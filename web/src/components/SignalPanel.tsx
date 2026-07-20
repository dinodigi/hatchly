"use client";

import { useState, type ReactNode } from "react";
import { Icons } from "./icons";

/* Collapsible wrapper for the signal map. Empty, it stays a single quiet line —
   the rail shouldn't show ten rows of empty dots on a brand-new idea. Once there's
   signal it defaults open, and can be toggled either way.

   The map itself is passed as `children` so it stays server-rendered — SignalMap
   imports from the server-only agent module and must not cross the client boundary. */

export default function SignalPanel({ hasSignal, children }: { hasSignal: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(hasSignal);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "transparent",
          border: "none",
          padding: 0,
          marginBottom: open && hasSignal ? 11 : 0,
        }}
      >
        <span style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 500 }}>
          Signal map
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
          {!hasSignal && "no signal yet"}
          {open ? <Icons.chevUp size={13} /> : <Icons.chevD size={13} />}
        </span>
      </button>
      {open && (hasSignal ? (
        children
      ) : (
        <p className="faint" style={{ fontSize: 11.5, margin: "9px 0 0", fontStyle: "italic" }}>
          Appears as the idea gathers thinking across topics.
        </p>
      ))}
    </div>
  );
}
