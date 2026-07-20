"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Icons } from "./icons";

/* Community signal — v4's DemandVoter + notify button, wired to /api/signal. */
export default function DemandSignals({ listingId }: { listingId: string }) {
  const { isSignedIn } = useAuth();
  const [voted, setVoted] = useState<string | null>(null);
  const [notified, setNotified] = useState(false);
  const [busy, setBusy] = useState(false);

  const signal = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch("/api/signal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId, ...payload }),
      });
      return res.ok;
    } finally {
      setBusy(false);
    }
  };

  const vote = async (k: string) => {
    if (await signal({ wouldUse: k })) setVoted(k);
  };
  const notify = async () => {
    if (await signal({ notifyMe: true })) setNotified(true);
  };

  if (!isSignedIn) {
    return (
      <>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>Would you use this?</div>
        <SignInButton mode="modal">
          <button className="btn btn-secondary" style={{ width: "100%" }}>Sign in to add your signal</button>
        </SignInButton>
      </>
    );
  }

  return (
    <>
      <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>Would you use this?</div>
      {voted ? (
        <p className="faint" style={{ fontSize: 12.5, margin: "4px 0 0" }}>Thanks — your signal&apos;s counted.</p>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          {(
            [
              ["yes", "Yes, I'd use it"],
              ["maybe", "Maybe"],
              ["no", "Not for me"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              disabled={busy}
              onClick={() => vote(k)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 500,
                border: "1px solid var(--border-strong)",
                background: "var(--surface-raised)",
                color: "var(--text-primary)",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      )}
      <div style={{ height: 1, background: "var(--border)", margin: "18px 0" }} />
      <button
        onClick={notify}
        disabled={notified || busy}
        style={{
          width: "100%",
          padding: "11px 0",
          borderRadius: 10,
          fontSize: 13.5,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          border: "1px solid var(--border-strong)",
          background: notified ? "var(--success-soft)" : "var(--surface-raised)",
          color: notified ? "var(--success-text)" : "var(--text-primary)",
        }}
      >
        {notified ? (
          <>
            <Icons.check size={16} /> You&apos;ll be notified
          </>
        ) : (
          <>
            <Icons.bell size={16} /> Notify me if it launches
          </>
        )}
      </button>
    </>
  );
}
