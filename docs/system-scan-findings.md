# System scan — findings and fix plan

> Full-codebase scan, 2026-07-23, four parallel passes: Quick Ideas, all API routes, client-side
> state/refresh, economy/data integrity. This is the evidence base for [Sprint 0](sprint-0-mcp-config-bugs.md)
> §0.4. Severity: **P0** breaks a feature or corrupts data · **P1** wrong/stale under normal use ·
> **P2** edge/robustness.

---

## The two you reported

**"Quick-idea comments don't show up instantly."** Not one bug — three stacked:
1. **Read-your-writes across two planes.** The comment is *written* through MCP (`callTool`) but
   *refetched* through the delivery API (`getAgentX`). The two planes have no consistency guarantee,
   so the refetch fired milliseconds after the write can return the list **without** the row it just
   created. `api/quick/comment/route.ts` (POST MCP :59 / GET delivery :23).
2. **No `router.refresh()`** in `CommentThread.post()` (`QuickControls.tsx:130`) — the card's
   server-rendered `comment_count` stays stale for everyone.
3. **`useState(count)` never re-syncs** (`QuickControls.tsx:112`) — local count drifts and ignores any
   fresh server prop.

**"The downvote button isn't showing."** Not a bug — **it was never built.** The board is upvote-only
by design: a unique upvote per user (`vote_key`), permanent, no decrement, no `downvotes` field in the
schema. This is a **product decision**, not a fix (see Decisions below).

**"Investing doesn't minus the balance / doesn't show in the ledger."** Verified in live data:
**investing works end to end** — every `invest_out` is in the ledger and the real `wallet.balance`
decremented correctly. The bug is **display-only**, Pattern C:
- `BucksChip.tsx:52` holds the shown balance as `useState(balance)` and only updates it in the
  daily-claim handler (`:63`). After an **invest**, `WalletChip` (server) passes a fresh `balance` prop
  but the mounted `BucksChip` ignores it — **the header balance freezes until a full reload.** This is
  the "not minusing" symptom. Fix: `useEffect(() => setShown(balance), [balance])`, or render the prop
  directly. Promoted to **P1** by the report.
- The wallet *page* ledger is server-fresh on load; an empty-looking ledger there is Next's client
  router cache serving a pre-invest `/wallet`. Fix: `export const dynamic = 'force-dynamic'` on the
  wallet route (and see landmine #21). **Wallet write/read mechanics themselves are sound.**

---

## Cross-cutting patterns (this is "where we're going wrong")

The individual bugs cluster into eight root patterns. Fixing the pattern is cheaper than fixing each site.

| # | Pattern | Where it bites | Sev |
|---|---|---|---|
| A | **Write via MCP, read via delivery API** — no read-your-writes | quick comments (the reported bug); latent anywhere a POST is followed by an immediate refetch | P1 |
| B | **Stored counters that only ever increment** — never decremented on moderation, never audited | `upvotes`, `comment_count`, `cloned_count`, `listings.bucks_total/backers` | P1 |
| C | **`useState(prop)` + missing `router.refresh()`** — local state that can't re-sync | VoteButton, CommentThread, ArtifactActions, CoverEditor, KeyManager, BucksChip | P1 |
| D | **Realtime feed is dead code** — `agentx.ts` ships `changes.stream/poll`, nothing subscribes | every count on every board only updates on hard reload | P1 |
| E | **Non-idempotent multi-write `transact`s** — retry ⇒ duplicate rows | chat, quick-comment, quick-clone, publish | P1 |
| F | **Racy read-then-write upserts, no unique constraint** — two concurrent calls ⇒ two rows | user-by-email, signal one-per-person, publish one-listing-per-idea, report dedup | P0–P2 |
| G | **Hand-rolled `publicFilter` over MCP** — `status:"live"` re-checked by hand, leaks the moment it's edited | me/listings, quick/clone, feedback, signal reads | P2 |
| H | **Unguarded `get_entry` / `req.json()`** — 500 where 404/400 belongs | chat, signal, feedback, publish, claim, report, admin/* | P2 |

---

## P0 — breaks a feature or corrupts data

**1. Duplicate user + wallet per email.** `ensureProvisioned` (`economy.ts:103`) de-dupes **only on
`clerk_user_id`**, never on email — there is *zero* email lookup in the whole codebase. A second Clerk id
for the same human creates a second `users` row (handle-collision handler silently suffixes it), a
second wallet, and a **second 100-buck signup grant**. This is the confirmed cause of the two
`partners@dinodigi.com` accounts. Splits balance/stakes across two wallets, corrupts rank and
reconciliation. **Fix the guard before merging the live rows, or the next sign-in recreates them.**

**2. Artifact edit / delete / publish-toggle is permanently dead.** POST creates the artifact **without
`owner_id`** (`artifacts/route.ts:99`), but PATCH (:173) and DELETE (:199) gate on
`row.owner_id === userId`. `undefined !== userId` is always true → every edit, delete, and
**"show on public page" toggle returns 404.** Fails closed, so no data leak, but the feature is inert.
Fix: stamp `owner_id: userId` on create (every other route already does).

**3. Ledger drift from the demo.** Two wallets were set to `balance: 25000` by direct write with no
ledger rows, so `audit-economy.mjs` invariant #1 now **fails**. Reconcile (compensating entries or reset
to true ledger sum) before the audit is trusted again. *(My doing during the demo — flagging it, not hiding it.)*

---

## P1 — wrong or stale under normal use

**4. VoteButton never reconciles.** Count is `useState(upvotes)` (`QuickControls.tsx:13`), `voted` starts
`false` and is never hydrated from the server, and there's **no `router.refresh()`** after voting. A
returning user sees already-upvoted ideas as un-voted; clicking 409s and the code swallows it silently.
Pattern C.

**5. Comment race + stale count** — the reported bug. Patterns A + C. Fix A structurally (read back
through the same plane you wrote, or return the created row from the POST) and add `router.refresh()`.

**6. Counters drift under moderation.** Hide a comment and the card still reads "5 comments" over a
4-item live thread; same for `upvotes` vs live votes and `listings.bucks_total`. Pattern B. **The audit
script fetches `listings.bucks_total`/`distinct_backers` but never checks them** — a drift blind spot in
the tool advertised as the integrity gate.

**7. Non-atomic clone orphans an idea.** `quick/clone` creates the `ideas` row **outside** the follow-up
`transact` (`:38` vs `:56`). If the transact fails, a private idea exists with no seed chat and no
counter bump; the user sees a 500. Double-click ⇒ two ideas. Patterns E + F.

**8. Uploaded cover dropped on first publish.** `publish/route.ts:100` reads
`idea.data.cover_image?.id`, but `cover/route.ts` stores `cover_image` as a bare asset-id **string**, so
`.id` is `undefined` and the new listing gets `cover_image: null`. Regresses the exact case its own
comment claims to fix. Fix: use `idea.data.cover_image` directly.

**9. Spotlight GET leaks non-public auction fields.** `spotlight/route.ts` returns `highBid`,
`highBidder`, `highListing`, `auctionEndsAt` via MCP — fields the public `Spotlight` delivery view
deliberately omits. Pattern G. Probably intended for the auction display, but it's a real bypass; decide
and make it explicit.

**10. Realtime feed unused.** Pattern D. Not a per-site fix — a decision about whether the boards should
live-update at all (see Decisions).

**11. Chat persistence not idempotent.** `chat/route.ts:170` writes user+assistant messages, memories,
activity and the turn bump with **no idempotency key**, and `turn` is a read-modify-write with no CAS.
A retry or a lost-response-after-success duplicates messages and double-advances the turn. Pattern E.
**This matters extra for Sprint 1** — the guided runtime leans on chat persistence.

---

## P2 — robustness / edge

- **12. Signal one-per-person is racy** — query-then-create, no unique constraint (`signal/route.ts:35`). Pattern F.
- **13. Publish one-listing-per-idea is racy** — same shape (`publish/route.ts:53`). Pattern F.
- **14. Unguarded `get_entry` ⇒ 500** — chat, signal, feedback, publish, claim (should be 404/409). Pattern H.
- **15. Unguarded `req.json()` ⇒ 500** — report, admin/report, admin/listing (should be 400). Pattern H.
- **16. `dailyClaim` surfaces transient CAS conflicts as 500** instead of a retryable 409 (`claim/route.ts:9`).
- **17. Self-invest inflates `distinct_backers`** — the one anti-sybil counter is inflatable by the listing owner (`economy.ts:442`).
- **18. Vote/report/bootstrap** minor: text-fragile 409 detection, racy report dedup, unguarded provisioning. Patterns F/H.
- **19. `postedToday` counts your own removed ideas** toward the daily limit (`quick/route.ts:24`). Pattern G.
- **20. Nit:** unused `McpError` import in `quick/route.ts:3`.

---

## Verified sound (so we don't re-audit)
- Invest / daily-claim / spotlight bid-settle: atomic `transact`, CAS on `ledger_version`, idempotency-keyed, jittered backoff. **No double-spend.**
- Spotlight escrow/refund/burn reconciles against ledger invariant #1.
- Admin routes enforce `getStaff()` and write their audit row in the same transact.
- Board server list is **not** stale-cached today (dynamic via `auth()`/`searchParams` + `no-store`) — but see landmine #21 below.
- **21. Landmine (P2):** the board's freshness is *accidental* — it depends on `await searchParams`
  preceding the list fetch. Reorder that and `fetchCache:'auto'` caches it indefinitely. Add an explicit
  `export const dynamic = 'force-dynamic'` (or `revalidate`) to lock it in.

---

## Fix plan — batched by pattern (folds into Sprint 0 §0.4)

**Batch 1 · Data-integrity P0 (do first, before any Sprint 1 schema work)**
- Email-dedupe guard in `ensureProvisioned` + reconcile the two live `partners@` rows (#1)
- Stamp `owner_id` on artifact create; revives edit/delete/publish-toggle (#2)
- Reconcile the two 25 000 wallets so the audit passes (#3)
- Demote the test admin; clear the junk stream rows *(from Sprint 0 §0.3)*

**Batch 2 · The reported bugs + their pattern**
- Fix the comment read-your-writes (Pattern A) — simplest: have the POST return the created comment and
  the client append it, so it never depends on the lagging read plane
- Add `router.refresh()` to CommentThread and VoteButton; hydrate `voted` from server state (Patterns C)
- Decide downvote (product decision, below)

**Batch 3 · Idempotency + atomicity (Pattern E/F)**
- Idempotency keys on chat, quick-comment, quick-clone, publish transacts
- Fold clone's idea-create into its transact
- Unique constraints (or CAS) for user-email, signal one-per-person, publish one-per-idea

**Batch 4 · Counter integrity (Pattern B)**
- Decrement counters on moderation, or make the card counts derive from live rows
- Add audit invariants for `listings.bucks_total` / `distinct_backers`

**Batch 5 · Robustness sweep (Patterns G/H)**
- Guard `get_entry`/`req.json()` → 404/400; make `dailyClaim` conflicts a 409
- Make the spotlight field exposure an explicit decision
- Add `export const dynamic` to the board (#21)

**Deferred / decisions, not fixes**
- Realtime live-updating (Pattern D) — real work, own its own decision
- Downvote — product call
- Sybil/rank weighting — ECONOMY.md already flags it "undecided"

---

## Decisions I need from you
1. **Downvote:** build it (net score, schema change, changes the board's tone) or stay upvote-only?
2. **Live updates:** wire the existing realtime feed so boards update without reload, or accept
   refresh-on-navigate for now? (Real work; not required to fix the reported bug.)
3. **Counter drift:** decrement-on-moderation (cheap, can still drift) vs derive counts from live rows
   (correct, more reads)?
