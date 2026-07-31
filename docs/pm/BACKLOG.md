# Backlog

Pull-from list. Roughly ordered within each tier; tiers matter more than order
inside them. IDs are permanent.

Status key: `todo` · `doing` · `blocked` · `done` · `dropped`
Size key: `S` < half a day · `M` 1–2 days · `L` 3+ days · `?` needs a spec first

---

## P1 — broken, blocking, or unsafe

| ID | Item | Size | Status | Notes |
|---|---|---|---|---|
| BL-01 | **Degenerate-reply guard** — retry once, never persist a dud like the `"content"` message | S | todo | Only item that currently shows founders something broken. Spec: [chat-reliability-hardening.md](../chat-reliability-hardening.md) §1 |
| BL-02 | **Bodyless 500 on MCP failure** — wrap the persistence phase, return `{error}` JSON | S | todo | Spec: same doc §2 |
| BL-03 | **Unguarded `res.json()` in ChatPanel** | S | todo | Spec: same doc §3. Do with BL-02 |
| BL-04 | **`writableBy: "none"` on `users.role` + `users.suspended`** | S | todo | Schema does not prevent self-escalation to admin. Not exploitable today (delivery token is server-only) but it's defense-in-depth, and cheap |
| BL-05 | **Firas approves the 7 chats + arcs** | — | blocked | Blocked on: Firas. Doc is ready: [chat-question-arcs.md](../chat-question-arcs.md). Blocks BL-06 and all arc iteration |

## P2 — high value

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
| BL-23 | **Chat templates → git-versioned YAML** | M | todo | `question_arc` is JSON-in-a-text-field today — no validation, unreadable in admin. YAML gives real structure, diffs, PR review. Cost: non-engineers lose live editing. Revisit at launch. Requires: treat `intent_key` as a stable identifier (add/deprecate, never rename) |
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
