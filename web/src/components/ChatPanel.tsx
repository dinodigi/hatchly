"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* The chat — one turn at a time through /api/chat. Tool traces render as the
   small "✦ updated brief · …" lines under assistant messages, v4-style. */

interface Msg {
  role: "user" | "assistant";
  content: string;
  traces: string[];
}

interface Template {
  opening: string;
  questions: { text: string; options: { label: string; expands_to?: string }[]; allow_help?: boolean }[];
}

export default function ChatPanel({
  ideaId,
  chatId: initialChatId,
  initialMessages,
  template,
}: {
  ideaId: string;
  chatId: string | null;
  initialMessages: Msg[];
  /** A pre-made chat's template — its opening line and curated first questions. */
  template?: Template;
}) {
  const router = useRouter();
  const [chatId, setChatId] = useState(initialChatId);
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, busy]);

  // The curated pills for the opening — shown until the founder answers, then the
  // agent takes over the conversation.
  const primer = template && messages.length === 0 ? template.questions[0] : undefined;

  const send = async (override?: string) => {
    const message = (override ?? input).trim();
    if (!message || busy) return;
    if (!override) setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", content: message, traces: [] }]);
    setBusy(true);
    // Don't let a stuck turn spin the typing dots forever — surface a retry after
    // 60s instead of a silent hang (feedback 6079a8de).
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 60_000);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ideaId, chatId, message }),
        signal: ctrl.signal,
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.code === "E_NO_KEY" || json.code === "E_KEY_INVALID") {
          router.push("/settings?reason=key");
          return;
        }
        throw new Error(json.error ?? "failed");
      }
      setChatId(json.chatId);
      setMessages((m) => [...m, { role: "assistant", content: json.reply, traces: json.traces ?? [] }]);
      router.refresh(); // memory rail + brief panel re-render server-side
    } catch (e) {
      setError(
        e instanceof DOMException && e.name === "AbortError"
          ? "That took too long — your reply may still be saving. Give it a moment and try again."
          : e instanceof Error
            ? e.message
            : "something went wrong",
      );
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  };

  return (
    <section className="col" style={{ height: "100%", minHeight: 0 }}>
      <div ref={scroller} className="scrollarea col gap14" style={{ flex: 1, paddingRight: 6 }}>
        {messages.length === 0 && (
          <div className="col gap8" style={{ alignItems: "flex-start" }}>
            <div className="row gap8" style={{ alignItems: "flex-start" }}>
              <span className="avatar avatar-ai" style={{ width: 26, height: 26, fontSize: 12 }}>H</span>
              <div className="card" style={{ padding: "10px 14px", fontSize: 14, lineHeight: 1.55, maxWidth: 520 }}>
                {template?.opening ?? "What's the idea? A sentence is enough — or just talk."}
              </div>
            </div>
            {template && (
              <span className="faint" style={{ fontSize: 11.5, marginLeft: 34 }}>
                Curated from your onboarding · tap an answer or just type.
              </span>
            )}
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="row" style={{ justifyContent: "flex-end" }}>
              <div
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "9px 14px",
                  fontSize: 14,
                  lineHeight: 1.5,
                  maxWidth: 480,
                }}
              >
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="col gap6" style={{ alignItems: "flex-start" }}>
              <div className="row gap8" style={{ alignItems: "flex-start" }}>
                <span className="avatar avatar-ai" style={{ width: 26, height: 26, fontSize: 12 }}>H</span>
                <div className="card" style={{ padding: "10px 14px", fontSize: 14, lineHeight: 1.55, maxWidth: 520 }}>
                  {m.content}
                </div>
              </div>
              {m.traces.length > 0 && (
                <div className="col gap2" style={{ marginLeft: 34 }}>
                  {m.traces.map((t, j) => (
                    <span key={j} className="faint mono" style={{ fontSize: 11 }}>
                      ✦ {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ),
        )}
        {busy && (
          <div className="row gap8">
            <span className="avatar avatar-ai" style={{ width: 26, height: 26, fontSize: 12 }}>H</span>
            <span className="typing-dots" style={{ padding: "12px 0" }}>
              <i /><i /><i />
            </span>
          </div>
        )}
      </div>

      {error && <p style={{ color: "var(--danger-text)", fontSize: 13, margin: "8px 0 0" }}>{error}</p>}

      {primer && (
        <div className="col gap6" style={{ marginTop: 14 }}>
          <span className="faint" style={{ fontSize: 12, fontWeight: 500 }}>{primer.text}</span>
          <div className="row gap6" style={{ flexWrap: "wrap" }}>
            {primer.options.map((o) => (
              <button
                key={o.label}
                className="tag-pick"
                disabled={busy}
                onClick={() => send(o.expands_to?.trim() || o.label)}
              >
                {o.label}
              </button>
            ))}
            {primer.allow_help && (
              <button className="tag-pick" disabled={busy} onClick={() => send("Help me decide — propose an answer from what you already know.")}>
                Help me decide
              </button>
            )}
          </div>
        </div>
      )}

      <div className="row gap8" style={{ marginTop: 14 }}>
        <input
          className="field"
          placeholder="Type, or just talk it through…"
          value={input}
          disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" disabled={busy || !input.trim()} onClick={() => send()}>
          Send
        </button>
      </div>
      <p className="faint" style={{ fontSize: 11.5, textAlign: "center", margin: "8px 0 0" }}>
        The chat fills your brief as you talk
      </p>
    </section>
  );
}
