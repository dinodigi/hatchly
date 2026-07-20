"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* Hide a listing from the stream, or restore it. Reversible by design —
   moderation never deletes founder work. */
export default function ListingActions({
  listingId,
  name,
  hidden,
}: {
  listingId: string;
  name: string;
  hidden: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    const reason = window.prompt(
      hidden ? `Restore "${name}" to the stream — why?` : `Hide "${name}" from the stream — why?`,
    );
    if (reason === null) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/listing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId, hidden: !hidden, reason }),
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
    <button
      className="btn btn-ghost btn-sm"
      style={{ flex: "none", color: hidden ? "var(--success-text)" : "var(--danger-text)" }}
      disabled={busy}
      onClick={toggle}
    >
      {hidden ? "Restore" : "Hide"}
    </button>
  );
}
