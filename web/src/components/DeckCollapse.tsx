"use client";

import { useState, type ReactNode } from "react";
import { Icons } from "./icons";

/* Collapsible wrapper for the chat-card strip above a conversation — once
   you're deep in a chat the deck is context, not content, so it folds away.
   Cards stay server-rendered (passed as children).

   Collapsed, it has to still read as THE CHATS: a filled bar rather than a
   hairline, the chat you're in by name, and a pip per chat carrying its
   coverage — otherwise it looks like a section divider. */

export interface DeckPip {
  state: "done" | "part" | "none";
  here: boolean;
  label: string;
}

export default function DeckCollapse({
  count,
  summary,
  pips = [],
  here,
  children,
}: {
  count: number;
  summary?: string;
  pips?: DeckPip[];
  here?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ flex: "none", borderBottom: "1px solid var(--border)", padding: open ? "12px 0 0" : "9px 0" }}>
      <button
        className="deck-bar"
        data-open={open}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{ width: "calc(100% - 48px)" }}
      >
        <Icons.chat size={14} style={{ flex: "none", color: open ? "var(--text-muted)" : "var(--accent-text)" }} />
        {open ? (
          <span>ALL {count} CHATS</span>
        ) : (
          <span>
            {count} CHATS{here ? <> · YOU&apos;RE IN <span className="db-here">{here.toUpperCase()}</span></> : null}
          </span>
        )}
        {pips.length > 0 && (
          <span className="deck-pips">
            {pips.map((p, i) => (
              <span
                key={i}
                className={`deck-pip ${p.state === "done" ? "done" : p.state === "part" ? "part" : ""}${p.here ? " here" : ""}`}
                title={p.label}
              />
            ))}
          </span>
        )}
        <span className="db-act">
          {!open && summary && <span style={{ marginRight: 2 }}>{summary}</span>}
          <span>{open ? "HIDE" : "SHOW"}</span>
          {open ? <Icons.chevUp size={13} /> : <Icons.chevD size={13} />}
        </span>
      </button>
      {open && children}
    </div>
  );
}
