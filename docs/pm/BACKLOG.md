# Backlog

Pull-from list. Roughly ordered within each tier; tiers matter more than order
inside them. IDs are permanent.

Status key: `todo` · `doing` · `blocked` · `done` · `dropped`
Size key: `S` < half a day · `M` 1–2 days · `L` 3+ days · `?` needs a spec first

---

## P1 — broken, blocking, or unsafe

| ID | Item | Size | Status | Notes |
|---|---|---|---|---|
| BL-01 | **Degenerate-reply guard** — retry once, never persist a dud like the `"content"` message | S | done | `f79adad` 2026-07-31. One silent retry, then a graceful non-persisted reply |
| BL-02 | **Bodyless 500 on MCP failure** — wrap the persistence phase, return `{error}` JSON | S | done | `f79adad` 2026-07-31. Save failure → `{error}` 502; atomic transact means clean state |
| BL-03 | **Unguarded `res.json()` in ChatPanel** | S | done | `f79adad` 2026-07-31. Parse guarded + ok-but-bodyless response rejected |
| BL-04 | **`writableBy: "none"` on `users.role` + `users.suspended`** | S | done | CMS schema change 2026-07-31, no deploy. Verified via `describe_collection`; delivery-only gate, admin/MCP writes (suspend flow, ensure-user) unaffected — and the app has zero delivery-plane `users` write call sites anyway |
| BL-05 | **Firas approves the 7 chats + arcs** | — | blocked | Blocked on: Firas. Doc is ready: [chat-question-arcs.md](../chat-question-arcs.md). Blocks BL-06 and all arc iteration |

## P2 — high value

### Epic: chat prompt quality + Prompt Studio (BL-40 … BL-46)
Spec: [chat-prompt-overhaul.md](../chat-prompt-overhaul.md). Audit of all seven
live prompts found false instructions, a stale integration reference, and a 4×
depth gap. Plus: make prompts editable from `/admin` without a deploy.

| ID | Item | Size | Status | Notes |
|---|---|---|---|---|
| BL-40 | **Remove false "Produce a X artifact" instructions** + stale BrandBucket reference | S | done | Done 2026-07-31 — CMS-data change in `chat_templates` (`pricing`/`brand`/`gtm` system prompts), no deploy needed. Pre-images in Pluggie entry versions. Inactive `competition`/`risk` templates still carry the old pattern — left alone, they can't be opened |
| BL-41 | **Rewrite all 7 system prompts** to the six-part standard | M | todo | job / good / push / push back / boundary / stuck |
| BL-42 | **Retire the dead `questions` field** | S | done | `d10aaae` 2026-07-31. All readers removed (primer pills, page fetch, type); `opening` kept as fallback; CMS column kept for now (prototyping caution) |
| BL-43 | **Admin `?tab=prompts`** — list + edit form | M | done | `3f27beb` 2026-07-31. Pulled ahead of Tracks A/B (both blocked on the audit API key). Signed-out gates verified (403 JSON / redirect); signed-in flows need a staff-session test |
| BL-44 | **Structured arc editor** | M | done | `3f0162d` 2026-07-31. Intent text / required / mode / reorder / add / remove-with-warning; existing keys locked, new keys snake_case-normalized; server validates and serializes. Needs a staff-session test alongside BL-43 |
| BL-45 | **Preview / dry-run a chat** | M | todo | Run initiation against a throwaway fixture; render reply + chips; write nothing to memories/messages |
| BL-46 | **Prompt version history + restore** | S | done | `3f27beb` 2026-07-31, with BL-43. Last 10 versions per template, restore audited (`admin_actions` enum extended: `edit_prompt`/`restore_prompt`, `chat_template`) |

### Epic: extraction quality (BL-47 … BL-52)
From an audit of 15 real memories produced by the Basecamp Ledger conversation.
`kind` classification and verbatim capture are working well; these are the gaps.
Measurement baseline lives in [SPRINT.md](SPRINT.md) § How we'll know it worked.

| ID | Item | Size | Status | Notes |
|---|---|---|---|---|
| BL-56 | **Extraction audit harness** | M | done | `67299eb` + `7964dad`. Two live reference runs 2026-07-31 (committed in `web/scripts/audit-runs/`) — Track A measures against these, not the Jul-27 stored rows. Replay mirrors the BL-01 retry (2 raw duds, 0 past retry in run 2). Run-to-run variance on identical prompts is real (dups 4→1) — judge changes on consistent signals, two runs per change |
| BL-47 | **Fix entity extraction** | S | done | `77f02d7` 2026-07-31, one iteration, two runs. Entities 47/50% pre → 54/69% post; run 4 captured 5/6 founder-named incl. **phone calls** (0/5 prior measurements). Honest reframe: agent-named tools (Splitwise) now correctly NOT captured on this fixture — the founder never engaged with them; earlier ✓s were the BL-57 defect. Second iteration only if needed after BL-48/57 stabilize the denominator |
| BL-48 | **Stop duplicate memories** | M | done | `04a944d` 2026-07-31. One-fact-one-memory + refine-via-intent-key instructions. Measured with BL-57 (its solo run showed self-capture dominated the metric — 3 of 5 pairs): combined pair landed dups **0 and 1**, both at target, vs 4/1/4/0/5 across the five prior runs |
| BL-49 | **Anchor confirmations to their intent** | S | done | `eb08203` 2026-07-31. Confirmations now tag the intent they answer or ride the brief update. Both measurement runs: zero confirmation-restatement rows; no-intent 1/9 and 3/13 (was 7/15) |
| BL-51 | **Resolve `feeds` vs `brief_updates`** | S | todo | `feeds` used by 2/15; `brief_updates` does the real work. Two mechanisms, one job. Recommend dropping `feeds` |
| BL-52 | **Decide the `kind` taxonomy's real shape** | S | todo | `question`, `constraint`, `risk` never appear in practice. Add recognition guidance or cut them. Evidence hardened: 4/7 in the stored baseline AND both live audit runs |
| BL-57 | **Initiation turns capture the agent's own analysis as memories** | S | done | `5cb98db` 2026-07-31. Requests-to-you produce zero memories; the founder's reaction is what gets captured. Verified in both combined runs: customer/product/gtm initiation chats produced **zero rows** (were 3-5 self-capture rows per run). From: BL-56 reference runs |

### Epic: co-founder response (BL-53 … BL-55)

| ID | Item | Size | Status | Notes |
|---|---|---|---|---|
| BL-53 | **Quote the founder's verbatim back** | S | todo | We store exact words and never use them. Probably the highest-leverage single change for "feels like a partner" |
| BL-54 | **Cross-chat reference in replies** | S | todo | All memories are in context; nothing tells the model to connect them conversationally |
| BL-55 | **Surface contradictions** | M | todo | $5 in one chat and $50 in another passes silently. A co-founder would notice |

### Epic: strengthen chat interaction (BL-10 … BL-17)
The chat is the product. Everything below makes the core loop feel faster,
recoverable, and less brittle. **Needs a spec before the big items are sized** —
see BL-10.

| ID | Item | Size | Status | Notes |
|---|---|---|---|---|
| BL-10 | **Write the chat-interaction spec** — decide scope + sequence for this epic | S | todo | Do this first; several items below are `?` until it exists |
| BL-11 | **Stream responses** | ? | todo | Biggest perceived-speed win available. Today a reply lands all at once after 10–30s of dots. Touches the agent call, the route, and ChatPanel. Note: our structured-output schema complicates naive streaming — spec needs to resolve how reply text streams while memories/brief updates still arrive validated |
| BL-12 | **Stop / cancel a running turn** | S | todo | No way to abort today; you wait out the 60s timeout |
| BL-13 | **Edit + resend a message** | M | todo | Typos and misfires currently require re-typing and pollute history |
| BL-14 | **Regenerate a reply** | S | todo | Pairs with BL-01 — gives the founder the manual version of the automatic guard |
| BL-15 | **Richer waiting state** — say what it's doing, not just dots | S | todo | Partially done (first-open line). Extend to normal turns |
| BL-16 | **Inline edit of brief fields + memory cards** | M | todo | Smoke-test feedback `85c78858`, still the only open round-2 item. Today you must argue the AI back into shape conversationally |
| BL-17 | **Voice input** | L | todo | Specced, not built: [voice-and-upload-spec.md](../voice-and-upload-spec.md). Mic button is a no-op with `title="coming soon"` |

### Everything else P2

| ID | Item | Size | Status | Notes |
|---|---|---|---|---|
| BL-20 | **Deck artifact + recipe layer** | L | todo | Last big Sprint 3 piece. Deliberately parked until the pipeline is proven and BL-05 lands. Spec: [sprint-3](../sprint-3-idea-hub-refinement.md) Phase 6 |
| BL-21 | **Leaderboards via `aggregate_entries`** | S | todo | Validated live. Replaces a 500-row JS reduce, deletes the `suspendedUserIds()` workaround, more correct at scale. Spec: [sprint-4](../sprint-4-platform-perf.md) §2 |
| BL-22 | **Cache static reads** (`chat_templates`, `onboarding_questions`) | S | todo | Re-fetched on every render; 2+ round-trips per page |
| ~~BL-23~~ | ~~Chat templates → git-versioned YAML~~ | — | **dropped** | Superseded by BL-43…BL-46. YAML opposes admin editing, which is the explicit ask; its two motivations (JSON-textarea pain, version control) are answered by the structured arc editor and Pluggie's entry versioning. **Carry forward the one thing YAML would have enforced: intent keys are stable identifiers — add and deprecate, never rename** |
| BL-24 | **Live updates via the `changes` stream** | L | todo | Nothing subscribes today — every count only moves on hard reload. Systemic; own pass. Spec: [sprint-2](../sprint-2-features.md) §2 |
| BL-25 | **Mobile pass** | L | todo | **Nothing below 900px has ever been checked, in the entire product.** Deferred since Sprint 0. Firas will open this on a phone eventually |

## P3 — worth doing, not urgent

| ID | Item | Size | Status | Notes |
|---|---|---|---|---|
| BL-30 | **Leaderboard one-liner + stacked cards** | S | todo | Firas: "it's very raw, it doesn't tell me what the idea is" |
| BL-31 | **Homepage: quick-ideas widget** | S | done | Shipped `f5a9c45` — kept for traceability |
| BL-32 | **Downvoting** | M | todo | Un-vote toggle shipped; up/down + net score never built. Spec: [sprint-2](../sprint-2-features.md) §1 |
| BL-33 | **Counter integrity on moderation** | M | todo | Decrement-on-hide decided, never implemented. Plus an audit invariant for `listings.bucks_total` drift. Spec: [sprint-2](../sprint-2-features.md) §3 |
| BL-34 | **`count_entries` swaps** | S | todo | Replace fetch-rows-to-`.length` |
| BL-35 | **Evaluate delivery `batch` endpoint** | ? | todo | Up to 10 reads in one round-trip. Measure with the `[mcp]` timing logs first — it's the delivery plane, so consistency caveats apply |
| BL-36 | **Thin data-access layer** | L | todo | Centralize "which read plane" so app code stops deciding per-query. Also widens the seam if we ever leave Pluggie |
| BL-37 | **Base URLs env-driven** | S | todo | Two constants ([mcp.ts:15](../../web/src/lib/mcp.ts), [agentx.ts:17](../../web/src/lib/agentx.ts)). Cheap insurance against a Pluggie domain move |
| BL-38 | **Full collection security sweep** | S | todo | Audited 5 of 25 (keys, users, wallets, listings, model_keys) — all clean. Remaining 20 unverified |
| BL-39 | **Exclude suspended dupe from public rankings — data cleanup** | S | todo | Code fix shipped; the duplicate "Dino Digi" account still exists in `users` |

## Needs its own sprint

| ID | Item | Size | Status | Notes |
|---|---|---|---|---|
| BL-50 | **Shareable link (share-by-URL visibility)** | L | todo | **Disabled 2026-07-30** — the option existed in the menu but was never implemented: `/api/publish` treated `link` exactly like `private`, so "anyone with the link can view" was a false promise. Now two states only (private / public). Enum still carries `link`, so re-enabling is UI + one route branch. **Needs real design first** — see open questions below |

**BL-50 open questions to answer before building:**
- What does a link-viewer actually *see*? The full brief? A read-only public
  page? Which chats, if any?
- Is the link guessable, or does it need an unguessable token separate from the
  idea id?
- Can it be revoked? Does it expire? One link per idea, or many?
- Can a link-viewer leave feedback or back the idea, or is it view-only?
- Does link-visibility create a `listing` row (currently only `public` does), and
  if so how is it kept out of the stream?
- SEO / crawlers — should link pages be `noindex`?
- What shows in the link preview (OG image) — and does that leak anything?

## Parked — deliberate, with a reason

| Item | Why parked | Unparks when |
|---|---|---|
| Branding toward Brown Bucket | Firas: "I want to get the UX done first" | UX locks |
| Feedback widget: general mode + click-to-pin | Round 2, backlogged in the huddle | After chat epic |
| Feedback widget: screenshot upload | Firas: "don't work on that" | Explicitly killed |
| Clerk production keys | Jonathan: skipping while in development | Pre-launch |
| Economy phase 2 (capped free key → BYOK) | Needs cost data first | After Firas's separate API key |
| Accept-as-API / token connector | "It's just a connector" — last | Product stable |
| Consolidate the 3 brief views | Tried and reverted — founder wants all data on the overview | Pipeline proven |
| Sprint 1 open items (artifact thinness thresholds; re-open resolved questions) | Never blocked anything | If artifacts get serious |

## Owned by others

| Item | Owner |
|---|---|
| Approve the 7 chats + arcs (BL-05) | Firas |
| Separate API key for cost tracking | Firas |
| Clerk production keys + hosting tier | Jonathan |
