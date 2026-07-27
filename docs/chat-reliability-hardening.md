# Chat reliability — findings & hardening backlog

Three defects found by investigation on 2026-07-27 (not yet fixed). All three
share a theme: **the pipeline behaves correctly, but degrades rudely.** Nothing
here corrupts data — the atomic save has held every time — but each one shows a
raw failure to the founder instead of a graceful one.

---

## 1. Degenerate model reply is saved and displayed as-is  ⚠️ highest value

**Evidence (real, from the DB).** In the "How it makes money" chat of Basecamp
Ledger (`chat eb05f122`), turn 4's assistant message is stored as literally:

```
content
```

No tool_trace, no suggestions, no memories, no brief updates. The model returned
a schema key name as its entire reply — a rare degenerate sample from structured
output, slightly likelier right after a prompt change (the formatting + chip
rules had just shipped).

**Why it reached the user.** We validate the *shape* of the model's output
(schema-enforced) but never its *sanity*. A reply that is a few characters long
with zero memories, zero brief updates and zero suggestions is almost certainly
a dud, and we persist and render it as though it were wisdom.

**Not a context problem.** The very next turn understood the founder's earlier
answer perfectly, resolved an open question and captured two pricing memories —
so nothing upstream was corrupted. One bad sample, nothing more.

**Fix.** In `api/chat/route.ts`, after `runAgentTurn`: if the reply is
degenerate (very short AND no memories AND no brief_updates AND no
suggested_replies), retry the turn **once**. If it's still degenerate, return a
graceful "I lost my train of thought — ask me that again?" and do NOT persist
the junk. Hard cap of one retry so a bad streak can't burn tokens.

**Cost note.** Today the dud burned one call and the founder's "?" nudge burned
another; the guard makes it one silent retry instead.

---

## 2. MCP failures after the model call crash to a bodyless 500

**Symptom reported.** "Unexpected end of JSON input" when opening a fresh chat;
Try again worked.

**What that error is.** The client's `await res.json()` on an EMPTY response
body. Something returned nothing parseable.

**Most likely trigger that day:** a Render deploy switchover cut the in-flight
request (12 deploys shipped that session). **Not an MCP/Pluggie fault** — the
`[mcp]` timing logs showed 150–500ms and zero errors all session.

**The real gap it exposed.** `api/chat/route.ts` try/catches only the *model*
call. Every MCP write after it — including the big save `transact` — is
uncaught, so any rejection (e.g. a write landing during the documented ~15s
schema-convergence window) throws out of the route as a **bodyless 500** instead
of the `{error}` JSON every other branch returns.

**Fix.** Wrap the persistence phase; return `{ error: "…" }` with a real status.

---

## 3. ChatPanel's `res.json()` is unguarded

The same hardening applied to the quick-ideas composer weeks ago
(`res.json().catch(() => ({}))`) never made it into `ChatPanel`. With it, #2
would have surfaced as "something went wrong — try again" instead of raw
JSON-parse jargon.

**Fix.** Guard the parse; keep the existing Try-again affordance.

---

## What held up well (don't regress these)
- **The save is one atomic transact.** Every failure left zero half-written
  state — no orphaned user message, no memory without a reply. That's why Try
  again always produced a clean conversation rather than duplicates.
- **The 60s timeout path works** and produces a friendly message; it was
  correctly ruled out as the cause of #2.
