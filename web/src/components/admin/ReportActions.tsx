"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* Resolve or dismiss a report. Both write an audit row server-side. */
export default function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const act = async (outcome: "actioned" | "dismissed") => {
    const note = window.prompt(
      outcome === "actioned" ? "What did you do about it?" : "Why is this being dismissed?",
    );
    if (note === null) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reportId, outcome, note }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        window.alert(j.error ?? "Failed");
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <span style={{ display: "flex", gap: 6, flex: "none" }}>
      <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => act("dismissed")}>
        Dismiss
      </button>
      <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => act("actioned")}>
        Action
      </button>
    </span>
  );
}
