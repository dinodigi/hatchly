import "server-only";
import { callTool, McpError } from "./mcp";

/**
 * The Hatchly Bucks economy service. Rules live in /ECONOMY.md.
 *
 * Invariants this file must never break:
 *  - Balance is derived from the ledger: sum(transactions.amount) == wallet.balance.
 *  - Every wallet mutation is CAS-guarded on ledger_version — concurrent writers
 *    conflict and retry instead of losing money.
 *  - Every transaction carries a unique idempotency_key — a retried request
 *    physically cannot double-apply (DB unique constraint).
 *  - All multi-row moves go through transact (all-or-nothing).
 */

/* ---- tuning (TBD markers tracked in ECONOMY.md) ---- */
export const SIGNUP_GRANT = 100;
export const DAILY_CLAIM = 100;
export const TAX_UNIVERSAL = 0.05; // TBD: every investment pays a small burn
export const TAX_SELF = 0.5; // TBD: self-investment pays a heavy burn
export const CONTACTS_FEE = 150;

/* ---- spotlight auction ----
 * Ascending auction on a single slot. Bidding is open for a window; each bid
 * must beat the leader; when the clock runs out the leading (= last) bidder
 * wins and is featured. Bids ESCROW rather than spend, so being outbid costs
 * nothing — only the winner's bid burns. */
export const SPOTLIGHT_MIN_BID = 25;
/** A new bid must beat the leader by at least this much. */
export const SPOTLIGHT_BID_INCREMENT = 25;
/** How long bidding stays open once an auction opens. */
export const SPOTLIGHT_AUCTION_HOURS = 24;
/** How long the winner is featured. */
export const SPOTLIGHT_FEATURE_DAYS = 7;
/**
 * A bid landing inside this tail pushes the close out by the same amount.
 * Without it "last bid before the timer" rewards whoever can fire closest to
 * the deadline — a latency race, not a willingness-to-pay race. Extending
 * keeps the intent (whoever wants it most wins) and kills sniping.
 */
export const SPOTLIGHT_ANTISNIPE_MINUTES = 5;

/* ---- shapes ---- */
interface Entry<T> {
  id: string;
  data: T;
}
interface WalletData {
  owner_id: string;
  user: { id: string };
  balance: number;
  escrow: number;
  lifetime_earned: number;
  lifetime_invested: number;
  lifetime_received: number;
  streak: number;
  last_claim_at?: string;
  ledger_version: number;
}
interface QueryResult<T> {
  entries: Entry<T>[];
}

async function queryOne<T>(collection: string, where: unknown[]): Promise<Entry<T> | null> {
  const r = await callTool<QueryResult<T>>("query_entries", { collection, where, limit: 1 });
  return r.entries[0] ?? null;
}

/* ---- CAS contention ----
 * Compare-and-set is how concurrent writers avoid losing money, but a loser
 * must retry rather than fail. Retries are jittered so two writers that
 * collided don't wake together and collide again. */
const CAS_ATTEMPTS = 8;

function casBackoff(attempt: number): Promise<void> {
  const base = Math.min(40 * 2 ** (attempt - 1), 400);
  return new Promise((r) => setTimeout(r, base + Math.random() * base));
}

/** Thrown when a writer lost every CAS round. Transient and retryable — it is
 *  NOT a server fault, and callers should surface it as "try again". */
export const E_CONTENTION = "E_CONTENTION";

export async function getWallet(ownerId: string): Promise<Entry<WalletData> | null> {
  return queryOne<WalletData>("wallets", [{ field: "owner_id", op: "eq", value: ownerId }]);
}

export async function getUserByClerkId(clerkUserId: string) {
  return queryOne<{ clerk_user_id: string; handle: string; name: string; role: string }>(
    "users",
    [{ field: "clerk_user_id", op: "eq", value: clerkUserId }],
  );
}

export async function getUserByEmail(email: string) {
  return queryOne<{ clerk_user_id: string; handle: string; name: string; role: string; email: string }>(
    "users",
    [{ field: "email", op: "eq", value: email }],
  );
}

/* ---- provisioning: first sign-in → users row + wallet + signup grant ---- */

export async function ensureProvisioned(profile: {
  clerkUserId: string;
  name: string;
  email: string;
  imageUrl?: string;
}): Promise<{ created: boolean }> {
  const existing = await getUserByClerkId(profile.clerkUserId);
  if (existing) {
    // User exists; make sure the wallet does too (crash-recovery path).
    const wallet = await getWallet(profile.clerkUserId);
    if (wallet) return { created: false };
    await createWalletWithGrant(profile.clerkUserId, existing.id);
    return { created: false };
  }

  // Same human, new Clerk identity? One account per email — reuse the existing
  // user instead of minting a second row + wallet + signup grant (the bug that
  // produced two accounts for one email). Repoint the user and its wallet to
  // this Clerk id so the session resolves to the one canonical account.
  const byEmail = await getUserByEmail(profile.email);
  if (byEmail) {
    const oldClerkId = byEmail.data.clerk_user_id;
    await callTool("update_entry", {
      collection: "users",
      id: byEmail.id,
      data: { clerk_user_id: profile.clerkUserId },
    });
    const oldWallet = await getWallet(oldClerkId);
    if (oldWallet) {
      await callTool("update_entry", {
        collection: "wallets",
        id: oldWallet.id,
        data: { owner_id: profile.clerkUserId },
      });
    } else {
      await createWalletWithGrant(profile.clerkUserId, byEmail.id);
    }
    return { created: false };
  }

  // Derive a handle: local part of email, deduped with a suffix on collision.
  const base =
    profile.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 24) || "founder";
  let userId: string | null = null;
  for (let attempt = 0; attempt < 3 && !userId; attempt++) {
    const handle = attempt === 0 ? base : `${base}${Math.floor(Math.random() * 900) + 100}`;
    try {
      const r = await callTool<{ id: string }>("create_entry", {
        collection: "users",
        data: {
          clerk_user_id: profile.clerkUserId,
          handle,
          name: profile.name,
          email: profile.email,
          email_verified: true,
          suspended: false,
          role: "member",
          avatar_initials: profile.name
            .split(/\s+/)
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase(),
        },
        idempotencyKey: `user_${profile.clerkUserId}`,
      });
      userId = r.id;
    } catch (e) {
      // Handle collision → retry with suffix. A clerk_user_id unique conflict
      // means a concurrent provision won — re-read and continue.
      if (e instanceof McpError && /handle/.test(e.message)) continue;
      const raced = await getUserByClerkId(profile.clerkUserId);
      if (raced) {
        userId = raced.id;
        break;
      }
      throw e;
    }
  }
  if (!userId) throw new McpError("could not provision user (handle collisions)");

  await createWalletWithGrant(profile.clerkUserId, userId);
  return { created: true };
}

async function createWalletWithGrant(ownerId: string, userId: string) {
  try {
    await callTool("transact", {
      idempotencyKey: `signup_${ownerId}`,
      ops: [
        {
          op: "create",
          collection: "wallets",
          ref: "wallet",
          data: {
            owner_id: ownerId,
            user: userId,
            balance: SIGNUP_GRANT,
            escrow: 0,
            lifetime_earned: SIGNUP_GRANT,
            lifetime_invested: 0,
            lifetime_received: 0,
            streak: 0,
            ledger_version: 1,
          },
        },
        {
          op: "create",
          collection: "transactions",
          data: {
            owner_id: ownerId,
            user: userId,
            type: "signup_grant",
            amount: SIGNUP_GRANT,
            balance_after: SIGNUP_GRANT,
            label: "Signup bonus",
            idempotency_key: `signup_${ownerId}`,
          },
        },
      ],
    });
  } catch (e) {
    // A unique conflict on wallets.owner_id means another request provisioned
    // concurrently — the invariant holds, nothing to do.
    if (e instanceof McpError && /unique|conflict/i.test(e.message)) return;
    throw e;
  }
}

/* ---- daily claim ---- */

export async function dailyClaim(
  ownerId: string,
): Promise<{ claimed: boolean; balance: number; streak: number; reason?: string }> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const wallet = await getWallet(ownerId);
    if (!wallet) throw new McpError("no wallet for " + ownerId);
    const w = wallet.data;

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const last = w.last_claim_at ? w.last_claim_at.slice(0, 10) : null;
    if (last === today) {
      return { claimed: false, balance: w.balance, streak: w.streak, reason: "already_claimed" };
    }
    const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
    const newStreak = last === yesterday ? w.streak + 1 : 1;
    const newBalance = w.balance + DAILY_CLAIM;

    try {
      await callTool("transact", {
        idempotencyKey: `claim_${ownerId}_${today}`,
        ops: [
          {
            op: "update_if",
            collection: "wallets",
            id: wallet.id,
            if: [{ field: "ledger_version", op: "eq", value: w.ledger_version }],
            data: {
              balance: newBalance,
              lifetime_earned: w.lifetime_earned + DAILY_CLAIM,
              streak: newStreak,
              last_claim_at: now.toISOString(),
              ledger_version: w.ledger_version + 1,
            },
          },
          {
            op: "create",
            collection: "transactions",
            data: {
              owner_id: ownerId,
              user: w.user.id,
              type: "daily_claim",
              amount: DAILY_CLAIM,
              balance_after: newBalance,
              label: "Daily login bonus",
              idempotency_key: `claim_${ownerId}_${today}`,
            },
          },
        ],
      });
      return { claimed: true, balance: newBalance, streak: newStreak };
    } catch (e) {
      if (e instanceof McpError && e.code === "E_CONFLICT") continue; // raced — re-read
      throw e;
    }
  }
  throw new McpError("dailyClaim: too many CAS conflicts");
}

/* ---- invest: backer wallet → founder wallet, taxed; listing counters move ---- */

export interface InvestResult {
  ok: true;
  /** true when this requestKey was already applied — nothing moved this time. */
  replayed?: boolean;
  amount: number;
  tax: number;
  net: number;
  backerBalance: number;
}

export async function invest(params: {
  backerOwnerId: string;
  listingId: string;
  amount: number;
  /** stable key from the client so a retried submit can't double-invest */
  requestKey: string;
}): Promise<InvestResult> {
  const { backerOwnerId, listingId, amount, requestKey } = params;
  if (!Number.isInteger(amount) || amount < 1) throw new McpError("invalid amount");

  // A popular listing gets many simultaneous backs, and every one of them
  // CAS-writes the same two wallet rows. Three bare attempts is not enough:
  // measured 8-way contention lost 4 of 8 legitimate requests. Retry more,
  // and jitter the wait so retries de-synchronise instead of re-colliding.
  for (let attempt = 0; attempt < CAS_ATTEMPTS; attempt++) {
    if (attempt > 0) await casBackoff(attempt);
    // Call budget matters: the MCP surface allows 300 tool calls/min per
    // PROJECT (shared by every user), and this path used to spend 5 calls
    // across 4 sequential hops. Fetch both wallets in ONE query and run it
    // alongside the stakes probe: 4 calls, 3 hops.
    const listing = await callTool<{ id: string; data: { owner_id: string; name: string; status: string } }>(
      "get_entry",
      { collection: "listings", id: listingId },
    );
    if (listing.data.status !== "live") throw new McpError("listing is not live");

    const isSelf = listing.data.owner_id === backerOwnerId;
    const taxRate = isSelf ? TAX_SELF : TAX_UNIVERSAL;
    const tax = Math.ceil(amount * taxRate);
    const net = amount - tax;

    const owners = isSelf ? [backerOwnerId] : [backerOwnerId, listing.data.owner_id];
    const [walletRows, existingStake] = await Promise.all([
      callTool<QueryResult<WalletData>>("query_entries", {
        collection: "wallets",
        where: [{ field: "owner_id", op: "in", value: owners }],
        limit: 2,
      }),
      queryOne("stakes", [
        { field: "backer_id", op: "eq", value: backerOwnerId },
        { field: "listing", op: "eq", value: listingId },
      ]),
    ]);

    const backerWallet = walletRows.entries.find((w) => w.data.owner_id === backerOwnerId) ?? null;
    if (!backerWallet) throw new McpError("no wallet for backer");
    const founderWallet = isSelf
      ? backerWallet
      : (walletRows.entries.find((w) => w.data.owner_id === listing.data.owner_id) ?? null);
    if (!founderWallet) throw new McpError("founder has no wallet");

    const bw = backerWallet.data;
    const fw = founderWallet.data;
    if (bw.balance < amount) throw new McpError("insufficient balance", "E_INSUFFICIENT");

    const firstStake = !existingStake;

    const backerAfter = bw.balance - amount;
    const sameWallet = isSelf; // self-investment: debit and credit hit ONE wallet

    const ops: unknown[] = [
      // 1. debit the backer (CAS on version; balance check rides in the condition)
      {
        op: "update_if",
        collection: "wallets",
        id: backerWallet.id,
        if: [
          { field: "ledger_version", op: "eq", value: bw.ledger_version },
          { field: "balance", op: "gt", value: amount - 1 },
        ],
        data: {
          balance: sameWallet ? bw.balance - amount + net : backerAfter,
          lifetime_invested: bw.lifetime_invested + amount,
          ...(sameWallet ? { lifetime_received: bw.lifetime_received + net } : {}),
          ledger_version: bw.ledger_version + 1,
        },
      },
      // 2. credit the founder (skipped when self — folded into op 1)
      ...(sameWallet
        ? []
        : [
            {
              op: "update_if",
              collection: "wallets",
              id: founderWallet.id,
              if: [{ field: "ledger_version", op: "eq", value: fw.ledger_version }],
              data: {
                balance: fw.balance + net,
                lifetime_received: fw.lifetime_received + net,
                ledger_version: fw.ledger_version + 1,
              },
            },
          ]),
      // 3. ledger: backer out
      {
        op: "create",
        collection: "transactions",
        data: {
          owner_id: backerOwnerId,
          user: bw.user.id,
          type: "invest_out",
          amount: -amount,
          balance_after: sameWallet ? bw.balance - amount + net : backerAfter,
          label: `Backed ${listing.data.name}`,
          listing: listingId,
          counterparty: fw.user.id,
          idempotency_key: `invest_out_${requestKey}`,
        },
      },
      // 4. ledger: founder in (net of tax)
      {
        op: "create",
        collection: "transactions",
        data: {
          owner_id: listing.data.owner_id,
          user: fw.user.id,
          type: "invest_in",
          amount: net,
          balance_after: sameWallet ? bw.balance - amount + net : fw.balance + net,
          label: `${isSelf ? "Self-backed" : "Backed by " + bw.owner_id} · ${listing.data.name}`,
          listing: listingId,
          counterparty: bw.user.id,
          idempotency_key: `invest_in_${requestKey}`,
        },
      },
      // 5. ledger: the burn
      ...(tax > 0
        ? [
            {
              op: "create",
              collection: "transactions",
              data: {
                owner_id: backerOwnerId,
                user: bw.user.id,
                type: isSelf ? "self_invest_tax" : "invest_tax",
                amount: 0, // informational row — the burn is the out/in delta
                balance_after: sameWallet ? bw.balance - amount + net : backerAfter,
                label: `Tax burned (${Math.round(taxRate * 100)}%) · ${listing.data.name}`,
                listing: listingId,
                idempotency_key: `tax_${requestKey}`,
              },
            },
          ]
        : []),
      // 6. the stake record
      {
        op: "create",
        collection: "stakes",
        data: {
          backer: bw.user.id,
          backer_id: backerOwnerId,
          listing: listingId,
          amount,
          net_to_founder: net,
          tax,
          is_self: isSelf,
        },
      },
      // 7. listing counters — atomic increments, no CAS needed
      { op: "update_if", collection: "listings", id: listingId, increment: { field: "bucks_total", by: net } },
      { op: "update_if", collection: "listings", id: listingId, increment: { field: "bucks_window", by: net } },
      { op: "update_if", collection: "listings", id: listingId, increment: { field: "bucks_today", by: net } },
      { op: "update_if", collection: "listings", id: listingId, increment: { field: "rank_score", by: net } },
      { op: "update_if", collection: "listings", id: listingId, increment: { field: "backers_count", by: 1 } },
      ...(firstStake
        ? [{ op: "update_if", collection: "listings", id: listingId, increment: { field: "distinct_backers", by: 1 } }]
        : []),
    ];

    try {
      const res = await callTool<{ replayed?: boolean }>("transact", {
        idempotencyKey: `invest_${requestKey}`,
        ops,
      });
      // A replayed batch applied NOTHING. Projecting the balance here would
      // report a second deduction that never happened, so re-read instead and
      // tell the caller this was a duplicate submit.
      if (res?.replayed) {
        const current = await getWallet(backerOwnerId);
        return {
          ok: true,
          replayed: true,
          amount,
          tax,
          net,
          backerBalance: current?.data.balance ?? bw.balance,
        };
      }
      return { ok: true, amount, tax, net, backerBalance: sameWallet ? bw.balance - amount + net : backerAfter };
    } catch (e) {
      if (e instanceof McpError && e.code === "E_CONFLICT") continue; // version raced — re-read
      throw e;
    }
  }
  throw new McpError("too many people are backing this right now — try again", E_CONTENTION);
}

/* ------------------------------------------------------------------ *
 * Spotlight — a timed ascending auction for the featured slot.
 *
 * How it works:
 *   1. An auction is open until `auction_ends_at`. Anyone may bid on their
 *      own live listing; each bid must beat the leader by the increment.
 *   2. A bid ESCROWS the bucks (balance → escrow). Being outbid refunds the
 *      previous leader in the same atomic batch, so bidding is never a loss.
 *   3. When the clock runs out the leading (= last) bidder wins: their escrow
 *      is burned — the sink — and their listing is featured for the feature
 *      window. The next auction opens immediately.
 *
 * Settlement is LAZY: any read that finds an expired auction settles it
 * first. There is no scheduler in this app, and the spotlight only matters
 * when somebody is looking at it. Settlement is CAS-guarded and carries a
 * deterministic idempotency key, so concurrent readers can race safely and
 * exactly one settlement applies.
 *
 * Ledger note (mirrors the investment tax): the burn is NOT a separate row.
 * The bucks already left `balance` at escrow time. Net spotlight burn is
 * therefore  −(Σ spotlight_escrow + Σ spotlight_refund)  — no zero-amount
 * rows, and the admin console derives it that way.
 * ------------------------------------------------------------------ */

export interface SpotlightState {
  id: string;
  version: number;
  /** Currently featured (may be null before the first auction settles). */
  listing: { id: string; label: string } | null;
  holder: { id: string; label: string } | null;
  amount: number;
  featureEndsAt: string | null;
  featured: boolean;
  /** Live auction. */
  auctionEndsAt: string | null;
  auctionOpen: boolean;
  highBid: number;
  highBidder: { id: string; label: string } | null;
  highListing: { id: string; label: string } | null;
  /** What the next bid must be at least. */
  minNextBid: number;
}

interface SlotData {
  slot: string;
  listing?: { id: string; label: string };
  holder?: { id: string; label: string };
  amount?: number;
  window_start?: string;
  window_end?: string;
  auction_ends_at?: string;
  high_bid?: number;
  high_bidder?: { id: string; label: string };
  high_listing?: { id: string; label: string };
  high_bid_owner?: string;
  version: number;
}

const HOUR = 3600_000;
const DAY = 86_400_000;

async function readSlot(): Promise<Entry<SlotData>> {
  const r = await callTool<QueryResult<SlotData>>("query_entries", {
    collection: "spotlight",
    where: [{ field: "slot", op: "eq", value: "main" }],
    limit: 1,
  });
  const e = r.entries[0];
  if (!e) throw new McpError("spotlight slot missing");
  return e;
}

function toState(e: Entry<SlotData>): SpotlightState {
  const d = e.data;
  const now = Date.now();
  const featured = !!d.window_end && new Date(d.window_end).getTime() > now;
  const auctionOpen = !!d.auction_ends_at && new Date(d.auction_ends_at).getTime() > now;
  const highBid = d.high_bid ?? 0;
  return {
    id: e.id,
    version: d.version,
    listing: d.listing ?? null,
    holder: d.holder ?? null,
    amount: d.amount ?? 0,
    featureEndsAt: d.window_end ?? null,
    featured,
    auctionEndsAt: d.auction_ends_at ?? null,
    auctionOpen,
    highBid,
    highBidder: d.high_bidder ?? null,
    highListing: d.high_listing ?? null,
    minNextBid: highBid > 0 ? highBid + SPOTLIGHT_BID_INCREMENT : SPOTLIGHT_MIN_BID,
  };
}

/**
 * Settle an expired auction and open the next one. Safe to call at any time:
 * returns immediately unless the clock has actually run out.
 */
async function settleIfDue(slot: Entry<SlotData>): Promise<Entry<SlotData>> {
  const d = slot.data;
  const now = Date.now();

  // No auction has ever been opened — open the first one.
  if (!d.auction_ends_at) {
    const opensTo = new Date(now + SPOTLIGHT_AUCTION_HOURS * HOUR).toISOString();
    try {
      await callTool("transact", {
        idempotencyKey: `spotlight_open_${slot.id}_v${d.version}`,
        ops: [
          {
            op: "update_if",
            collection: "spotlight",
            id: slot.id,
            if: [{ field: "version", op: "eq", value: d.version }],
            data: { auction_ends_at: opensTo, version: d.version + 1 },
          },
        ],
      });
    } catch {
      /* someone else opened it — fall through to a re-read */
    }
    return readSlot();
  }

  if (new Date(d.auction_ends_at).getTime() > now) return slot; // still running

  const nextAuctionEnd = new Date(now + SPOTLIGHT_AUCTION_HOURS * HOUR).toISOString();

  // Nobody bid — roll the window forward, leave any current feature alone.
  if (!d.high_bid || !d.high_bid_owner || !d.high_listing) {
    try {
      await callTool("transact", {
        idempotencyKey: `spotlight_roll_${slot.id}_${d.auction_ends_at}`,
        ops: [
          {
            op: "update_if",
            collection: "spotlight",
            id: slot.id,
            if: [{ field: "version", op: "eq", value: d.version }],
            data: { auction_ends_at: nextAuctionEnd, version: d.version + 1 },
          },
        ],
      });
    } catch {
      /* raced — re-read below */
    }
    return readSlot();
  }

  // A winner exists: burn their escrow and feature them.
  const winnerWallet = await getWallet(d.high_bid_owner);
  if (!winnerWallet) throw new McpError("spotlight winner has no wallet");
  const ww = winnerWallet.data;
  const won = d.high_bid;
  const featureEnd = new Date(now + SPOTLIGHT_FEATURE_DAYS * DAY).toISOString();

  try {
    await callTool("transact", {
      // Keyed on the auction that just closed, so two concurrent settlers
      // cannot both award the slot.
      idempotencyKey: `spotlight_settle_${slot.id}_${d.auction_ends_at}`,
      ops: [
        {
          op: "update_if",
          collection: "spotlight",
          id: slot.id,
          if: [{ field: "version", op: "eq", value: d.version }],
          data: {
            listing: d.high_listing.id,
            holder: d.high_bidder?.id,
            amount: won,
            window_start: new Date(now).toISOString(),
            window_end: featureEnd,
            auction_ends_at: nextAuctionEnd,
            high_bid: 0,
            high_bidder: null,
            high_listing: null,
            high_bid_owner: null,
            version: d.version + 1,
          },
        },
        // The bucks left `balance` when they were escrowed; winning just
        // releases the hold. No ledger row — see the note at the top.
        {
          op: "update_if",
          collection: "wallets",
          id: winnerWallet.id,
          if: [{ field: "escrow", op: "gt", value: won - 1 }],
          increment: { field: "escrow", by: -won },
        },
        {
          op: "update",
          collection: "spotlight_bids",
          id: await currentBidId(slot.id, d),
          data: { status: "active", window_start: new Date(now).toISOString(), window_end: featureEnd },
        },
      ],
    });
  } catch (e) {
    if (!(e instanceof McpError && e.code === "E_CONFLICT")) throw e;
  }
  return readSlot();
}

/** The escrowed bid row for the current leader, so settlement can mark it. */
async function currentBidId(_slotId: string, d: SlotData): Promise<string> {
  const r = await queryOne<{ status: string }>("spotlight_bids", [
    { field: "bidder_id", op: "eq", value: d.high_bid_owner },
    { field: "listing", op: "eq", value: d.high_listing?.id },
    { field: "status", op: "eq", value: "escrowed" },
  ]);
  if (!r) throw new McpError("leading bid row missing");
  return r.id;
}

export async function getSpotlight(): Promise<SpotlightState> {
  const slot = await settleIfDue(await readSlot());
  return toState(slot);
}

export interface BidResult {
  ok: true;
  replayed?: boolean;
  amount: number;
  auctionEndsAt: string;
  extended: boolean;
  refundedTo: string | null;
  balance: number;
}

/**
 * Place a bid in the open auction. Escrows the bid and refunds the previous
 * leader atomically — one batch, so the slot can never show a leader whose
 * money was not held, and a refund can never go missing.
 */
export async function bidSpotlight(params: {
  ownerId: string;
  listingId: string;
  amount: number;
  requestKey: string;
}): Promise<BidResult> {
  const { ownerId, listingId, amount, requestKey } = params;
  if (!Number.isInteger(amount) || amount < SPOTLIGHT_MIN_BID)
    throw new McpError(`minimum bid is ${SPOTLIGHT_MIN_BID}`, "E_MIN_BID");

  for (let attempt = 0; attempt < CAS_ATTEMPTS; attempt++) {
    if (attempt > 0) await casBackoff(attempt);

    const slot = await settleIfDue(await readSlot());
    const s = toState(slot);
    if (!s.auctionOpen) throw new McpError("bidding is closed", "E_AUCTION_CLOSED");
    if (amount < s.minNextBid)
      throw new McpError(`bid at least ${s.minNextBid}`, "E_OUTBID");
    if (s.highBidder && slot.data.high_bid_owner === ownerId)
      throw new McpError("you already hold the leading bid", "E_ALREADY_LEADING");

    const [wallet, listing] = await Promise.all([
      getWallet(ownerId),
      callTool<{ id: string; data: { owner_id: string; name: string; status: string } }>("get_entry", {
        collection: "listings",
        id: listingId,
      }),
    ]);
    if (!wallet) throw new McpError("no wallet");
    if (listing.data.owner_id !== ownerId)
      throw new McpError("you can only feature your own idea", "E_NOT_OWNER");
    if (listing.data.status !== "live") throw new McpError("listing is not live");
    const w = wallet.data;
    if (w.balance < amount) throw new McpError("insufficient balance", "E_INSUFFICIENT");

    const now = Date.now();
    const closesAt = new Date(s.auctionEndsAt!).getTime();
    const tail = SPOTLIGHT_ANTISNIPE_MINUTES * 60_000;
    const extended = closesAt - now <= tail;
    const newEnd = new Date(extended ? now + tail : closesAt).toISOString();
    const newBalance = w.balance - amount;

    // Refund the outgoing leader, if any.
    const prevOwner = slot.data.high_bid_owner ?? null;
    const prevAmount = slot.data.high_bid ?? 0;
    const prevWallet = prevOwner ? await getWallet(prevOwner) : null;
    if (prevOwner && !prevWallet) throw new McpError("outgoing leader has no wallet");

    const ops: unknown[] = [
      {
        op: "update_if",
        collection: "spotlight",
        id: slot.id,
        if: [{ field: "version", op: "eq", value: slot.data.version }],
        data: {
          auction_ends_at: newEnd,
          high_bid: amount,
          high_bidder: w.user.id,
          high_listing: listingId,
          high_bid_owner: ownerId,
          version: slot.data.version + 1,
        },
      },
      // Escrow the new bid: balance → escrow, with the ledger row that makes
      // the movement real.
      {
        op: "update_if",
        collection: "wallets",
        id: wallet.id,
        if: [
          { field: "ledger_version", op: "eq", value: w.ledger_version },
          { field: "balance", op: "gt", value: amount - 1 },
        ],
        data: {
          balance: newBalance,
          escrow: (w.escrow ?? 0) + amount,
          ledger_version: w.ledger_version + 1,
        },
      },
      {
        op: "create",
        collection: "transactions",
        data: {
          owner_id: ownerId,
          user: w.user.id,
          type: "spotlight_escrow",
          amount: -amount,
          balance_after: newBalance,
          label: `Spotlight bid — ${listing.data.name}`,
          listing: listingId,
          idempotency_key: `spotlight_bid_${requestKey}`,
        },
      },
      {
        op: "create",
        collection: "spotlight_bids",
        data: {
          bidder: w.user.id,
          bidder_id: ownerId,
          listing: listingId,
          amount,
          status: "escrowed",
        },
      },
    ];

    if (prevOwner && prevWallet && prevAmount > 0) {
      const pw = prevWallet.data;
      ops.push(
        {
          op: "update_if",
          collection: "wallets",
          id: prevWallet.id,
          if: [
            { field: "ledger_version", op: "eq", value: pw.ledger_version },
            { field: "escrow", op: "gt", value: prevAmount - 1 },
          ],
          data: {
            balance: pw.balance + prevAmount,
            escrow: (pw.escrow ?? 0) - prevAmount,
            ledger_version: pw.ledger_version + 1,
          },
        },
        {
          op: "create",
          collection: "transactions",
          data: {
            owner_id: prevOwner,
            user: slot.data.high_bidder?.id,
            type: "spotlight_refund",
            amount: prevAmount,
            balance_after: pw.balance + prevAmount,
            label: `Outbid — spotlight refund`,
            idempotency_key: `spotlight_refund_${requestKey}`,
          },
        },
      );
    }

    try {
      const res = await callTool<{ replayed?: boolean }>("transact", {
        idempotencyKey: `spotlight_bid_${requestKey}`,
        ops,
      });
      if (res?.replayed) {
        const current = await getWallet(ownerId);
        return {
          ok: true,
          replayed: true,
          amount,
          auctionEndsAt: newEnd,
          extended: false,
          refundedTo: null,
          balance: current?.data.balance ?? w.balance,
        };
      }
      return {
        ok: true,
        amount,
        auctionEndsAt: newEnd,
        extended,
        refundedTo: slot.data.high_bidder?.label ?? null,
        balance: newBalance,
      };
    } catch (e) {
      if (e instanceof McpError && e.code === "E_CONFLICT") continue; // someone bid first
      throw e;
    }
  }
  throw new McpError("bidding is moving fast right now — try again", E_CONTENTION);
}
