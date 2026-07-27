"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icons } from "./icons";

/* Archive / restore an idea from the dashboard. Reversible — the idea is only
   hidden from the default list, never deleted. Lives inside the card's <Link>,
   so clicks must not navigate. */
export default function ArchiveIdeaButton({
  ideaId,
  archived,
}: {
  ideaId: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/ideas/archive", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: ideaId, archived: !archived }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      className="btn btn-ghost btn-sm"
      disabled={busy}
      onClick={toggle}
      title={archived ? "Restore this idea" : "Archive this idea"}
      style={{ flex: "none", padding: "3px 8px", fontSize: 11.5 }}
    >
      {archived ? (
        <>
          <Icons.back size={13} /> Restore
        </>
      ) : (
        <>
          <Icons.trash size={13} /> Archive
        </>
      )}
    </button>
  );
}
