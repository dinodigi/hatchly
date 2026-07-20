"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icons } from "./icons";

/* Row of actions on an open artifact: show it publicly, redraft it, delete it.
   Redraft is destructive in a quiet way — it replaces a document the founder
   may have edited — so it confirms first. */

export default function ArtifactActions({
  id,
  ideaId,
  title,
  onPublicPage,
}: {
  id: string;
  ideaId: string;
  title: string;
  onPublicPage: boolean;
}) {
  const router = useRouter();
  const [pub, setPub] = useState(onPublicPage);
  const [busy, setBusy] = useState<null | "public" | "redraft" | "delete">(null);
  const [error, setError] = useState<string | null>(null);

  const togglePublic = async () => {
    setBusy("public");
    setError(null);
    const next = !pub;
    setPub(next); // optimistic — a toggle should feel instant
    try {
      const res = await fetch("/api/artifacts", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, onPublicPage: next }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "failed");
      router.refresh();
    } catch (e) {
      setPub(!next);
      setError(e instanceof Error ? e.message : "could not save");
    } finally {
      setBusy(null);
    }
  };

  const redraft = async () => {
    if (!window.confirm(`Redraft "${title}"? This replaces the current version, including any edits.`))
      return;
    setBusy("redraft");
    setError(null);
    try {
      // Delete then regenerate: the API keeps one artifact per type per idea,
      // so the old one must go first.
      const del = await fetch(`/api/artifacts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!del.ok) throw new Error((await del.json().catch(() => ({}))).error ?? "could not replace it");

      const type = await fetch(`/api/artifacts?ideaId=${encodeURIComponent(ideaId)}`)
        .then((r) => r.json())
        .then((j) => (j.types ?? []).find((t: { title: string }) => t.title === title)?.key);
      if (!type) throw new Error("unknown artifact type");

      const res = await fetch("/api/artifacts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ideaId, type }),
      });
      const json = await res.json();
      if (res.status === 422 && json.code === "E_NO_KEY") {
        router.push("/settings?reason=key");
        return;
      }
      if (!res.ok) throw new Error(json.error ?? "redraft failed");
      router.replace(`/ideas/${ideaId}?tab=artifacts&doc=${json.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "something went wrong");
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${title}"? You can generate it again later.`)) return;
    setBusy("delete");
    setError(null);
    try {
      const res = await fetch(`/api/artifacts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "failed");
      router.replace(`/ideas/${ideaId}?tab=artifacts`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "could not delete");
      setBusy(null);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <button
        className={pub ? "btn btn-soft btn-sm" : "btn btn-secondary btn-sm"}
        disabled={!!busy}
        onClick={togglePublic}
      >
        <Icons.globe size={14} /> {pub ? "On your public page" : "Show on public page"}
      </button>
      <button className="btn btn-ghost btn-sm" disabled={!!busy} onClick={redraft}>
        <Icons.sparkle size={14} /> {busy === "redraft" ? "Redrafting…" : "Redraft"}
      </button>
      <span style={{ flex: 1 }} />
      <button
        className="btn btn-ghost btn-sm"
        style={{ color: "var(--danger-text)" }}
        disabled={!!busy}
        onClick={remove}
      >
        <Icons.trash size={14} /> Delete
      </button>
      {error && (
        <span style={{ color: "var(--danger-text)", fontSize: 12.5, width: "100%" }}>{error}</span>
      )}
    </div>
  );
}
