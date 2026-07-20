"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icons } from "./icons";
import { Coin } from "./ui";

/* The gold balance chip + claim affordance + ClaimModal — nav.jsx, wired. */

function GoldBurst({ fire }: { fire: number }) {
  if (!fire) return null;
  const parts = Array.from({ length: 14 });
  return (
    <span key={fire} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
      {parts.map((_, i) => {
        const ang = (i / parts.length) * Math.PI * 2 + (fire % 6) * 0.3;
        const dist = 34 + (i % 4) * 14;
        return (
          <span
            key={i}
            className="goldp"
            style={{
              left: "50%",
              top: "50%",
              // @ts-expect-error css custom props
              "--dx": `${Math.cos(ang) * dist}px`,
              "--dy": `${Math.sin(ang) * dist - 18}px`,
              animationDelay: `${(i % 5) * 18}ms`,
            }}
          />
        );
      })}
    </span>
  );
}

export default function BucksChip({
  balance,
  streak,
  claimable,
  dailyClaim = 100,
}: {
  balance: number;
  streak: number;
  claimable: boolean;
  dailyClaim?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [shown, setShown] = useState(balance);
  const [burst, setBurst] = useState(0);
  const [busy, setBusy] = useState(false);

  const claim = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/claim", { method: "POST" });
      const json = await res.json();
      if (json.claimed) {
        setShown(json.balance);
        setDone(true);
        setBurst((b) => b + 1);
        router.refresh();
      } else {
        setDone(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Link
        href="/wallet"
        title="Open wallet"
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px 6px 9px",
          borderRadius: 999,
          background: "var(--accent-soft)",
          border: "1px solid color-mix(in srgb, var(--accent) 28%, transparent)",
        }}
      >
        <GoldBurst fire={burst} />
        <Coin size={19} />
        <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-text)" }}>
          {shown.toLocaleString()}
        </span>
      </Link>
      {claimable && !done ? (
        <button onClick={() => setOpen(true)} className="claim-btn" style={{ background: "var(--accent)" }}>
          +{dailyClaim} today
        </button>
      ) : (
        <span className="faint" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 4 }}>
          <Icons.check size={13} /> claimed
        </span>
      )}

      {open && (
        <>
          <div className="scrim" onClick={() => setOpen(false)} />
          <div className="modal" style={{ width: 400, padding: "34px 32px", textAlign: "center" }}>
            <div style={{ position: "relative", width: 84, height: 84, margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GoldBurst fire={done ? 1 : 0} />
              <div style={{ width: 72, height: 72, borderRadius: 999, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Coin size={46} />
              </div>
            </div>
            <h2 className="serif" style={{ fontSize: 30, margin: "10px 0 6px", fontStyle: "italic", fontWeight: 400 }}>
              Your daily {dailyClaim}
            </h2>
            <p className="muted" style={{ fontSize: 14, margin: "0 auto 20px", maxWidth: 280 }}>
              {done
                ? "Banked. Go back a winner — your early bets are what build a track record."
                : `Claim ${dailyClaim} Hatchly Bucks. Spend them backing public ideas you believe in.`}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 22 }}>
              <div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 600 }}>{(done ? streak + 1 : streak) || 1}🔥</div>
                <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Day streak</div>
              </div>
              <div style={{ width: 1, background: "var(--border)" }} />
              <div>
                <span className="bucks" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600 }}>
                  <Coin size={22} />
                  <span style={{ fontSize: 19 }}>{shown.toLocaleString()}</span>
                </span>
                <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>Balance</div>
              </div>
            </div>
            {done ? (
              <button className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setOpen(false)}>Done</button>
            ) : (
              <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy} onClick={claim}>
                <Coin size={17} /> Claim {dailyClaim} bucks
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
