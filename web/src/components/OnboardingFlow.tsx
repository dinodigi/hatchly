"use client";

import { useRouter } from "next/navigation";
import { type CSSProperties, useMemo, useState } from "react";
import type { OnboardingQuestion } from "@/lib/onboarding";

/* The dedicated idea-onboarding step: the founder's sentence, then the templated
   pill questions, one at a time. Answers post to /api/ideas, which generates the
   title and seeds the placeholder chats, then we drop into the new workspace. */

function shows(q: OnboardingQuestion, answers: Record<string, unknown>): boolean {
  if (!q.show_when?.trim()) return true;
  try {
    const c = JSON.parse(q.show_when) as { field: string; equals?: unknown };
    return "equals" in c ? answers[c.field] === c.equals : true;
  } catch {
    return true;
  }
}

export default function OnboardingFlow({ questions }: { questions: OnboardingQuestion[] }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-evaluate visible steps whenever answers change (conditional questions).
  const steps = useMemo(() => questions.filter((q) => shows(q, answers)), [questions, answers]);
  const step = steps[i];
  const done = i >= steps.length;

  const keyOf = (q: OnboardingQuestion) => q.maps_to || q.key;

  const setAnswer = (q: OnboardingQuestion, v: unknown) => setAnswers((a) => ({ ...a, [keyOf(q)]: v }));

  const advance = () => setI((n) => n + 1);

  const submit = async (finalAnswers: Record<string, unknown>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ raw: String(finalAnswers.raw ?? ""), answers: finalAnswers }),
      });
      const json = await res.json().catch(() => ({}) as { id?: string; code?: string; error?: string });
      if (res.status === 422 && json.code === "E_NO_KEY") {
        router.push("/settings?reason=key");
        return;
      }
      if (!res.ok || !json.id) throw new Error(json.error ?? "Couldn't create the idea. Please try again.");
      router.push(`/ideas/${json.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "something went wrong");
      setBusy(false);
      setI(steps.length); // land on the review screen to retry
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        {busy ? (
          <>
            {/* The hatch — the moment between answering and landing in the workspace. */}
            <div className="hatch-stage" aria-hidden="true">
              <span className="hatch-ring" />
              <span className="hatch-ring hatch-ring2" />
              <span className="hatch-egg">🥚</span>
            </div>
            <div className="serif" style={{ fontSize: 26, fontStyle: "italic", margin: "18px 0 8px" }}>Hatching your workspace…</div>
            <p className="muted" style={{ fontSize: 14 }}>Naming your idea and preparing your conversations.</p>
          </>
        ) : (
          <>
            <div className="serif" style={{ fontSize: 27, marginBottom: 10 }}>I think I&apos;ve got it.</div>
            <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.6, maxWidth: 420, margin: "0 auto 18px" }}>
              Next I&apos;ll set up your workspace and start a few focused conversations to refine
              it — each one opens with a first take you can react to.
            </p>
            {error && <p style={{ color: "var(--danger-text)", fontSize: 13, margin: "0 0 14px" }}>{error}</p>}
            <button className="btn btn-primary btn-lg" onClick={() => submit(answers)}>Set up my workspace →</button>
          </>
        )}
      </div>
    );
  }

  const num = String(i + 1).padStart(2, "0");
  // Denominator = the full question pool, not the currently-visible steps: a
  // conditional question (e.g. "platform") must not make the total tick 05 → 06
  // mid-flow. A short path just finishes a step early. (feedback d4e9aa34)
  const total = Math.max(questions.length, steps.length);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <span className="faint mono" style={{ fontSize: 12 }}>{num} / {String(total).padStart(2, "0")}</span>
        <span style={{ flex: 1, height: 5, borderRadius: 999, background: "var(--surface)", overflow: "hidden" }}>
          <span style={{ display: "block", height: "100%", width: `${((i + 1) / total) * 100}%`, background: "var(--accent)", borderRadius: 999, transition: "width .35s ease" }} />
        </span>
      </div>

      {step.sub && <div className="eyebrow" style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, color: "var(--accent-text)" }}>{step.sub}</div>}
      <h1 className="serif" style={{ fontSize: 27, fontWeight: 400, lineHeight: 1.2, letterSpacing: "-.01em", margin: "8px 0 20px", textWrap: "balance" }}>{step.text}</h1>

      {step.type === "text" ? (
        <TextStep
          value={String(answers[keyOf(step)] ?? "")}
          onChange={(v) => setAnswer(step, v)}
          onNext={advance}
          isFirst={i === 0}
        />
      ) : step.type === "multi" ? (
        <MultiStep
          options={step.options ?? []}
          selected={(answers[keyOf(step)] as string[]) ?? []}
          onChange={(v) => setAnswer(step, v)}
          onNext={advance}
        />
      ) : (
        <div className="col" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {(step.options ?? []).map((o, oi) => (
            <button key={o} className="pill-opt" style={pillStyle} onClick={() => { setAnswer(step, o); advance(); }}>
              <span style={keyBadge}>{String.fromCharCode(65 + oi)}</span>{o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const pillStyle: CSSProperties = {
  textAlign: "left", padding: "13px 15px", borderRadius: 12, border: "1px solid var(--border-strong)",
  background: "var(--surface-raised)", fontSize: 14.5, display: "flex", alignItems: "center", gap: 11, cursor: "pointer", width: "100%",
};
const keyBadge: CSSProperties = {
  width: 19, height: 19, borderRadius: 6, border: "1.5px solid var(--border-strong)", flex: "none",
  fontSize: 10.5, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)",
};

function TextStep({ value, onChange, onNext, isFirst }: { value: string; onChange: (v: string) => void; onNext: () => void; isFirst: boolean }) {
  return (
    <>
      <input
        autoFocus
        className="field"
        value={value}
        placeholder={isFirst ? "e.g. Uber for dog walkers you already trust" : "Type your answer…"}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) onNext(); }}
        style={{ fontSize: 15 }}
      />
      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        <button className="btn btn-primary" disabled={!value.trim()} onClick={onNext}>Continue →</button>
        {!isFirst && <button className="btn btn-ghost" onClick={onNext}>Skip</button>}
      </div>
    </>
  );
}

function MultiStep({ options, selected, onChange, onNext }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; onNext: () => void }) {
  const toggle = (o: string) => {
    if (o.toLowerCase().startsWith("none")) return onChange(selected.includes(o) ? [] : [o]);
    const base = selected.filter((x) => !x.toLowerCase().startsWith("none"));
    onChange(base.includes(o) ? base.filter((x) => x !== o) : [...base, o]);
  };
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {options.map((o, oi) => {
          const on = selected.includes(o);
          return (
            <button key={o} onClick={() => toggle(o)} style={{ ...pillStyle, borderColor: on ? "var(--accent)" : "var(--border-strong)", background: on ? "var(--accent-softer)" : "var(--surface-raised)" }}>
              <span style={{ ...keyBadge, background: on ? "var(--accent)" : "transparent", borderColor: on ? "var(--accent)" : "var(--border-strong)", color: on ? "#fff" : "var(--text-muted)" }}>{String.fromCharCode(65 + oi)}</span>{o}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 22 }}>
        <button className="btn btn-primary" onClick={onNext}>Continue →</button>
      </div>
    </>
  );
}
