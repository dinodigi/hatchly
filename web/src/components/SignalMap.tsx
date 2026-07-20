import { SIGNAL_TOPICS } from "@/lib/agent";

/* The signal map — a compass, never a score. Shows where the idea has
   thinking and where it's blank. Grows forever; never "completes". */

export default function SignalMap({ counts }: { counts: Record<string, number> }) {
  return (
    <div className="col gap6">
      {SIGNAL_TOPICS.map((topic) => {
        const n = counts[topic] ?? 0;
        const dots = Math.min(n, 4);
        return (
          <div key={topic} className="row gap8" title={`${n} ${n === 1 ? "memory" : "memories"}`}>
            <span
              className="faint"
              style={{ fontSize: 11, width: 78, flex: "none", color: n ? "var(--text-secondary)" : "var(--text-muted)" }}
            >
              {topic}
            </span>
            <span className="row gap4">
              {Array.from({ length: 4 }, (_, i) => (
                <span
                  key={i}
                  className="dot"
                  style={{
                    width: 6,
                    height: 6,
                    background: i < dots ? "var(--accent)" : "transparent",
                    border: i < dots ? "none" : "1px solid var(--border-strong)",
                  }}
                />
              ))}
              {n > 4 && (
                <span className="faint mono" style={{ fontSize: 9.5 }}>+{n - 4}</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
