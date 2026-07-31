# Sprint 5 — Idea Hub & Memory Foundation · retro

**Window:** 2026-07-24 → 2026-07-30
**Goal we set:** turn the Jul 24 huddle into a working pipeline — trim the chats,
make them self-starting, and give memory enough structure to generate outputs from.
**Did we hit it:** yes on the pipeline, no on the outputs. Onboarding → chats →
memory → coverage runs end-to-end. The deck (BL-20) was deliberately parked.

---

## Shipped

15 deploys — full list in [SHIPPED.md](../SHIPPED.md). Headlines: the feedback
management system, 20 feedback items triaged and answered, the 9→7 chat re-cut
with question arcs, memory gaining `kind`/`entities`/`intent_key` with
singular-node updates, coverage badges, quick-reply chips, onboarding trimmed to
1+5 with a hatch animation, and the chat-layout root-cause fix.

## What worked

**Root-causing instead of patching.** The chat composer wouldn't pin and the
thread wouldn't scroll. The first fix — capping the column to the viewport — was
correct *and* completely inert, because the `.row`/`.col`/`.gap*` flex utilities
it depended on **were never defined in the CSS**. Only checking whether the class
existed found it. That same audit then found `.spacer` and `.clamp2` missing too.
Keep doing this: when a fix "should work" and doesn't, verify the layer beneath it.

**Proving the fix in an isolated mock before touching production files.** Both
the chat layout and the hatch animation were validated in a throwaway HTML file
first. Cheap, and it caught that the layout fix genuinely worked before it went
anywhere near the real component.

**Reading live data before diagnosing.** Three separate user-reported bugs turned
out to be *different bugs than reported*: the "silently discarded" quick idea was
never lost (read-plane lag), the wallet's "−0" was a display bug over a correct
ledger, and the degenerate reply was confirmed as a literal `"content"` string in
the database rather than a rendering fault. Guessing would have fixed the wrong
thing all three times.

**Atomic transacts.** Every failure this sprint left zero half-written state — no
orphaned messages, no memory without a reply. That's why "Try again" always
produced a clean conversation instead of duplicates.

## What didn't

**I marked a bug fixed when it wasn't.** The chat-layout feedback item went to
`actioned` after the viewport-cap change, which couldn't work. It took the user
reporting it *again* to find the real cause. Concretely: don't close an item on a
change I haven't verified produces the observable outcome.

**I rebuilt the overview when asked to improve it.** Given "better layout," I
proposed three options, built the one chosen, and it removed data the founder
wanted on the page — full revert (`12cbd3a` → `6e57196`). The ask was "same data,
cleaner UI" and I heard "restructure." Concretely: when the request is about
presentation, changing what's *present* needs its own explicit yes.

**I hid the Memory tab.** Over-applied "hide the machinery" and removed the
product's core surface. Called back the next day. Concretely: a principle that
removes a primary surface should be checked against "is this the thing we're
building?" before shipping.

**I sequenced two sprints into a circular dependency.** Sprint 5 was written to
land *before* Sprint 3's arcs — but its core mechanism (singular-node updates)
keys off `intent_key`, which the arcs define. Caught only because the user asked
"is this ready?" Concretely: when writing a sprint that claims to block another,
check the dependency in both directions.

**I filed platform feedback before exploring the platform.** Two reports to
Pluggie were partly premature; a third I nearly filed ("no nested schemas") would
have been flat wrong — `group` and `array` types exist. Explore, then report.

**I sorted the chat cards by recency.** Shipped cards ordered by
`last_message_at` when the entire point of the re-cut was a fixed pitch sequence.
The user caught it immediately.

## Fixed

| Bug | How it was found |
|---|---|
| Chat composer unpinned / thread unscrollable | User report ×2, then root-cause audit |
| Missing `.row`/`.col`/`.gap*`/`.spacer`/`.clamp2` CSS | Audit (never reported) |
| Quick idea "silently discarded" | User report — DB showed nothing was lost |
| Wallet "Tax burned −0" | User report — economy was already correct |
| Duplicate account in leaderboard | Found while verifying an unrelated fix |
| Chat tab-switch showed stale thread | Smoke-test feedback |
| Memory tagged `features` never reached brief | Smoke-test feedback |
| Onboarding step counter jumping 05→06 | Smoke-test feedback |
| RSC prefetch storm (30+ requests, 503s) | Smoke-test feedback |
| Chips lost on reload | Investigation after user noticed inconsistency |

Roughly half came from user reports, half from audits. The audit half is the
encouraging number — but the two bugs the *user* had to report twice are the
warning.

## Arising

Became backlog items:

- **BL-01/02/03** — degenerate model replies get persisted verbatim; MCP failures
  crash to a bodyless 500; ChatPanel's `res.json()` is unguarded
- **BL-04** — `users.role` has no `writableBy: "none"`, so the schema doesn't
  prevent self-escalation (not exploitable today; the delivery token is server-only)
- **BL-23** — `question_arc` as JSON-in-a-text-field is painful to edit and
  unvalidated; git-versioned YAML would fix it
- **BL-37/38** — env-driven base URLs; 20 of 25 collections never security-audited
- **The chat-interaction epic (BL-10…BL-17)** — raised directly by Jonathan

Open questions carried forward: does the tagline auto-update or freeze? single vs
multi `topic`? where exactly does assumption end and decision begin?

## Carried

| Item | Real reason |
|---|---|
| BL-05 — Firas approves the arcs | Blocked on a person. Doc ready since Jul 27 |
| BL-20 — deck artifact | Deliberately parked: it's the piece most shaped by BL-05 |
| BL-21/22 — perf items | The instance upgrade removed the pain that motivated them |
| Sprint 2 entirely | Never scheduled — worth noting it's been open since Sprint 0 |

## Numbers

- **15 deploys**, all to `main` → Render
- **10 bugs closed**, ~5 from user reports and ~5 from audits
- **1 bug introduced and caught same-day** (recency sort)
- **1 change fully reverted** (document-first overview)
- **4 items carried**, 1 of them blocked on a person for 3 days
- **20 feedback items** triaged and answered

The one to watch: three separate corrections came from the user rather than from
verification (layout marked done early, overview over-built, memory hidden). All
three were changes I couldn't fully verify myself because the surfaces are
auth-gated. That's a real gap — worth deciding whether a signed-in test path is
worth building.
