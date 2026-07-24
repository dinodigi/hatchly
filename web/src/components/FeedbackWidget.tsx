"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

/* Floating feedback widget — the review team leaves notes without logging in;
   they land on the shareholder_feedback board in the Pluggie admin, stamped with
   the screen they came from. */

export default function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const m = message.trim();
    if (!m || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/shareholder-feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: m, name: name.trim(), screen: pathname }),
      });
      if (res.ok) setSent(true);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setOpen(false);
    setSent(false);
    setMessage("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Send feedback"
        style={{
          position: "fixed", right: 18, bottom: 18, zIndex: 60,
          display: "flex", alignItems: "center", gap: 7,
          padding: "10px 15px", borderRadius: 999, border: "none",
          background: "var(--text-primary)", color: "var(--background)",
          fontSize: 13, fontWeight: 500, boxShadow: "var(--shadow-lift)", cursor: "pointer",
        }}
      >
        ✎ Feedback
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Feedback"
          style={{
            position: "fixed", right: 18, bottom: 68, zIndex: 60, width: 300,
            background: "var(--surface-raised)", border: "1px solid var(--border-strong)",
            borderRadius: 14, boxShadow: "var(--shadow-modal)", padding: 16,
          }}
        >
          {sent ? (
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Thanks — noted.</div>
              <p className="muted" style={{ fontSize: 12.5, margin: "0 0 12px", lineHeight: 1.5 }}>
                It landed on the feedback board.
              </p>
              <button className="btn btn-secondary btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={reset}>
                Done
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Leave feedback</div>
              <p className="faint" style={{ fontSize: 12, margin: "2px 0 10px" }}>On this screen, the flow, anything.</p>
              <textarea
                className="field"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                maxLength={2000}
                rows={3}
                style={{ resize: "vertical", marginBottom: 8, fontSize: 13 }}
              />
              <input
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                maxLength={120}
                style={{ marginBottom: 10, fontSize: 13 }}
              />
              <button
                className="btn btn-primary btn-sm"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={busy || !message.trim()}
                onClick={send}
              >
                {busy ? "Sending…" : "Send feedback"}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
