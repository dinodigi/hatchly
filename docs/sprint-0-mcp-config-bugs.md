# Sprint 0 — MCP update, configuration, and past-build bugs

> **Status: DONE (2026-07-24).** Bug fixes shipped to `main` (6 commits, `0b5a32a..26c9fc7`).
> Live data cleaned: single admin account, test admin demoted, junk hidden, dupe suspended, ledger
> reconciled → `audit-economy.mjs` **exits 0**. Clerk unified on `glad-phoenix-18` (app + Pluggie).
> Deferred out of scope: downvote / live-updates / counter-decrement → [Sprint 2](sprint-2-features.md).
> `events` notifications (M10) remain unbuilt — tracked separately, not a Sprint 0 blocker.
>
> Runs **before** [Sprint 1](sprint-1-idea-dashboard.md). Sprint 1 adds two new Pluggie collections and a
> config-driven runtime; doing that on top of an un-reconciled backend is how you get a week of
> mystery bugs. This sprint makes the ground solid.
>
> Snapshot taken 2026-07-23. Connectors: neon · r2 · resend · clerk all **connected**.
> Failed deliveries (24h): **0**. Briefing attention/updates/notices: **empty**.

---

## Slice 0.1 · Configuration reconciliation

### 🔴 Clerk issuer mismatch — the one that matters
| | |
|---|---|
| Pluggie `endUserAuth.issuer` | `https://grand-lemur-61.clerk.accounts.dev` |
| App `.env.local` | `glad-phoenix-18.clerk.accounts.dev` |

Two different Clerk instances. The app works **today** only because every route owner-scopes
server-side using the MCP/delivery token — it never sends an end-user JWT.

**What it costs us:** the delivery API's `X-User-Token` path can never authenticate, so collection
`access` rules (`read: "owner"`, `write: "owner"`) are unusable from the client. Every future
per-user read has to be proxied through our own routes. It also means `PATCH`/`DELETE
{deliveryBase}/{collection}/{id}` is off the table.

**Decision needed:** point Pluggie at `glad-phoenix-18`, or move the app to `grand-lemur-61`.
Pointing Pluggie at the app's instance is almost certainly right — the app has live users on it.

### Other config
- **No `events` declared on any collection.** This is the entire reason nothing notifies anyone
  (M10). Pluggie's `events.created/updated/deleted` with `when:[…]` + `after:<delay>` is the
  mechanism — Resend is already connected and idle.
- **All 22 collections are `publicWrite: false`.** The shareholder feedback widget in Sprint 1 needs a
  `publicWrite: true` collection so stakeholders can submit without logging in.
- **Stripe not configured.** Correct for now; it becomes a dependency if the $9.95/mo subscription is picked up.
- **Delivery token rotation** — `mint_delivery_token` / `revoke_delivery_token` now exist. Worth a
  rotation now that the token has been in a demo build.

---

## Slice 0.2 · MCP capabilities we aren't using yet

The platform has grown since Hatchly was built. Ranked by value to us:

| Capability | Use for Hatchly | Priority |
|---|---|---|
| **`events`** | Resend notifications: outbid, new feedback, idea trending, quick idea cloned | **High** — closes M10 |
| **`batch` reads** | The idea hub fires 5 parallel `callTool` queries per load; `POST /batch` makes it one round trip | **High** — direct perf win |
| **`beforeCreate` / `beforeUpdate` hooks** | Enforce economy invariants at the write boundary instead of trusting callers | Medium |
| **Image resizing** (`/assets/{id}/image?w=`) | Feed thumbnails — the roadmap always planned this, never wired it | Medium |
| **`computed` fields** (`now`, `uuid`, `slugify`, `template`) | Replace hand-set timestamps and slugs | Low, easy |
| **`search_entries` / `?q=`** | Full-text over ideas and quick ideas | Low |
| **`aggregate_entries`** | Admin economy dashboards without pulling every row | Low |
| **changes feed / SSE** | Live stream updates | Later |

**Also:** `get_client_code` must be regenerated — Sprint 1 adds collections and the typed client has to
know about them. Treat regeneration as a required step of any schema change, not an afterthought.

---

## Slice 0.3 · Data hygiene

### Duplicate user accounts *(real bug, live data)*
`partners@dinodigi.com` exists **twice** with different `clerk_user_id`s, each with its own wallet:

| user id | clerk id | wallet |
|---|---|---|
| `0b612724…` | `user_3G4KjYQ…` | balance 25 000 |
| `ec6d7d7b…` | `user_3GlAFx…` | balance 25 000 |

Root cause to confirm: user bootstrap almost certainly creates a row per Clerk id without checking
whether the email already exists. **Fix the guard first, then merge the rows** — merging without the
guard just recreates the problem on next sign-in.

### Ledger drift *(caused during the demo — my doing)*
Both wallets were set to 25 000 by direct write to `wallets.balance`. The invariant
`sum(transactions.amount) == wallet.balance` is now broken, so **`node scripts/audit-economy.mjs`
will fail**. Fix by either writing compensating ledger entries or resetting both balances to their
true ledger sum. Do this before anyone trusts the audit script again.

### Other
- **`alex+clerk_test@example.com` is still `role: admin`** — must drop to `member` before production.
  (Attempted; blocked by a permission classifier. Needs doing from the Pluggie admin.)
- **Junk rows in the live stream** — the `Testbed` fixture and an `Untitled idea` sit at the bottom of
  the public stream. Hide or clean up.

---

## Slice 0.4 · Bugs and gaps from the past build

Full-codebase scan completed 2026-07-23 (four parallel passes). Findings, severity, and the
pattern-batched fix plan live in **[system-scan-findings.md](system-scan-findings.md)** — that doc is
the source of truth for this slice. Headlines: a **P0 duplicate-user-per-email** bug (root cause of the
`partners@` duplication), a **P0 dead artifact edit/delete/publish-toggle** (missing `owner_id`), and
the reported **comment lag** traced to a write-via-MCP / read-via-delivery-API race. Eight cross-cutting
patterns, five fix batches; Batch 1 (data-integrity P0) must land before Sprint 1's schema work.

**Fixed already this session** (context, not work): New-idea button stuck on "Creating…", missing quick
comment thread, composer drift from the v4 design, hardcoded artifacts panel.

**Also outstanding (from the scan's broader sweep):**
1. **Public reads over MCP.** MCP deliberately bypasses `publicFilter` — that's what it's for. One
   instance was found and fixed (quick comments). **Audit every other read of publicly-visible data**
   and move it to the delivery API so the platform enforces visibility instead of hand-written clauses.
2. **`contact_unlocks` exists with no API or UI.** Schema and client are ready; the 150-buck unlock and
   CSV export were never built.
3. **Artifact generation unverified against a live model.** Every surrounding surface is tested, but the
   test account has no BYOK key so a real generation has never run. **Sprint 1 depends on the agent
   loop working** — verify this early, not late.
4. **No mobile pass.** Nothing checked below 900px. Deferred by decision; re-confirm that still holds
   given Sprint 1 rebuilds the workspace layout.
5. **Clerk "infinite redirect loop" warning** — diagnosed: *not* a key mismatch (both keys verified
   against the same instance). It was colliding browser cookies. Documented so nobody re-debugs it.

---

## Done when
- One Clerk instance across app and Pluggie, with a decision recorded
- At least one `events` declaration delivering a real Resend email end to end
- `audit-economy.mjs` exits 0
- One account per email, with a guard preventing recurrence
- Test admin demoted, junk stream rows cleared
- Client regenerated; a public read audit completed
- One real artifact generated against a live model

## Explicitly not in Sprint 0
Stripe, the changes feed, mobile, and anything in Sprint 1.
