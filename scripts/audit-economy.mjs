#!/usr/bin/env node
/**
 * Hatchly economy invariant audit.
 *
 *   node scripts/audit-economy.mjs
 *
 * Read-only. Verifies the guarantees ECONOMY.md claims, against live data:
 *
 *   1. Ledger reconciliation — sum(transactions) == wallet.balance, per wallet.
 *   2. No negative balances.
 *   3. Idempotency keys are unique (the DB enforces it; this catches drift).
 *   4. Tax math — for every investment, |out| - in == ceil(amount * rate),
 *      at the self rate when backer == founder, else the universal rate.
 *   5. Every invest_out has exactly one matching invest_in (no orphaned legs).
 *   6. Stakes agree with the ledger — sum(stakes per listing) == sum of the
 *      gross amounts invested into it.
 *   7. Wallet lifetime_* counters agree with the ledger.
 *
 * Exit code 1 if any invariant fails, so it can gate a deploy.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MCP_URL = "https://pluggie.app/api/mcp";

const TAX_UNIVERSAL = 0.05;
const TAX_SELF = 0.5;

function loadToken() {
  const env = readFileSync(join(ROOT, "web", ".env.local"), "utf8");
  const m = /^AGENTX_MCP_TOKEN\s*=\s*(.+)$/m.exec(env);
  if (!m) throw new Error("AGENTX_MCP_TOKEN not found in web/.env.local");
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const TOKEN = loadToken();
let rpc = 0;

async function callTool(name, args, attempt = 0) {
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${TOKEN}`,
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++rpc, method: "tools/call", params: { name, arguments: args } }),
  });
  const json = await res.json();
  const text = json.result?.content?.find((c) => c.type === "text")?.text ?? "";
  const failed = json.error || json.result?.isError;
  if (failed) {
    const msg = json.error?.message ?? text;
    if (/rate limit/i.test(msg) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      return callTool(name, args, attempt + 1);
    }
    throw new Error(msg);
  }
  return JSON.parse(text);
}

/** Page through a collection so the audit never silently truncates. */
async function all(collection, select) {
  const out = [];
  let cursor;
  for (;;) {
    const page = await callTool("query_entries", {
      collection,
      select,
      limit: 200,
      ...(cursor ? { cursor } : {}),
    });
    out.push(...page.entries);
    if (!page.hasMore || !page.nextCursor) break;
    cursor = page.nextCursor;
  }
  return out;
}

const failures = [];
const notes = [];
const fail = (inv, msg) => failures.push(`[${inv}] ${msg}`);
const note = (msg) => notes.push(msg);

const fmt = (n) => n.toLocaleString("en-US");

async function main() {
  console.log("Reading live data…\n");
  const [txns, wallets, stakes, listings, users] = await Promise.all([
    all("transactions", ["owner_id", "amount", "type", "idempotency_key", "listing", "counterparty", "reversed"]),
    all("wallets", ["owner_id", "balance", "escrow", "lifetime_earned", "lifetime_invested", "lifetime_received", "user"]),
    all("stakes", ["backer", "listing", "amount"]),
    all("listings", ["name", "owner_id", "bucks_total", "distinct_backers", "author"]),
    all("users", ["name", "clerk_user_id"]),
  ]);

  console.log(
    `  ${txns.length} transactions · ${wallets.length} wallets · ${stakes.length} stakes · ${listings.length} listings\n`,
  );

  const clerkById = new Map(users.map((u) => [u.id, u.data.clerk_user_id]));

  /* The demo dataset was written directly rather than through the economy
   * service, so seed rows have no ledger behind them by construction. They are
   * excluded from the behavioural invariants (4–7) and reported instead — a
   * check that can never pass tells an operator nothing. */
  const isSeedOwner = (ownerId) => String(ownerId).startsWith("seed_");
  const isSeedUser = (userId) => (clerkById.get(userId) ?? "").startsWith("seed_");

  /* ---- 1. ledger reconciliation, per wallet ---- */
  const byOwner = new Map();
  for (const t of txns) {
    const o = t.data.owner_id;
    byOwner.set(o, (byOwner.get(o) ?? 0) + t.data.amount);
  }
  for (const w of wallets) {
    const ledger = byOwner.get(w.data.owner_id) ?? 0;
    if (ledger !== w.data.balance) {
      fail("1 reconcile", `${w.data.owner_id}: ledger ${fmt(ledger)} != balance ${fmt(w.data.balance)} (drift ${fmt(ledger - w.data.balance)})`);
    }
  }
  // Ledger rows whose owner has no wallet at all.
  const walletOwners = new Set(wallets.map((w) => w.data.owner_id));
  for (const owner of byOwner.keys()) {
    if (!walletOwners.has(owner)) fail("1 reconcile", `ledger rows for "${owner}" but no wallet exists`);
  }

  /* ---- 2. no negative balances ---- */
  for (const w of wallets) {
    if (w.data.balance < 0) fail("2 negative", `${w.data.owner_id} balance ${fmt(w.data.balance)}`);
    if ((w.data.escrow ?? 0) < 0) fail("2 negative", `${w.data.owner_id} escrow ${fmt(w.data.escrow)}`);
  }

  /* ---- 3. idempotency keys unique ---- */
  const keys = new Map();
  for (const t of txns) {
    const k = t.data.idempotency_key;
    if (!k) { fail("3 idempotency", `txn ${t.id} has no idempotency_key`); continue; }
    if (keys.has(k)) fail("3 idempotency", `duplicate key "${k}" on ${t.id} and ${keys.get(k)}`);
    keys.set(k, t.id);
  }

  /* ---- 4/5. investment legs + tax math ----
   * The three legs of one investment share a key suffix, differing only in
   * their prefix: invest_out_<X>, invest_in_<X>, tax_<X>. Group on the
   * suffix. (Matching a trailing uuid instead would silently skip any
   * investment whose requestKey isn't uuid-shaped — which is exactly how
   * hand-driven test traffic slips past an audit unverified.) */
  const legKey = (k, type) => {
    const prefix = type === "invest_out" ? "invest_out_" : type === "invest_in" ? "invest_in_" : "tax_";
    return k.startsWith(prefix) ? k.slice(prefix.length) : null;
  };
  const invest = new Map();
  let unmatchedLegs = 0;
  let seedLegs = 0;
  for (const t of txns) {
    const type = t.data.type;
    if (!["invest_out", "invest_in", "invest_tax", "self_invest_tax"].includes(type)) continue;
    // Discriminate on KEY SHAPE, not owner: a real investment into a seed
    // founder's listing has its invest_in leg owned by that seed user, so
    // excluding seed owners would orphan legitimate counter-legs. Only rows
    // the economy service never wrote (seed keys like "seed_alexr_t2") lack
    // the prefix.
    const id = legKey(t.data.idempotency_key ?? "", type);
    if (!id) {
      if (isSeedOwner(t.data.owner_id)) seedLegs++;
      else unmatchedLegs++;
      continue;
    }
    const rec = invest.get(id) ?? { id };
    if (type === "invest_out") rec.out = t;
    else if (type === "invest_in") rec.in = t;
    else rec.tax = t;
    invest.set(id, rec);
  }
  if (unmatchedLegs) {
    fail("5 legs", `${unmatchedLegs} investment ledger row(s) have an unrecognised idempotency-key shape and could not be verified`);
  }
  if (seedLegs) note(`${seedLegs} seed investment leg(s) excluded (demo content, no matching counter-leg by construction)`);

  let taxTotal = 0;
  for (const rec of invest.values()) {
    if (!rec.out) { fail("5 legs", `investment ${rec.id}: missing invest_out`); continue; }
    if (!rec.in) { fail("5 legs", `investment ${rec.id}: invest_out with no matching invest_in`); continue; }

    const gross = Math.abs(rec.out.data.amount);
    const net = rec.in.data.amount;
    const tax = gross - net;
    taxTotal += tax;

    const isSelf = rec.tax?.data.type === "self_invest_tax";
    const rate = isSelf ? TAX_SELF : TAX_UNIVERSAL;
    const expected = Math.ceil(gross * rate);
    if (tax !== expected) {
      fail("4 tax", `investment ${rec.id}: gross ${gross}, net ${net} → tax ${tax}, expected ${expected} (${isSelf ? "self" : "universal"} rate)`);
    }

    // Self-investment must land on one wallet; cross-investment on two.
    const sameWallet = rec.out.data.owner_id === rec.in.data.owner_id;
    if (isSelf !== sameWallet) {
      fail("4 tax", `investment ${rec.id}: ${isSelf ? "self" : "universal"} rate but out/in wallets ${sameWallet ? "match" : "differ"}`);
    }
  }
  note(`${invest.size} investments · ${fmt(taxTotal)} bucks burned as tax (derived from out/in gap — the tax rows carry amount 0)`);

  /* ---- 6. stakes agree with the ledger (real backers only) ---- */
  const stakeByListing = new Map();
  let seedStakeTotal = 0;
  for (const s of stakes) {
    const l = s.data.listing?.id;
    if (!l) continue;
    if (isSeedUser(s.data.backer?.id)) { seedStakeTotal += s.data.amount; continue; }
    stakeByListing.set(l, (stakeByListing.get(l) ?? 0) + s.data.amount);
  }
  const grossByListing = new Map();
  for (const rec of invest.values()) {
    const l = rec.out?.data.listing?.id;
    if (!l || isSeedOwner(rec.out.data.owner_id)) continue;
    grossByListing.set(l, (grossByListing.get(l) ?? 0) + Math.abs(rec.out.data.amount));
  }
  for (const listingId of new Set([...grossByListing.keys(), ...stakeByListing.keys()])) {
    const gross = grossByListing.get(listingId) ?? 0;
    const staked = stakeByListing.get(listingId) ?? 0;
    if (staked !== gross) {
      const name = listings.find((l) => l.id === listingId)?.data.name ?? listingId;
      fail("6 stakes", `"${name}": stakes ${fmt(staked)} != ledger gross ${fmt(gross)}`);
    }
  }
  if (seedStakeTotal) note(`${fmt(seedStakeTotal)} bucks of seed stakes excluded (demo content, no ledger by construction)`);

  /* ---- 7. lifetime counters (real wallets only) ---- */
  let seedCounterExposure = 0;
  for (const w of wallets) {
    const owner = w.data.owner_id;
    const mine = txns.filter((t) => t.data.owner_id === owner);
    const invested = mine.filter((t) => t.data.type === "invest_out").reduce((n, t) => n + Math.abs(t.data.amount), 0);
    const received = mine.filter((t) => t.data.type === "invest_in").reduce((n, t) => n + t.data.amount, 0);
    if (isSeedOwner(owner)) {
      seedCounterExposure += Math.abs(w.data.lifetime_invested - invested) + Math.abs(w.data.lifetime_received - received);
      continue;
    }
    if (w.data.lifetime_invested !== invested) {
      fail("7 counters", `${owner}: lifetime_invested ${fmt(w.data.lifetime_invested)} != ledger ${fmt(invested)}`);
    }
    if (w.data.lifetime_received !== received) {
      fail("7 counters", `${owner}: lifetime_received ${fmt(w.data.lifetime_received)} != ledger ${fmt(received)}`);
    }
  }
  if (seedCounterExposure) {
    note(`${fmt(seedCounterExposure)} bucks of seed lifetime-counter values excluded (demo content, no ledger by construction)`);
  }
  note(`verified against real activity: ${wallets.filter((w) => !isSeedOwner(w.data.owner_id)).length} of ${wallets.length} wallets`);

  /* ---- 8. escrow is backed by exactly one live bid ----
   * Only the leading spotlight bidder may hold escrow. If the totals diverge,
   * a refund was missed (bucks stranded) or a bid was not held (bucks the
   * bidder could double-spend). Both are money bugs, so check them directly. */
  const slot = (await all("spotlight", ["slot", "high_bid", "high_bid_owner"]))[0];
  const realWallets = wallets.filter((w) => !isSeedOwner(w.data.owner_id));
  const escrowTotal = realWallets.reduce((n, w) => n + (w.data.escrow ?? 0), 0);
  const leadingBid = slot?.data.high_bid ?? 0;
  if (escrowTotal !== leadingBid) {
    fail("8 escrow", `wallets hold ${fmt(escrowTotal)} in escrow but the leading bid is ${fmt(leadingBid)}`);
  }
  for (const w of realWallets) {
    const held = w.data.escrow ?? 0;
    if (held > 0 && w.data.owner_id !== slot?.data.high_bid_owner) {
      fail("8 escrow", `${w.data.owner_id} holds ${fmt(held)} in escrow but is not the leading bidder`);
    }
  }
  const seedEscrow = wallets.reduce((n, w) => n + (isSeedOwner(w.data.owner_id) ? (w.data.escrow ?? 0) : 0), 0);
  if (seedEscrow) note(`${fmt(seedEscrow)} bucks of seed escrow excluded (demo content, backs no live bid)`);

  /* ---- report ---- */
  const supply = wallets.reduce((n, w) => n + w.data.balance, 0);
  const ledger = txns.reduce((n, t) => n + t.data.amount, 0);
  console.log(`Supply: ${fmt(supply)} across ${wallets.length} wallets · ledger total ${fmt(ledger)}\n`);
  for (const n of notes) console.log(`  · ${n}`);
  console.log();

  if (failures.length === 0) {
    console.log("PASS — every invariant holds.\n");
    return;
  }
  console.log(`FAIL — ${failures.length} violation(s):\n`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log();
  // Set the code rather than calling process.exit(): forcing teardown while
  // fetch's keep-alive sockets are open trips a libuv assertion on Windows
  // and clobbers the exit status this script exists to report.
  process.exitCode = 1;
}

main().catch((e) => {
  console.error("audit crashed:", e.message);
  process.exitCode = 2;
});
