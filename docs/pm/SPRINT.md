# Sprint 6 — Chat Quality *(proposed — awaiting sign-off)*

**Status:** scoped, not started
**Window:** TBD
**Theme:** the chat *is* the product. Make what it says good, make it editable
without a deploy, and stop it showing founders broken output.

> Previous sprint closed 2026-07-30 — see [retros/sprint-5-idea-hub-and-memory.md](retros/sprint-5-idea-hub-and-memory.md).
> Supersedes the earlier "chat hardening" draft, which is folded in below.

---

## Why this, over the alternatives

Jonathan's call: chat quality is the top priority right now. It also happens to
be where the evidence points — an audit of all seven live prompts found **three
that instruct the model to do something it cannot do** ("Produce a pricing model
artifact" — chats don't produce artifacts), one stale integration reference
(BrandBucket), and a 4×  depth gap between the prompts rewritten in Sprint 5 and
the three still carrying their original one-liners.

The hardening items ride along because they're the same problem seen from the
output side: a degenerate reply reaching the founder is a chat-quality failure,
not a separate infrastructure concern.

**Not the deck (BL-20)** — still blocked on Firas's arc approval, and building it
first risks rework.

## Pulled

### Prompt quality — spec: [chat-prompt-overhaul.md](../chat-prompt-overhaul.md)

| ID | Item | Size | Status |
|---|---|---|---|
| BL-40 | **Remove the false "Produce a X artifact" instruction** from `pricing`, `brand`, `gtm`, and the stale BrandBucket reference | S | todo |
| BL-41 | **Rewrite all 7 system prompts** to the six-part standard (job / good / push / push back / boundary / stuck) | M | todo |
| BL-42 | **Retire the dead `questions` field** — stop reading it, hide it in the editor. Keep `opening` as the documented fallback for chats without initiation | S | todo |

### Prompt Studio — same spec

| ID | Item | Size | Status |
|---|---|---|---|
| BL-43 | **Admin `?tab=prompts`** — list + edit form for name, subtitle, system prompt, initiation prompt | M | todo |
| BL-44 | **Structured arc editor** — intent text, required toggle, singular/accumulative. Not a JSON textarea. Intent keys read-only after creation | M | todo |
| BL-45 | **Preview / dry-run** — run a chat's initiation against a throwaway fixture idea; render reply + chips; write nothing | M | todo |
| BL-46 | **Prompt version history + restore** — Pluggie already versions entries, so this is mostly UI | S | todo |

### Hardening (folded in from the earlier draft)

| ID | Item | Size | Status |
|---|---|---|---|
| BL-01 | Degenerate-reply guard — never persist a dud like the `"content"` message | S | todo |
| BL-02 | Bodyless 500 on MCP failure → return `{error}` JSON | S | todo |
| BL-03 | Unguarded `res.json()` in ChatPanel | S | todo |
| BL-04 | `writableBy: "none"` on `users.role` / `users.suspended` | S | todo |

### Stretch — only if the above lands clean

| ID | Item | Size | Status |
|---|---|---|---|
| BL-12 | Stop / cancel a running turn | S | todo |
| BL-14 | Regenerate a reply | S | todo |
| BL-10 | Write the chat-interaction spec (streaming, edit/resend, voice) | S | todo |

## Deliberately not in this sprint

- **BL-11 streaming** — the single biggest perceived-speed win, but our
  structured-output schema fights naive streaming (reply text must stream while
  memory extraction still arrives validated). Needs BL-10 first. Its own sprint.
- **BL-20 deck** — blocked on BL-05 (Firas).
- **BL-23 templates → YAML** — **dropped.** Directly opposes admin editing; both
  its motivations are answered by BL-44 and BL-46. See the spec's closing note.
- **BL-25 mobile** — real gap, own sprint.

## Definition of done

- No chat prompt instructs the model to take an action it cannot take.
- All 7 system prompts meet the six-part standard; a reader can tell what
  "finished" looks like for each chat.
- Firas can change a prompt from `/admin`, preview the effect on a fixture, and
  roll back a bad edit — **without a deploy and without opening Pluggie**.
- Editing a question arc never requires typing JSON.
- A degenerate model reply reaches neither the founder nor the database.
- Every `/api/chat` failure path returns JSON, never an empty body.

## Risks

| Risk | Mitigation |
|---|---|
| Preview burns model calls on the team's key | Rate-limit; show cost; fixture-only |
| A bad prompt edit degrades every new chat silently | Version history + restore (BL-46); preview before save |
| Rewriting 7 prompts at once makes regressions hard to attribute | Land BL-40 first (pure removal), then rewrite in one commit per chat |
| Prompt edits and arcs drift apart | Intent keys read-only after creation; never rename |

## Blocked / needs a human

| What | Who | Blocks |
|---|---|---|
| Approve the 7 chats + arcs (BL-05) | Firas | BL-20 deck, heavy arc iteration |
| Review the rewritten prompts | Firas / Zeena | Nothing — but worth a read before they go live |
