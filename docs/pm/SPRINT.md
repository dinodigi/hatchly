# Sprint 6 — Chat hardening & interaction *(proposed — not started)*

**Status:** awaiting sign-off on scope
**Window:** TBD
**Theme:** the chat is the product; make it recoverable and fast before adding surface

> Previous sprint closed 2026-07-30 — see [retros/sprint-5-idea-hub-and-memory.md](retros/sprint-5-idea-hub-and-memory.md).

---

## Why this, over the alternatives

The pipeline works end-to-end now — onboarding, seven ordered chats, arcs,
memory with kind/entities/intents, coverage. What it *isn't* yet is robust or
fast: a bad model sample gets persisted verbatim, a transient failure shows raw
JSON-parse jargon, and every reply lands as a 10–30 second wall of nothing
followed by a paragraph.

The two large alternatives both lose on timing:

- **Deck artifact (BL-20)** is the most valuable *feature* left, but it's the
  piece most shaped by Firas's arc feedback — building it before BL-05 risks
  rework.
- **Perf items (BL-21/22)** are cheap and real, but the instance upgrade already
  removed the pain that motivated them. Measure before optimizing.

Chat hardening has no such dependency and fixes things founders currently see.

## Pulled

| ID | Item | Size | Status |
|---|---|---|---|
| BL-01 | Degenerate-reply guard | S | todo |
| BL-02 | Bodyless 500 on MCP failure | S | todo |
| BL-03 | Unguarded `res.json()` | S | todo |
| BL-04 | `writableBy: "none"` on `users.role` / `suspended` | S | todo |
| BL-10 | Write the chat-interaction spec | S | todo |
| BL-12 | Stop / cancel a running turn | S | todo |
| BL-14 | Regenerate a reply | S | todo |

**Stretch (only if the above lands clean):**

| ID | Item | Size | Status |
|---|---|---|---|
| BL-11 | Stream responses | ? | todo — sized by BL-10 |
| BL-21 | Leaderboards via `aggregate_entries` | S | todo |

## Deliberately not in this sprint

- **BL-20 deck** — waiting on BL-05 (Firas). Building first risks rework.
- **BL-11 streaming** — in as stretch only. Our structured-output schema means
  naive streaming breaks memory extraction; BL-10 has to resolve that first.
- **BL-25 mobile** — real gap, but a whole sprint of its own.
- **BL-23 templates-as-YAML** — best done right *before* heavy arc iteration,
  which is gated on BL-05.

## Definition of done

- A degenerate model reply never reaches the founder or the database.
- Every failure path in `/api/chat` returns JSON, never an empty body.
- The founder can stop a running turn and regenerate a bad one.
- A written spec exists for the chat-interaction epic, with BL-11/13/16/17 sized.
- No collection allows a user to change their own `role`.

## Blocked / needs a human

| What | Who | Blocks |
|---|---|---|
| Approve the 7 chats + arcs (BL-05) | Firas | BL-20, all arc iteration, BL-23 |
| Separate API key for cost tracking | Firas | Economy phase 2 |
