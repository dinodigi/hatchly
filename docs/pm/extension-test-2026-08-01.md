# Extension pressure-test — live observations · 2026-08-01

Dino watching the Claude-in-Chrome founder run on prod ("Prepped" idea).
**Tracking only — no fixes during the run.** Triage into BL items after the
tester's report lands.

| # | Observation | Evidence | First read (hypothesis, unverified) |
|---|---|---|---|
| 1 | "That took too long" mid-run | The problem chat, vague-answer pressure move | Degenerate spiral burning to the 16k cap + BL-59 retry doubling model time. Already filed → **BL-62** (cap max_tokens; apply post-run) |
| 2 | **Near-blank reply persisted**: assistant bubble containing only ":" — yet traces show `updated brief · features` + `updated memory · pricing`, and chips rendered | How it makes money, right after "$12 per meal flat" | Guard gap: `isDegenerate` requires reply<20 chars **AND zero extraction** — a husk reply WITH successful memories/brief/chips bypasses the retry. The reply field alone was degenerate; extraction and chips were fine |
| 3 | **Token-stutter reply**: "…or would you would you rather anchor higher since since since it's it's it's bundled bundled bundled with locker pickup…" — also opens mid-sentence (", meals a week lands you…", leading comma, likely a dropped first token) | Same chat, the $55-65/week reply | Same degeneracy family, milder: repetition/stutter with intact meaning. No current heuristic catches it (arguably shouldn't hard-retry — content is usable; maybe detect N-gram runs) |

| 4 | **Corrupted contradiction callout**: reply reads ", Q you Q u the earlier locked pricepricepricein Q at Q your Q $ decision decision — decisiondecision" — word-salad with token repetition, stray "Q"s, and the leading-comma/dropped-first-token signature again. Crucially: trace shows `captured memory · pricing` AND the chip "Stick with $12/meal" rendered — the BL-55 contradiction logic actually FIRED (it wants the founder to choose between $12 and $25); only the reply text corrupted | How it makes money, immediately after the planted "$25 per meal" contradiction | Reply-field-only corruption, worst instance yet. Pattern across #2/#3/#4: extraction + chips always intact, reply field alone degenerates, dropped leading token recurs, and the pricing chat is the hotspot (3 of 4 incidents). Post-run: consider a stutter/entropy heuristic in `isDegenerate` (reply-only retry), and check whether the shared context of this chat (locked prices, repeated $ tokens) correlates |

## Post-run: the tester's full report landed; triage complete

Verdict: "strong reasoning, unreliable rendering and cross-chat bookkeeping —
I'd trust it to think with me; I wouldn't yet trust its screen to always show
me the truth." Zero fabricated facts across 33 memories; bare confirmations,
off-lane redirects, and help-me-decide all passed clean.

DB verification corrected two mechanisms vs the report's hypotheses:
- The Activity "leak" = honest rendering of a POISONED memory content (the
  corruption family writes into any string field) → **BL-65**
- "Still open" $12-vs-$25 = a live untagged conflict-narration row beside the
  resolved node, not a sync bug → **BL-66**
- Badge stalls = cross-chat facts never re-tagged for the local arc → **BL-63**
- Frozen brief.problem = onboarding placeholder reads as filled → **BL-64**
- Minor, log-only: "both"-answer tagged assumption where decision was arguable;
  45% vs "45-46%" precision drift in one economics memory.

**Triage outcome (all closed same day):** BL-65/62/66 shipped as the
containment package (`96c510d`, `e5ceb83`); BL-63 (`d7ff11a`) and BL-64
(`158bdcf`) closed the badge-stall and placeholder-brief findings. Harness
note recorded along the way: a DOUBLE-degenerate turn is a lost turn in the
replay (frozen transcript can't re-ask) but a recoverable "ask me again"
moment in production — read a brief-fill dip against the degenerate-past-retry
count before blaming a change (bit us on run `18-35-52`: problem t4 died
twice, who/value never landed; the sibling run filled everything).

Healthy signals worth protecting, same run: The problem / What you're building /
How it makes money all reached **✓ covered** (BL-60's recorded-resolution fix
visibly working); replies anchoring price against Factor/Trifecta (six-part
prompt PUSH behaving); extraction traces firing on every turn.
