# Shipped

Append-only. Newest first. Every entry carries its commit — an entry without one
is a claim, not a record.

All commits are on `main` and deployed to Render.

---

## Sprint 5 — Idea Hub & Memory Foundation · closed 2026-07-30

Retro: [retros/sprint-5-idea-hub-and-memory.md](retros/sprint-5-idea-hub-and-memory.md)

| Commit | What landed |
|---|---|
| `e5e86b4` | Recorded chat-reliability findings (degenerate reply, bodyless 500, unguarded parse) → became BL-01/02/03 |
| `f5a9c45` | Homepage: Top quick ideas widget leads the rail, Biggest movers demoted (BL-31) |
| `026b739` | Consistent chips + readable replies — hard rule that enumerated options must ship as chips; chips persist on the message so a reload no longer drops them; agent formats for a chat bubble; bubbles render `pre-wrap` |
| `6e57196` | **Reverted** the document-first overview back to the accordion layout — same data, cleaner UI |
| `12cbd3a` | ~~Overview goes document-first~~ *(reverted by `6e57196` — removed data the founder wanted on the page)* |
| `056ff98` | Collapsible chat deck + overview rail accordion; defined missing `.clamp2/.clamp3` |
| `90ba16e` | Conversations fill the overview's left column, sorted by fixed pitch order (was recency) |
| `be915e8` | Memory tab restored (with kind/intent/entity pills); chips biased on by default; chat initiation no longer reads as frozen (status line + Try again) |
| `0c7b863` | Onboarding trimmed to 1 open question + 5 picks; confirm screen; hatch animation |
| `1728fe1` | Coverage signal on chat cards; agent-suggested quick replies (`suggested_replies`) |
| `d36a8b9` | **Sprint 5 core** — 7 question arcs (19 required + 12 optional intents); `kind`, `entities`, `intent_key` on memories; topic expanded; singular intents update their node in place with old→new to activity; tagline renders beside the brand name |
| `13ab4ac` | **Root-cause fix:** `.row`/`.col`/`.gap*` flex utilities were never defined in CSS — chat composer couldn't pin, thread couldn't scroll, avatars stacked above bubbles |
| `21ca32a` | Round-2 quick wins: suspended accounts excluded from all leaderboards; gate explainer tooltip; un-vote on quick ideas |
| `cedbc8e` | Two P1 smoke-test bugs: quick-idea "silently discarded" (read-plane mismatch — board now reads MCP); wallet "Tax burned −0" (display fix + backfilled labels); home Top-backers keyed by id not name |
| `1249a57` | **Feedback management** — `response` retrospect field + `in_progress`/`wontfix` statuses; admin wall + API; plus 7 round-1 fixes (chat tab-switch stale thread, composer push, 60s timeout, memory→brief features backfill, onboarding step counter, prefetch storm) |

**Also shipped without code:** all 20 shareholder-feedback items triaged to
`actioned` or `reviewed`, each with a written retrospect.

---

## Earlier

| Commit | What landed |
|---|---|
| `a290ea7` | Invest modal escaped its row via `createPortal` (hover transform created a containing block trap) |

Sprints 0 (stabilization), 1 (idea dashboard / onboarding), and 2 (features —
*never started*) predate this log. See their specs in `docs/sprint-*.md`.
