"use client";

import { useEffect, useState } from "react";

/* The hatch — the moment between "set up my workspace" and landing in it.
 *
 * Four scenes over ~15s, but deliberately NOT a slideshow: every prop that
 * arrives also leaves (the founder's answers are absorbed INTO the egg as the
 * conversations fan out), the egg's own motion never restarts — nested float
 * and tilt loops with a scale that transitions across the whole run — and the
 * cracks draw by transition rather than keyframes.
 *
 * The ceremony holds on its last scene until the workspace actually exists:
 * `ready` flips when the API returns. Never a fake wait, never a cut-off payoff.
 */

const SCENES = [
  {
    title: "Reading your answers",
    cap: "“Every big company was once one person refusing to let a small idea go.”",
  },
  {
    title: "Shaping your conversations",
    cap: "“Ideas don't hatch from thinking harder — they hatch from the right questions.”",
  },
  {
    title: "Seeding your brief",
    cap: "“The first version doesn't need to be good. It needs to exist.”",
  },
  {
    title: "Ready to hatch",
    cap: "“Talk about your idea until it embarrasses you — that's where the real one starts.”",
  },
  {
    title: "Your workspace is ready",
    cap: "Seven conversations, a living brief, and a memory — built from your answers.",
  },
];
const AT = [0, 4200, 8400, 12200];
const SCALE = ["0.92", "1.0", "1.03", "1.06", "1.08"];

const CHIPS = [
  { text: "your idea, in your words", fx: "-186px", fy: "-42px" },
  { text: "what's broken today", fx: "178px", fy: "-70px" },
  { text: "…and who it's for", fx: "146px", fy: "58px" },
];
const FANS = [
  { ic: "◎", label: "The problem", fx: "-198px", fy: "-52px" },
  { ic: "✦", label: "What you're building", fx: "-176px", fy: "52px" },
  { ic: "◍", label: "The market", fx: "-56px", fy: "-108px" },
  { ic: "◈", label: "How it makes money", fx: "100px", fy: "-94px" },
  { ic: "❖", label: "Name & brand", fx: "182px", fy: "-12px" },
  { ic: "➤", label: "First 100 users", fx: "158px", fy: "76px" },
  { ic: "✎", label: "Think out loud", fx: "-42px", fy: "110px" },
];
const MOTES = [
  { left: "24%", top: "72%", dur: 11, delay: 0 },
  { left: "36%", top: "80%", dur: 13, delay: 2.4 },
  { left: "58%", top: "76%", dur: 12, delay: 1.2 },
  { left: "70%", top: "70%", dur: 14, delay: 3.6 },
  { left: "46%", top: "84%", dur: 10.5, delay: 5 },
];

/** Honour the OS setting: no ceremony, just the finished state. */
const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function HatchCeremony({ ready, onEnter }: { ready: boolean; onEnter: () => void }) {
  // Lazy initialisers rather than setState-in-effect: this component only ever
  // mounts client-side (after the founder submits), so there's no SSR to mismatch.
  const [scene, setScene] = useState(() => (prefersReduced() ? 3 : 0));
  const [finished, setFinished] = useState(prefersReduced);

  useEffect(() => {
    if (prefersReduced()) return;
    const timers = AT.slice(1).map((at, i) => setTimeout(() => setScene(i + 1), at));
    timers.push(setTimeout(() => setFinished(true), 15000));
    return () => timers.forEach(clearTimeout);
  }, []);

  // The last scene only arrives once the workspace genuinely exists.
  const done = finished && ready;
  const shown = done ? 4 : scene;

  // Land in the workspace a beat after the payoff, so the hatch is seen.
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(onEnter, 1400);
    return () => clearTimeout(t);
  }, [done, onEnter]);

  const propClass = (mine: number) => (shown === mine ? "on" : shown > mine ? "off" : "");

  return (
    <div className="hatch-wrap" data-scene={shown}>
      <div className="hatch-halo" aria-hidden="true" />
      <div className="hatch-field" aria-hidden="true">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="hatch-mote"
            style={{ left: m.left, top: m.top, animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s` }}
          />
        ))}
        <span className="hatch-ring-big" />
        <span className="hatch-ring-big r2" />

        {CHIPS.map((c, i) => (
          <span
            key={c.text}
            className={`hatch-prop hatch-chip ${propClass(0)}`}
            style={{ ["--fx" as string]: c.fx, ["--fy" as string]: c.fy, transitionDelay: `${i * 0.09}s` }}
          >
            {c.text}
          </span>
        ))}
        {FANS.map((f, i) => (
          <span
            key={f.label}
            className={`hatch-prop hatch-fan ${propClass(1)}`}
            style={{ ["--fx" as string]: f.fx, ["--fy" as string]: f.fy, transitionDelay: `${i * 0.09}s` }}
          >
            <i>{f.ic}</i>
            {f.label}
          </span>
        ))}

        <div className="hatch-scale" style={{ ["--eggScale" as string]: SCALE[Math.min(shown, 4)] }}>
          <div className="hatch-orbit">
            <div className="hatch-tilt">
              <div className="hatch-egg-big">
                <svg className={`hatch-crack c1${shown >= 2 ? " drawn" : ""}`} viewBox="0 0 100 40">
                  <polyline points="0,22 16,30 30,12 46,28 60,10 76,26 100,16" />
                </svg>
                <svg className={`hatch-crack c2${shown >= 3 ? " drawn" : ""}`} viewBox="0 0 100 40">
                  <polyline points="0,18 20,26 38,14 58,24 78,12 100,20" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hatch-titles">
        {SCENES.map((s, i) => (
          <h1 key={s.title} className={`hatch-title serif ${i === shown ? "on" : i < shown ? "past" : ""}`}>
            {s.title}
          </h1>
        ))}
      </div>
      <div className="hatch-caps" aria-live="polite">
        {SCENES.map((s, i) => (
          <p key={s.cap} className={`hatch-cap serif ${i === shown ? "on" : i < shown ? "past" : ""}`}>
            {s.cap}
          </p>
        ))}
      </div>

      <div className="hatch-dots" aria-hidden="true">
        {/* 7px dot + 14px gap = 21px pitch — derived, no measuring pass. */}
        <span className="hatch-trav" style={{ ["--tx" as string]: `${Math.min(shown, 3) * 21 - 1}px` }} />
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`hatch-dot${i < Math.min(shown, 3) ? " past" : ""}`} />
        ))}
      </div>
      <div className="hatch-bar" aria-hidden="true">
        <i />
      </div>

      <div className={`hatch-cta${done ? " on" : ""}`}>
        <button className="btn btn-primary btn-lg" onClick={onEnter} disabled={!done}>
          Step inside →
        </button>
      </div>
    </div>
  );
}
