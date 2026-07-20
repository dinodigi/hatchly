# Hatchly — Project Orientation

> **Source of truth: the v4 UI** — `Design/Hatchly.html` + `Design/app/`.
> Not the handoff spec (that's v3, archived). When the doc and the UI disagree, the UI wins.
>
> **Decided 2026-07-19:** v4 · free + BYOK · lean on Pluggie · build from the UI.

---

## The product

**Ideas die in private.** You shape one alone, convince yourself it's good, build for six
months, then find out nobody wanted it. Hatchly makes validation social and cheap
*before* it gets expensive and real.

> *"Where ideas get backed before they get built."*

Two halves that feed each other:

**Private.** An AI chat interviews you. Everything meaningful becomes a **memory** that
remembers its own provenance — which chat, which turn, and your verbatim words.
Memories fill a 5-section **Product brief**. Complete it and the build gate opens:
MVP → execution plan → a copy-paste build prompt for Replit or Claude Code.

**Public.** Publish to the stream and the community backs you with **Hatchly Bucks** —
play money, stated everywhere: *"Prestige, not equity — bucks are never real money."*
Backing yields ranking momentum, demand signals, written feedback, and a notify-list of
warm leads.

The leaderboard ranks backers by **returns on ideas they backed early**. That's what
keeps the signal honest — flattery costs you rank.

---

## User types

| Type | Does |
|---|---|
| **Founder** | Shapes ideas privately, publishes, harvests feedback + leads, builds |
| **Backer** | Browses without an account, backs with bucks, climbs the leaderboard |
| **Requester** | Posts "someone should build this" to Quick Ideas — one per day |
| **Builder** | Claims a Quick Idea via "I'll build this", cloning it into their workspace |
| **Spotlight bidder** | Escrows bucks for the featured slot |

Most people are several at once. There is no admin or moderator role in the UI.

---

## Journeys

**Lurker → backer.** Browse the stream (no account needed) → Back → auth wall
*"Create an account to claim bucks and back ideas"* → 100 free bucks → invest
(25/50/100/250) → appear on the leaderboard.

**Founder → build.** New idea (**gated on having an API key**) → chat → memories accrue →
brief fills → 100% → *"I'm ready — build my project"* → MVP + plan + build prompt.

**Founder → validate.** Set visibility public → stream listing → bucks, feedback,
demand signals (would-use / willing-to-pay / notify-me) → spend 150 bucks to unlock the
contact list → email it or export CSV.

**Requester → builder.** Post a Quick Idea → someone clicks "I'll build this" → it clones
into their private workspace seeded with an opening chat.

**Spotlight.** Hold a public idea → bid ≥ current + 25 → bucks move to escrow → outbid
returns them in full.

**Memory correction.** Memory is **read-only**. *"Memory is shaped by the conversation —
talk to change it."* Refining opens a new chat that quotes the memory back at you.

---

## Feature inventory

**Economy** — signup grant (100), daily claim + streak, invest, escrow, refund-on-outbid,
transaction ledger, leaderboard with returns, wallet
**Ideas** — 3 stages (`ideation` / `public` / `build`), 3 visibilities (`private` /
`link` / `public`), cover editor (5 tonal presets + upload), tags, live-app URL
**Chat** — multiple named chats per idea, each feeding the brief; tool-call traces;
typing indicator; text + link + voice affordances
**Brief** — 5 sections: Problem · Who it's for · Core value · Features · Open questions.
Gate = problem + who + value + ≥1 feature
**Memory** — auto-captured, read-only, provenance-linked, `feeds` a brief section
**Artifacts** — 10 generatable types: brief (auto), problem, ICP, positioning, MVP,
pricing, landing, competitive, GTM, brand. The brief is the one that *is* live state
**Public listing** — shareable page, brief snapshot, feedback box, demand voter
**Community** — feedback inbox, paywalled contact list (150 bucks) + CSV export
**Quick Ideas** — upvotes, comments, clone-to-build, one post per day
**Settings** — BYOK Anthropic key, usage counter

---

## Design language

Warm paper, one amber accent, editorial serif.

- **Type** — Geist (UI) · Geist Mono · **Instrument Serif** (display, italic)
- **Accent** — `#DCA032`. One accent only.
- **Light** — bg `#FAFAF8` · surface `#F5F2EC` · raised `#FFFFFF` · text `#1A1814`
- **Dark** — bg `#0E0D0B` · surface `#141210` · raised `#1C1A17` · text `#F0EAE0`
- **Semantic** — success `#52C068` · danger `#E24B4A` · info `#5A8CD8`
- **Radii** — btn 9px · card 14px · modal 18px · pill 999px
- **Motion** — `cubic-bezier(.22,1,.36,1)`, 140–320ms; respects `prefers-reduced-motion`

---

## Backend — Pluggie / AgentX

`.mcp.json` → pluggie.app, project **Hatchly**. Connectors live: **Neon** (DB),
**R2** (media), **Clerk** (auth, issuer `glad-phoenix-18`), **Resend** (email).
Stripe and locales not configured.

**Collections: none.** A v3-shaped schema was built and then dropped on 2026-07-19 when
v4 became the source of truth. Rebuild from the v4 model.

Useful capabilities: `array`-of-`group` repeaters, `searchable` full-text, `enum` +
`indexed`, Clerk owner-scoping (`write:"owner"`), the `changes` SSE feed (realtime for
free), R2 image resizing, Resend via declarative `events` with `after:` delays.

**Known gaps:** no vector store (memory retrieval starts on full-text — keep it behind an
interface); no place to run the agent loop (needs its own service).

**BYOK security rule:** raw `sk-ant-…` keys must never be stored in Pluggie collections.
Pluggie holds `{provider, masked_hint, active, connected_at}` only; the secret lives
encrypted in the agent service.

---

## Open questions

1. **`Design/direction/` reintroduces a validation score (84)** and destinations v4 lacks
   (Mindmap, Structuring, Report, Launch ready, Timeline, AI Generator, Assets). It is
   newer than v4 and has no code. How much of it lands in v1?
2. **Backend for the economy.** Bucks, escrow, and the spotlight auction need atomic
   balance moves. Pluggie has `transact` and CAS (`update_entry_if`) — workable, but the
   auction's refund-on-outbid needs a careful design.
3. **Latent bug in v4** — `postQuick` writes `comments: 0` (number) while cards call
   `(q.comments || []).length`.
