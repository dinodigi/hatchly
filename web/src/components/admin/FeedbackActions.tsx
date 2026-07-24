"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* Triage buttons for a shareholder feedback item — mark reviewed / actioned,
   or reopen. Refreshes the list server-side after each change. */
export default function FeedbackActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const set = async (next: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 6, flex: "none" }}>
      {status === "new" && (
        <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => set("reviewed")}>
          Reviewed
        </button>
      )}
      {status !== "actioned" && (
        <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => set("actioned")}>
          Actioned
        </button>
      )}
      {status === "actioned" && (
        <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => set("new")}>
          Reopen
        </button>
      )}
    </div>
  );
}
