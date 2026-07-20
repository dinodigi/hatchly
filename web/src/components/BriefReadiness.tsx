import type { BriefGate } from "@/lib/agent";

/* Brief readiness — the side-panel lead (direction B3). A ring showing how many
   of the four gate criteria are met, the criteria as pills, and a link into the
   brief. Presentational: the gate is computed server-side and passed in. */

const CRITERIA: { key: keyof Omit<BriefGate, "open">; label: string }[] = [
  { key: "problem", label: "Problem" },
  { key: "who", label: "Audience" },
  { key: "value", label: "Core value" },
  { key: "feature", label: "First feature" },
];

const R = 22;
const CIRC = 2 * Math.PI * R; // 138.23

export default function BriefReadiness({ gate, href }: { gate: BriefGate; href: string }) {
  const met = CRITERIA.filter((c) => gate[c.key]).length;
  const offset = CIRC * (1 - met / CRITERIA.length);
  const done = gate.open;

  return (
    <div style={{ padding: "16px 18px", background: "var(--accent-softer)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 2 }}>
        <div style={{ position: "relative", width: 52, height: 52, flex: "none" }}>
          <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r={R} fill="none" stroke="var(--surface)" strokeWidth="5" />
            <circle
              cx="26"
              cy="26"
              r={R}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              transform="rotate(-90 26 26)"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              color: met ? "var(--accent-text)" : "var(--text-muted)",
            }}
          >
            {met}/{CRITERIA.length}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>Brief readiness</div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
            {done ? "Build-ready" : met === 0 ? "Start chatting to fill it" : `${CRITERIA.length - met} ${CRITERIA.length - met === 1 ? "piece" : "pieces"} to go`}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 11 }}>
        {CRITERIA.map((c) => {
          const on = gate[c.key];
          return (
            <span
              key={c.key}
              style={{
                fontSize: 11,
                padding: "2px 9px",
                borderRadius: 999,
                background: on ? "var(--accent-soft)" : "var(--surface)",
                color: on ? "var(--accent-text)" : "var(--text-muted)",
              }}
            >
              {c.label}
            </span>
          );
        })}
      </div>

      <a
        href={href}
        className="btn btn-secondary btn-sm"
        style={{
          width: "100%",
          marginTop: 12,
          ...(done
            ? { borderColor: "color-mix(in srgb, var(--accent) 50%, transparent)", background: "var(--accent-soft)", color: "var(--accent-text)" }
            : {}),
        }}
      >
        Open the brief
      </a>
    </div>
  );
}
