"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* "+ New idea" — creates the record and drops straight into chat (no form).
   Gated on the API key, with v4's redirect-to-settings reason. */
export default function NewIdeaButton({ label = "New idea" }: { label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const create = async () => {
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
      setBusy(false);
    }
  };

  return (
    <button className="btn btn-primary" disabled={busy} onClick={create}>
      {busy ? "Creating…" : `+ ${label}`}
    </button>
  );
}
