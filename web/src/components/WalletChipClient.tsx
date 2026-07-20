"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* Client half of the wallet chip: shows balance + streak, and a claim
   affordance when today's reward hasn't been taken. */
export default function WalletChipClient({
  balance,
  streak,
  claimable,
}: {
  balance: number;
  streak: number;
  claimable: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);

  const claim = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/claim", { method: "POST" });
      const json = await res.json();
      if (json.claimed) {
        setJustClaimed(true);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="row gap6">
      <a href="/wallet" className="pill pill-accent row gap6" title={`Streak: ${streak} days — open wallet`}>
        <span aria-hidden>🪙</span>
        <span className="mono" style={{ fontWeight: 600 }}>{balance.toLocaleString("en-US")}</span>
        {streak > 1 && <span style={{ fontSize: 10.5 }}>{streak}🔥</span>}
      </a>
      {claimable && !justClaimed && (
        <button className="btn btn-soft btn-sm" disabled={busy} onClick={claim} title="Claim today's 100 bucks">
          {busy ? "…" : "+100"}
        </button>
      )}
    </span>
  );
}
