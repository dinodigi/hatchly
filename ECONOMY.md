# Hatchly Bucks — economy rules

> Play money. Prestige, never real currency, never redeemable. Every surface keeps that copy —
> it's a legal posture, not a tone choice.
>
> **Status:** core loop decided. Open items at the bottom.

---

## The loop

```
        ┌─── signup grant ───┐
IN  ────┼─── daily reward ───┼──▶  backer wallet
        └─── earn mechanics ─┘           │
                                         │ invest in an idea
                                         ▼
                                  founder wallet ──┬──▶ reinvest in own idea (HIGH TAX) ──▶ 🔥
                                                   ├──▶ buy spotlight ──────────────────▶ 🔥
                                                   └──▶ invest in others' ideas ─────────┘ (circulates)
```

Bucks **circulate** — an investment moves from the backer's wallet into the founder's wallet.
They are not burned on investment.

## Decided

| Rule | |
|---|---|
| **Wallets** | Every user has one. Investment moves bucks backer → founder. |
| **Multiple ideas** | A user can run several ideas on the stream at once, all funded into the same wallet. |
| **Project rank** | **Cumulative received**, never current balance. If rank tracked balance, spending would cost rank, nobody would spend, and the economy would freeze. |
| **Sink 1 — self-investment tax** | A founder may invest in their own idea, taxed heavily. Buying your own rank is allowed but priced. |
| **Sink 2 — spotlight** | Bucks spent on the featured slot are **burned**. |
| **No returns** | There is no dividend and no reputation-return counter. Strip `returns` from `ECONOMY` and `LEADERBOARD`. |
| **No cash-out** | Bucks never convert to money. |
| **Periodic refresh** | Ranks refresh weekly or monthly so the board doesn't entrench. Mechanic TBD — see below. |

## The refresh — recommended mechanic

**Rank on a rolling window; keep lifetime totals as a separate stat.**

The UI already does this: idea cards carry both `bucks` (cumulative) and `today`, and the
stream's default sort is **Top today**. Extend that pattern — rank by *bucks received in the
last 7 / 30 days*, and display lifetime total alongside it.

Why this over a hard reset:
- No destructive reset job, no lost trophies — a founder keeps their all-time number
- Solves cold start: a new idea competes on *this period's* flow, not against an
  18-month accumulated total
- Already matches the mental model the UI teaches
- Seasons can sit on top for prestige (archive each period's winners to a hall of fame)

## The spotlight — DECIDED: a timed ascending auction

**A clock runs. People bid while it runs. Whoever leads when it hits zero wins the feature.**

| | |
|---|---|
| Bidding window | 24h (`SPOTLIGHT_AUCTION_HOURS`) |
| Feature window | 7 days (`SPOTLIGHT_FEATURE_DAYS`) |
| Opening bid | 25 (`SPOTLIGHT_MIN_BID`) |
| Minimum raise | 25 (`SPOTLIGHT_BID_INCREMENT`) |
| Anti-snipe | a bid in the last 5 min extends the close by 5 min |

**Money flow.** A bid **escrows** (`balance → escrow`); it is not spent. Being outbid refunds
you in full, in the same atomic batch that installs the new leader — so a leader can never
exist whose bucks aren't held, and a refund can never go missing. Only the **winner's** bid is
burned, at settlement. Losing a bid costs nothing, which is what makes bidding safe enough to
be competitive.

This keeps the spotlight a true sink while fixing the flaw in the prototype's version, where
refund-on-outbid made the slot free to hold forever (bid once, never get outbid, own the banner
permanently at zero cost).

**Why anti-snipe.** "Last bid before the timer wins" with a hard deadline is a latency race —
whoever fires closest to the buzzer wins, regardless of willingness to pay. Extending on a late
bid preserves the intent (whoever wants it most wins) and removes the reward for sniping.

**Settlement is lazy.** There is no scheduler in the app. Any read of the spotlight that finds
an expired auction settles it: burn the winner's escrow, feature them, open the next auction.
It is CAS-guarded and carries a deterministic idempotency key derived from the auction that
just closed, so concurrent readers race safely and exactly one settlement applies. The stream
is the busiest read in the product, so in practice settlement happens within seconds of expiry.

**Ledger note.** The burn is not a separate row — the bucks already left `balance` at escrow
time. Net spotlight burn is `−(Σ spotlight_escrow + Σ spotlight_refund)`, the same derivation
pattern as the investment tax below.

---

## Open — needs a decision

### 1. Collusion / sybil funnelling ← the important one

The self-investment tax is a toll on one road. **Mutual investment pays no toll.**

A invests 500 in B's idea, B invests 500 in A's. Neither self-invested, neither is taxed, both
climb. With alt accounts it's worse: farm daily rewards across N accounts, funnel it all into
your own idea as "someone else's" investment, pay zero tax, outrank everyone honest.

This is the dominant strategy the moment rank matters, and it routes around the exact mechanism
built to stop it.

Candidate mitigations (combinable):
- **Small universal tax** on every investment, heavy on self-investment — removes the untaxed path
- **Distinct-backer weighting** — 40 backers at 10 each outranks 2 backers at 200. Directly
  targets funnelling, and is a better signal anyway
- **Reciprocity damping** — discount mutual flows between the same pair
- **Hard signup gate** — phone or invite, making alts expensive

*Leaning: universal tax + distinct-backer weighting.*

**Detection now exists** (M6b). `/admin` runs two scans over public stakes:
- **Reciprocal pairs** — A backs B *and* B backs A, scored by symmetry (a 1.0 symmetric
  high-volume pair is a wash trade) and volume.
- **Concentrated inflow** — a founder whose bucks come ≥60% from one backer across ≤3
  sources.

Detection is not mitigation. The mechanics above are still undecided; the console only
tells an operator where to look.

**Accounting note for anyone reading the ledger:** the `invest_tax` / `self_invest_tax`
rows are written with `amount: 0`. They are informational. The burn is real but lives in
the gap between the backer's `invest_out` (−amount) and the founder's `invest_in` (+net),
so summing those rows reports a zero sink. Derive it as `−(Σ invest_out + Σ invest_in)`.
The admin console does this; anything else reading the ledger must too.

### 2. Tax rate, and where the tax goes
Burned (pure inflation control) or redistributed into a discovery pool for new ideas
(turns the sink into a cold-start fix)? Rate needs a number.

### 3. Earn mechanics beyond the daily reward
Referrals, giving feedback, completing a brief. Each is an inflation source and must be
weighed against the sinks.

### 4. Balance cap
Should idle accumulation be capped, so attendance alone doesn't create whales?

### 5. Refresh cadence
Weekly or monthly. Weekly = more churn and urgency; monthly = more signal per period.
