# Sprint 4 — Platform hardening & performance (AgentX adoption)

A separate track from the Sprint 3 product reshape. Goal: make the app fast and
the data layer robust by adopting AgentX capabilities we validated live this
session. These are mostly **read-side, reversible, no money-path** changes, so
they can land independently of (and before) the idea-hub rework.

## Why this sprint exists — what the numbers actually say
We added per-call MCP timing (`lib/mcp.ts`, dev-only / `MCP_TIMING=1`). First real
numbers from a home render:

```
[mcp] ok  416ms  query_entries:users
[mcp] ok  425ms  query_entries:spotlight
[mcp] ok 1228ms  query_entries:spotlight   ← cold outlier
[mcp] ok  152ms  query_entries:users
```

Takeaway: **~150–425ms warm per round-trip (up to ~1.2s cold). Pluggie is not
slow per call — we make too many calls per page** (idea hub = 6+). The lever is
round-trip *count*, plus hosting (Render free-tier cold starts, Clerk dev keys),
which are separate config fixes, not code.

## Committed items (priority order)

### 1. MCP call timing — DONE (pending commit)
One log line per `callTool` with wall time + retry count, gated to dev/`MCP_TIMING`.
**Risk: ~zero** — dev-only, no control-flow change, prod is an early-return no-op.

### 2. Leaderboards via `aggregate_entries` — low risk, validated
**Current:** home, wallet, and `/leaderboard` each pull up to 200–500 `stakes`
rows via the delivery API and reduce by backer in JS, then filter suspended with
a second `suspendedUserIds()` query.
**Change:** one `aggregate_entries` call — `sum(amount) groupBy backer`, with
`where backer.suspended != true` folded in. Returns per-backer totals *with
labels*, largest-first.
**Verified live this session:**
- `stakes.publicFilter` is `null` → nothing hidden to leak by using the MCP plane
  (the trap that bit quick-ideas does not exist here).
- The suspended relation-filter returns exactly the right backers (Founder 360,
  Dino Digi 1345, Alex 350) — identical to today's board, dupe excluded.
- **Read-only / display-only** — does not touch invest/ledger/wallet. Worst case
  is a wrong ranking number, never a wrong balance. Audit invariants untouched.
- More correct at scale: JS-reduce over 500 rows undercounts if stakes > 500;
  the aggregate sums across all rows (caps at 500 *backers*, `truncatedGroups`).
**Rollout:** `/leaderboard` first (eyeball before/after in the `[mcp]` logs), then
home + wallet. Reversible in one revert. Deletes the `suspendedUserIds()` helper.

### 3. Cheap counts via `count_entries`
Replace any "fetch rows just to `.length`" with `count_entries`. Same low risk.

### 4. Cache static per-render reads
`chat_templates` and `onboarding_questions` are identical on every render but are
re-fetched each time. Cache them (request-memo or short TTL) to drop calls per
page. Low risk (static reference data).

### 5. Evaluate the delivery `batch` endpoint for the idea hub
`POST {deliveryBase}/batch { queries:[…] }` answers up to 10 reads in ONE
round-trip — ideal for the per-user idea hub (6+ calls today).
**Caveats / why "evaluate," not "do":** it's the **delivery plane** — subject to
`publicFilter` and the ~15s convergence lag, so it's only safe for reads that
don't need read-your-writes. And don't batch *public cacheable* sections (single
GETs are CDN-served free). **Measure with the timing logs first**, then adopt only
where it's a clear win and consistency-safe.

### 6. (Stretch) thin data-access helper
Centralize "which plane do I read from" (MCP vs delivery) so app code stops
deciding per-query — the standing tech-debt behind the read-your-writes bugs.

## Coordinated with Sprint 3 (dependency, not owned here)
- **`array` / `group` / typed-blocks field types** — validated they exist (this
  corrects my earlier "no nested schemas"). They're the right primitive for the
  Sprint 3 **single-pager / pitch deck** and for replacing the JSON-in-text
  onboarding/chat questions. Owned by Sprint 3, but the schema work carries the
  `define_collection` all-or-nothing risk → **snapshot with `describe_collection`
  and diff before every change.**

## Available capabilities — not committed, adopt when a feature needs them
Found live via `get_project_info` / `list_connectors`:
- **Resend = connected** (`admin@builtbystallion.com`) — unblocks email flows
  (notify-me-on-launch list, "your idea got backed", feedback digests).
- **`define_schedule`** — background jobs (the huddle's "job that pulls open
  questions", digests, lazy economy settlement).
- **`events` / `beforeWrite` hooks** — move the one-idea-per-day quota and
  notifications off app code (needs an endpoint on our infra).
- **`changes` stream (SSE/poll)** — live-updating stream/feedback without polling.
- **Image resize** (`/assets/{id}/image?w=&h=`) — responsive covers/avatars.
- **Stripe checkout** — when BYOK → paid tiers (not configured yet).

## Risk summary
| Item | Plane | Touches money? | Reversible | Risk |
|------|-------|----------------|-----------|------|
| 1 timing | — | no | yes | ~none (dev-only) |
| 2 leaderboard aggregate | MCP read | no (display) | yes | low, validated |
| 3 count_entries | MCP read | no | yes | low |
| 4 cache static reads | MCP read | no | yes | low |
| 5 batch endpoint | delivery read | no | yes | med — consistency caveats, measure first |
| 6 data-access helper | both | no | yes | med — refactor surface |

## Recommended sequencing
Do **1–3 first** (low-risk, and they let us *measure* before the idea-hub work),
then 4, then evaluate 5 with numbers in hand. 6 is opportunistic. Config fixes
(prod Clerk keys, paid Render instance) are outside this doc but remove the
cold-start / auth-throttle slowness independently.
