// ===== UI primitives (compose tokens only) + Hatchly Bucks economy bits =====
const { useState, useEffect, useRef, useCallback, useMemo } = React;

const Btn = ({ variant="primary", size, className="", children, ...p }) => (
  <button className={`btn btn-${variant} ${size?"btn-"+size:""} ${className}`} {...p}>{children}</button>
);
const IconBtn = ({ children, className="", ...p }) => (
  <button className={`iconbtn ${className}`} {...p}>{children}</button>
);
const Card = ({ hover, className="", style, children, ...p }) => (
  <div className={`card ${hover?"card-hover":""} ${className}`} style={style} {...p}>{children}</div>
);
const Pill = ({ accent, className="", children, style, ...p }) => (
  <span className={`pill ${accent?"pill-accent":""} ${className}`} style={style} {...p}>{children}</span>
);
const StatusDot = ({ band, color, size=8 }) => {
  const c = color || (band==="strong"?"var(--success)":band==="moderate"?"var(--accent)":band==="weak"?"var(--danger)":"var(--text-muted)");
  return <span className="dot" style={{ width:size, height:size, background:c }} />;
};
const LiveDot = () => <span className="live-dot" />;

const Avatar = ({ kind="user", label, size=30, color }) => (
  <span className={`avatar avatar-${kind}`} style={{ width:size, height:size, fontSize:size*0.4, background:color }}>{label}</span>
);

const SectionLabel = ({ children, style }) => (
  <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text-muted)", ...style }}>{children}</div>
);

const ProgressBar = ({ value, color, height=6 }) => (
  <div className="progress" style={{ height }}>
    <span style={{ width:`${value}%`, background: color || "var(--accent)" }} />
  </div>
);

// ---- Visibility / stage badge ----
const StageBadge = ({ stage, className="" }) => {
  const map = {
    ideation:{ label:"Ideation", cls:"b-idea" },
    public:{ label:"On the stream", cls:"b-launch" },
    build:{ label:"Building", cls:"b-val" },
  };
  const s = map[stage] || map.ideation;
  return <span className={`badge ${s.cls} ${className}`}>{s.label}</span>;
};

// ---- animated count-up ----
function CountUp({ to, dur=900, prefix="", className, style }) {
  const [n, setN] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    let raf, start; const a = from.current; const b = to;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(a + (b - a) * e));
      if (p < 1) raf = requestAnimationFrame(tick); else from.current = b;
    };
    raf = requestAnimationFrame(tick);
    const safety = setTimeout(() => { setN(b); from.current = b; }, dur + 250);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); };
  }, [to, dur]);
  return <span className={className} style={style}>{prefix}{n.toLocaleString()}</span>;
}

// ---- Hatchly Bucks coin (egg mark on a gold disc) ----
function Coin({ size=18, style }) {
  return (
    <span className="coin" style={{ width:size, height:size, ...style }}>
      <svg viewBox="0 0 24 24" width={size*0.62} height={size*0.62} fill="#fff" style={{ display:"block" }}>
        <path d="M12 2c-2.5 2-4 4.8-4 8 0 1.6.5 3 1.3 4.2C7.6 13.4 6 12 4.5 12c0 4 3.2 8 7.5 8s7.5-4 7.5-8c-1.5 0-3.1 1.4-4.8 2.2.8-1.2 1.3-2.6 1.3-4.2 0-3.2-1.5-6-4-8z"/>
      </svg>
    </span>
  );
}

// ---- bucks amount: coin + number ----
function Bucks({ amount, size=18, fontSize, animate=false, prefix="", className="", style }) {
  return (
    <span className={`bucks ${className}`} style={{ display:"inline-flex", alignItems:"center", gap:size*0.32, fontWeight:600, fontVariantNumeric:"tabular-nums", ...style }}>
      <Coin size={size} />
      {animate
        ? <CountUp to={amount} prefix={prefix} style={{ fontSize:fontSize||size*0.86 }} />
        : <span style={{ fontSize:fontSize||size*0.86 }}>{prefix}{amount.toLocaleString()}</span>}
    </span>
  );
}

// ---- momentum sparkline ----
function Spark({ data=[], w=64, h=22, color="var(--accent)", up=true }) {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data), span = (max-min)||1;
  const pts = data.map((v,i) => [ (i/(data.length-1))*w, h - ((v-min)/span)*(h-3) - 1.5 ]);
  const d = pts.map((p,i) => (i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
  const area = d + ` L${w} ${h} L0 ${h} Z`;
  const id = useMemo(()=>"sp"+Math.random().toString(36).slice(2,8),[]);
  return (
    <svg width={w} height={h} style={{ display:"block", overflow:"visible" }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity="0.18"/><stop offset="1" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.2" fill={color} />
    </svg>
  );
}

// ---- gold burst (coins flying out on invest) ----
function GoldBurst({ fire }) {
  if (!fire) return null;
  const parts = Array.from({ length:14 });
  return (
    <span key={fire} style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:5 }}>
      {parts.map((_,i) => {
        const ang = (i/parts.length)*Math.PI*2 + (fire%6)*0.3;
        const dist = 34 + (i%4)*14;
        return <span key={i} className="goldp" style={{
          left:"50%", top:"50%",
          "--dx":`${Math.cos(ang)*dist}px`, "--dy":`${Math.sin(ang)*dist - 18}px`,
          animationDelay:`${(i%5)*18}ms`,
        }}/>;
      })}
    </span>
  );
}

// ---- typewriter for assistant lines ----
function Typewriter({ text, speed=14, onDone, className }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0); let id;
    const step = () => { setI(p => { if (p >= text.length) { onDone&&onDone(); return p; } id = setTimeout(step, speed); return p+1; }); };
    id = setTimeout(step, speed);
    return () => clearTimeout(id);
  }, [text]);
  return <span className={className}>{text.slice(0,i)}{i<text.length && <span style={{opacity:0.4}}>▍</span>}</span>;
}
const TypingDots = () => <span className="typing-dots"><i/><i/><i/></span>;

// ---- stagger children entrance ----
function Stagger({ children, step=60, start=0, className="", style }) {
  const arr = React.Children.toArray(children);
  return (
    <div className={`stagger ${className}`} style={style}>
      {arr.map((ch, i) => React.cloneElement(ch, { key:ch.key??i, style:{ ...(ch.props.style||{}), animationDelay:`${start + i*step}ms` } }))}
    </div>
  );
}

const Empty = ({ icon:I=Icons.sparkle, title, body, action }) => (
  <div style={{ textAlign:"center", padding:"56px 24px", maxWidth:380, margin:"0 auto" }}>
    <div style={{ width:46, height:46, borderRadius:12, background:"var(--surface)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:"var(--text-muted)" }}><I size={22}/></div>
    <div style={{ fontWeight:600, fontSize:15, marginBottom:6 }}>{title}</div>
    <div className="muted" style={{ fontSize:13.5, marginBottom:action?18:0 }}>{body}</div>
    {action}
  </div>
);

Object.assign(window, { Btn, IconBtn, Card, Pill, StatusDot, LiveDot, Avatar, SectionLabel, ProgressBar, StageBadge, CountUp, Coin, Bucks, Spark, GoldBurst, Typewriter, TypingDots, Stagger, Empty });
