import "server-only";
import { auth } from "@clerk/nextjs/server";
import { callTool } from "./mcp";
import { getUserByClerkId } from "./economy";

/**
 * Admin & moderation service (M6b).
 *
 * You cannot operate an economy you can't see. This file answers three
 * questions the raw Pluggie console can't: where is money being created and
 * burned, who is funnelling bucks between alt accounts, and what did staff do
 * about it.
 *
 * Every mutating helper here writes an admin_actions row — the audit trail is
 * not optional, and it is written in the SAME transact as the effect wherever
 * the backend allows it.
 */

export type Role = "member" | "moderator" | "admin";

interface Entry<T> {
  id: string;
  data: T;
}

/** Gate: resolves the caller's staff role, or null if they aren't staff. */
export async function getStaff(): Promise<{ clerkUserId: string; userId: string; role: Role } | null> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;
  const user = await getUserByClerkId(clerkUserId).catch(() => null);
  if (!user) return null;
  const role = user.data.role as Role;
  if (role !== "admin" && role !== "moderator") return null;
  return { clerkUserId, userId: user.id, role };
}

/* ------------------------------------------------------------------ *
 * Economy observability
 * ------------------------------------------------------------------ */

/** Faucets mint new bucks; sinks destroy them. Transfers net to zero across
 *  wallets, so they say nothing about supply — they're volume, not inflation. */
const FAUCETS = ["signup_grant", "daily_claim", "earn"] as const;

/** Sinks that carry their own signed amount in the ledger.
 *  `spotlight_burn` is legacy — the old buy-it-now spotlight wrote one. The
 *  auction model doesn't: see spotlightBurn() below. */
const EXPLICIT_SINKS = ["spotlight_burn", "contacts_unlock"] as const;

/**
 * Spotlight burn under the auction model. A bid leaves `balance` when it is
 * escrowed (spotlight_escrow, negative) and returns on an outbid
 * (spotlight_refund, positive). Whatever never came back was burned by a win:
 *     −(Σ spotlight_escrow + Σ spotlight_refund)
 * Money currently held in a LIVE auction is also "not returned yet", so this
 * slightly leads reality until the auction settles — which is the honest way
 * round for a supply gauge.
 */
function spotlightBurn(byType: { type: string; sum: number }[]): number {
  const esc = byType.find((r) => r.type === "spotlight_escrow")?.sum ?? 0;
  const ref = byType.find((r) => r.type === "spotlight_refund")?.sum ?? 0;
  return Math.max(0, -(esc + ref));
}

/**
 * The investment tax is NOT one of them. economy.ts writes the invest_tax /
 * self_invest_tax rows with amount: 0 — they're informational, because the
 * burn is already expressed as the gap between the backer's invest_out
 * (−amount) and the founder's invest_in (+net). Summing those rows therefore
 * reports a zero burn even though bucks really did leave the economy.
 *
 * Recover it from the pair instead: for every investment
 *     invest_out = −amount, invest_in = +net, and amount − net = tax
 * so  −(Σ invest_out + Σ invest_in) = Σ tax.
 * Self-investment lands on one wallet but writes the same two rows, so it is
 * covered by the identity too.
 */
function investmentBurn(byType: { type: string; sum: number }[]): number {
  const out = byType.find((r) => r.type === "invest_out")?.sum ?? 0;
  const inn = byType.find((r) => r.type === "invest_in")?.sum ?? 0;
  return Math.max(0, -(out + inn));
}

/** aggregate_entries answers as {results:[{fn, field, value}]}, and when
 *  grouped, {groups:[{key, results:[...]}]}. */
interface AggResult {
  fn: string;
  field?: string;
  value: number;
}
const pick = (results: AggResult[] | undefined, fn: string) =>
  results?.find((r) => r.fn === fn)?.value ?? 0;

export interface EconomyStats {
  supply: number;
  minted: number;
  burned: number;
  inflation: number | null;
  byType: { type: string; count: number; sum: number }[];
  wallets: number;
  ledgerTotal: number;
  /** sum(ledger) − sum(wallets). Must be 0; anything else is real drift. */
  drift: number;
  /** Tax actually burned by investments — derived, since the ledger rows are
   *  informational zeroes. See investmentBurn(). */
  taxBurn: number;
  topHolders: { name: string; balance: number; share: number }[];
}

export async function economyStats(): Promise<EconomyStats> {
  const [ledger, walletAgg, wallets] = await Promise.all([
    callTool<{ groups?: { key: string; results: AggResult[] }[] }>("aggregate_entries", {
      collection: "transactions",
      aggregates: [{ fn: "count" }, { fn: "sum", field: "amount" }],
      groupBy: "type",
    }),
    callTool<{ results?: AggResult[] }>("aggregate_entries", {
      collection: "wallets",
      aggregates: [{ fn: "count" }, { fn: "sum", field: "balance" }],
    }),
    callTool<{ entries: Entry<{ balance: number; user?: { label: string } }>[] }>("query_entries", {
      collection: "wallets",
      orderBy: { field: "balance", dir: "desc" },
      select: ["balance", "user"],
      limit: 8,
    }),
  ]);

  const byType = (ledger.groups ?? []).map((g) => ({
    type: g.key,
    count: pick(g.results, "count"),
    sum: pick(g.results, "sum"),
  }));

  const sumOf = (types: readonly string[]) =>
    byType.filter((r) => types.includes(r.type)).reduce((n, r) => n + r.sum, 0);

  // admin_adjust can mint or destroy; count only its minting direction.
  const adjust = byType.find((r) => r.type === "admin_adjust")?.sum ?? 0;
  const minted = sumOf(FAUCETS) + Math.max(0, adjust);
  const burned =
    Math.abs(sumOf(EXPLICIT_SINKS)) +
    Math.abs(Math.min(0, adjust)) +
    investmentBurn(byType) +
    spotlightBurn(byType);

  const supply = pick(walletAgg.results, "sum");
  const ledgerTotal = byType.reduce((n, r) => n + r.sum, 0);

  const topHolders = wallets.entries.map((w) => ({
    name: w.data.user?.label ?? "—",
    balance: w.data.balance,
    share: supply > 0 ? w.data.balance / supply : 0,
  }));

  return {
    supply,
    minted,
    burned,
    // Bucks created per buck destroyed. >1 means the sinks aren't keeping up.
    inflation: burned > 0 ? minted / burned : null,
    byType: byType.sort((a, b) => Math.abs(b.sum) - Math.abs(a.sum)),
    wallets: pick(walletAgg.results, "count"),
    ledgerTotal,
    drift: ledgerTotal - supply,
    taxBurn: investmentBurn(byType),
    topHolders,
  };
}

/* ------------------------------------------------------------------ *
 * Collusion detection
 *
 * ECONOMY.md §1: mutual investment between two accounts pays no
 * self-investment tax, so alt-account funnelling routes around the main sink.
 * Two signals catch it:
 *   1. Reciprocal pairs — A backs B and B backs A.
 *   2. Inflow concentration — a founder whose bucks come from ~one source.
 * ------------------------------------------------------------------ */

export interface CollusionPair {
  a: string;
  b: string;
  aToB: number;
  bToA: number;
  total: number;
  /** min/max of the two directions — 1.0 is a perfectly balanced wash trade. */
  symmetry: number;
}

export interface Concentration {
  founder: string;
  totalIn: number;
  topBacker: string;
  topAmount: number;
  share: number;
}

export interface CollusionReport {
  pairs: CollusionPair[];
  concentrated: Concentration[];
  scanned: number;
}

export async function collusionScan(): Promise<CollusionReport> {
  // stakes carry backer + listing; expand the listing to reach its author.
  const stakes = await callTool<{
    entries: Entry<{
      backer: { id: string; label: string };
      listing: { id: string; label: string; data?: { author?: { id: string; label: string } } };
      amount: number;
    }>[];
  }>("query_entries", {
    collection: "stakes",
    expand: ["listing"],
    limit: 500,
  });

  // Directed edges: backer → founder.
  const edges = new Map<string, number>();
  const names = new Map<string, string>();
  for (const s of stakes.entries) {
    const backer = s.data.backer;
    const author = s.data.listing?.data?.author;
    if (!backer || !author || backer.id === author.id) continue; // self-investment is taxed separately
    names.set(backer.id, backer.label);
    names.set(author.id, author.label);
    const key = `${backer.id}>${author.id}`;
    edges.set(key, (edges.get(key) ?? 0) + s.data.amount);
  }

  // Reciprocal pairs — both directions present.
  const seen = new Set<string>();
  const pairs: CollusionPair[] = [];
  for (const [key, amount] of edges) {
    const [from, to] = key.split(">");
    const back = edges.get(`${to}>${from}`);
    if (back === undefined) continue;
    const pairKey = [from, to].sort().join("|");
    if (seen.has(pairKey)) continue;
    seen.add(pairKey);
    const hi = Math.max(amount, back);
    const lo = Math.min(amount, back);
    pairs.push({
      a: names.get(from) ?? from,
      b: names.get(to) ?? to,
      aToB: amount,
      bToA: back,
      total: amount + back,
      symmetry: hi > 0 ? lo / hi : 0,
    });
  }

  // Inflow concentration per founder.
  const inflow = new Map<string, Map<string, number>>();
  for (const [key, amount] of edges) {
    const [from, to] = key.split(">");
    const m = inflow.get(to) ?? new Map<string, number>();
    m.set(from, (m.get(from) ?? 0) + amount);
    inflow.set(to, m);
  }
  const concentrated: Concentration[] = [];
  for (const [founder, sources] of inflow) {
    const total = [...sources.values()].reduce((a, b) => a + b, 0);
    if (total < 100) continue; // ignore noise
    const [topId, topAmount] = [...sources.entries()].sort((a, b) => b[1] - a[1])[0];
    const share = topAmount / total;
    // One backer supplying most of the money, and not a trivially small crowd.
    if (share >= 0.6 && sources.size <= 3) {
      concentrated.push({
        founder: names.get(founder) ?? founder,
        totalIn: total,
        topBacker: names.get(topId) ?? topId,
        topAmount,
        share,
      });
    }
  }

  return {
    // Balanced, high-volume wash trades first.
    pairs: pairs.sort((a, b) => b.symmetry * b.total - a.symmetry * a.total),
    concentrated: concentrated.sort((a, b) => b.totalIn - a.totalIn),
    scanned: stakes.entries.length,
  };
}

/* ------------------------------------------------------------------ *
 * Audited moderation actions
 * ------------------------------------------------------------------ */

type ActionName =
  | "hide_listing"
  | "unhide_listing"
  | "suspend_user"
  | "unsuspend_user"
  | "remove_comment"
  | "remove_quick_idea"
  | "reverse_transaction"
  | "adjust_balance"
  | "resolve_report"
  | "dismiss_report"
  | "edit_prompt"
  | "restore_prompt";

interface AuditOp {
  action: ActionName;
  targetKind: "listing" | "user" | "comment" | "quick_idea" | "transaction" | "report" | "chat_template";
  targetId: string;
  targetLabel?: string;
  reason?: string;
  amount?: number;
}

/** Build the audit row for a staff action. Callers push this into the SAME
 *  transact as the effect so an action can never land unlogged. */
export function auditOp(
  staff: { clerkUserId: string; userId: string },
  op: AuditOp,
): { op: "create"; collection: string; data: Record<string, unknown> } {
  return {
    op: "create",
    collection: "admin_actions",
    data: {
      actor_id: staff.clerkUserId,
      actor: staff.userId,
      action: op.action,
      target_kind: op.targetKind,
      target_id: op.targetId,
      target_label: op.targetLabel?.slice(0, 200),
      reason: op.reason?.slice(0, 1000),
      amount: op.amount,
    },
  };
}

/** Fetch one entry by id. `id` is not a queryable field in `where` — single
 *  lookups go through get_entry. */
async function getEntry<T>(collection: string, id: string): Promise<Entry<T> | null> {
  try {
    return await callTool<Entry<T>>("get_entry", { collection, id });
  } catch {
    return null;
  }
}

/** Hide or restore a stream listing. Atomic with its audit row. */
export async function setListingHidden(
  staff: { clerkUserId: string; userId: string },
  listingId: string,
  hidden: boolean,
  reason: string,
) {
  const listing = await getEntry<{ name: string }>("listings", listingId);
  const label = listing?.data.name;

  await callTool("transact", {
    ops: [
      { op: "update", collection: "listings", id: listingId, data: { status: hidden ? "hidden" : "live" } },
      auditOp(staff, {
        action: hidden ? "hide_listing" : "unhide_listing",
        targetKind: "listing",
        targetId: listingId,
        targetLabel: label,
        reason,
      }),
    ],
  });
}

/** Suspend or reinstate a user. Suspension is reversible and never deletes. */
export async function setUserSuspended(
  staff: { clerkUserId: string; userId: string },
  userId: string,
  suspended: boolean,
  reason: string,
) {
  const user = await getEntry<{ name: string }>("users", userId);

  await callTool("transact", {
    ops: [
      { op: "update", collection: "users", id: userId, data: { suspended } },
      auditOp(staff, {
        action: suspended ? "suspend_user" : "unsuspend_user",
        targetKind: "user",
        targetId: userId,
        targetLabel: user?.data.name,
        reason,
      }),
    ],
  });
}

/** Move a report through its workflow.
 *
 * The declared state machine has no open→actioned edge (only open→reviewing→
 * actioned, plus a direct open→dismissed). So actioning a fresh report steps
 * through `reviewing` first rather than failing the transition. */
export async function resolveReport(
  staff: { clerkUserId: string; userId: string },
  reportId: string,
  outcome: "actioned" | "dismissed",
  note: string,
) {
  const current = await getEntry<{ status: string }>("reports", reportId);
  const status = current?.data.status ?? "open";

  const steps: { op: "update"; collection: string; id: string; data: Record<string, unknown> }[] = [];
  if (outcome === "actioned" && status === "open") {
    steps.push({ op: "update", collection: "reports", id: reportId, data: { status: "reviewing" } });
  }
  steps.push({
    op: "update",
    collection: "reports",
    id: reportId,
    data: { status: outcome, resolution_note: note.slice(0, 1000) },
  });

  await callTool("transact", {
    ops: [
      ...steps,
      auditOp(staff, {
        action: outcome === "actioned" ? "resolve_report" : "dismiss_report",
        targetKind: "report",
        targetId: reportId,
        reason: note,
      }),
    ],
  });
}
