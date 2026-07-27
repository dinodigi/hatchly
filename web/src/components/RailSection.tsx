"use client";

import { useState, type ReactNode } from "react";
import { Icons } from "./icons";

/* Collapsible right-rail section for the idea overview. As the brief and
   memory grow, the rail stays a scannable accordion instead of one endless
   scroll (smoke-test 74c1398e). Content stays server-rendered via children;
   `action` (e.g. an "Open →" link) stays clickable without toggling. */

export default function RailSection({
  title,
  hint,
  action,
  defaultOpen = true,
  children,
}: {
  title: ReactNode;
  /** small muted text shown when collapsed (e.g. "3/4 filled", "12 items") */
  hint?: string;
  action?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ padding: "14px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 7, color: "var(--text-primary)" }}>
            {title}
          </span>
          {!open && hint && <span className="faint" style={{ fontSize: 11.5 }}>{hint}</span>}
          <span style={{ flex: 1 }} />
          <span style={{ color: "var(--text-muted)", display: "flex" }}>
            {open ? <Icons.chevUp size={13} /> : <Icons.chevD size={13} />}
          </span>
        </button>
        {action}
      </div>
      {open && <div style={{ marginTop: 10 }}>{children}</div>}
    </div>
  );
}
