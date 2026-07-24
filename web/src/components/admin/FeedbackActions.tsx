"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* Triage controls for a shareholder feedback item — move it through the
   workflow (new → in progress → actioned / won't fix, or reopen) and record a
   short retrospect on what was changed. Refreshes the list after each write. */
export default function FeedbackActions({
  id,
  status,
  response,
}: {
  id: string;
  status: string;
  response: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(response);

  const patch = async (body: { status?: string; response?: string }) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 260, flex: "none" }}>
        <textarea
          className="field"
          autoFocus
          rows={3}
          placeholder="What was changed / why not…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{ fontSize: 12.5, resize: "vertical" }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => patch({ response: draft, status: "actioned" })}>
            Save &amp; action
          </button>
          <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => patch({ response: draft })}>
            Save note
          </button>
          <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => { setDraft(response); setEditing(false); }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6, flex: "none", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 240 }}>
      {status === "new" && (
        <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => patch({ status: "in_progress" })}>
          Working on it
        </button>
      )}
      <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => setEditing(true)}>
        {response ? "Edit retrospect" : "Retrospect"}
      </button>
      {status !== "actioned" && (
        <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => patch({ status: "actioned" })}>
          Actioned
        </button>
      )}
      {status !== "wontfix" && status !== "actioned" && (
        <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => patch({ status: "wontfix" })}>
          Won&apos;t fix
        </button>
      )}
      {(status === "actioned" || status === "wontfix") && (
        <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => patch({ status: "new" })}>
          Reopen
        </button>
      )}
    </div>
  );
}
