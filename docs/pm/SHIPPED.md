# Shipped

Append-only. Newest first. Every entry carries its commit — an entry without one
is a claim, not a record.

All commits are on `main` and deployed to Render.

---

## Sprint 6 — The Co-Founder Engine · in progress

| Commit | What landed |
|---|---|
| `98d3dc7` | **BL-59 — prod bug, found by Dino, fixed same day.** The structured-output parse-failure fallback returned raw model text as the reply, so a brace-spiral (long-form cousin of the July `"content"` dud, likely running to the 16k-token cap) rendered model innards to the founder — twice in one chat, the first poisoning context for the second. Parse failure now yields an empty degenerate turn (BL-01 retry → graceful non-persisted line), `isDegenerate` catches brace-floods at any length, and both poisoned rows were repaired in place |
| `a8a9e20` | **BL-45 — Studio preview, closing the sprint's build list.** Dry-run any chat's live prompt + arc against a built-in sample idea; reply, chips, and would-be captures (kind/intent/entity badges) rendered in the editor; nothing persisted; one model call on the staffer's own BYOK key with the cost stated. Preview refuses to run over unsaved edits |
| — (CMS data, no deploy) | **BL-41** — all 7 live system prompts rewritten to the six-part standard (Job/Good/Push/Push back/Boundary/Stuck), one versioned `chat_templates` edit per chat, live for founders immediately. Pricing uses the spec's worked example. Guard-run pair (committed): extraction held, brief fill passed, zero raw degenerates; the new pushes visibly firing in replies ("not just 'the organizer' broadly…", "they're not necessarily the one who should foot the bill"). Closes the 4× depth gap from the original audit |
| `10407fe` `a3f3031` `a7919bf` | **BL-53/54/55 — the co-founder moves.** Verbatim rides into the memory context and replies quote the founder's own words; memories name their source chat and the agent connects them conversationally without re-asking; contradictions get quoted both-ways and resolved onto the intent node. Guard-run pair: extraction metrics held (dups 0/1, brief-fill flag on run 13 traced to replay divergence, not the engine — caveat documented in the fixture); quoting + cross-chat behavior visible in committed reply corpus (pricing building on problem-chat memories in the founder's words) |
| `ef1ac2f` + `c93d05b` | **BL-51 + BL-52 — Track A complete.** `feeds` dropped (brief_updates owns the brief; the d6c37fec backfill replaced by a harness brief-fill metric — both measurement runs passed the floor without it). `kind` taxonomy kept with recognition cues for the silent three; fixture lacks ground truth, so validation waits for a richer conversation. Runs committed |
| `eb08203` | **BL-49** — bare confirmations ("yes, that's it") now anchor to the arc intent they answer or ride the brief update they confirm; the unanchored restatement row is gone in both measurement runs. No-intent 1/9 and 3/13 vs 7/15 at baseline. Runs committed |
| `04a944d` + `5cb98db` | **BL-48 + BL-57** — one fact, one memory (fragments enrich content; refinements re-tag the intent key so nodes update in place), and the agent's own first-pass analysis is never a memory (requests-to-you produce zero rows; the founder's reaction is what gets captured). Combined measurement pair: duplicates 0 and 1 (target ≤1, was 3 at baseline and up to 5 mid-tuning); initiation chats produced zero self-capture rows in both runs; founder-named entity capture held at 5/6. Runs committed |
| `77f02d7` | **BL-47** — entity extraction sharpened (worked examples in the schema; entity tagging named in the turn checklist, which never mentioned it). Measured over two committed runs: entities 47/50% → 54/69%; phone calls captured for the first time in five measurements; Splitwise-class agent-named captures correctly absent without founder engagement (prior ✓s were the BL-57 defect) |
| `7964dad` | **BL-56 closed** — first two live audit runs (reference JSONs committed); harness now mirrors the BL-01 retry via a shared `isDegenerate` in `turn-apply.ts` (run 2: 2 raw duds, 0 past retry). Splitwise-class capture confirmed live; run-to-run variance documented; new defect filed as BL-57 (initiation turns store the agent's own analysis as founder memories) |
| `3f0162d` | **BL-44** — structured arc editor in the Prompt Studio: intent text, required toggle, singular/accumulative, reorder, add, remove-with-warning. Existing intent keys locked (add and deprecate, never rename); new keys live-normalized to snake_case; server validates the structured arc and owns `question_arc` serialization — no JSON textarea anywhere |
| `3f27beb` | **BL-43 + BL-46** — Prompt Studio: `/admin?tab=prompts` lists all chat templates in pitch order with an edit form (name, subtitle, system/initiation/opening prompts; arc read-only pending BL-44; retired `questions` absent) and Pluggie-backed version history with restore. Save + restore audited (`admin_actions` enums extended CMS-side: `edit_prompt`/`restore_prompt`, `chat_template`). Saves apply from the next chat opened, stated in the UI. Pulled ahead of Tracks A/B, which are blocked on the audit key. Verified signed-out: 403 `{error}` JSON on both API verbs, page redirects |
| `d10aaae` | **BL-42** — retired the legacy `questions` primer: ChatPanel pills + stale hint removed, idea page stops fetching/parsing the field, type dropped. `opening` stays as the fallback for `refine`; CMS column kept for now (prototyping caution) |
| `f79adad` | **BL-01/02/03** — chat degrades gracefully: degenerate reply → one silent retry → non-persisted "lost my train of thought" fallback; save-transact failure → `{error}` JSON 502 instead of a bodyless 500; ChatPanel guards `res.json()` and rejects ok-but-bodyless responses |
| — (CMS schema, no deploy) | **BL-04** — `writableBy: "none"` on `users.role` + `users.suspended` (2026-07-31): closes the delivery-plane self-escalation vector while admin/MCP writes are unaffected. Verified via `describe_collection`; the app has zero delivery-plane `users` write call sites |
| `67299eb` | **BL-56** — extraction audit harness (`npm run audit:extraction` in `web/`). Replays the frozen Basecamp Ledger transcript through the real pipeline against in-memory state; five metrics + degenerate-reply count vs baseline. `--baseline` mode reproduces the audit's hand counts exactly (incl. the 3 duplicate pairs); `--dry-run` verified against live templates. Route's apply-logic extracted to shared `turn-apply.ts` so harness and route can't drift. **Not yet run live** — needs `ANTHROPIC_API_KEY` in `web/.env.local` |
| — (CMS data, no deploy) | **BL-40** — removed the false "Produce a X artifact" instruction from `pricing`, `brand`, `gtm` system prompts and the stale "(via BrandBucket)" reference from `brand`, in the `chat_templates` collection (2026-07-31). Pure removal; arcs, initiation prompts, and `produces` keys untouched. Pre-images in Pluggie entry versions. Verified: no code path injects artifact language (`produces`/`completion` never reach the model context — [route.ts:82](../../web/src/app/api/chat/route.ts), [agent.ts](../../web/src/lib/agent.ts)) |

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
