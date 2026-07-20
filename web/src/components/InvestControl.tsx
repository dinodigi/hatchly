"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icons } from "./icons";
import { Coin } from "./ui";

/* "Back this idea" — v4's InvestModal (nav.jsx): slider, presets, coin display,
   serif-italic success. Wired to /api/invest. */

const PRESETS = [25, 50, 100, 250];

export default function InvestControl({
  listingId,
  listingName,
  variant = "lg",
}: {
  listingId: string;
  listingName: string;
  /** "lg" — full-width primary (idea page / spotlight). "soft" — v4 feed-card "Back" chip. */
  variant?: "lg" | "soft";
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [max, setMax] = useState(0);
  const [amount, setAmount] = useState(50);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ amount: number; tax: number; net: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/me")
      .then((r) => r.json())
      .then((j) => {
        setMax(j.balance ?? 0);
        setAmount((a) => Math.min(a, j.balance ?? 0));
      })
      .catch(() => {});
  }, [open]);

  const trigger = (onClick?: () => void) =>
    variant === "soft" ? (
      <button
        className="btn btn-soft btn-sm"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClick?.();
        }}
      >
        <Coin size={15} /> Back
      </button>
    ) : (
      <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: variant === "lg" ? 18 : 0 }} onClick={onClick}>
        <Coin size={18} /> Back this idea
      </button>
    );

  if (!isSignedIn) {
    return <SignInButton mode="modal">{trigger()}</SignInButton>;
  }

  const set = (v: number) => setAmount(Math.max(0, Math.min(max, v)));

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/invest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId, amount, requestKey: crypto.randomUUID() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "failed");
      setDone({ amount: json.amount, tax: json.tax, net: json.net });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {trigger(() => {
        setDone(null);
        setError(null);
        setOpen(true);
      })}

      {open && (
        <>
          <div className="scrim" onClick={() => setOpen(false)} />
          <div className="modal" style={{ width: 440, overflow: "visible" }}>
            <div style={{ padding: "24px 26px" }}>
              {!done ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18 }}>
                    <span className="avatar avatar-user" style={{ width: 40, height: 40, fontSize: 16 }}>
                      {listingName[0]}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>Back {listingName}</div>
                      <div className="faint" style={{ fontSize: 12.5 }}>bucks move from your wallet to the founder&apos;s</div>
                    </div>
                    <div style={{ flex: 1 }} />
                    <button className="iconbtn" onClick={() => setOpen(false)}><Icons.x size={18} /></button>
                  </div>
                  <div style={{ textAlign: "center", padding: "10px 0 18px" }}>
                    <span className="bucks" style={{ display: "inline-flex", alignItems: "center", gap: 12, fontWeight: 600, justifyContent: "center" }}>
                      <Coin size={40} />
                      <span style={{ fontSize: 40 }}>{amount.toLocaleString()}</span>
                    </span>
                    <div className="faint" style={{ fontSize: 12.5, marginTop: 6 }}>of your {max.toLocaleString()} available</div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(max, 1)}
                    step={5}
                    value={amount}
                    onChange={(e) => set(+e.target.value)}
                    className="bucks-range"
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    {PRESETS.map((p) => (
                      <button
                        key={p}
                        onClick={() => set(p)}
                        disabled={p > max}
                        style={{
                          flex: 1,
                          padding: "9px 0",
                          borderRadius: 9,
                          fontSize: 13,
                          fontWeight: 600,
                          border: "1px solid " + (amount === p ? "var(--accent)" : "var(--border-strong)"),
                          background: amount === p ? "var(--accent-soft)" : "var(--surface-raised)",
                          color: amount === p ? "var(--accent-text)" : "var(--text-primary)",
                          opacity: p > max ? 0.4 : 1,
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  {error && <p style={{ color: "var(--danger-text)", fontSize: 13, margin: "12px 0 0", textAlign: "center" }}>{error}</p>}
                  <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 18 }} disabled={busy || amount <= 0} onClick={confirm}>
                    <Coin size={18} /> {busy ? "Investing…" : `Invest ${amount} bucks`}
                  </button>
                  <p className="faint" style={{ fontSize: 11.5, textAlign: "center", margin: "12px 0 0" }}>
                    Play-money. Prestige, not equity — bucks are never real money.
                  </p>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "14px 6px 6px" }}>
                  <div style={{ position: "relative", width: 88, height: 88, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 74, height: 74, borderRadius: 999, background: "var(--success-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success-text)" }}>
                      <Icons.check size={38} />
                    </div>
                  </div>
                  <h2 className="serif" style={{ fontSize: 28, margin: "6px 0 6px", fontStyle: "italic", fontWeight: 400 }}>
                    You&apos;re in for {done.amount}
                  </h2>
                  <p className="muted" style={{ fontSize: 14, margin: "0 auto 20px", maxWidth: 300 }}>
                    You&apos;re now backing <b style={{ color: "var(--text-primary)" }}>{listingName}</b> —{" "}
                    {done.net} to the founder, {done.tax} burned as tax.
                  </p>
                  <button className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setOpen(false)}>
                    Back to the stream
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
