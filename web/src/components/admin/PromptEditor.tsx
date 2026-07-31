"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* One chat template row in the Prompt Studio (BL-43/BL-46): collapsed summary,
   an edit form (name, subtitle, system prompt, initiation prompt, opening),
   and Pluggie-backed version history with restore. The question arc renders
   read-only until the structured editor lands (BL-44); the retired `questions`
   field is deliberately absent (BL-42). */

export interface PromptTemplate {
  key: string;
  name: string;
  subtitle?: string;
  icon?: string;
  role?: string;
  active?: boolean;
  system_prompt: string;
  initiation_prompt?: string;
  opening: string;
}

export interface ArcIntentRow {
  key: string;
  intent: string;
  required?: boolean;
  mode?: string;
}

interface Version {
  versionId: string;
  createdAt: string;
  actor: string;
  changedFields: string[];
}

const FIELD_META: { key: keyof PromptTemplate; label: string; rows: number; hint?: string }[] = [
  { key: "name", label: "Name", rows: 1 },
  { key: "subtitle", label: "Subtitle", rows: 1 },
  { key: "system_prompt", label: "System prompt", rows: 7, hint: "The chat's job. Global voice, formatting, chip rules and the arc mechanism live in code — don't restate them here." },
  { key: "initiation_prompt", label: "Initiation prompt", rows: 3, hint: "Sent on the founder's behalf when the chat first opens. Empty = the chat waits, showing the opening line instead." },
  { key: "opening", label: "Opening line", rows: 2, hint: "Fallback greeting — only shown when there's no initiation prompt (today: refine)." },
];

export default function PromptEditor({ id, tpl, arc }: { id: string; tpl: PromptTemplate; arc: ArcIntentRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<Version[] | "loading" | "error" | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const value = (k: keyof PromptTemplate) => form[k] ?? String(tpl[k] ?? "");
  const dirty = FIELD_META.some((f) => form[f.key] !== undefined && form[f.key] !== String(tpl[f.key] ?? ""));
  const requiredArc = arc.filter((a) => a.required).length;

  const openEdit = () => {
    setEditing((v) => !v);
    setNote(null);
  };

  const save = async () => {
    if (busy || !dirty) return;
    setBusy(true);
    setNote(null);
    const patch: Record<string, string> = {};
    for (const f of FIELD_META) {
      if (form[f.key] !== undefined && form[f.key] !== String(tpl[f.key] ?? "")) patch[f.key] = form[f.key];
    }
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, patch }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNote({ tone: "err", text: json.error ?? "save failed" });
        return;
      }
      setNote({ tone: "ok", text: "Saved — applies from the next chat opened. Chats already in progress keep their prompt." });
      setForm({});
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const loadHistory = async () => {
    setShowHistory((v) => !v);
    if (versions !== null) return;
    setVersions("loading");
    const res = await fetch(`/api/admin/prompts?id=${encodeURIComponent(id)}`).catch(() => null);
    const json = res ? await res.json().catch(() => null) : null;
    setVersions(res?.ok && json?.versions ? (json.versions as Version[]) : "error");
  };

  const restore = async (v: Version) => {
    if (busy) return;
    if (!window.confirm(`Restore "${tpl.name}" to the version from ${when(v.createdAt)}? The current prompt becomes a new version.`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, restore: v.versionId }),
      });
      if (res.ok) {
        setVersions(null);
        setShowHistory(false);
        setForm({});
        setNote({ tone: "ok", text: "Restored — applies from the next chat opened." });
        router.refresh();
      } else {
        setNote({ tone: "err", text: "restore failed" });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      {/* ---- summary row ---- */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px" }}>
        <span style={{ fontSize: 16, width: 22, textAlign: "center", flex: "none" }}>{tpl.icon ?? "▸"}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{tpl.name}</span>
            <span className="mono faint" style={{ fontSize: 11 }}>{tpl.key}</span>
            {tpl.active === false && (
              <span className="badge" style={{ fontSize: 9, background: "var(--surface)", color: "var(--text-muted)" }}>inactive</span>
            )}
          </div>
          {tpl.subtitle && <div className="faint" style={{ fontSize: 11.5, marginTop: 2 }}>{tpl.subtitle}</div>}
        </div>
        <span className="faint" style={{ fontSize: 11.5, flex: "none" }}>
          {arc.length ? `${arc.length} intents · ${requiredArc} required` : "no arc"}
        </span>
        <button className="btn btn-secondary btn-sm" onClick={openEdit}>{editing ? "Close" : "Edit"}</button>
        <button className="btn btn-ghost btn-sm" onClick={() => void loadHistory()}>History</button>
      </div>

      {note && (
        <p style={{ margin: "0 18px 10px", fontSize: 12, color: note.tone === "ok" ? "var(--success-text)" : "var(--danger-text)" }}>{note.text}</p>
      )}

      {/* ---- edit form ---- */}
      {editing && (
        <div className="col gap10" style={{ padding: "2px 18px 16px" }}>
          {FIELD_META.map((f) => (
            <label key={f.key} className="col gap4" style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 600 }}>{f.label}</span>
              {f.rows === 1 ? (
                <input className="field" value={value(f.key)} disabled={busy}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} style={{ fontSize: 13 }} />
              ) : (
                <textarea className="field" rows={f.rows} value={value(f.key)} disabled={busy}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                  style={{ fontSize: 13, lineHeight: 1.5, resize: "vertical" }} />
              )}
              {f.hint && <span className="faint" style={{ fontSize: 11 }}>{f.hint}</span>}
            </label>
          ))}

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Question arc</div>
            {arc.length === 0 && <p className="faint" style={{ margin: 0, fontSize: 12, fontStyle: "italic" }}>This chat has no arc.</p>}
            {arc.map((a) => (
              <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 12.5 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--accent-text)", width: 110, flex: "none" }}>{a.key}</span>
                <span style={{ flex: 1 }}>{a.intent}</span>
                {a.required && <span className="badge" style={{ fontSize: 9, background: "var(--accent-soft)", color: "var(--accent-text)" }}>required</span>}
                <span className="faint" style={{ fontSize: 10.5 }}>{a.mode ?? "singular"}</span>
              </div>
            ))}
            <p className="faint" style={{ margin: "6px 0 0", fontSize: 11 }}>
              Read-only for now — the structured arc editor is coming. Intent keys are stable identifiers: add and deprecate, never rename.
            </p>
          </div>

          <div className="row gap6">
            <button className="btn btn-primary btn-sm" disabled={busy || !dirty} onClick={() => void save()}>Save</button>
            <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => { setForm({}); setEditing(false); setNote(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ---- history ---- */}
      {showHistory && (
        <div style={{ padding: "0 18px 14px" }}>
          {versions === "loading" && <p className="faint" style={{ margin: 0, fontSize: 12, fontStyle: "italic" }}>Loading versions…</p>}
          {versions === "error" && <p style={{ margin: 0, fontSize: 12, color: "var(--danger-text)" }}>Couldn&apos;t load versions.</p>}
          {Array.isArray(versions) && versions.length === 0 && (
            <p className="faint" style={{ margin: 0, fontSize: 12, fontStyle: "italic" }}>No stored versions yet — versions appear after the first edit.</p>
          )}
          {Array.isArray(versions) &&
            versions.map((v) => (
              <div key={v.versionId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid var(--border)", fontSize: 12 }}>
                <span style={{ width: 150, flex: "none" }}>{when(v.createdAt)}</span>
                <span className="faint" style={{ width: 70, flex: "none" }}>{v.actor}</span>
                <span className="mono faint" style={{ flex: 1, fontSize: 11 }}>{v.changedFields.join(", ") || "—"}</span>
                <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => void restore(v)}>Restore</button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function when(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
