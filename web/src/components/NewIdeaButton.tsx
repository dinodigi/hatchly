"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* "+ New idea" — creates the record and drops straight into chat (no form).
   Gated on the API key, with v4's redirect-to-settings reason. */
export default function NewIdeaButton({ label = "New idea" }: { label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const create = async () => {
    // This button lives in the persistent TopNav, which does NOT unmount on a
    // soft navigation — so `busy` must always be reset, or a successful create
    // leaves it stuck reading "Creating…" until a hard refresh. (The guard stops
    // a double-click from firing two creates while the first is in flight.)
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/ideas", { method: "POST" });
      const json = await res.json();
      if (res.status === 422 && json.code === "E_NO_KEY") {
        router.push("/settings?reason=key");
        return;
      }
      if (!res.ok) throw new Error(json.error ?? "failed");
      router.push(`/ideas/${json.id}`);
    } catch {
      // Swallow — the button simply returns to its idle label so it can be retried.
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className="btn btn-primary" disabled={busy} onClick={create}>
      {busy ? "Creating…" : `+ ${label}`}
    </button>
  );
}
