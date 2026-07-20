"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icons } from "./icons";

/* v4's ArtifactPicker (idea-tabs.jsx): a two-column library of documents the
   agent can draft. Types you already have are disabled, not hidden — seeing
   what you've covered is the point. */

interface TypeRow {
  key: string;
  title: string;
  desc: string;
  have: boolean;
}

export default function ArtifactPicker({
  ideaId,
  trigger = "button",
}: {
  ideaId: string;
  /** "button" — the toolbar action. "card" — the dashed tile at the end of the grid. */
  trigger?: "button" | "card";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [types, setTypes] = useState<TypeRow[] | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [thin, setThin] = useState<{ title: string; reason?: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    fetch(`/api/artifacts?ideaId=${encodeURIComponent(ideaId)}`)
      .then((r) => r.json())
      .then((j) => setTypes(j.types ?? []))
      .catch(() => setTypes([]));
  }, [open, ideaId]);

  const pick = async (t: TypeRow) => {
    if (t.have || busyKey) return;
    setBusyKey(t.key);
    setError(null);
    try {
      const res = await fetch("/api/artifacts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ideaId, type: t.key }),
      });
      const json = await res.json();
      if (res.status === 422 && json.code === "E_NO_KEY") {
        router.push("/settings?reason=key");
        return;
      }
      if (!res.ok) throw new Error(json.error ?? "could not draft it");

      setTypes((prev) => prev?.map((x) => (x.key === t.key ? { ...x, have: true } : x)) ?? null);
      router.refresh();

      // A thin draft is worth saying out loud — otherwise the founder reads a
      // half-empty document and assumes the agent is bad, not that the idea
      // hasn't been talked through yet.
      if (json.thin) setThin({ title: t.title, reason: json.thinReason });
      else setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "something went wrong");
    } finally {
      setBusyKey(null);
    }
  };

  const openIt = () => {
    setThin(null);
    setError(null);
    setOpen(true);
  };

  return (
    <>
      {trigger === "button" ? (
        <button className="btn btn-secondary btn-sm" onClick={openIt}>
          <Icons.sparkle size={15} /> Generate artifact
        </button>
      ) : (
        <button
          onClick={openIt}
          className="card"
          style={{
            padding: 18,
            borderStyle: "dashed",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 6,
            background: "transparent",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 600, fontSize: 13.5, color: "var(--text-secondary)" }}>
            <Icons.sparkle size={15} style={{ color: "var(--accent-text)" }} /> Generate an artifact
          </span>
          <p className="faint" style={{ fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>
            Pick from the library — scope, pricing, positioning, landing copy and more.
          </p>
        </button>
      )}

      {open && (
        <>
          <div className="scrim" onClick={() => !busyKey && setOpen(false)} />
          <div className="modal" style={{ width: 560, maxHeight: "82vh" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icons.sparkle size={17} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>Generate an artifact</div>
                <div className="faint" style={{ fontSize: 12.5 }}>
                  Drafted from what you&apos;ve actually said — never invented.
                </div>
              </div>
              <button className="iconbtn" disabled={!!busyKey} onClick={() => setOpen(false)}>
                <Icons.x size={18} />
              </button>
            </div>

            {thin ? (
              <div style={{ padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 11, marginBottom: 14 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--accent-soft)", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    <Icons.search size={17} />
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{thin.title} is thin</div>
                    <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, margin: "5px 0 0" }}>
                      It&apos;s saved, but the conversation didn&apos;t have much to draw on yet — so the
                      agent left the gaps honest instead of filling them in.
                    </p>
                  </div>
                </div>
                {thin.reason && (
                  <div className="card" style={{ padding: "12px 14px", background: "var(--surface)", marginBottom: 16 }}>
                    <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
                      Talk about this next
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{thin.reason}</div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setThin(null)}>
                    Generate another
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setOpen(false)}>
                    Read it
                  </button>
                </div>
              </div>
            ) : (
              <div className="scrollarea" style={{ padding: 16, maxHeight: "60vh" }}>
                {error && (
                  <p style={{ color: "var(--danger-text)", fontSize: 13, margin: "0 0 12px" }}>{error}</p>
                )}
                {types === null ? (
                  <p className="faint" style={{ fontSize: 13, padding: 8 }}>Loading the library…</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {types.map((t) => {
                      const busy = busyKey === t.key;
                      return (
                        <button
                          key={t.key}
                          disabled={t.have || !!busyKey}
                          onClick={() => pick(t)}
                          className="artifact-opt"
                          style={{
                            opacity: t.have ? 0.5 : busyKey && !busy ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 11,
                            padding: 13,
                            borderRadius: 11,
                            border: "1px solid var(--border-strong)",
                            background: "var(--surface-raised)",
                            textAlign: "left",
                            cursor: t.have ? "default" : "pointer",
                          }}
                        >
                          <span className="file-glyph glyph-page" style={{ width: 34, height: 34, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent-text)" }}>
                            {busy ? <Icons.clock size={16} /> : <Icons.doc size={16} />}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}>
                              {t.title}
                              {t.have && <Icons.check size={13} style={{ color: "var(--success-text)" }} />}
                            </div>
                            <div className="faint" style={{ fontSize: 11.5, lineHeight: 1.4 }}>
                              {busy ? "Drafting…" : t.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
