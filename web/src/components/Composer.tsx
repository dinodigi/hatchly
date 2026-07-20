"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icons } from "./icons";

/* Overview composer — v4's exact markup: borderless textarea inside a card,
   link/mic icon buttons, "Start chat" bottom-right. Starts a NEW chat. */
export default function Composer({ ideaId }: { ideaId: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    const message = draft.trim();
    if (!message || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ideaId, message }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.code === "E_NO_KEY" || json.code === "E_KEY_INVALID") {
          router.push("/settings?reason=key");
          return;
        }
        throw new Error(json.error ?? "failed");
      }
      router.push(`/ideas/${ideaId}?chat=${json.chatId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "something went wrong");
      setBusy(false);
    }
  };

  return (
    <div className="card composer" style={{ padding: "16px 18px" }}>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            start();
          }
        }}
        rows={2}
        disabled={busy}
        placeholder="Start a new chat — describe a piece of the idea, paste a link, or talk it through…"
        style={{ width: "100%", border: "none", background: "none", resize: "none", outline: "none", fontSize: 15, lineHeight: 1.55 }}
      />
      {error && <p style={{ color: "var(--danger-text)", fontSize: 13, margin: "6px 0 0" }}>{error}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <button className="iconbtn" title="Attach link (coming soon)"><Icons.link size={17} /></button>
        <button className="iconbtn" title="Record voice (coming soon)"><Icons.mic size={17} /></button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary btn-sm" disabled={busy || !draft.trim()} onClick={start}>
          <Icons.chat size={15} /> {busy ? "Starting…" : "Start chat"}
        </button>
      </div>
    </div>
  );
}
