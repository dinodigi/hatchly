"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Icons } from "./icons";

/* "Feedback for the founder" — v4's FeedbackBox, wired. */
export default function FeedbackBox({ listingId, founderFirstName }: { listingId: string; founderFirstName: string }) {
  const { isSignedIn } = useAuth();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId, text: t }),
      });
      if (res.ok) {
        setText("");
        setSent(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <Icons.chat size={17} style={{ color: "var(--accent-text)" }} />
        <h2 style={{ fontSize: 18, margin: 0, letterSpacing: "-0.01em" }}>Feedback for the founder</h2>
      </div>
      <div className="card" style={{ padding: 18 }}>
        {sent ? (
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "6px 2px" }}>
            <span style={{ width: 34, height: 34, borderRadius: 999, background: "var(--success-soft)", color: "var(--success-text)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <Icons.check size={18} />
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Sent to {founderFirstName}</div>
              <div className="faint" style={{ fontSize: 12.5 }}>
                It shows up on their idea dashboard.{" "}
                <button onClick={() => setSent(false)} className="link-btn">Leave more</button>
              </div>
            </div>
          </div>
        ) : !isSignedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="muted" style={{ fontSize: 13.5, flex: 1 }}>
              What would make this better? Be honest — it goes straight to the founder.
            </span>
            <SignInButton mode="modal">
              <button className="btn btn-secondary btn-sm">Sign in to send</button>
            </SignInButton>
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="What would make this better? What would make you use it? Be honest — it goes straight to the founder."
              className="edit-area"
              style={{ width: "100%", fontSize: 14, lineHeight: 1.55, marginBottom: 12 }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="spacer" />
              <button className="btn btn-primary btn-sm" disabled={busy || !text.trim()} onClick={send}>
                <Icons.send size={14} /> Send feedback
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
