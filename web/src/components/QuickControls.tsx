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

type Comment = { id: string; text: string; author: string; created_at?: string };

/** The thread is collapsed by default and fetched on first open — the board
    renders 50 cards, and eager-loading every thread would be 50 queries. */
export function CommentThread({ quickId, count }: { quickId: string; count: number }) {
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [total, setTotal] = useState(count);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && comments === null) {
      try {
        const res = await fetch(`/api/quick/comment?quickId=${encodeURIComponent(quickId)}`);
        const json = await res.json();
        if (res.ok) setComments(json.comments);
      } catch {
        setComments([]);
      }
    }
  };

  const post = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/quick/comment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quickId, text: t }),
      });
      if (res.ok) {
        setText("");
        setTotal((n) => n + 1);
        const refreshed = await fetch(`/api/quick/comment?quickId=${encodeURIComponent(quickId)}`);
        const json = await refreshed.json();
        if (refreshed.ok) setComments(json.comments);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <span
        className="faint"
        onClick={toggle}
        style={{ fontSize: 12, cursor: "pointer" }}
        title={open ? "Hide comments" : "Show comments"}
      >
        · {total} {total === 1 ? "comment" : "comments"}
      </span>
      {open && (
        <div style={{ flexBasis: "100%", marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          {comments === null ? (
            <span className="faint" style={{ fontSize: 12.5 }}>Loading…</span>
          ) : comments.length === 0 ? (
            <span className="faint" style={{ fontSize: 12.5 }}>No comments yet.</span>
          ) : (
            comments.map((c) => (
              <div key={c.id} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span className="faint" style={{ fontSize: 11.5 }}>{c.author}</span>
                <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{c.text}</span>
              </div>
            ))
          )}

          {isSignedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                className="field"
                placeholder="Add a comment"
                value={text}
                disabled={busy}
                maxLength={1000}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") post();
                }}
                style={{ flex: 1, fontSize: 13.5 }}
              />
              <button className="btn btn-soft btn-sm" disabled={busy || !text.trim()} onClick={post}>
                {busy ? "Posting…" : "Post"}
              </button>
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="btn btn-soft btn-sm" style={{ alignSelf: "flex-start" }}>Sign in to comment</button>
            </SignInButton>
          )}
        </div>
      )}
    </>
  );
}

const QI_TAGS = ["AI", "SaaS", "Consumer", "Marketplace", "Productivity", "Fintech", "Creator", "Education"];

// v4's "need a start?" prompts — each pre-fills the title so a blank box is
// never the first thing you face. (Design/app/quick.jsx)
const QI_TEMPLATES: { label: string; fill: string }[] = [
  { label: "___ for ___", fill: "Netflix for " },
  { label: "___ but ___", fill: "Airbnb but " },
  { label: "An app that ___", fill: "An app that " },
];

export function QuickComposer() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
        body: JSON.stringify({ title: t, description: description.trim(), tag }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "failed");
      setTitle("");
      setDescription("");
      setTag("");
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
        placeholder="e.g. Uber for cats"
        value={title}
        disabled={busy}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") post();
        }}
        style={{ border: "none", background: "transparent", padding: "2px 2px", fontSize: 14.5 }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span className="faint" style={{ fontSize: 12 }}>Need a start?</span>
        {QI_TEMPLATES.map((t) => (
          <button key={t.label} type="button" className="tag-pick" disabled={busy} onClick={() => setTitle(t.fill)}>
            {t.label}
          </button>
        ))}
      </div>
      <textarea
        className="edit-area"
        placeholder="A sentence on why it should exist… (optional)"
        value={description}
        disabled={busy}
        rows={2}
        maxLength={1000}
        onChange={(e) => setDescription(e.target.value)}
        style={{ fontSize: 13.5, lineHeight: 1.55 }}
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
