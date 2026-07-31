# Hatchly PM

Lightweight project management. Four files, one folder of retros. The rule is:
**if it isn't written here, it doesn't exist.**

## The files

| File | What it holds | Who edits it |
|---|---|---|
| [BACKLOG.md](BACKLOG.md) | Everything not yet scheduled, roughly prioritized. The pull-from list. | Anyone, anytime |
| [SPRINT.md](SPRINT.md) | The one sprint currently being worked. Nothing else. | Set at sprint start |
| [SHIPPED.md](SHIPPED.md) | Append-only log of what actually landed, with commits | On every deploy |
| [retros/](retros/) | One retro per finished sprint | At sprint close |

**PM tracks status. The `docs/sprint-*.md` files track *specs*.** A backlog item
points at its spec; it does not restate it. If an item needs more than three
lines to describe, it needs a spec doc.

## The loop

```
BACKLOG ──pull──> SPRINT ──work──> SHIPPED ──close──> retros/
   ▲                                                     │
   └──────────── new items from the retro ───────────────┘
```

1. **Pull.** Pick items from the backlog into `SPRINT.md`. Say why they were
   picked over the alternatives — a sprint with no stated rationale becomes a
   to-do list.
2. **Work.** Update item status in `SPRINT.md` as things move. Log each deploy
   in `SHIPPED.md` with its commit hash.
3. **Close.** Write the retro. Move anything unfinished back to the backlog with
   a note on *why* it didn't land — that reason is usually the most useful thing
   in the retro.
4. **Feed back.** Suggestions from the retro become backlog items with a
   `from: retro-N` tag, so we can see whether we act on our own findings.

## What a retro must contain

Copy [retros/_TEMPLATE.md](retros/_TEMPLATE.md). Non-negotiable sections:

- **Shipped** — what actually landed, with commits. Not what was planned.
- **Worked** — practices to keep doing. Be specific; "good communication" is noise.
- **Didn't work** — including our own mistakes. A retro with no failures is a
  retro nobody read honestly.
- **Fixed** — bugs closed, with how they were found (user report? audit? luck?).
- **Arising** — new items, questions, and risks discovered mid-sprint. These go
  to the backlog.
- **Carried** — what slipped, and the real reason.

## Conventions

- **IDs.** Backlog items are `BL-nn`, permanent once assigned. Reference them in
  commits and sprint docs so history is traceable.
- **Status.** `todo` · `doing` · `blocked` · `done` · `dropped`. `blocked` must
  name what it's blocked on.
- **Sizing.** `S` (< half a day) · `M` (1–2 days) · `L` (3+ days) · `?` (needs a
  spec before it can be sized). Rough on purpose.
- **Evidence over estimate.** When closing an item, link the commit or the
  verification. "Done" without a reference is not done.
- **Blocked-on-a-person is a real status.** Approvals and config that only a
  human can do (Firas's arc sign-off, Clerk prod keys) belong on the board, not
  in someone's memory.
