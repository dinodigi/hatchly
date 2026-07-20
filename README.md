# Hatchly

Where ideas get backed before they get built.

Founders shape an idea by talking to an agent that remembers what they said. When it's ready
they publish it to a public stream, where anyone can back it with **Hatchly Bucks** — play
money that buys prestige, never equity.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router, Turbopack) + TypeScript |
| Data | [Pluggie](https://pluggie.app) (Neon) — collections, relations, atomic `transact`, CAS |
| Auth | Clerk v7 |
| Media | R2 (covers, avatars) |
| Email | Resend (declared via Pluggie events) |
| Agent | Anthropic API, **BYOK** — each user brings their own key |

Hatchly is free to use. The model calls run on the user's own Anthropic key, which is
encrypted at rest (AES-256-GCM) and never enters a Pluggie collection, a log, or chat context.

## Getting started

```bash
cd web
cp .env.example .env.local     # then fill in the values below
npm install
npm run dev
```

Required environment:

| Variable | What it is |
|---|---|
| `AGENTX_DELIVERY_TOKEN` | Pluggie **delivery**-scoped token (public reads) |
| `AGENTX_MCP_TOKEN` | Pluggie **MCP**-scoped token (server writes — economy, moderation) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Clerk instance |
| `HATCHLY_KEY_SECRET` | 32-byte hex — encrypts users' BYOK model keys |
| `NEXT_PUBLIC_SITE_URL` | Public origin. **Required in production** — without it `metadataBase` falls back to localhost and every shared link advertises an `og:image` no crawler can fetch |

The two Pluggie tokens are different scopes and are not interchangeable; using one where the
other is expected fails with `E_SCOPE`. Economy collections are `write:"none"` on the delivery
API by design, so no client token can ever move money.

For Claude Code, copy `.mcp.json.example` to `.mcp.json` and paste an MCP-scoped token.

## Deploying

[`render.yaml`](render.yaml) is a Render Blueprint: **New → Blueprint**, point it at this repo.
It provisions one stateless web service — Postgres (Neon), object storage (R2) and auth (Clerk)
all live outside it.

Every secret is marked `sync: false`, so Render prompts for the values on first deploy and
stores them encrypted rather than keeping them in this repo. Set all six from the table above.

Two things that bite:

- `NEXT_PUBLIC_*` values are **inlined at build time**, not read at runtime. `NEXT_PUBLIC_SITE_URL`
  and the Clerk publishable key must be set *before* the first build, or you ship a bundle
  pointing at localhost.
- The health check is `/api/health`, deliberately not `/`. `/` renders the stream, which costs
  several Pluggie calls; a probe hitting it every few seconds would spend the shared 300/min
  rate limit that real users need.

`HATCHLY_KEY_SECRET` must stay stable across deploys — rotating it orphans every stored BYOK
key and forces all users to reconnect.

## The economy

Rules live in [ECONOMY.md](ECONOMY.md). Two properties matter most:

- **Balance is derived from the ledger.** `sum(transactions.amount) == wallet.balance`, always.
  Every wallet mutation is CAS-guarded and carries a unique idempotency key, so concurrent
  writers conflict and retry rather than losing money.
- **Bucks are play money.** Every surface that touches them says so. That's a legal posture,
  not a tone choice.

Verify it against live data at any time:

```bash
node scripts/audit-economy.mjs
```

It checks eight invariants and exits non-zero on any violation, so it can gate a deploy.
Seed demo rows are excluded and reported rather than silently skipped.

## Layout

```
web/            the Next.js app
  src/lib/      economy, agent, admin, key vault, Pluggie clients
  src/app/      routes — stream, idea hub, public pages, admin, API
  assets/       fonts vendored for OG image rendering
Design/         the v4 prototype — the source of truth for UI
scripts/        operational scripts (economy audit)
```

`Design/Hatchly.html` + `Design/app/` is **v4**, the definitive design spec. When UI and docs
disagree, v4 wins.

## Docs

- [PROJECT.md](PROJECT.md) — what Hatchly is, the user journeys, the system features
- [ROADMAP.md](ROADMAP.md) — milestone status and what's left
- [ECONOMY.md](ECONOMY.md) — currency rules, sinks, open decisions
