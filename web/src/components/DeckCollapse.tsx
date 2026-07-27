"use client";

import { useState, type ReactNode } from "react";
import { Icons } from "./icons";

/* Collapsible wrapper for the chat-card strip above a conversation — once
   you're deep in a chat the deck is context, not content, so it folds to a
   single slim bar. Cards stay server-rendered (passed as children). */

export default function DeckCollapse({ count, summary, children }: { count: number; summary?: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ flex: "none", borderBottom: "1px solid var(--border)", paddingTop: open ? 14 : 0 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: open ? "0 24px 10px" : "9px 24px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 10, letterSpacing: "0.11em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
          Chats · {count}
        </span>
        {!open && summary && (
          <span className="faint" style={{ fontSize: 11.5 }}>{summary}</span>
        )}
        <span style={{ flex: 1 }} />
        <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
          {open ? <Icons.chevUp size={14} /> : <Icons.chevD size={14} />}
        </span>
      </button>
      {open && children}
    </div>
  );
}
