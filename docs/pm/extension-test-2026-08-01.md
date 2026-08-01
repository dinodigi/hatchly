# Extension pressure-test — live observations · 2026-08-01

Dino watching the Claude-in-Chrome founder run on prod ("Prepped" idea).
**Tracking only — no fixes during the run.** Triage into BL items after the
tester's report lands.

| # | Observation | Evidence | First read (hypothesis, unverified) |
|---|---|---|---|
| 1 | "That took too long" mid-run | The problem chat, vague-answer pressure move | Degenerate spiral burning to the 16k cap + BL-59 retry doubling model time. Already filed → **BL-62** (cap max_tokens; apply post-run) |
| 2 | **Near-blank reply persisted**: assistant bubble containing only ":" — yet traces show `updated brief · features` + `updated memory · pricing`, and chips rendered | How it makes money, right after "$12 per meal flat" | Guard gap: `isDegenerate` requires reply<20 chars **AND zero extraction** — a husk reply WITH successful memories/brief/chips bypasses the retry. The reply field alone was degenerate; extraction and chips were fine |
| 3 | **Token-stutter reply**: "…or would you would you rather anchor higher since since since it's it's it's bundled bundled bundled with locker pickup…" — also opens mid-sentence (", meals a week lands you…", leading comma, likely a dropped first token) | Same chat, the $55-65/week reply | Same degeneracy family, milder: repetition/stutter with intact meaning. No current heuristic catches it (arguably shouldn't hard-retry — content is usable; maybe detect N-gram runs) |

Healthy signals worth protecting, same run: The problem / What you're building /
How it makes money all reached **✓ covered** (BL-60's recorded-resolution fix
visibly working); replies anchoring price against Factor/Trifecta (six-part
prompt PUSH behaving); extraction traces firing on every turn.
