"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Icons } from "./icons";

/* The user-facing half of moderation — v4 has no such affordance, so this is
   new surface designed to match it: a quiet ghost control, never a shout. */

const REASONS = [
  ["spam", "Spam or promotion"],
  ["abuse", "Abusive or hateful"],
  ["impersonation", "Impersonation"],
  ["collusion", "Vote / buck manipulation"],
  ["other", "Something else"],
] as const;

export default function ReportButton({
  targetKind,
  targetId,
  label = "Report",
}: {
  targetKind: "listing" | "quick_idea" | "comment" | "feedback" | "user";
  targetId: string;
  label?: string;
}) {
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("spam");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trigger = (
    <button className="btn btn-ghost btn-sm" style={{ color: "var(--text-muted)" }}>
      <Icons.flag size={14} /> {label}
    </button>
  );

  if (!isSignedIn) return <SignInButton mode="modal">{trigger}</SignInButton>;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetKind, targetId, reason, detail }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "failed");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <span
        onClick={() => {
          setDone(false);
          setError(null);
          setOpen(true);
        }}
      >
        {trigger}
      </span>

      {open && (
        <>
          <div className="scrim" onClick={() => setOpen(false)} />
          <div className="modal" style={{ width: 420 }}>
            <div style={{ padding: "22px 26px" }}>
              {done ? (
                <div style={{ textAlign: "center", padding: "10px 4px 4px" }}>
                  <div style={{ width: 60, height: 60, borderRadius: 999, background: "var(--success-soft)", color: "var(--success-text)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <Icons.check size={28} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Thanks — we&apos;ll take a look</div>
                  <p className="muted" style={{ fontSize: 13.5, margin: "0 0 18px" }}>
                    A moderator reviews every report. You won&apos;t hear back on the outcome, but it does get read.
                  </p>
                  <button className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setOpen(false)}>Done</button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
                    <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--danger-soft)", color: "var(--danger-text)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                      <Icons.flag size={17} />
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15.5 }}>Report this {targetKind.replace("_", " ")}</div>
                      <div className="faint" style={{ fontSize: 12.5 }}>Reports are private and never shown to the author.</div>
                    </div>
                    <button className="iconbtn" onClick={() => setOpen(false)}><Icons.x size={18} /></button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                    {REASONS.map(([k, text]) => {
                      const active = reason === k;
                      return (
                        <button
                          key={k}
                          onClick={() => setReason(k)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 12px",
                            borderRadius: 9,
                            textAlign: "left",
                            fontSize: 13.5,
                            border: "1px solid " + (active ? "var(--accent)" : "var(--border-strong)"),
                            background: active ? "var(--accent-soft)" : "var(--surface-raised)",
                            color: "var(--text-primary)",
                          }}
                        >
                          <span className="dot" style={{ width: 8, height: 8, background: active ? "var(--accent)" : "var(--border-strong)" }} />
                          {text}
                        </button>
                      );
                    })}
                  </div>

                  <textarea
                    className="field"
                    placeholder="Anything that would help a moderator (optional)"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value.slice(0, 1000))}
                    rows={3}
                    style={{ resize: "vertical", marginBottom: 12 }}
                  />
                  {error && <p style={{ color: "var(--danger-text)", fontSize: 13, margin: "0 0 10px" }}>{error}</p>}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setOpen(false)}>Cancel</button>
                    <button className="btn btn-primary" style={{ flex: 2 }} disabled={busy} onClick={submit}>
                      {busy ? "Sending…" : "Send report"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
