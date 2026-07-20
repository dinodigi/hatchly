// ===== Brand kit — the full drafted-brand page (spec: "Your brand, drafted") =====

/* ---------- logo marks (simple geometric, brand-colored) ---------- */
function bkSpiralPath() {
  const cx = 50, cy = 50, turns = 2.35, steps = 90, maxR = 33, minR = 3;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ang = t * turns * 2 * Math.PI - Math.PI / 2;
    const r = minR + (maxR - minR) * t;
    const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
    d += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " ";
  }
  return d.trim();
}

function BrandMark({ kind, color = "#1F3A30", size = 64, sw = 5 }) {
  const common = { width: size, height: size, viewBox: "0 0 100 100", fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  if (kind === "rhythm") return (
    <svg {...common}>
      <path d="M20 64 A30 30 0 0 1 80 64" />
      <path d="M31 64 A19 19 0 0 1 69 64" />
      <path d="M42 64 A8 8 0 0 1 58 64" />
      <circle cx="50" cy="64" r="3.4" fill={color} stroke="none" />
    </svg>
  );
  if (kind === "compound") return (
    <svg {...common} stroke="none">
      <circle cx="28" cy="52" r="5" fill={color} opacity="0.5" />
      <circle cx="49" cy="52" r="7.5" fill={color} opacity="0.75" />
      <circle cx="73" cy="52" r="10.5" fill={color} />
    </svg>
  );
  if (kind === "spiral") return (
    <svg {...common}><path d={bkSpiralPath()} /></svg>
  );
  if (kind === "stack") return (
    <svg {...common}>
      <rect x="26" y="58" width="48" height="17" rx="4" />
      <rect x="31" y="40" width="38" height="15" rx="4" />
      <rect x="36" y="23" width="28" height="13" rx="3.5" />
    </svg>
  );
  if (kind === "burst") {
    const lines = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 2 * Math.PI - Math.PI / 2;
      const long = i % 2 === 0;
      const r1 = 13, r2 = long ? 36 : 26;
      lines.push(<line key={i} x1={50 + Math.cos(a) * r1} y1={50 + Math.sin(a) * r1} x2={50 + Math.cos(a) * r2} y2={50 + Math.sin(a) * r2} />);
    }
    return <svg {...common}>{lines}<circle cx="50" cy="50" r="4" fill={color} stroke="none" /></svg>;
  }
  // wordmark fallback handled by caller
  return null;
}

// wordmark lockup: small mark + serif italic wordmark
function BrandLockup({ kit, markKey, color, size = 18, gap = 8 }) {
  const d = kit.type[0];
  const display = d.stack;
  const fw = d.weightCss || (d.italic ? 400 : 700);
  return (
    <span className="row" style={{ gap, alignItems: "center", color }}>
      <BrandMark kind={markKey} color={color} size={size + 8} sw={6} />
      <span style={{ fontFamily: display, fontStyle: d.italic ? "italic" : "normal", fontWeight: fw, fontSize: size, lineHeight: 1 }}>{kit.hero.wordmark}</span>
    </span>
  );
}

/* ---------- small layout helpers ---------- */
function BkEyebrow({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: "var(--text-muted)" }}>{children}</div>;
}
function BkLabel({ children }) {
  return <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>{children}</div>;
}
function BkSection({ n, kicker, title, desc, children }) {
  return (
    <section style={{ marginTop: 46 }} data-screen-label={`Brand · ${kicker}`}>
      <BkEyebrow>{n} · {kicker}</BkEyebrow>
      <h2 style={{ fontSize: 25, fontWeight: 700, letterSpacing: "-0.01em", margin: "10px 0 0" }}>{title}</h2>
      {desc && <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 580 }}>{desc}</p>}
      <div style={{ marginTop: 22 }}>{children}</div>
    </section>
  );
}

function bkLum(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/* ---------- palette swatch (click to copy) ---------- */
function BkSwatch({ c, ink, paper }) {
  const [copied, setCopied] = useState(false);
  const onSwatch = bkLum(c.hex) < 0.6 ? paper : ink;
  const copy = () => { try { navigator.clipboard?.writeText(c.hex); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1100); };
  return (
    <button onClick={copy} style={{ textAlign: "left", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--surface-raised)", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 92, background: c.hex, position: "relative", display: "flex", alignItems: "flex-end", padding: 10 }}>
        <span className="mono" style={{ fontSize: 11, color: onSwatch, opacity: 0.9 }}>{copied ? "copied ✓" : c.hex}</span>
      </div>
      <div style={{ padding: "10px 11px 12px" }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 2, lineHeight: 1.4 }}>{c.role}</div>
        <div className="mono faint" style={{ fontSize: 9.5, marginTop: 8, letterSpacing: "0.04em" }}>{c.contrast}</div>
      </div>
    </button>
  );
}

const BK_MEM_ICON = { sparkle: Icons.sparkle, voice: Icons.voice, doc: Icons.doc, brain: Icons.brain };

/* ============================ BRAND TAB ============================ */
function BrandTab({ idea, onOpenDomain }) {
  const kit = idea.brand_kit;
  if (idea.phase === "ideation" || !kit) {
    return <div><TabHeader title="Brand kit" /><LockedTab title="Not drafted yet" body="Your brand drafts once your positioning is clear. Keep shaping the idea — then Hatchly drafts a full kit from your validation report and memory." /></div>;
  }

  const [ink, brand, paper, accent, second] = kit.palette.map(p => p.hex);
  const onP = kit.on_primary || "#F5F2EC";
  const display = kit.type[0].stack;
  const dI = kit.type[0].italic;
  const dW = kit.type[0].weightCss || (dI ? 400 : 700);
  const USE_GREEN = "#3F7A55";

  const [tagSel, setTagSel] = useState(() => Math.max(0, kit.taglines.findIndex(t => t.selected)));
  const [len, setLen] = useState(kit.description.selected || "medium");
  const [markSel, setMarkSel] = useState(() => Math.max(0, kit.logo_concepts.findIndex(c => c.selected)));
  const [descCopied, setDescCopied] = useState(false);
  const markKey = kit.logo_concepts[markSel].key;

  const lenOpts = [["short", "Short · 4w"], ["medium", "Medium · 30w"], ["long", "Long · 100w"]];
  const copyDesc = () => { try { navigator.clipboard?.writeText(kit.description[len]); } catch (e) {} setDescCopied(true); setTimeout(() => setDescCopied(false), 1100); };

  return (
    <div className="bk-root">
      {/* ---------------- header ---------------- */}
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
        <div style={{ minWidth: 280, flex: 1 }}>
          <div className="row gap8" style={{ alignItems: "center" }}>
            <span className="dot" style={{ background: "var(--accent)" }}></span>
            <BkEyebrow>Generation {kit.generation} · Drafted {kit.drafted_ago} · From {kit.source}</BkEyebrow>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", margin: "10px 0 0" }}>Your brand, drafted</h1>
          <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 520 }}>Built from your validation report and the themes in your memory. Refine anything — Hatchly regenerates downstream applications so the system stays in sync.</p>
        </div>
        <div className="row gap8" style={{ flex: "none" }}>
          <Btn variant="secondary"><Icons.restore size={15} /> Regenerate</Btn>
          <Btn variant="primary"><Icons.ext size={15} /> Export kit</Btn>
        </div>
      </div>

      {/* ---------------- hero showcase ---------------- */}
      <div className="bk-hero" style={{ marginTop: 22, borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
        {/* left */}
        <div style={{ background: paper, color: ink, padding: "34px 32px", display: "flex", flexDirection: "column", minHeight: 380 }}>
          <BrandLockup kit={kit} markKey={markKey} color={brand} size={19} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "26px 0" }}>
            <div style={{ fontFamily: display, fontStyle: dI?"italic":"normal", fontWeight: dW, fontSize: 42, lineHeight: 1.04, color: brand, maxWidth: 360 }}>{kit.hero.headline}</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: ink, opacity: 0.72, margin: "20px 0 0", maxWidth: 320 }}>{kit.hero.blurb}</p>
          </div>
          <div className="row gap8">
            {kit.hero.dots.map((d, i) => <span key={i} style={{ width: 22, height: 22, borderRadius: 999, background: d, border: bkLum(d) > 0.85 ? "1px solid rgba(0,0,0,0.12)" : "none" }}></span>)}
          </div>
        </div>
        {/* right — phone */}
        <div style={{ background: brand, display: "flex", alignItems: "center", justifyContent: "center", padding: "30px 20px" }}>
          <BkPhone kit={kit} brand={brand} onP={onP} accent={accent} />
        </div>
      </div>

      {/* ---------------- 01 name & tagline ---------------- */}
      <BkSection n="01" kicker="Name & tagline" title="The name carries the moat" desc={kit.name_note}>
        <div className="bk-2col">
          {kit.taglines.map((t, i) => {
            const sel = i === tagSel;
            return (
              <button key={i} onClick={() => setTagSel(i)} style={{ textAlign: "left", cursor: "pointer", borderRadius: 14, padding: "20px 22px", border: "1.5px solid", borderColor: sel ? "var(--accent)" : "var(--border)", background: sel ? "var(--accent-softer)" : "var(--surface-raised)", position: "relative", transition: "border-color 150ms, background 150ms" }}>
                <span style={{ position: "absolute", top: 18, right: 18, width: 20, height: 20, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: sel ? "var(--accent)" : "transparent", border: sel ? "none" : "1.5px solid var(--border-strong)", color: "#fff" }}>{sel && <Icons.check size={12} />}</span>
                <div style={{ fontFamily: display, fontStyle: dI?"italic":"normal", fontWeight: dW, fontSize: 22, lineHeight: 1.15, color: "var(--text-primary)", paddingRight: 30 }}>{t.text}</div>
                <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.55, margin: "12px 0 0" }}>{t.rationale}</p>
              </button>
            );
          })}
        </div>
        {/* description */}
        <div style={{ marginTop: 14, border: "1px solid var(--border)", borderRadius: 14, background: "var(--surface)", padding: "18px 20px" }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div className="row gap12" style={{ alignItems: "center" }}>
              <BkLabel>Description</BkLabel>
              <div className="row gap2" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 9, padding: 3 }}>
                {lenOpts.map(([k, lbl]) => (
                  <button key={k} onClick={() => setLen(k)} style={{ border: "none", borderRadius: 6, padding: "5px 11px", fontSize: 12, fontWeight: 500, cursor: "pointer", background: len === k ? "var(--background)" : "transparent", color: len === k ? "var(--text-primary)" : "var(--text-secondary)", boxShadow: len === k ? "var(--shadow-card)" : "none" }}>{lbl}</button>
                ))}
              </div>
            </div>
            <button onClick={copyDesc} className="iconbtn" title="Copy description">{descCopied ? <Icons.check size={15} /> : <Icons.doc size={15} />}</button>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, margin: "16px 0 0", color: "var(--text-primary)" }}>{kit.description[len]}</p>
        </div>
      </BkSection>

      {/* ---------------- 02 visual identity ---------------- */}
      <BkSection n="02" kicker="Visual identity" title={kit.identity_title} desc={kit.identity_desc}>
        <BkLabel>Logo concepts · {kit.logo_concepts.length}</BkLabel>
        <div className="bk-2col" style={{ marginTop: 12 }}>
          {kit.logo_concepts.map((c, i) => {
            const sel = i === markSel;
            return (
              <button key={c.key} onClick={() => setMarkSel(i)} style={{ textAlign: "left", cursor: "pointer", borderRadius: 14, overflow: "hidden", border: "1.5px solid", borderColor: sel ? "var(--accent)" : "var(--border)", background: "var(--surface-raised)", padding: 0, boxShadow: sel ? "0 0 0 3px var(--accent-softer)" : "none", transition: "border-color 150ms" }}>
                <div style={{ background: paper, height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {c.key === "wordmark"
                    ? <span style={{ fontFamily: display, fontStyle: dI?"italic":"normal", fontWeight: dW, fontSize: 30, letterSpacing: "0.04em", color: brand }}>{kit.hero.wordmark.toLowerCase()}</span>
                    : <BrandMark kind={c.key} color={brand} size={62} sw={5} />}
                </div>
                <div style={{ padding: "13px 15px 15px" }}>
                  <div className="row gap8" style={{ alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</span>
                    {sel && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-text)" }}>Selected</span>}
                  </div>
                  <p className="muted" style={{ fontSize: 12, lineHeight: 1.5, margin: "5px 0 0" }}>{c.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <BkLabel>Palette · {kit.palette.length} colors</BkLabel>
        <div className="bk-pal" style={{ marginTop: 12 }}>
          {kit.palette.map(c => <BkSwatch key={c.hex} c={c} ink={ink} paper={paper} />)}
        </div>

        <div style={{ marginTop: 22 }}><BkLabel>Type system</BkLabel></div>
        <div className="col gap12" style={{ marginTop: 12 }}>
          {kit.type.map((t, i) => (
            <div key={i} className="bk-type-row" style={{ border: "1px solid var(--border)", borderRadius: 14, background: "var(--surface)", padding: 18 }}>
              <div>
                <BkLabel>{t.role}</BkLabel>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>{t.font}</div>
                <div className="faint" style={{ fontSize: 12, marginTop: 1 }}>{t.weight}</div>
                <p className="muted" style={{ fontSize: 12, lineHeight: 1.5, margin: "12px 0 0" }}>{t.note}</p>
              </div>
              <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 22px", display: "flex", alignItems: "center" }}>
                <div style={{ fontFamily: t.stack, fontStyle: t.italic ? "italic" : "normal", fontWeight: t.weightCss || 400, fontSize: t.big ? 32 : t.mono ? 14 : 17, lineHeight: 1.25, color: "var(--text-primary)", whiteSpace: "pre-line" }}>{t.specimen}</div>
              </div>
            </div>
          ))}
        </div>
      </BkSection>

      {/* ---------------- 03 voice & tone ---------------- */}
      <BkSection n="03" kicker="Voice & tone" title={kit.voice_title} desc={kit.voice_desc}>
        <div className="bk-2col">
          <BkVoiceCard tone="good" title="Sounds like" items={kit.voice_sounds} />
          <BkVoiceCard tone="bad" title="Doesn't sound like" items={kit.voice_avoid} />
        </div>
        {/* word dna */}
        <div style={{ marginTop: 14, border: "1px solid var(--border)", borderRadius: 14, background: "var(--surface)", overflow: "hidden" }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center", padding: "15px 18px", borderBottom: "1px solid var(--border)" }}>
            <BkLabel>Word DNA · {kit.word_dna.length} swaps</BkLabel>
            <span className="faint" style={{ fontSize: 11.5 }}>Hatchly enforces these in generated copy</span>
          </div>
          <div className="row" style={{ padding: "9px 18px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            <span style={{ flex: "0 0 26%" }}>Use</span><span style={{ flex: "0 0 28%" }}>Instead of</span><span style={{ flex: 1 }}>Why</span>
          </div>
          {kit.word_dna.map((w, i) => (
            <div key={i} className="row" style={{ padding: "13px 18px", fontSize: 13, borderTop: "1px solid var(--border)", alignItems: "baseline" }}>
              <span style={{ flex: "0 0 26%", fontWeight: 600, color: USE_GREEN }}>{w.use}</span>
              <span style={{ flex: "0 0 28%", color: accent, textDecoration: "line-through", opacity: 0.85 }}>{w.instead}</span>
              <span className="muted" style={{ flex: 1, fontSize: 12.5, lineHeight: 1.45 }}>{w.why}</span>
            </div>
          ))}
        </div>
      </BkSection>

      {/* ---------------- 04 in the wild ---------------- */}
      <BkSection n="04" kicker="In the wild" title="Applied across surfaces" desc="Hatchly applies the brand to the launch artifacts automatically — landing copy, app icon, social cards. Edit the kit above, these re-render.">
        <div className="bk-wild">
          {/* landing */}
          <div style={{ background: paper, color: ink, borderRadius: 16, padding: "26px 28px 30px", minHeight: 360, display: "flex", flexDirection: "column", border: "1px solid var(--border)" }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <BrandLockup kit={kit} markKey={markKey} color={brand} size={16} />
              <div className="row gap14" style={{ fontSize: 12, color: ink, opacity: 0.6 }}>{kit.wild.nav.map(n => <span key={n}>{n}</span>)}</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "26px 0" }}>
              <div style={{ fontFamily: display, fontStyle: dI?"italic":"normal", fontWeight: dW, fontSize: 36, lineHeight: 1.05, color: brand, maxWidth: 380 }}>{kit.hero.headline}</div>
              <p style={{ fontSize: 12.5, lineHeight: 1.6, color: ink, opacity: 0.7, margin: "18px 0 0", maxWidth: 320 }}>{kit.wild.landing_blurb}</p>
              <div className="row gap10" style={{ marginTop: 22 }}>
                <span style={{ background: accent, color: onP, fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 999 }}>{kit.wild.primary_cta}</span>
                <span style={{ border: `1px solid ${brand}`, color: brand, fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 999 }}>{kit.wild.secondary_cta}</span>
              </div>
            </div>
          </div>
          {/* right column: app icon + card */}
          <div className="col gap14">
            <div style={{ background: brand, borderRadius: 22, aspectRatio: "1 / 1", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-card)" }}>
              <BrandMark kind={markKey === "wordmark" ? "rhythm" : markKey} color={onP} size={78} sw={5} />
            </div>
            <div style={{ background: paper, color: ink, borderRadius: 16, padding: "18px 20px", border: "1px solid var(--border)" }}>
              <BrandMark kind={markKey === "wordmark" ? "rhythm" : markKey} color={brand} size={26} sw={6} />
              <div style={{ fontFamily: display, fontStyle: dI?"italic":"normal", fontWeight: dW, fontSize: 22, color: brand, marginTop: 18 }}>{kit.wild.card_name}</div>
              <div style={{ fontSize: 11.5, color: ink, opacity: 0.6, marginTop: 6 }}>{kit.wild.card_role}</div>
              <div className="mono" style={{ fontSize: 11, color: ink, opacity: 0.55, marginTop: 3 }}>{kit.wild.card_contact}</div>
            </div>
          </div>
        </div>
        {/* social card */}
        <div style={{ marginTop: 14, background: brand, color: onP, borderRadius: 16, padding: "40px 40px 34px", minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <BrandLockup kit={kit} markKey={markKey} color={onP} size={16} />
          <div style={{ fontFamily: display, fontStyle: dI?"italic":"normal", fontWeight: dW, fontSize: 34, lineHeight: 1.18, maxWidth: 560, marginTop: 28 }}>
            {kit.wild.social_pre}<span style={{ color: accent }}>{kit.wild.social_em}</span>{kit.wild.social_post}
          </div>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.12em", opacity: 0.6, marginTop: 28 }}>{kit.wild.social_footer}</div>
        </div>
      </BkSection>

      {/* ---------------- 05 reasoning ---------------- */}
      <BkSection n="05" kicker="Reasoning" title="Why these choices?" desc="Every decision in this kit is anchored to something in your memory or validation report. Click any source to revisit.">
        <div className="bk-2col" style={{ border: "1px solid var(--border)", borderRadius: 14, background: "var(--surface)", padding: 22, gap: 28 }}>
          <div>
            <BkLabel>Themes the kit draws from</BkLabel>
            <div className="row gap8" style={{ flexWrap: "wrap", marginTop: 12 }}>
              {kit.reasoning.themes.map(t => <span key={t} style={{ fontSize: 12.5, fontWeight: 500, color: "var(--accent-text)" }}>{t}</span>)}
            </div>
            <div style={{ marginTop: 24 }}><BkLabel>Validation scores anchored</BkLabel></div>
            <div className="col gap10" style={{ marginTop: 14 }}>
              {kit.reasoning.scores.map(s => (
                <div key={s.label} className="row gap12" style={{ alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, width: 110, flex: "none", color: "var(--text-secondary)" }}>{s.label}</span>
                  <div className="progress" style={{ flex: 1 }}><span style={{ width: s.value + "%" }}></span></div>
                  <span className="mono" style={{ fontSize: 12.5, width: 24, textAlign: "right", fontWeight: 600 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <BkLabel>Memory items used · {kit.reasoning.memory.length}</BkLabel>
            <div className="col gap8" style={{ marginTop: 12 }}>
              {kit.reasoning.memory.map((m, i) => {
                const I = BK_MEM_ICON[m.icon] || Icons.sparkle;
                return (
                  <button key={i} className="row gap10" style={{ width: "100%", textAlign: "left", alignItems: "center", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface-raised)", cursor: "pointer" }}>
                    <span style={{ width: 26, height: 26, borderRadius: 7, flex: "none", background: "var(--accent-soft)", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}><I size={14} /></span>
                    <span style={{ flex: 1, fontSize: 13 }}>{m.label}</span>
                    <span className="faint"><Icons.chevR size={15} /></span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </BkSection>

      {/* ---------------- 06 domains (BrandBucket) ---------------- */}
      <BkSection n="06" kicker="The name" title="Claim the domain" desc="Curated to your positioning and ICP — not a storefront. Surfaced only here, once the idea has a clear shape.">
        <div className="row gap8" style={{ marginBottom: 14 }}><Pill accent style={{ fontSize: 10 }}>via BrandBucket</Pill></div>
        <div className="col gap10">
          {idea.domains.map(d => (
            <div key={d.name} className="row gap14" style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12, alignItems: "center", background: "var(--surface-raised)" }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", flex: "none" }}><Icons.globe size={17} /></span>
              <div style={{ flex: 1 }}>
                <div className="row gap8" style={{ alignItems: "baseline" }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{d.name}</span>
                  {d.status === "viewed" && <span className="faint" style={{ fontSize: 11 }}>· viewed</span>}
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 2, maxWidth: 440 }}>{d.fit_reason}</div>
              </div>
              <Pill style={{ fontWeight: 600 }}>${d.price.toLocaleString()}</Pill>
              <Btn variant="soft" size="sm" onClick={() => onOpenDomain(d)}>View</Btn>
            </div>
          ))}
        </div>
      </BkSection>
    </div>
  );
}

/* ---------- phone mockup ---------- */
function BkPhone({ kit, brand, onP, accent }) {
  const line = "color-mix(in srgb, " + onP + " 18%, transparent)";
  const fill = "color-mix(in srgb, " + onP + " 9%, transparent)";
  return (
    <div style={{ width: 244, borderRadius: 30, background: brand, border: `1px solid ${line}`, padding: 18, boxShadow: "0 30px 60px rgba(0,0,0,0.35)", color: onP }}>
      <div className="row" style={{ justifyContent: "space-between", fontSize: 11, opacity: 0.55, padding: "0 4px 14px" }}>
        <span className="mono">9:41</span><Icons.dots size={15} />
      </div>
      <div style={{ fontFamily: kit.type[0].stack, fontStyle: kit.type[0].italic ? "italic" : "normal", fontWeight: kit.type[0].weightCss || (kit.type[0].italic ? 400 : 700), fontSize: 24, lineHeight: 1.1 }}>{kit.phone.greeting}</div>
      <p style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.72, margin: "12px 0 18px" }}>{kit.phone.body}</p>
      <div className="col gap8">
        {kit.phone.items.map((it, i) => (
          <div key={i} className="row" style={{ justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 11, background: it.active ? fill : "transparent", border: `1px solid ${line}` }}>
            <span style={{ fontSize: 13, fontWeight: it.active ? 600 : 500 }}>{it.label}</span>
            <span className="mono" style={{ fontSize: 10.5, opacity: 0.55 }}>{it.time}</span>
          </div>
        ))}
      </div>
      <div className="row gap8" style={{ justifyContent: "center", alignItems: "center", marginTop: 16, background: accent, color: onP, borderRadius: 999, padding: "12px 0", fontSize: 13, fontWeight: 600 }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: onP }}></span>{kit.phone.cta}
      </div>
    </div>
  );
}

/* ---------- voice column card ---------- */
function BkVoiceCard({ tone, title, items }) {
  const good = tone === "good";
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 14, background: "var(--surface)", padding: "20px 22px" }}>
      <div className="row gap8" style={{ alignItems: "center", color: good ? "var(--success-text)" : "var(--danger-text)" }}>
        {good ? <Icons.check size={15} /> : <Icons.x size={15} />}
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</span>
      </div>
      <div className="col gap16" style={{ marginTop: 18 }}>
        {items.map((it, i) => (
          <div key={i}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{it.label}</div>
            <div className="muted italic" style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 3 }}>{it.ex}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { BrandTab });
