"use client";

import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icons } from "./icons";
import { Avatar, SectionLabel } from "./ui";

/* Quick Ideas interactions — vote column, "I'll build this", and the composer. */

export function VoteButton({ quickId, upvotes }: { quickId: string; upvotes: number }) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [count, setCount] = useState(upvotes);
  const [lastUpvotes, setLastUpvotes] = useState(upvotes);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);

  // Reconcile with the server count after a refresh (own vote or someone
  // else's) instead of drifting from the mount-time prop. During-render sync.
  if (upvotes !== lastUpvotes) {
    setLastUpvotes(upvotes);
    setCount(upvotes);
  }

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
        router.refresh();
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
  const router = useRouter();
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
        body: JSON.stringify({ quickId, text: t, requestKey: crypto.randomUUID() }),
      });
      const json = await res.json();
      if (res.ok && json.comment) {
        setText("");
        setTotal((n) => n + 1);
        // Append the comment the server just handed back — no lagging refetch.
        setComments((cur) => [...(cur ?? []), json.comment]);
        // Keep the card's server-rendered comment_count in sync for everyone.
        router.refresh();
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

export function QuickComposer({ postedToday = false, signedIn = false }: { postedToday?: boolean; signedIn?: boolean }) {
  const { user } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("Consumer");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initial = (user?.firstName?.[0] ?? user?.username?.[0] ?? user?.primaryEmailAddress?.emailAddress?.[0] ?? "?").toUpperCase();

  const reset = () => {
    setOpen(false);
    setTitle("");
    setDescription("");
    setTag("Consumer");
    setError(null);
  };

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
      // Daily limit already hit — reflect the real server state (the "posted
      // today" card) instead of a generic error or a false success.
      if (res.status === 429) {
        reset();
        router.refresh();
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "failed");
      reset();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "something went wrong");
    } finally {
      setBusy(false);
    }
  };

  // Signed out — the collapsed row, but the CTA opens sign-in. Uses the
  // server-derived `signedIn` (not client Clerk state) so a signed-in user
  // never gets flashed the "Sign in to post" label before hydration
  // (feedback 9f63c5d4).
  if (!signedIn)
    return (
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", marginBottom: 20 }}>
        <span className="muted" style={{ flex: 1, fontSize: 15 }}>
          Got a &ldquo;someone should build this&rdquo;? Drop it — one a day.
        </span>
        <SignInButton mode="modal">
          <button className="btn btn-primary btn-sm">Sign in to post</button>
        </SignInButton>
      </div>
    );

  // Already posted today — v4's confirmation card, no composer.
  if (postedToday)
    return (
      <div className="card" style={{ padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: 999, background: "var(--success-soft)", color: "var(--success-text)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Icons.check size={18} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>That&apos;s your idea for today</div>
          <div className="faint" style={{ fontSize: 12.5 }}>One a day keeps the board fresh. Come back tomorrow.</div>
        </div>
      </div>
    );

  // Collapsed — a single click-to-open row.
  if (!open)
    return (
      <div
        onClick={() => setOpen(true)}
        className="card card-hover"
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", cursor: "text", marginBottom: 20 }}
      >
        <Avatar label={initial} kind="user" size={34} />
        <span className="muted" style={{ flex: 1, fontSize: 15 }}>
          Got a &ldquo;someone should build this&rdquo;? Drop it — one a day.
        </span>
        <button className="btn btn-primary btn-sm"><Icons.sparkle size={15} /> Post idea</button>
      </div>
    );

  // Expanded — the full composer (Design/app/quick.jsx QuickComposer).
  return (
    <div className="card" style={{ padding: 20, marginBottom: 20, border: "1px solid var(--accent)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <SectionLabel>Your one-liner</SectionLabel>
        <span className="faint" style={{ fontSize: 11.5 }}>one idea per day</span>
      </div>
      <input
        autoFocus
        value={title}
        disabled={busy}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") post();
        }}
        placeholder="e.g. Uber for cats"
        style={{ width: "100%", border: "none", borderBottom: "2px solid var(--border-strong)", background: "none", outline: "none", fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", padding: "8px 0", marginBottom: 10 }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <span className="faint" style={{ fontSize: 12 }}>Need a start?</span>
        {QI_TEMPLATES.map((t) => (
          <button key={t.label} type="button" className="tag-pick" disabled={busy} onClick={() => setTitle(t.fill)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        Add detail (optional)
      </div>
      <textarea
        className="edit-area"
        value={description}
        disabled={busy}
        rows={2}
        maxLength={1000}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="A sentence on why it should exist…"
        style={{ width: "100%", fontSize: 14, lineHeight: 1.55, marginBottom: 14 }}
      />
      {error && <p style={{ color: "var(--danger-text)", fontSize: 12.5, margin: "0 0 12px" }}>{error}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="faint" style={{ fontSize: 12.5 }}>Tag</span>
        <select value={tag} disabled={busy} onChange={(e) => setTag(e.target.value)} className="mini-select">
          {QI_TAGS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div style={{ flex: 1 }} />
        <button className="btn btn-secondary btn-sm" disabled={busy} onClick={reset}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={busy || !title.trim()} onClick={post}>
          <Icons.sparkle size={14} /> {busy ? "Posting…" : "Post idea"}
        </button>
      </div>
    </div>
  );
}
