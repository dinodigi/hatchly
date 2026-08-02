"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

/* "One thing to settle" — the co-founder initiating instead of waiting.
 *
 * Tier 1 (BL-67): the question is a real unresolved arc intent, pulled from the
 * chat that owns it — no model call, nothing invented. The founder answers in
 * their own words and it lands in memory tagged with that intent, so coverage
 * moves and the chat won't re-ask.
 *
 * Never nagging: one question at a time, and "not now" hides it for the session.
 */

export default function SettleCard({
  ideaId,
  chatId,
  chatTitle,
  intentKey,
  question,
  chatHref,
}: {
  ideaId: string;
  chatId: string;
  chatTitle: string;
  intentKey: string;
  question: string;
  chatHref: string;
}) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (dismissed) return null;

  const submit = async () => {
    const text = answer.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/settle", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ideaId, chatId, intentKey, answer: text }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "couldn't save that — try again?");
        return;
      }
      setDone(true);
      router.refresh(); // signals, memory and coverage all move server-side
    } catch {
      setError("couldn't save that — try again?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="settle-card">
      <div className="settle-k">One thing to settle</div>
      {done ? (
        <p className="settle-done">✓ Logged to memory — {chatTitle} won&apos;t ask again.</p>
      ) : (
        <>
          <p className="settle-q serif">{question}</p>
          <p className="settle-why">
            From <b>{chatTitle}</b> — it&apos;s the next thing that chat needs.
          </p>
          <div className="settle-row">
            <input
              className="field"
              placeholder="Answer in your own words…"
              value={answer}
              disabled={busy}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submit();
                }
              }}
            />
            <button className="btn btn-primary" disabled={busy || !answer.trim()} onClick={() => void submit()}>
              {busy ? <span className="egg-busy" /> : "Log it"}
            </button>
          </div>
          {error && <p className="settle-err">{error}</p>}
          <div className="settle-foot">
            <Link href={chatHref} className="link-btn" prefetch={false}>
              Take it to the chat →
            </Link>
            <button className="link-btn settle-not-now" onClick={() => setDismissed(true)}>
              Not now
            </button>
          </div>
        </>
      )}
    </div>
  );
}
