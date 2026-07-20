"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icons } from "./icons";
import { Bucks, SectionLabel } from "./ui";

/* The spotlight auction: a countdown, a leading bid, and a bid box.
   The whole point is that a glance answers "how long do I have, what do I
   have to beat, and am I winning?" — so all three live on the surface. */

interface AuctionState {
  auctionEndsAt: string | null;
  auctionOpen: boolean;
  highBid: number;
  highBidder: string | null;
  highListing: string | null;
  minNextBid: number;
  featured: boolean;
  holder: string | null;
  featureEndsAt: string | null;
}

/** Live "2h 14m 09s" countdown. Ticks every second under a minute so the
 *  endgame feels urgent, every 30s before that to avoid pointless renders. */
function useCountdown(iso: string | null) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!iso) return setLeft(null);
    const target = new Date(iso).getTime();
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);
  return left;
}

function formatLeft(ms: number | null) {
  if (ms === null) return "—";
  if (ms <= 0) return "closing…";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}m ${String(sec).padStart(2, "0")}s`;
}

export function SpotlightTimer({ endsAt, urgent }: { endsAt: string | null; urgent?: boolean }) {
  const left = useCountdown(endsAt);
  const hot = left !== null && left > 0 && left < 10 * 60_000;
  return (
    <span
      className="mono"
      style={{
        fontVariantNumeric: "tabular-nums",
        fontWeight: 700,
        color: hot || urgent ? "var(--danger-text)" : "var(--accent-text)",
      }}
    >
      {formatLeft(left)}
    </span>
  );
}

export default function SpotlightControl({
  initial,
}: {
  initial: {
    auctionEndsAt: string | null;
    auctionOpen: boolean;
    highBid: number;
    highBidder: string | null;
    highListing: string | null;
    minNextBid: number;
  };
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AuctionState | null>(null);
  const [open, setOpen] = useState(false);
  const [mine, setMine] = useState<{ id: string; name: string }[] | null>(null);
  const [balance, setBalance] = useState(0);
  const [sel, setSel] = useState("");
  const [amount, setAmount] = useState(initial.minNextBid);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const endsAt = state?.auctionEndsAt ?? initial.auctionEndsAt;
  const left = useCountdown(endsAt);
  const polled = useRef(false);

  const live = state ?? { ...initial, featured: false, holder: null, featureEndsAt: null };

  const refresh = useCallback(async () => {
    try {
      const s = await fetch("/api/spotlight").then((r) => r.json());
      if (!s.error) setState(s);
      return s;
    } catch {
      return null;
    }
  }, []);

  // Someone else's bid changes what you must beat, so poll while the modal is
  // open — and once when the clock hits zero, to pick up the settlement.
  useEffect(() => {
    if (!open) return;
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [open, refresh]);

  useEffect(() => {
    if (left === 0 && !polled.current) {
      polled.current = true;
      // Settlement is lazy: this read is what actually closes the auction.
      setTimeout(() => refresh().then(() => router.refresh()), 1200);
    }
    if (left && left > 0) polled.current = false;
  }, [left, refresh, router]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/me")
      .then((r) => r.json())
      .then((j) => setBalance(j.balance ?? 0))
      .catch(() => {});
    if (mine === null) {
      fetch("/api/me/listings")
        .then((r) => r.json())
        .then((j) => {
          setMine(j.listings ?? []);
          if (j.listings?.length) setSel(j.listings[0].id);
        })
        .catch(() => setMine([]));
    }
  }, [open, mine]);

  useEffect(() => {
    setAmount((a) => Math.max(a, live.minNextBid));
  }, [live.minNextBid]);

  const label = live.highBid > 0 ? "Outbid them" : "Bid to feature yours";

  const trigger = (
    <button className="btn btn-secondary btn-sm" style={{ width: "100%" }}>
      <Icons.flame size={14} /> {label}
    </button>
  );

  if (!isSignedIn) return <SignInButton mode="modal">{trigger}</SignInButton>;

  const ok = sel && amount >= live.minNextBid && amount <= balance;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/spotlight", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId: sel, amount, requestKey: crypto.randomUUID() }),
      });
      const json = await res.json();
      if (!res.ok) {
        // A rival bid landed first — refresh so the user sees the new floor
        // instead of a stale one, and let them try again.
        if (json.code === "E_OUTBID" || res.status === 409) await refresh();
        throw new Error(json.error ?? "failed");
      }
      await refresh();
      setFlash(
        json.extended
          ? `You're leading at ${json.amount}. A late bid extended the clock.`
          : `You're leading at ${json.amount}.`,
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <span onClick={() => { setFlash(null); setError(null); setOpen(true); }}>{trigger}</span>

      {open && (
        <>
          <div className="scrim" onClick={() => setOpen(false)} />
          <div className="modal" style={{ width: 460 }}>
            <div style={{ padding: "22px 26px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <Icons.flame size={19} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>Spotlight auction</div>
                  <div className="faint" style={{ fontSize: 12.5 }}>
                    Highest bid when the clock hits zero wins the feature
                  </div>
                </div>
                <button className="iconbtn" onClick={() => setOpen(false)}><Icons.x size={18} /></button>
              </div>

              {/* clock + current leader */}
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <div className="card" style={{ flex: 1, padding: "12px 14px", textAlign: "center" }}>
                  <div className="faint" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    Bidding closes in
                  </div>
                  <div style={{ fontSize: 20 }}>
                    <SpotlightTimer endsAt={endsAt} />
                  </div>
                </div>
                <div className="card" style={{ flex: 1, padding: "12px 14px", textAlign: "center" }}>
                  <div className="faint" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    Leading bid
                  </div>
                  {live.highBid > 0 ? (
                    <>
                      <Bucks amount={live.highBid} size={18} fontSize={18} style={{ justifyContent: "center", color: "var(--accent-text)" }} />
                      <div className="faint" style={{ fontSize: 11, marginTop: 2 }}>{live.highBidder ?? "—"}</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 18, fontWeight: 600 }}>no bids yet</div>
                  )}
                </div>
              </div>

              <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.55, margin: "0 0 16px" }}>
                Your bucks are <b style={{ color: "var(--text-primary)" }}>held, not spent</b> — if someone
                outbids you they come straight back. Only the winning bid is burned, and the winner is
                featured at the top of the stream for {7} days.
              </p>

              {flash && (
                <div className="card" style={{ padding: "10px 13px", marginBottom: 14, background: "var(--success-soft)", border: "1px solid var(--success-text)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Icons.check size={15} style={{ color: "var(--success-text)", flex: "none" }} />
                  <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{flash}</span>
                </div>
              )}

              {mine === null ? (
                <p className="faint" style={{ fontSize: 13 }}>Loading your ideas…</p>
              ) : mine.length === 0 ? (
                <div className="card" style={{ padding: 16, textAlign: "center", background: "var(--surface)" }}>
                  <p className="muted" style={{ fontSize: 13, margin: "0 0 12px" }}>
                    You need a public idea to bid. Publish one first.
                  </p>
                  <button className="btn btn-secondary" onClick={() => setOpen(false)}>Got it</button>
                </div>
              ) : !live.auctionOpen ? (
                <div className="card" style={{ padding: 16, textAlign: "center", background: "var(--surface)" }}>
                  <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                    Bidding is closed. The next auction opens as soon as this one settles.
                  </p>
                </div>
              ) : (
                <>
                  <SectionLabel style={{ marginBottom: 8 }}>Idea to feature</SectionLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                    {mine.map((l) => {
                      const active = sel === l.id;
                      return (
                        <button
                          key={l.id}
                          onClick={() => setSel(l.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "11px 13px",
                            borderRadius: 10,
                            textAlign: "left",
                            border: "1px solid " + (active ? "var(--accent)" : "var(--border-strong)"),
                            background: active ? "var(--accent-soft)" : "var(--surface-raised)",
                          }}
                        >
                          <span className="dot" style={{ width: 8, height: 8, background: active ? "var(--accent)" : "var(--border-strong)" }} />
                          <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{l.name}</span>
                          {active && <Icons.check size={15} style={{ color: "var(--accent-text)" }} />}
                        </button>
                      );
                    })}
                  </div>

                  <SectionLabel style={{ marginBottom: 8 }}>Your bid · must beat {live.minNextBid - 25}</SectionLabel>
                  <div style={{ textAlign: "center", padding: "4px 0 14px" }}>
                    <Bucks amount={amount} size={36} fontSize={34} style={{ justifyContent: "center" }} />
                    <div className="faint" style={{ fontSize: 12, marginTop: 5 }}>
                      of your {balance.toLocaleString()} available
                    </div>
                  </div>
                  <input
                    type="range"
                    min={live.minNextBid}
                    max={Math.max(live.minNextBid, balance)}
                    step={25}
                    value={amount}
                    onChange={(e) => setAmount(+e.target.value)}
                    className="bucks-range"
                    style={{ width: "100%" }}
                  />
                  {error && <p style={{ color: "var(--danger-text)", fontSize: 13, margin: "12px 0 0", textAlign: "center" }}>{error}</p>}
                  <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 18 }} disabled={!ok || busy} onClick={submit}>
                    <Icons.flame size={17} />{" "}
                    {busy ? "Bidding…" : ok ? `Bid ${amount}` : balance < live.minNextBid ? "Not enough bucks" : "Bid too low"}
                  </button>
                  <p className="faint" style={{ fontSize: 11, textAlign: "center", margin: "12px 0 0" }}>
                    Held in escrow · refunded in full the moment you&apos;re outbid.
                  </p>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
