"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icons } from "./icons";

/* BYOK key entry — v4's Settings key card (nav.jsx). Plaintext leaves the
   browser once, over HTTPS, straight into the server-side vault. */
export default function KeyManager({
  initialConnected,
  initialMasked,
}: {
  initialConnected: boolean;
  initialMasked: string | null;
}) {
  const router = useRouter();
  const [connected, setConnected] = useState(initialConnected);
  const [masked, setMasked] = useState(initialMasked);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/key", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: value }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "failed");
      setConnected(true);
      setMasked(json.masked);
      setValue("");
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await fetch("/api/key", { method: "DELETE" });
      setConnected(false);
      setMasked(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Anthropic API key</span>
        {connected ? (
          <span className="badge b-launch" style={{ fontSize: 9.5 }}><Icons.check size={11} /> Connected</span>
        ) : (
          <span className="badge" style={{ fontSize: 9.5, background: "var(--danger-soft)", color: "var(--danger-text)" }}>Not set</span>
        )}
      </div>
      <p className="faint" style={{ fontSize: 12.5, margin: "0 0 14px", lineHeight: 1.5 }}>
        Your key is encrypted server-side and runs the chat that shapes your ideas. You need one
        before creating an idea.
      </p>
      {connected && masked && (
        <div className="mono" style={{ fontSize: 12.5, color: "var(--text-secondary)", padding: "8px 12px", background: "var(--surface)", borderRadius: 8, marginBottom: 12 }}>
          {masked}
        </div>
      )}
      <label className="label">{connected ? "Replace key" : "Paste your key"}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="field mono"
          type="password"
          placeholder="sk-ant-…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" disabled={busy || !value.trim()} onClick={save}>
          {busy ? "Verifying…" : saved ? "Saved" : "Save key"}
        </button>
      </div>
      {error && <p style={{ color: "var(--danger-text)", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
      {connected && (
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12, color: "var(--danger-text)" }} disabled={busy} onClick={remove}>
          <Icons.trash size={14} /> Remove key
        </button>
      )}
      <p className="faint" style={{ fontSize: 12, margin: "10px 0 0" }}>
        console.anthropic.com → API keys
      </p>
    </div>
  );
}
