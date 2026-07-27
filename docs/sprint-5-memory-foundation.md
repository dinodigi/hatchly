# Sprint 5 — Memory foundation & idea identity

Extracted from Sprint 3's Phase 1 because it is foundational: every output (deck,
brief, artifacts, public listing) generates from memory, so this lands **before**
the chat re-cut and the runtime work. Source: Jul 27 architecture session.

Phase: **prototyping** — no live users, no migration. We wipe and reseed freely.

---

## Why this sprint exists

Memory is the source of truth. Everything else is a query over it. Two things are
missing today:

1. **Memory has no notion of what kind of claim a fact is.** A validated finding
   and a wild guess are stored identically, so no generated output can tell them
   apart.
2. **Memory only ever appends.** Revisit the name three times and you get three
   rows plus a `superseded` flag, instead of one node that changed.

Fixing #2 is what keeps memory bounded as an idea matures — which is the real
answer to "does memory get too heavy?" It doesn't, if nodes update.

---

## Part 1 — Memory node semantics (the core change)

### Singular vs accumulative

Some facts have exactly one answer; a new answer **replaces** the old one:
the name, the tagline, the pricing model, the core problem statement.

Others coexist and **append**: competitors, features, risks, channels, quotes.

This maps to how the brief already behaves — `problem`/`who`/`value` replace,
`features`/`open_questions` append. We are making that behaviour explicit and
general.

### Singularity is owned by the intent, not the row

The question-arc intent declares it. "What should it be called" is singular by
definition; "who else is doing this" is accumulative. A memory written against an
intent inherits that behaviour.

Consequence: updating is **deterministic**. We look up the node for that intent
and overwrite it — no fuzzy matching of "which previous memory did this replace."
That retires the `supersedes`-as-relation idea from the Sprint 3 draft entirely.

### History lives in activity, not memory

Memory holds **current state**. The `activity` collection already records
`type: "change"` with `old_value` / `new_value` — that is the audit trail and it
already powers the "you changed your mind" view. No new mechanism needed.

### The bound this creates

Singular nodes cap at roughly the number of intents — 7 chats × ~6 intents ≈ 40.
Everything beyond that is genuinely additive information, not restatement. A
mature idea stays queryable instead of ballooning.

---

## Part 2 — Schema changes

### `memories` collection

**Add**
| Field | Type | Why |
|---|---|---|
| `kind` | enum | `decision · evidence · assumption · constraint · preference · question · risk`. The single most important addition — lets the deck demand evidence and the open-questions view populate itself as a query. |
| `entities` | array of text | Named things: competitors, channels, price points, segments. Makes "list every competitor" a query, not an LLM pass. |
| `intent_key` | text, nullable | Which arc intent this answers. Nullable — free-form chat can produce facts that map to no intent. This is what makes singular updates deterministic. |

**Expand** — `topic` is missing `market_size`, `timing` (why now), and `legal`.

**Keep** — `content`, `verbatim`, `topic`, `chat`, `turn`, `source_type`,
`source_label`, `idea`, `owner_id`.

**Cut / don't add** — `confidence` (redundant: assumption-vs-evidence already
encodes it), `origin` (no output queries it), `salience` as a model judgment
(derive it — a fact feeding a required output slot is core by definition).

**Revisit** — `superseded` may become unnecessary for singular slots once nodes
update in place. Keep it for now for accumulative items that get retracted.

⚠️ `define_collection` is all-or-nothing — an omitted field reads as a removal.
**Snapshot with `describe_collection` and diff before writing.**

### `ideas` collection
No schema change. `name` and `one_liner` already exist; the work is in how they
are treated (Part 3).

### `chat_templates` collection
Add `subtitle` (static, per template). Full re-cut of this collection belongs to
Sprint 3 — only the field is added here so the card work can land.

---

## Part 3 — Idea identity (the tagline)

Firas's point: the auto-generated one-liner from onboarding must survive, because
a brand name like "Cakefinder" does not explain what the thing is.

**Rules**
1. Onboarding generates a plain-language tagline before any brand name exists.
2. The brand name **never replaces** the tagline. They always render together —
   "Cakefinder — the local home baker marketplace."
3. Render together in all four places: idea card, public listing, hub header,
   deck cover.
4. The tagline stays plain-language even after branding — that is the job it is
   doing.
5. It is a **singular** memory slot (topic `brand`, kind `decision`).

**Open:** does the tagline auto-update as the pitch sharpens, or freeze once the
founder approves one? Auto-update risks drifting under them. Current agent prompt
already says "update the one-liner when the pitch materially sharpens" — so today
it drifts. Needs a call.

---

## Part 4 — Chat card presentation

Two lines under each card, doing different jobs:

- **Subtitle — static, per template.** What this chat is for. A chat's job is
  identical across ideas ("what makes this hard to copy" means the same thing for
  cakes or alerts), so generating it per idea adds cost and variance for nothing.
- **Status — dynamic, derived.** What has actually been captured so far. This is
  the coverage signal that replaces the killed build gate, and it tells a founder
  which chat to open next without inventing a percentage.

Status is **derived from memory coverage**, not stored — no extra writes.

---

## Part 5 — Build order

1. **Snapshot** `memories` + `chat_templates` schemas (`describe_collection`).
2. **Extend `memories`** — `kind`, `entities`, `intent_key`; expand `topic`.
3. **Extend the agent's extraction schema** (`lib/agent.ts` `OUTPUT_SCHEMA`) to
   populate `kind`, `entities`, `intent_key`, with clear enum descriptions —
   inconsistent tagging is worse than absent tagging.
4. **Update the write path** (`api/chat/route.ts`) — singular intents update the
   existing node and write an `activity` change row; accumulative intents append.
5. **Wipe and reseed** test memories so nothing is half-tagged.
6. **Idea identity** — render `name` + `one_liner` together everywhere; stop
   letting the name supersede it.
7. **`subtitle` field** on `chat_templates` + the derived status line on cards.

Steps 6–7 are independent of 1–5 and can land in parallel.

---

## Definition of done

- Changing the idea's name three times leaves **one** name node, not three, and
  three `activity` change rows.
- Mentioning three competitors leaves **three** memory rows.
- Every new memory carries a `kind`; spot-check that a stated fact, a guess, and
  a decision are classified differently.
- `topic=competition` + entity query returns the competitor list without an LLM.
- Name and tagline render together on idea card, listing, hub header, deck cover.
- Memory count on a heavily-revisited test idea stays in the tens, not hundreds.

---

## Open decisions carried in

| # | Question |
|---|----------|
| A | Tagline: auto-update as the pitch sharpens, or freeze on approval? |
| B | `topic`: single value, or primary + secondary? ("10% commission funds referrals" is both pricing and gtm) |
| C | `kind` edge cases — where does assumption end and decision begin? Needs worked examples before the enum descriptions are written. |

---

## Relationship to other sprints

- **Sprint 3 (Idea Hub)** — depends on this. The 7-chat re-cut, question arcs,
  auto-initiation and the deck all assume this memory model. Sprint 3's Phase 1
  is now this document.
- **Sprint 4 (Platform/perf)** — independent. No overlap.
