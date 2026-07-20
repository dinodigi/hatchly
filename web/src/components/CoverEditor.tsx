"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Icons } from "./icons";
import { SectionLabel } from "./ui";

/* Cover art for a listing: five washes, or your own image.
   Lives in the Publish tab where the founder is already deciding how the
   idea presents itself. */

const COVER_CSS: Record<string, string> = {
  meadow: "linear-gradient(120deg, #E7EDE0, #CFE0CB 55%, #B8D0BE)",
  linen: "linear-gradient(120deg, #F3ECDF, #E7D9C3 60%, #DCC9AC)",
  dusk: "linear-gradient(120deg, #E3E0EC, #D2CCE0 55%, #BFC2DC)",
  gold: "linear-gradient(120deg, #F6E6C4, #EDCF8E 55%, #DCA032)",
  slate: "linear-gradient(120deg, #E4E6E7, #CDD2D4 55%, #B4BBBD)",
};

export default function CoverEditor({
  ideaId,
  preset,
  imageUrl,
}: {
  ideaId: string;
  preset: string;
  imageUrl: string | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState(preset || "linen");
  const [image, setImage] = useState<string | null>(imageUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (key: string) => {
    setBusy(true);
    setError(null);
    // Optimistic: the swatch should respond instantly even though the write
    // is a round trip away.
    const prev = { key: current, img: image };
    setCurrent(key);
    setImage(null);
    try {
      const res = await fetch("/api/cover", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ideaId, preset: key }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "failed");
      router.refresh();
    } catch (e) {
      setCurrent(prev.key);
      setImage(prev.img);
      setError(e instanceof Error ? e.message : "could not save");
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("ideaId", ideaId);
      fd.append("file", file);
      const res = await fetch("/api/cover", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "upload failed");
      setImage(json.url);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "could not upload");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          height: 110,
          position: "relative",
          background: image ? `url(${image}) center/cover` : COVER_CSS[current] ?? COVER_CSS.linen,
        }}
      >
        <div style={{ position: "absolute", left: 14, bottom: 12, display: "flex", gap: 7 }}>
          {Object.entries(COVER_CSS).map(([key, css]) => {
            const active = !image && current === key;
            return (
              <button
                key={key}
                title={key}
                disabled={busy}
                onClick={() => pick(key)}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: css,
                  cursor: busy ? "default" : "pointer",
                  padding: 0,
                  border: active ? "2px solid var(--accent)" : "1px solid rgba(0,0,0,0.12)",
                  boxShadow: active ? "0 0 0 2px rgba(255,255,255,0.7)" : undefined,
                }}
              />
            );
          })}
        </div>
        <button
          className="btn btn-secondary btn-sm"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          style={{ position: "absolute", right: 14, bottom: 12 }}
        >
          <Icons.plus size={14} /> {busy ? "Working…" : image ? "Replace" : "Upload"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />
      </div>
      <div style={{ padding: "14px 18px" }}>
        <SectionLabel>Cover</SectionLabel>
        <p className="faint" style={{ fontSize: 12.5, margin: "6px 0 0" }}>
          {image
            ? "Your image is live. Pick a wash to go back to a gradient."
            : "Pick a wash or upload your own. Shows on your public listing and in link previews."}
        </p>
        {error && <p style={{ color: "var(--danger-text)", fontSize: 12.5, margin: "8px 0 0" }}>{error}</p>}
      </div>
    </div>
  );
}
