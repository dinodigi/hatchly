// ===== UI primitives (compose tokens only — no new color/type) =====
const { useState, useEffect, useRef, useCallback } = React;

const Btn = ({ variant="primary", size, className="", children, ...p }) => (
  <button className={`btn btn-${variant} ${size?"btn-"+size:""} ${className}`} {...p}>{children}</button>
);
const IconBtn = ({ children, className="", ...p }) => (
  <button className={`iconbtn ${className}`} {...p}>{children}</button>
);

const Card = ({ hover, className="", style, children, ...p }) => (
  <div className={`card ${hover?"card-hover":""} ${className}`} style={style} {...p}>{children}</div>
);

const PhaseBadge = ({ phase, className="" }) => {
  const ph = PHASES[phase]; if (!ph) return null;
  return <span className={`badge ${ph.badge} ${className}`}>{ph.label}</span>;
};

const Pill = ({ accent, className="", children, style }) => (
  <span className={`pill ${accent?"pill-accent":""} ${className}`} style={style}>{children}</span>
);

const StatusDot = ({ band, color, size=8 }) => {
  const c = color || (band==="strong"?"var(--success)":band==="moderate"?"var(--accent)":band==="weak"?"var(--danger)":"var(--text-muted)");
  return <span className="dot" style={{ width:size, height:size, background:c }} />;
};
const LiveDot = () => <span className="live-dot" />;

const Avatar = ({ kind="user", label, size=30 }) => (
  <span className={`avatar avatar-${kind}`} style={{ width:size, height:size, fontSize:size*0.4 }}>{label}</span>
);

const ProgressBar = ({ value, color, height=6 }) => (
  <div className="progress" style={{ height }}>
    <span style={{ width:`${value}%`, background: color || "var(--accent)" }} />
  </div>
);

// animated count-up
function CountUp({ to, dur=900, className }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf, start;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(e * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // fallback: ensure final value even if rAF is throttled/paused (offscreen/export)
    const safety = setTimeout(() => setN(to), dur + 250);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); };
  }, [to, dur]);
  return <span className={className}>{n}</span>;
}

// SVG score ring
function ScoreRing({ value, size=92, stroke=7, color, label, animate=true, sub }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [shown, setShown] = useState(animate ? 0 : value);
  useEffect(() => { setShown(value); }, [value, animate]);
  const c = color || (value>=75?"var(--success)":value>=60?"var(--accent)":"var(--danger)");
  return (
    <div style={{ position:"relative", width:size, height:size, flex:"none" }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - (shown/100)*circ}
          style={{ transition:"stroke-dashoffset 1100ms cubic-bezier(.22,1,.36,1)" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", lineHeight:1 }}>
        <span style={{ fontSize:size*0.30, fontWeight:600, letterSpacing:"-0.02em" }}>
          {animate ? <CountUp to={value} /> : value}
        </span>
        {(label||sub) && <span className="faint" style={{ fontSize:size*0.12, marginTop:3, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>{label||sub}</span>}
      </div>
    </div>
  );
}

// typewriter for assistant lines
function Typewriter({ text, speed=16, onDone, className }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    let id;
    const step = () => { setI(p => { if (p >= text.length) { onDone&&onDone(); return p; } id = setTimeout(step, speed); return p+1; }); };
    id = setTimeout(step, speed);
    return () => clearTimeout(id);
  }, [text]);
  return <span className={className}>{text.slice(0,i)}{i<text.length && <span style={{opacity:0.4}}>▍</span>}</span>;
}

const TypingDots = () => <span className="typing-dots"><i/><i/><i/></span>;

// stagger children entrance
function Stagger({ children, step=70, start=0, className="", style }) {
  const arr = React.Children.toArray(children);
  return (
    <div className={`stagger ${className}`} style={style}>
      {arr.map((ch, i) => React.cloneElement(ch, { key:ch.key??i, style:{ ...(ch.props.style||{}), animationDelay:`${start + i*step}ms` } }))}
    </div>
  );
}

// source-type glyph for memory items
function SourceGlyph({ type, size=26 }) {
  const map = { chat:Icons.dots, link:Icons.link, voice:Icons.voice, file:Icons.doc };
  const I = map[type] || Icons.dots;
  return (
    <span className="avatar avatar-user" style={{ width:size, height:size, borderRadius:8 }}>
      <I size={size*0.55} />
    </span>
  );
}

const SectionLabel = ({ children, style }) => (
  <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text-muted)", ...style }}>{children}</div>
);

const Empty = ({ icon:I=Icons.sparkle, title, body, action }) => (
  <div style={{ textAlign:"center", padding:"56px 24px", maxWidth:380, margin:"0 auto" }}>
    <div style={{ width:46, height:46, borderRadius:12, background:"var(--surface)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:"var(--text-muted)" }}><I size={22}/></div>
    <div style={{ fontWeight:600, fontSize:15, marginBottom:6 }}>{title}</div>
    <div className="muted" style={{ fontSize:13.5, marginBottom:action?18:0 }}>{body}</div>
    {action}
  </div>
);

Object.assign(window, { Btn, IconBtn, Card, PhaseBadge, Pill, StatusDot, LiveDot, Avatar, ProgressBar, CountUp, ScoreRing, Typewriter, TypingDots, Stagger, SourceGlyph, SectionLabel, Empty });
