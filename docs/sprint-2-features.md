# Sprint 2 — Quick Ideas voting, live updates, counter integrity

> Features decided during Sprint 0 planning that are **not bugs** — they expand the product, so
> they live here rather than bloating the Sprint 0 stabilization pass. Independent of Sprint 1;
> can run whenever.

---

## Feature 1 · Downvoting

Today the board is upvote-only: a unique upvote per user (`vote_key`), permanent, no `downvotes`
field. This adds up/down with a togglable vote. **Schema, API, and UI already scoped in Sprint 0.**

**Schema (additive — non-destructive; `define_collection` needs no `confirm` for new fields):**
- `quick_votes` + `direction` enum `["up","down"]` — optional, so existing rows read as "up"
- `quick_ideas` + `downvotes` (number, min 0, integer, publicRead, indexed); keep `upvotes`

**API (`/api/quick/vote`):** rework insert-only → **toggle**. First vote inserts with a direction and
increments that counter; same direction again removes the row and decrements; opposite direction flips
the row and moves one from each counter. All counter moves in one atomic `transact`, idempotent on a
client `requestKey`.

**UI (`VoteButton`):** down-chevron below the count; display **net** (`upvotes − downvotes`); reflect the
caller's current vote (up / down / none). Delivers the deferred **vote-state hydration** — the board
query must return the caller's vote so the arrows render correctly on load (requires exposing
`quick_votes` to the caller, or a per-user vote lookup in the page).

**Deferred sub-decision:** "Top" sort stays on `upvotes` for v1. Net-score ranking needs a maintained
`score` field + a backfill of existing rows — a small follow-up.

---

## Feature 2 · Live updates (automatic render)

The generated client ships `changes.stream` / `changes.poll` (`agentx.ts`) but **nothing subscribes** —
so every count on every board (upvotes, comments, cloned, bucks, spotlight bids) only updates on a hard
reload. Wire it so boards update automatically.

- Subscribe the key boards — stream, Quick Ideas, spotlight — to the delivery `changes` feed
- Reconcile local state from change events (respecting the `useState(prop)` pattern already fixed in
  Sprint 0, so external changes propagate)
- Fall back to poll where SSE isn't available; the feed is gated by the same publicFilter as reads

Systemic change — its own careful pass. Biggest risk is subscription lifecycle (mount/unmount, dupes).

---

## Feature 3 · Counter integrity on moderation

**Decision (owner deferred → decided decrement-on-moderation):** when an admin hides/removes a comment,
quick idea, or listing, **decrement** the stored counter it fed. Cheap, moderation is rare, reversible.

- Hide/remove a `quick_comment` → decrement its idea's `comment_count`
- Remove a `quick_idea` / listing → the board already filters `status`, but reconcile any rolled-up counts
- Add an audit invariant for `listings.bucks_total` / `distinct_backers` (the drift blind spot) — now
  meaningful because the demo ledger is reconciled and the audit is green

---

## Not here
- Realtime for the **idea hub chat** — that's Sprint 1's guided runtime, not a board
- Net-score ranking — the downvote follow-up above
