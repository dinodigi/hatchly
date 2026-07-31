# Sprint 6 — The Co-Founder Engine

**Status:** planned, not started
**Window:** TBD
**Goal:** *a better engine that extracts well from the founder and responds so it
feels like a co-founder* — not a form that interviews them.

> Previous sprint: [retros/sprint-5-idea-hub-and-memory.md](retros/sprint-5-idea-hub-and-memory.md)
> Specs: [chat-prompt-overhaul.md](../chat-prompt-overhaul.md) · [chat-reliability-hardening.md](../chat-reliability-hardening.md)

---

## Where the engine actually is today

Audited all 15 memories the engine produced from a real conversation (Basecamp
Ledger). This is evidence, not estimate.

### Working — protect this

**Verbatim capture is real.** The founder's exact words are preserved, typos and
all: *"basically texts (mulitple of them) and phone calls and fights and always
something is missing"*. That's unedited founder voice, and it's the raw material
for everything downstream.

**`kind` classification is accurate.** Spot-checking the seven-value taxonomy
against real turns, it gets the hard calls right:

| Founder said | Tagged | Correct? |
|---|---|---|
| "groups do not know anything better and i dont think anyone has built suuch a thing" | `assumption` | ✅ belief, unvalidated |
| "Both from day one" | `decision` | ✅ committed choice |
| "texts and phone calls and fights" | `evidence` | ✅ observed behaviour |
| "Warm & communal" | `preference` | ✅ taste, not commitment |

The disambiguation rules are doing their job. Don't loosen them.

**Intent tagging works.** `who_hurts`, `coping`, `cost`, `frequency`,
`why_unsolved`, `feel`, `shape`, `who_pays` all populated correctly from natural
conversation — the founder never saw an arc, and coverage still filled.

### Weak — this is the sprint

**1. Entity extraction is under-firing.** 10 of 15 memories have `entities: []`.
Worse, the misses are the ones that matter: the agent itself referenced
**Splitwise** in conversation, and no Splitwise entity was captured anywhere.
Neither were "text threads" or "phone calls" as named alternatives.

The competitive-analysis recipe depends on entity extraction. Right now it would
return almost nothing.

**2. Memory duplication.** Three separate rows cover one pricing decision:

- *"Organizer pays to start a trip; each joining member pays $1-5…"* (`shape`)
- *"Per-person payment doubles as a commitment mechanic"* (no intent)
- *"Organizer pays the same $1-5 fee…"* (`who_pays`)

The middle one is a fragment of the first. Similarly, *"Founder confirmed the
problem statement…"* duplicates problem content already captured. Noise now;
context bloat and contradictory retrieval later.

**3. Six of fifteen memories carry no `intent_key`.** They're not wrong — but
they don't count toward coverage, and they're exactly where the duplication
lives. The unanchored captures are the noisy ones.

**4. Three `kind` values never appear.** No `question`, `constraint`, or `risk`
in the entire conversation — despite it plainly containing open questions. Either
the taxonomy is richer than the model uses, or those cases aren't being
recognised. Both are worth knowing.

**5. `feeds` has atrophied.** Only 2 of 15 use it, while `brief_updates` does the
real work. Two mechanisms for one job, one of them nearly dead.

**6. Confirmations create rows instead of updating them.** *"Yes, that's it"* got
its own `decision` memory with no `intent_key`, rather than updating the problem
node. Singular-node updating works when an intent is tagged, and silently
doesn't when it isn't.

### The response side

Separately from extraction — what makes it *feel* like a co-founder:

- **It never quotes you back.** We store verbatim and never use it. A co-founder
  says *"you said the money-chasing is what sours the trip — does that still
  hold?"* Ours doesn't.
- **It never connects across chats.** Memories from all chats are in context, but
  nothing instructs the model to reference them conversationally.
- **It never notices contradictions.** Say $5 in one chat and $50 in another and
  nothing flags it.
- **Three prompts contain false instructions** ("Produce a pricing model
  artifact" — chats cannot produce artifacts) and one references a nonexistent
  BrandBucket integration.

---

## The plan

### Track A — Extraction quality

| ID | Item | Size |
|---|---|---|
| BL-47 | **Fix entity extraction** — sharpen the schema description with worked examples (competitors, tools, channels, price points, place names). Splitwise-class misses are the test case | S |
| BL-48 | **Stop duplicate memories** — instruct the model not to capture a fragment of a fact it just captured; prefer updating the anchored memory over adding a sibling | M |
| BL-49 | **Anchor confirmations** — "yes, that's it" should update the intent's node, not create an unanchored `decision` row | S |
| BL-51 | **Resolve `feeds` vs `brief_updates`** — pick one mechanism. Recommend: drop `feeds`, let `brief_updates` own the brief | S |
| BL-52 | **Decide the `kind` taxonomy's real shape** — `question`/`constraint`/`risk` are unused. Either add recognition guidance or cut them | S |

### Track B — Co-founder response

| ID | Item | Size |
|---|---|---|
| BL-53 | **Use verbatim in replies** — quote the founder's own words back when confirming or challenging. Highest-leverage single change for "feels like a co-founder" | S |
| BL-54 | **Cross-chat reference** — instruct the model to connect what it already knows ("in Name & brand you said warm and communal — that argues against a per-seat enterprise price") | S |
| BL-55 | **Contradiction surfacing** — when a new statement conflicts with an existing memory, say so plainly rather than silently overwriting | M |
| BL-40 | **Remove false "Produce a X artifact" instructions** + stale BrandBucket reference | S |
| BL-41 | **Rewrite all 7 system prompts** to the six-part standard | M |
| BL-42 | **Retire the dead `questions` field** | S |

### Track C — Editable without a deploy

| ID | Item | Size |
|---|---|---|
| BL-43 | **Admin `?tab=prompts`** — list + edit form | M |
| BL-44 | **Structured arc editor** — no JSON textarea; intent keys read-only after creation | M |
| BL-45 | **Preview / dry-run** against a fixture idea; writes nothing | M |
| BL-46 | **Prompt version history + restore** (Pluggie already versions entries) | S |

### Track D — Never show a founder something broken

| ID | Item | Size |
|---|---|---|
| BL-01 | Degenerate-reply guard | S |
| BL-02 | Bodyless 500 → JSON error | S |
| BL-03 | Unguarded `res.json()` | S |
| BL-04 | `writableBy: "none"` on `users.role` / `suspended` | S |

---

## How we'll know it worked

A sprint that says "make it better" with no measurement is a vibes sprint. Two
concrete instruments, both cheap:

**1. The extraction audit (repeatable).** Take one fixed founder transcript, run
it end to end, and count:

| Metric | Today (Basecamp Ledger) | Target |
|---|---|---|
| Memories with entities populated | 5 / 15 (33%) | > 70% where entities exist |
| Named competitors/tools captured | 0 (Splitwise missed) | every one the conversation names |
| Duplicate / fragment memories | ≥ 3 of 15 | ≤ 1 |
| Memories with no `intent_key` | 6 / 15 | < 3 |
| `kind` values in use | 4 of 7 | 6 of 7, or taxonomy cut |

Re-run after every prompt change. It's the same conversation, so differences are
attributable.

**2. The co-founder read.** Have Firas or Zeena read one full transcript and
answer: *did it feel like a partner or a form?* Subjective on purpose — it's the
actual goal, and no metric captures it. One read at sprint start, one at close.

## Sequence

1. **BL-40 first** — pure removal of false instructions. Immediate improvement, zero design.
2. **Track D** — small, independent, stops founders seeing breakage while we work.
3. **Track A** — extraction fixes, measured against the audit above.
4. **Track B** — the prompt rewrite, one commit per chat so regressions stay attributable.
5. **Track C** — the Studio, last, so it ships editing over prompts that are already good.

Rationale for that order: fixing the engine before building the tuning UI means
Firas opens the Studio to *good* prompts and tunes from there, rather than
inheriting our mess with a nicer editor.

## Explicitly not in this sprint

- **BL-11 streaming** — biggest perceived-speed win available, but our
  structured-output schema fights it (reply text must stream while memory
  extraction still arrives validated). Own spec, own sprint.
- **BL-20 deck** — blocked on Firas approving the arcs (BL-05).
- **BL-50 shareable link** — parked; needs a design pass of its own.
- **BL-25 mobile** — real gap, own sprint.

## Risks

| Risk | Mitigation |
|---|---|
| Prompt changes improve one metric and quietly break another | The audit runs on a fixed transcript — compare all five numbers each time |
| Richer extraction instructions make the schema harder for the model to satisfy | Watch for a rise in degenerate replies; BL-01's guard is the safety net |
| Rewriting 7 prompts at once makes regressions unattributable | One commit per chat |
| "Feels like a co-founder" is unfalsifiable | That's why the human read exists alongside the numbers — neither alone is enough |

## Blocked / needs a human

| What | Who | Blocks |
|---|---|---|
| Approve the 7 chats + arcs (BL-05) | Firas | BL-20, heavy arc iteration |
| The co-founder read, start and end | Firas / Zeena | The subjective half of "did it work" |
