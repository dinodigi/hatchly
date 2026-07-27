# Sprint 3 — Idea Hub (agreed architecture + build plan)

Supersedes the earlier transcript-extraction version of this doc. Sources: the
Jul 24 huddle (Firas / Zeena / Jonathan) plus the Jul 27 architecture brainstorm.

Phase: **prototyping**. No live users, no migration burden, no backfill. We can
wipe and reseed collections freely. That assumption is load-bearing for several
decisions below.

---

## Part 1 — What we agreed (locked)

### The architecture

1. **Chats are not the deck.** Chats are capture surfaces — where talking
   happens. The deck is an artifact generated later. They were conflated; they
   are now separate layers.
2. **Memory is the spine and the source of truth.** The deck, the brief, every
   artifact, and the public listing are all generated *from memory*. Nothing
   else is authoritative.
3. **Because of #2, the "chats-as-spine vs output-as-spine" debate is moot.**
   Either organizing principle works, since everything generates from memory
   regardless. We use chats to organize the conversation, and that costs nothing
   because the intermediate structured document is hidden (see Visibility).
4. **Outputs pull; memory does not push.** A memory row NEVER names the output it
   belongs to. It is tagged with *what it is*; each output declares a **recipe**
   that queries those tags. Consequence: a new artifact type works retroactively
   against every fact ever captured — no migration, no re-tagging. And the chat
   set becomes a cheap decision instead of an architectural commitment.
5. **The brief and the deck are siblings, not a sequence.** Both are queries over
   memory, at different refresh rates (brief live, deck on demand). The earlier
   waterfall model (brief → artifacts → deck) was wrong.

### Memory schema

6. **Richer tagging is effectively free** and improves output quality. The
   earlier "it's taxing" claim was overstated and is retracted: ~20–40 extra
   output tokens per memory item, on a project that has spent ~$0.70 total.
   Richer tagging also *reduces* generation cost later, because a recipe can
   query 20 relevant rows instead of dumping 300 into context.
7. **Add `kind`** — the missing dimension, and the most important single change.
   Values: `decision · evidence · assumption · constraint · preference ·
   question · risk`. Without it a validated finding and a wild guess are stored
   identically, which would wreck any generated output.
8. **Add `entities`** — named things (competitors, channels, price points,
   segments), so "list every competitor mentioned" is a query, not an LLM pass.
9. **Keep** `content`, `verbatim`, `topic` (expand values — missing market
   sizing, why-now/timing, legal/regulatory), `chat`, `turn`, `source_type`,
   `superseded`.
10. **Cut** `confidence` (redundant — assumption-vs-evidence already encodes it),
    `origin` (no output queries it), and `salience` as a model judgment.
    **Derive** salience instead: a fact feeding a required output slot is core.
11. **Memory nodes update in place.** Singular facts (name, tagline, pricing
    model) are one node that mutates; accumulative facts (competitors, features,
    risks) append. Singularity is declared by the question-arc **intent**, which
    makes updates deterministic and retires the `supersedes`-as-relation idea
    entirely. History lives in the existing `activity` change rows, not in
    memory. This is what keeps memory bounded as an idea matures.
    Full detail: **[Sprint 5](sprint-5-memory-foundation.md)**.

### The chats

12. **Seven chats** — Firas's stated ceiling, deliberately hit, not accidentally:
    `problem · solution · market · money · brand · go-to-market · think out loud`
13. **Money gets its own chat.** Confirmed. Note for approval: Firas's original
    five did NOT include money — this is our addition, within his "up to 7".
14. **Think out loud** is the single catch-all and is always **last**.
15. **No "start new chat."** Chats are rigid — a founder may dismiss one as "not
    relevant" but cannot create their own. (Firas: uniform common denominator.)
16. **Fixed intents, generated phrasing.** Each chat carries a **question arc** of
    ~6 intents. The intents are identical for every idea (uniformity); the
    wording and the offered options are generated per idea (specificity). This is
    the fix for "we currently have one single question" — every template today
    has exactly one static question.
17. **~3 required + ~3 optional per chat.** All-required across 7 chats would be
    ~42 mandatory questions — too heavy. ~21 required is a reasonable business plan.
18. **Auto-initiation, lazily.** The first unresolved intent fires automatically
    on **first open only** — never all chats at once. Unvisited chat costs nothing.
    Then 2–4 generated refinement chips after each answer.
19. **Arc is context-aware.** Onboarding pre-answers some intents; those are
    skipped, not re-asked. An intent answered inside another chat is marked
    resolved in its home arc. (Zeena: "you organize it for me.")
20. **No gate.** Firas explicitly rejected the unlock-chat idea. All chats open
    after onboarding.

### Visibility

21. **Hide work-in-progress machinery; show finished outputs.** The rule is not
    "hide all documents."
22. **Raw memory browser → hidden.** 27 cards of extracted facts is a debugging
    view. This is what actually resolves the smoke-test "three overlapping views"
    complaint. Founders still see capture working via the trace lines under chat
    messages — the right dose of "I got that."
23. **Brief / single pager → visible, always there.** This is the thing Firas
    wants to "always go to."
24. **Generated artifacts → visible.** They do not exist until generated and are
    whole when they appear, so there is nothing half-built to hide. Counter-
    evidence for hiding them: the smoke test called the artifact library "the
    clearest business-ready payoff moment in the whole product."
25. **Deck coverage is the progress signal**, replacing the killed build gate.
    How many deck sections have real material behind them — honest, no invented
    percentage, and it points at which chat to open next.

### Carried forward from the huddle (unchanged)

26. Chat cards move to the **bottom** of the idea page.
27. Each chat card gets a **subtitle** — "don't rely on just the title."
28. **Quick pitch retained as a permanent tagline** alongside the brand name
    ("Cakefinder — the local home baker marketplace").
29. **Onboarding stays a wizard, not a chat**: 1 open question + 5 multiple
    choice + a confirm screen. Remove the end-of-flow friction question. Needs a
    real animation on the confirm screen.

---

## Part 2 — Open decisions

Nothing below is settled. Do not build past these without a call.

| # | Question | Notes |
|---|----------|-------|
| A | Does the **deck appear from day one** with mostly-empty sections, or only once it has material? | Early = direction. Late = avoids "looks broken". |
| B | **Single topic, or primary + secondary?** | "10% commission funds the referral program" is genuinely both pricing and gtm. Multi-value tagging is where models get sloppy. |
| C | The **`kind` edge cases** — where exactly does assumption end and decision begin? | This is where inconsistent tagging would start. Needs worked examples. |
| D | The exact **5 onboarding questions**. | Currently 6, one conditional. |
| E | The exact **chat names, subtitles, and question arcs**. | The Monday deliverable — see Part 4. |

---

## Part 3 — Build phases (dependency order)

**Phase 0 — the chat set on one page.** Names, friendly subtitles, deck order,
and each arc. No code. This is what Firas approves. *Blocks everything else.*

**Phase 1 — memory foundation.** → **moved to
[Sprint 5](sprint-5-memory-foundation.md)** and expanded there. It must land
first: adds `kind`, `entities`, `intent_key`, expands `topic`, and defines
singular-vs-accumulative node semantics (memory nodes UPDATE in place rather than
appending forever — which is what keeps memory bounded as an idea matures).
Sprint 5 also owns the tagline rules and the chat-card subtitle/status lines.

**Phase 2 — chat templates.** Re-cut `chat_templates` to the approved 7. Add
`subtitle`, `initiation_prompt`, and the `question_arc` (intents, required flag,
what each captures, fallback options). Retire merged templates.

**Phase 3 — chat runtime.** Auto-fire the first unresolved intent on first open
(idempotent — re-opening never re-runs). Loading state. Render generated
refinement chips after each assistant turn. Mark intents resolved across arcs.

**Phase 4 — UI cleanup.** Cards to the bottom, subtitles on cards, remove
start-new-chat entirely, hide the raw memory tab.

**Phase 5 — onboarding.** Trim to 1 + 5, confirm screen, drop the friction
question, add the animation.

**Phase 6 — outputs.** Recipe layer over memory. Deck as an artifact with a
fixed section list. Coverage as the progress signal. Quick pitch rendered
alongside the name everywhere.

Phases 4 and 5 are cheap and independent — pull forward if we want visible
progress before the deeper work lands.

---

## Part 4 — What Firas approves Monday

He asked for something small and fast ("trim it down to 5 based on research…
don't overthink it") and you promised him the chat list. Deliver exactly that:

1. The **7 chats** in deck order, with friendly names and one-line subtitles.
2. **Money as its own chat** — flagged as our addition to his five.
3. One **example question arc** in full, so he can see what "a bunch of questions,
   dynamic per idea" actually means versus today's single static question.
4. The open decisions in Part 2 that need his input (A, D).

Everything in Part 1 is the *how* and stays underneath — not the headline.

---

## Out of scope / deferred (unchanged)

Branding toward Brown Bucket (after UX is locked) · homepage quick-ideas widget ·
leaderboard one-liner + card redesign · feedback widget general-mode and
click-to-select · screenshot upload (explicitly killed) · economy phases and the
API/token connector · everything in Sprint 4 (platform/perf).
