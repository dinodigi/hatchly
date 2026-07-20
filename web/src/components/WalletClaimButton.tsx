"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* v4's .claim-btn on the wallet balance card. */
export default function WalletClaimButton({ amount }: { amount: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="claim-btn"
      style={{ alignSelf: "flex-start" }}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/claim", { method: "POST" });
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Claiming…" : `Claim +${amount} today`}
    </button>
  );
}
