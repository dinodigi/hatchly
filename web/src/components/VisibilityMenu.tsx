"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* Header visibility dropdown — v4's VisibilityMenu. */

const VIS = [
  { key: "private", label: "Private", icon: "🔒", desc: "Only you can see this." },
  { key: "link", label: "Link-only", icon: "🔗", desc: "Anyone with the link can view." },
  { key: "public", label: "Public", icon: "🌐", desc: "On the stream — discoverable and backable." },
] as const;

export default function VisibilityMenu({
  ideaId,
  visibility,
}: {
  ideaId: string;
  visibility: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const current = VIS.find((v) => v.key === visibility) ?? VIS[0];

  const set = async (key: string) => {
    if (key === visibility) {
      setOpen(false);
      return;
    }
    setBusy(true);
    try {
      await fetch("/api/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ideaId, visibility: key }),
      });
      router.refresh();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button className="btn btn-secondary btn-sm" onClick={() => setOpen(!open)} disabled={busy}>
        {current.icon} {current.label} ▾
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 60 }} onClick={() => setOpen(false)} />
          <div
            className="card col"
            style={{ position: "absolute", right: 0, top: "110%", width: 260, zIndex: 61, padding: 6, boxShadow: "var(--shadow-lift)" }}
          >
            {VIS.map((v) => (
              <button
                key={v.key}
                onClick={() => set(v.key)}
                className="col gap2"
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 9,
                  border: "none",
                  background: v.key === visibility ? "var(--accent-softer)" : "transparent",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {v.icon} {v.label} {v.key === visibility ? "✓" : ""}
                </span>
                <span className="faint" style={{ fontSize: 11.5 }}>{v.desc}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
