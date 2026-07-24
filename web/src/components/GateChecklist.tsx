import type { BriefGate } from "@/lib/agent";

/* The build gate — a readiness checklist, never a percentage.
   Four checks; when all pass, the gate opens. */

const ITEMS: { key: keyof Omit<BriefGate, "open">; label: string }[] = [
  { key: "problem", label: "A problem" },
  { key: "who", label: "An audience" },
  { key: "value", label: "A core value" },
  { key: "feature", label: "A first feature" },
];

/** One-line explainer of what the gate is and what opening it means — surfaced
 *  as a tooltip wherever the gate marker or checkmarks appear (feedback 80f2eb27). */
export const GATE_HELP =
  "The build gate opens once your brief captures all four — a problem, an audience, a core value, and a first feature. Opening it marks the idea build-ready to start building; it doesn't mean the idea is finished.";

export default function GateChecklist({
  gate,
  compact = false,
}: {
  gate: BriefGate;
  compact?: boolean;
}) {
  if (compact) {
    // dashboard-card variant: four ticks in a row
    return (
      <div className="row gap6" title={`${GATE_HELP}\n\n${ITEMS.map((i) => `${gate[i.key] ? "✓" : "○"} ${i.label}`).join("  ")}`}>
        {ITEMS.map((i) => (
          <span
            key={i.key}
            style={{
              width: 16,
              height: 16,
              borderRadius: 5,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              background: gate[i.key] ? "var(--success-soft)" : "var(--surface)",
              color: gate[i.key] ? "var(--success-text)" : "var(--text-muted)",
              border: gate[i.key] ? "none" : "1px solid var(--border)",
            }}
            aria-label={`${i.label}: ${gate[i.key] ? "met" : "missing"}`}
          >
            {gate[i.key] ? "✓" : ""}
          </span>
        ))}
        <span className="faint" style={{ fontSize: 11.5, marginLeft: 2 }}>
          {gate.open ? "build-ready" : "shaping"}
        </span>
      </div>
    );
  }

  return (
    <div className="col gap8">
      {ITEMS.map((i) => (
        <div key={i.key} className="row gap8" style={{ fontSize: 13 }}>
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 6,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              flex: "none",
              background: gate[i.key] ? "var(--success-soft)" : "var(--surface)",
              color: gate[i.key] ? "var(--success-text)" : "var(--text-muted)",
              border: gate[i.key] ? "none" : "1px solid var(--border-strong)",
            }}
          >
            {gate[i.key] ? "✓" : ""}
          </span>
          <span style={{ color: gate[i.key] ? "var(--text-primary)" : "var(--text-muted)" }}>{i.label}</span>
        </div>
      ))}
    </div>
  );
}
