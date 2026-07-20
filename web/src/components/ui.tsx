/* UI primitives — ported verbatim from Design/app/ui.jsx (compose tokens only).
   Server-safe subset; animated pieces (CountUp, Typewriter, GoldBurst) stay in
   client components. Do not restyle these — they ARE the design system. */

import type { CSSProperties, ReactNode } from "react";
import { Icons } from "./icons";

export const Card = ({
  hover,
  className = "",
  style,
  children,
}: {
  hover?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) => (
  <div className={`card ${hover ? "card-hover" : ""} ${className}`} style={style}>
    {children}
  </div>
);

export const Pill = ({
  accent,
  className = "",
  children,
  style,
}: {
  accent?: boolean;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <span className={`pill ${accent ? "pill-accent" : ""} ${className}`} style={style}>
    {children}
  </span>
);

export const Avatar = ({
  kind = "user",
  label,
  size = 30,
  color,
}: {
  kind?: "user" | "ai";
  label: ReactNode;
  size?: number;
  color?: string;
}) => (
  <span className={`avatar avatar-${kind}`} style={{ width: size, height: size, fontSize: size * 0.4, background: color }}>
    {label}
  </span>
);

export const SectionLabel = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--text-muted)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const StageBadge = ({ stage, className = "" }: { stage: string; className?: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    ideation: { label: "Ideation", cls: "b-idea" },
    public: { label: "On the stream", cls: "b-launch" },
    build: { label: "Building", cls: "b-val" },
  };
  const s = map[stage] || map.ideation;
  return <span className={`badge ${s.cls} ${className}`}>{s.label}</span>;
};

/* Hatchly Bucks coin (egg mark on a gold disc) */
export const Coin = ({ size = 18, style }: { size?: number; style?: CSSProperties }) => (
  <span className="coin" style={{ width: size, height: size, ...style }}>
    <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="#fff" style={{ display: "block" }}>
      <path d="M12 2c-2.5 2-4 4.8-4 8 0 1.6.5 3 1.3 4.2C7.6 13.4 6 12 4.5 12c0 4 3.2 8 7.5 8s7.5-4 7.5-8c-1.5 0-3.1 1.4-4.8 2.2.8-1.2 1.3-2.6 1.3-4.2 0-3.2-1.5-6-4-8z" />
    </svg>
  </span>
);

export const Bucks = ({
  amount,
  size = 18,
  fontSize,
  prefix = "",
  className = "",
  style,
}: {
  amount: number;
  size?: number;
  fontSize?: number;
  prefix?: string;
  className?: string;
  style?: CSSProperties;
}) => (
  <span
    className={`bucks ${className}`}
    style={{ display: "inline-flex", alignItems: "center", gap: size * 0.32, fontWeight: 600, fontVariantNumeric: "tabular-nums", ...style }}
  >
    <Coin size={size} />
    <span style={{ fontSize: fontSize || size * 0.86 }}>
      {prefix}
      {amount.toLocaleString()}
    </span>
  </span>
);

/* momentum sparkline — deterministic gradient id so it server-renders */
export const Spark = ({
  data = [],
  w = 64,
  h = 22,
  color = "var(--accent)",
  id = "sp",
}: {
  data?: number[];
  w?: number;
  h?: number;
  color?: string;
  id?: string;
}) => {
  if (!data.length) return null;
  const min = Math.min(...data),
    max = Math.max(...data),
    span = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / span) * (h - 3) - 1.5]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = d + ` L${w} ${h} L0 ${h} Z`;
  const gid = `${id}-${data.join("-")}`.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 40);
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.18" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.2" fill={color} />
    </svg>
  );
};

export const Empty = ({
  icon: I = Icons.sparkle,
  title,
  body,
  action,
}: {
  icon?: (p: { size?: number }) => ReactNode;
  title: ReactNode;
  body: ReactNode;
  action?: ReactNode;
}) => (
  <div style={{ textAlign: "center", padding: "56px 24px", maxWidth: 380, margin: "0 auto" }}>
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 12,
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px",
        color: "var(--text-muted)",
      }}
    >
      <I size={22} />
    </div>
    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{title}</div>
    <div className="muted" style={{ fontSize: 13.5, marginBottom: action ? 18 : 0 }}>{body}</div>
    {action}
  </div>
);
