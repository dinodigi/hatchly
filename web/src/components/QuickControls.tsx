"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icons } from "./icons";

/* Quick Ideas interactions — vote column, "I'll build this", and the composer. */

export function VoteButton({ quickId, upvotes }: { quickId: string; upvotes: number }) {
  const { isSignedIn } = useAuth();
  const [count, setCount] = useState(upvotes);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);

  const vote = async () => {
    if (voted || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/quick/vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quickId }),
      });
      if (res.ok) {
        setCount((c) => c + 1);
        setVoted(true);
      } else if (res.status === 409) {
        setVoted(true);
      }
    } finally {
      setBusy(false);
    }
  };

  const inner = (
    <span
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        width: 44,
        flex: "none",
        color: voted ? "var(--accent-text)" : "var(--text-secondary)",
        cursor: "pointer",
      }}
      onClick={isSignedIn ? vote : undefined}
      title={voted ? "Voted" : "Upvote"}
    >
      <Icons.chevUp size={18} />
      <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{count}</span>
    </span>
  );

  if (!isSignedIn)
    return (
      <SignInButton mode="modal">
        {inner}
      </SignInButton>
    );
  return inner;
}

export function BuildButton({ quickId }: { quickId: string }) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const clone = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/quick/clone", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quickId }),
      });
      const json = await res.json();
      if (res.status === 422 && json.code === "E_NO_KEY") {
        router.push("/settings?reason=key");
        return;
      }
      if (res.ok) router.push(`/ideas/${json.id}?chat=`);
      else setBusy(false);
    } catch {
      setBusy(false);
    }
  };

  if (!isSignedIn)
    return (
      <SignInButton mode="modal">
        <button className="btn btn-soft btn-sm">I&apos;ll build this</button>
      </SignInButton>
    );
  return (
    <button className="btn btn-soft btn-sm" disabled={busy} onClick={clone}>
      {busy ? "Cloning…" : "I'll build this"}
    </button>
  );
}

const QI_TAGS = ["AI", "SaaS", "Consumer", "Marketplace", "Productivity", "Fintech", "Creator", "Education"];

export function QuickComposer() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = async () => {
    const t = title.trim();
    if (!t || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/quick", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: t, tag }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "failed");
      setTitle("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "something went wrong");
    } finally {
      setBusy(false);
    }
  };

  if (!isSignedIn)
    return (
      <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <span className="muted" style={{ fontSize: 13.5, flex: 1 }}>
          Got one? A sentence is enough — someone here might just build it.
        </span>
        <SignInButton mode="modal">
          <button className="btn btn-primary btn-sm">Sign in to post</button>
        </SignInButton>
      </div>
    );

  return (
    <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <input
        className="field"
        placeholder='"___ for ___" · "___ but ___" · "An app that ___"'
        value={title}
        disabled={busy}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") post();
        }}
        style={{ border: "none", background: "transparent", padding: "2px 2px", fontSize: 14.5 }}
      />
      {error && <p style={{ color: "var(--danger-text)", fontSize: 12.5, margin: 0 }}>{error}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {QI_TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setTag(tag === t ? "" : t)}
            className={tag === t ? "pill pill-accent" : "pill"}
            style={{ fontSize: 11, border: "none", cursor: "pointer" }}
          >
            {t}
          </button>
        ))}
        <span className="spacer" />
        <button className="btn btn-primary btn-sm" disabled={busy || !title.trim()} onClick={post}>
          {busy ? "Posting…" : "Post it"}
        </button>
      </div>
      <span className="faint" style={{ fontSize: 11.5 }}>One idea per day — make it count.</span>
    </div>
  );
}
