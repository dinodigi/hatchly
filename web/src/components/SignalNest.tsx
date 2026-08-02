"use client";

import { useState } from "react";

/* The signals widget (Option K) — what the idea knows, by topic.
 *
 * Each row is a bar filling toward TARGET memories, the point a topic reads as
 * properly explored. Deliberately ABSOLUTE, not relative to the biggest topic:
 * a relative scale makes every other bar shrink whenever one topic grows, and
 * "full" would mean nothing. The count keeps climbing past full.
 *
 * Untouched topics stay visible — the zeros are where the co-founder steers next.
 */

const TARGET = 4;

export interface TopicSignal {
  topic: string;
  count: number;
  /** newest memory for this topic — the founder's own words */
  latest?: { content: string; chat?: string; when?: string };
  /** what this topic would answer, shown when it has nothing yet */
  nudge?: string;
}

export default function SignalNest({ topics, total }: { topics: TopicSignal[]; total: number }) {
  const [hover, setHover] = useState<string | null>(null);

  const withSignal = topics.filter((t) => t.count > 0).sort((a, b) => b.count - a.count);
  const empty = topics.filter((t) => !t.count);
  const shown = topics.find((t) => t.topic === hover) ?? withSignal[0];

  if (!total) {
    return (
      <div className="col gap8">
        <div className="sig-empty-egg" />
        <span className="faint" style={{ fontSize: 12.5, textAlign: "center" }}>
          Nothing captured yet — open a conversation and it fills in as you talk.
        </span>
      </div>
    );
  }

  return (
    <div className="signest">
      <div className="snest-head">
        <span className="snest-egg" />
        <span className="snest-tot">
          <b>{total}</b>
          <span>
            {total === 1 ? "thing" : "things"} learned · {withSignal.length} of {topics.length} topics
          </span>
        </span>
      </div>

      {withSignal.map((t) => {
        const pct = Math.min(100, Math.round((100 * t.count) / TARGET));
        return (
          <div
            key={t.topic}
            className={`snest-row${t.count >= TARGET ? " full" : ""}`}
            onMouseEnter={() => setHover(t.topic)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="snest-egglet">
              <i style={{ height: `${pct}%` }} />
            </span>
            <span className="snest-name">{t.topic}</span>
            <span className="snest-track">
              <span className="snest-fill" style={{ width: `${pct}%` }} />
            </span>
            <span className="snest-num">{t.count}</span>
          </div>
        );
      })}

      {empty.length > 0 && (
        <>
          <div className="snest-div">nothing yet — where your co-founder steers next</div>
          {empty.map((t) => (
            <div
              key={t.topic}
              className="snest-row zero"
              onMouseEnter={() => setHover(t.topic)}
              onMouseLeave={() => setHover(null)}
            >
              <span className="snest-egglet" />
              <span className="snest-name">{t.topic}</span>
              <span className="snest-track" />
              <span className="snest-num">0</span>
            </div>
          ))}
        </>
      )}

      {shown && (
        <div className="snest-latest">
          {shown.count > 0 && shown.latest ? (
            <>
              <div className="snest-lk">Latest — {shown.topic}</div>
              <p className="snest-lq serif">“{shown.latest.content}”</p>
              <div className="snest-lm">
                your words{shown.latest.chat ? <> , from <b>{shown.latest.chat}</b></> : null}
                {shown.latest.when ? ` · ${shown.latest.when}` : ""}
              </div>
            </>
          ) : (
            <>
              <div className="snest-lk">{shown.topic} — nothing yet</div>
              <p className="snest-lq" style={{ fontStyle: "normal", color: "var(--text-secondary)" }}>
                {shown.nudge ?? "No conversation has touched this yet."}
              </p>
              <div className="snest-lm">your co-founder will steer here next</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
