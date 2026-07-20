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

export default function ChatPanel({
  ideaId,
  chatId: initialChatId,
  initialMessages,
}: {
  ideaId: string;
  chatId: string | null;
  initialMessages: Msg[];
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

  const send = async () => {
    const message = input.trim();
    if (!message || busy) return;
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", content: message, traces: [] }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ideaId, chatId, message }),
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
      setError(e instanceof Error ? e.message : "something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="col" style={{ minHeight: 560, maxHeight: "calc(100vh - 140px)" }}>
      <div ref={scroller} className="scrollarea col gap14" style={{ flex: 1, paddingRight: 6 }}>
        {messages.length === 0 && (
          <div className="col gap8" style={{ alignItems: "flex-start" }}>
            <div className="row gap8" style={{ alignItems: "flex-start" }}>
              <span className="avatar avatar-ai" style={{ width: 26, height: 26, fontSize: 12 }}>H</span>
              <div className="card" style={{ padding: "10px 14px", fontSize: 14, lineHeight: 1.55, maxWidth: 520 }}>
                What&apos;s the idea? A sentence is enough — or just talk.
              </div>
            </div>
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
        <button className="btn btn-primary" disabled={busy || !input.trim()} onClick={send}>
          Send
        </button>
      </div>
      <p className="faint" style={{ fontSize: 11.5, textAlign: "center", margin: "8px 0 0" }}>
        The chat fills your brief as you talk
      </p>
    </section>
  );
}
