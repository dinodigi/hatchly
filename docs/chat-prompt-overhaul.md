# Chat prompt overhaul — diagnosis & standard

Spec for BL-40…BL-44. Written 2026-07-30 after auditing all seven live prompts.

---

## What's actually wrong

### 1. Three prompts instruct the model to do something it cannot do

`pricing`, `brand`, and `gtm` all end with **"Produce a X artifact."** The chat
cannot produce artifacts — those are generated separately through
`ArtifactPicker`. We are telling the model to perform an action it has no way to
take, which invites it to either claim it did, or waste a turn trying.

**This is the highest-priority fix.** It's not a style problem, it's a false
instruction.

### 2. A stale integration reference

The `brand` prompt says *"then suggests names (via BrandBucket)."* There is no
BrandBucket integration. The model is being pointed at a naming service that
doesn't exist in this product.

### 3. Wildly inconsistent depth

| Chat | System prompt |
|---|---|
| `product` | 4 sentences — scope guidance, in/out framing, explicit "stack details are memories, not brief features" |
| `customer` | 3 sentences — beachhead, sizing, name real competitors, push on differentiation |
| `problem` | 3 sentences — who hurts, how badly, push past vague |
| `pricing` | **1 sentence** |
| `brand` | **1 sentence** (plus the stale reference) |
| `gtm` | **1 sentence** |
| `refine` | 2 sentences — appropriate, it's the free chat |

Problem/product/market got rewritten during the Sprint 5 re-cut. Pricing, brand,
and GTM still carry their original one-liners. That gap is almost certainly what
made the chats feel uneven.

### 4. The prompt doesn't know the arc exists

Question arcs are injected into context by `runAgentTurn`, but no `system_prompt`
mentions them. The per-chat instruction and the arc mechanism are two systems
that don't acknowledge each other, so the prompt can't say things like "when the
founder resolves an intent, confirm it back in their words."

### 5. Two dead fields still in the editor

- **`opening`** — only renders when there's no `initiation_prompt`. Live for
  `refine` only; vestigial on the other six.
- **`questions`** — the legacy single-question primer, suppressed whenever
  `initiation_prompt` exists. Dead on six of seven.

So an editor sees three question-ish fields (`questions`, `question_arc`,
`initiation_prompt`) where only two do anything. Confusing for us, worse for
Firas or Zeena editing from the admin.

### 6. No chat says what "done" looks like

Arcs define *required intents*, but no prompt tells the model what a good outcome
for its chat actually is, or what to do when the founder says "I don't know."

---

## The standard every chat prompt should meet

Six parts. Short — the goal is consistency and specificity, not length.

```
JOB          One line: what this conversation exists to settle.

GOOD         What a finished version of this chat looks like — concrete
             enough that the model can tell whether it's there yet.

PUSH         The specific vagueness to reject in THIS domain. Generic
             "be rigorous" does nothing; "'everyone' is not an audience —
             make them pick a first group" does.

PUSH BACK    The one or two claims founders make here that are usually
             wrong, and how to challenge them without being combative.

BOUNDARY     What belongs in a different chat, so this one doesn't sprawl.
             (Memory still captures cross-topic facts — this is about
             where the conversation should go next, not what gets stored.)

STUCK        What to do when the founder genuinely doesn't know. Every
             chat needs an answer; "Help me decide" is a chip they can tap.
```

Global voice, formatting, chip rules, and the arc mechanism stay in
`agent.ts` — per-chat prompts must not restate them.

### Worked example — `pricing`, rewritten

> **Job.** Settle who pays, in what shape, and roughly how much.
>
> **Good.** A named payer, a pricing model, and a rough number the founder can
> defend — even if it's a range they'd test.
>
> **Push.** "We'll figure out monetization later" is not an answer at this
> stage — ask what they'd charge *if they had to charge tomorrow*. Prices
> without a comparison are guesses; anchor against what this audience already
> pays for something adjacent.
>
> **Push back.** Founders routinely assume the user and the payer are the same
> person. In marketplaces, B2B, and anything with an organizer, they often
> aren't — check.
>
> **Boundary.** Distribution and acquisition cost belong in First 100 users.
> Stay on the money model itself.
>
> **Stuck.** Offer two or three concrete models drawn from comparable products
> and let them react — reacting is easier than inventing.

Compare to today's entire prompt: *"This chat figures out the revenue shape and
who it must feel fair to. Produce a pricing model artifact."*

---

## Field cleanup that goes with it

| Field | Action |
|---|---|
| `system_prompt` | Rewrite all 7 to the standard |
| `initiation_prompt` | Keep — these are consistent and working. Light pass only |
| `opening` | Keep for `refine`; mark clearly as the fallback for chats without initiation |
| `questions` | **Retire.** Superseded by `question_arc`. Don't delete the column yet (prototyping caution) — stop reading it, and hide it in the admin editor |
| `question_arc` | Keep — but it must get a **structured editor**, not a raw JSON textarea |

---

## Prompt Studio (admin)

Goal: Firas and Zeena can adjust a chat's prompt and see the effect without a
deploy and without touching Pluggie's raw admin.

**Surface:** a new `?tab=prompts` on `/admin`.

1. **List** — the 7 chats in pitch order, each showing name, subtitle, and
   arc coverage count.
2. **Edit** — a form per chat: name, subtitle, system prompt, initiation prompt,
   and the arc as a **structured list** (intent text, required toggle,
   singular/accumulative) rather than hand-escaped JSON. This alone removes the
   most painful part of editing templates today.
3. **Preview** — the "see how they work" piece. Run this chat's initiation
   against a **throwaway sample idea**, render the reply and chips, and discard
   it. No real idea, no memory writes, no coverage changes.
4. **History** — Pluggie already versions entries
   (`list_entry_versions` / `restore_entry_version`), so prompt rollback is
   close to free. Show the last N revisions with a restore button.

**Guardrails**
- Staff-only (`getStaff()`), same as the rest of `/admin`.
- Preview must never write to `memories`, `messages`, or any real idea — it's
  a dry run against a fixture.
- Preview burns a model call. Show the cost implication; consider a rate limit.
- Saving a prompt takes effect on the **next chat opened**; it does not
  retroactively change chats already in progress. Say so in the UI.

---

## ⚠️ This supersedes BL-23

BL-23 proposed moving templates to **git-versioned YAML**. That is the *opposite
direction* from admin editing, and admin editing is the explicit ask.

Recommendation: **drop BL-23.** The two reasons it existed are both answered
here — the JSON-in-a-textarea pain is solved by the structured arc editor, and
version control is solved by Pluggie's entry versioning. Revisit only if prompt
edits start needing code review.

The one thing YAML would still have given us is arc/`intent_key` referential
integrity. Keep that discipline manually: **intent keys are stable identifiers —
add and deprecate, never rename.** The admin editor should make key fields
read-only after creation to enforce it.
