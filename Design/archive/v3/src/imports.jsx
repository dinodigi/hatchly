// ===== Imported ideas — "the Seal": mine ideas from the founder's own AI chats =====

/* ---------- the mining prompt (editable intent + locked schema) ---------- */
const PROMPT_INTENT_DEFAULT =
`Scan this conversation (and any I paste) for distinct product or
business ideas I've explored. Include half-formed ones. Focus on
the last 6 months. Return at most 15, strongest first.`;

const PROMPT_SCHEMA =
`# LOCKED — do not change; Hatchly needs this exact format
Output ONLY a single block in this exact shape, nothing before or after.
Use plain JSON. Do NOT base64-encode. Group ideas into 2–5 named clusters
by theme. Obey the caps. If there are more than 15 ideas, return the best
15 and set "more_available": true.

Caps: name ≤40 chars · one_liner ≤100 · ≤5 memories, each ≤140 chars.

===HATCHLY SEAL v1===
{
  "v": 1,
  "idea_count": <number of ideas below>,
  "more_available": false,
  "clusters": ["...", "..."],
  "ideas": [
    {
      "name": "...",
      "one_liner": "...",
      "cluster": "...",
      "confidence": "high|medium|low",
      "tags": ["...", "..."],
      "memories": ["short fact", "short fact"]
    }
  ]
}
===END SEAL===`;

const buildPrompt = (intent) => `# EDITABLE — the user can tune this part\n${intent}\n\n${PROMPT_SCHEMA}`;

// a realistic sample the demo user can drop into step 2
const EXAMPLE_SEAL = `Sure — here's everything I found across our chats:

===HATCHLY SEAL v1===
{
  "v": 1,
  "idea_count": 6,
  "more_available": true,
  "clusters": ["Founder tools", "Local commerce", "Health"],
  "ideas": [
    { "name": "Threadback", "one_liner": "Turns your old Slack threads into a searchable decision log.", "cluster": "Founder tools", "confidence": "high", "tags": ["saas","productivity","ai"],
      "memories": ["Keeps re-litigating settled decisions","Wants a 'why did we do this' search","Would pay per seat for a small team"] },
    { "name": "Warmly", "one_liner": "Auto-drafts intro emails from your CRM in your own voice.", "cluster": "Founder tools", "confidence": "medium", "tags": ["saas","ai","sales"],
      "memories": ["Hates writing the same intro 5x","Tone matters more than speed"] },
    { "name": "Corner", "one_liner": "A standing weekly order from one nearby restaurant.", "cluster": "Local commerce", "confidence": "medium", "tags": ["marketplace","local","food"],
      "memories": ["Likes the regular-at-a-spot feeling","Delivery apps feel transactional"] },
    { "name": "Stoop", "one_liner": "Hyper-local stoop sales, mapped and notified.", "cluster": "Local commerce", "confidence": "low", "tags": ["marketplace","local"],
      "memories": ["Loves a neighborhood treasure hunt","Liability + flaky sellers worry me"] },
    { "name": "Taper", "one_liner": "Caffeine tracker that nudges you down, not off.", "cluster": "Health", "confidence": "high", "tags": ["mobile_app","health","consumer"],
      "memories": ["Quitting cold turkey always fails","Wants a gentle schedule, not shame","Apple Health integration is table stakes"] },
    { "name": "Mend", "one_liner": "Find a tailor for one garment, by photo.", "cluster": "Local commerce", "confidence": "low", "tags": ["marketplace","local","service"],
      "memories": ["Has a drawer of clothes that need small fixes"] }
  ]
}
===END SEAL===

Let me know if you want me to pull more — there were a few weaker ones I left out.`;

/* ---------- parser: robust, lenient ---------- */
function parseSeal(raw) {
  if (!raw || !raw.trim()) return { status: "empty" };
  const m = raw.match(/===\s*HATCHLY SEAL v1\s*===([\s\S]*?)===\s*END SEAL\s*===/i);
  if (!m) return { status: "no_seal" };
  let json;
  try { json = JSON.parse(m[1].trim()); }
  catch (e) { return { status: "bad_json" }; }
  const all = Array.isArray(json.ideas) ? json.ideas : [];
  const ideas = all.filter(x => x && typeof x.name === "string" && x.name.trim() && typeof x.one_liner === "string" && x.one_liner.trim());
  if (ideas.length === 0) return { status: "no_seal" };
  const declared = Number.isFinite(json.idea_count) ? json.idea_count : ideas.length;
  let clusters = Array.isArray(json.clusters) && json.clusters.length ? json.clusters.slice() : [];
  ideas.forEach(i => { if (i.cluster && !clusters.includes(i.cluster)) clusters.push(i.cluster); });
  if (!clusters.length) clusters = ["Ideas"];
  const status = declared !== ideas.length ? "partial" : "parsed";
  return { status, declared, parsed: ideas.length, dropped: declared - ideas.length, clusters, ideas, more: !!json.more_available };
}

function archFromTags(tags = []) {
  const t = tags.map(x => String(x).toLowerCase());
  if (t.includes("marketplace")) return "marketplace";
  if (t.includes("ecom") || t.includes("subscription") || t.includes("commerce")) return "physical_ecom";
  if (t.includes("mobile_app") || t.includes("mobile")) return "mobile_app";
  if (t.includes("content") || t.includes("creator")) return "content";
  if (t.includes("service")) return "service";
  if (t.includes("saas") || t.includes("ai") || t.includes("productivity")) return "saas";
  return null;
}

const CONF = {
  high: { band: "strong", label: "High" },
  medium: { band: "moderate", label: "Medium" },
  low: { band: "weak", label: "Low" },
};

/* ---------- import wizard (3 steps) ---------- */
function WizardSteps({ step }) {
  const labels = ["Copy prompt", "Paste the seal", "Review"];
  return (
    <div className="row gap8" style={{ alignItems: "center" }}>
      {labels.map((l, i) => {
        const n = i + 1, done = n < step, cur = n === step;
        return (
          <React.Fragment key={l}>
            <div className="row gap6" style={{ alignItems: "center", color: cur ? "var(--text-primary)" : "var(--text-muted)" }}>
              <span style={{ width: 22, height: 22, borderRadius: 999, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, background: done ? "var(--accent)" : cur ? "var(--accent-soft)" : "var(--surface)", color: done ? "#fff" : cur ? "var(--accent-text)" : "var(--text-muted)", border: cur ? "none" : "1px solid var(--border)" }}>{done ? <Icons.check size={12} /> : n}</span>
              <span style={{ fontSize: 12.5, fontWeight: cur ? 600 : 500 }}>{l}</span>
            </div>
            {i < 2 && <div style={{ width: 24, height: 1, background: "var(--border-strong)" }}></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ImportWizard({ onClose, onImport }) {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState(PROMPT_INTENT_DEFAULT);
  const [showSchema, setShowSchema] = useState(false);
  const [copied, setCopied] = useState(false);
  const [raw, setRaw] = useState("");
  const [label, setLabel] = useState("ChatGPT · " + new Date().toLocaleDateString(undefined, { month: "short", year: "numeric" }));

  const res = parseSeal(raw);
  const canContinue2 = res.status === "parsed" || res.status === "partial";

  const copyPrompt = () => { try { navigator.clipboard?.writeText(buildPrompt(intent)); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1400); };
  const finish = () => { onImport(res, label); };

  return (
    <>
      <Scrim onClose={onClose} />
      <div className="modal" style={{ width: 640 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: "1px solid var(--border)" }}>
          <WizardSteps step={step} />
          <IconBtn onClick={onClose}><Icons.x size={18} /></IconBtn>
        </div>

        <div className="scrollarea" style={{ padding: 26, flex: 1 }}>
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div className="row gap8" style={{ marginBottom: 6 }}><span style={{ color: "var(--accent-text)" }}><Icons.sparkle size={17} /></span><h2 style={{ fontSize: 21, margin: 0 }}>Mine ideas from your chats</h2></div>
              <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, margin: "0 0 20px" }}>Your AI already heard every idea you've talked through. Copy this prompt, run it in your own tool, and bring the result back — your chats never leave your hands.</p>

              <SectionLabel style={{ marginBottom: 8 }}>What to look for <span className="faint" style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>· editable</span></SectionLabel>
              <textarea className="field mono" value={intent} onChange={e => setIntent(e.target.value)} rows={4} style={{ resize: "vertical", fontSize: 12.5, lineHeight: 1.6 }}></textarea>

              <button onClick={() => setShowSchema(s => !s)} className="row gap6" style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 12.5, marginTop: 14, cursor: "pointer", padding: 0 }}>
                <Icons.lock size={13} /> Output format <span className="faint">(locked — the parser needs it)</span> <Icons.chevD size={14} style={{ transform: showSchema ? "rotate(180deg)" : "none", transition: "transform 160ms" }} />
              </button>
              {showSchema && <pre style={{ margin: "10px 0 0", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", fontFamily: "'Geist Mono', monospace", fontSize: 11, lineHeight: 1.6, color: "var(--text-muted)", whiteSpace: "pre-wrap", maxHeight: 200, overflow: "auto" }}>{PROMPT_SCHEMA}</pre>}

              <div style={{ marginTop: 22, padding: "16px 18px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
                <div className="row gap10" style={{ alignItems: "center" }}>
                  <Btn variant="primary" onClick={copyPrompt} style={{ minWidth: 150 }}>{copied ? <><Icons.check size={15} /> Copied</> : <><Icons.doc size={15} /> Copy prompt</>}</Btn>
                  <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.45 }}>Paste it into ChatGPT, Claude, or Gemini — then bring the result back here.</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 21, margin: "0 0 6px" }}>Paste what it gave you</h2>
              <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, margin: "0 0 16px" }}>Drop in everything the model returned — Hatchly finds the seal even if there's chatter around it.</p>

              <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={9} placeholder={"Paste the full reply here, including the\n===HATCHLY SEAL v1=== … ===END SEAL=== lines."}
                className="field mono" style={{ resize: "vertical", fontSize: 12, lineHeight: 1.6, borderStyle: raw ? "solid" : "dashed", borderColor: res.status === "no_seal" || res.status === "bad_json" ? "var(--danger)" : (canContinue2 ? "var(--success)" : "var(--border-strong)") }}></textarea>

              <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 12 }}>
                <div style={{ minHeight: 20, flex: 1 }}><SealStatus res={res} /></div>
                <button onClick={() => setRaw(EXAMPLE_SEAL)} className="row gap5" style={{ background: "none", border: "none", color: "var(--accent-text)", fontSize: 12, cursor: "pointer", flex: "none", whiteSpace: "nowrap" }}><Icons.sparkle size={12} /> Use a sample seal</button>
              </div>
            </div>
          )}

          {/* STEP 3 — reveal */}
          {step === 3 && <RevealStep res={res} label={label} setLabel={setLabel} />}
        </div>

        {/* footer */}
        <div className="row gap10" style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", alignItems: "center" }}>
          {step > 1 ? <Btn variant="ghost" onClick={() => setStep(step - 1)}><Icons.chevL size={15} /> Back</Btn> : <Btn variant="ghost" onClick={onClose}>Cancel</Btn>}
          <div className="spacer"></div>
          {step === 1 && <Btn variant="primary" onClick={() => setStep(2)}>I've run it — paste the seal <Icons.chevR size={15} /></Btn>}
          {step === 2 && <Btn variant="primary" disabled={!canContinue2} onClick={() => setStep(3)}>Continue <Icons.chevR size={15} /></Btn>}
          {step === 3 && <Btn variant="primary" onClick={finish}><Icons.sparkle size={15} /> Add {res.parsed} to Imported ideas</Btn>}
        </div>
      </div>
    </>
  );
}

function SealStatus({ res }) {
  if (res.status === "empty") return <span className="faint" style={{ fontSize: 12.5 }}>Waiting for a paste…</span>;
  if (res.status === "no_seal") return <span style={{ fontSize: 12.5, color: "var(--danger-text)" }}>Couldn't find a Hatchly seal — copy the whole block, including the <span className="mono">===HATCHLY SEAL===</span> lines.</span>;
  if (res.status === "bad_json") return <span style={{ fontSize: 12.5, color: "var(--danger-text)" }}>Found the seal but the JSON looks corrupted — try re-pasting.</span>;
  if (res.status === "partial") return <span className="row gap6" style={{ fontSize: 12.5, color: "var(--accent-text)" }}><Icons.alert size={14} /> Looks cut off — got {res.parsed} of {res.declared}. Re-paste, or import these {res.parsed}.</span>;
  return <span className="row gap6" style={{ fontSize: 12.5, color: "var(--success-text)" }}><Icons.check size={14} /> Found {res.parsed} idea{res.parsed !== 1 ? "s" : ""} in {res.clusters.length} cluster{res.clusters.length !== 1 ? "s" : ""}.</span>;
}

function RevealStep({ res, label, setLabel }) {
  const byCluster = res.clusters.map(c => ({ cluster: c, items: res.ideas.filter(i => (i.cluster || res.clusters[0]) === c) })).filter(g => g.items.length);
  let idx = 0;
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent-soft)", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", animation: "scaleIn 420ms cubic-bezier(.22,1,.36,1)" }}><Icons.sparkle size={24} /></div>
        <h2 className="serif italic" style={{ fontSize: 27, margin: "0 0 4px", fontWeight: 400 }}>{res.parsed} ideas crystallized</h2>
        <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>Pulled out of the chaos of your chats{res.more ? " — and there are more where these came from." : "."}</p>
      </div>

      {res.status === "partial" && <div className="row gap8" style={{ alignItems: "center", padding: "10px 14px", background: "var(--accent-softer)", borderRadius: 10, marginBottom: 16, fontSize: 12.5, color: "var(--accent-text)" }}><Icons.alert size={14} /> The paste looked cut off — importing the {res.parsed} that came through cleanly.</div>}

      <div className="col gap18">
        {byCluster.map(g => (
          <div key={g.cluster}>
            <div className="row gap8" style={{ marginBottom: 10 }}><SectionLabel>{g.cluster}</SectionLabel><span className="faint" style={{ fontSize: 11 }}>{g.items.length}</span><div className="hr" style={{ flex: 1 }}></div></div>
            <div className="col gap8">
              {g.items.map(it => {
                const c = CONF[it.confidence] || CONF.medium;
                const delay = (idx++) * 80;
                return (
                  <div key={it.name} className="row gap10" style={{ alignItems: "flex-start", padding: "11px 14px", border: "1px solid var(--border)", borderRadius: 11, background: "var(--surface-raised)", opacity: 0, animation: "fadeUp 460ms cubic-bezier(.22,1,.36,1) forwards", animationDelay: delay + "ms" }}>
                    <StatusDot band={c.band} size={8} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{it.name}</div>
                      <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.45 }}>{it.one_liner}</div>
                    </div>
                    <span className="faint mono" style={{ fontSize: 10.5, flex: "none", paddingTop: 2 }}>{(it.memories || []).length}m</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <label className="label">Label this import</label>
        <input className="field" value={label} onChange={e => setLabel(e.target.value)} />
      </div>
    </div>
  );
}

/* ---------- imported-ideas staging view (dashboard tab) ---------- */
function ImportedIdeaCard({ item, batch, ideas, onConvert, onQuickLook, go }) {
  const c = CONF[item.confidence] || CONF.medium;
  const converted = item.status === "converted";
  const dup = !converted && ideas.some(i => !i.archived && i.name.toLowerCase() === item.name.toLowerCase());
  return (
    <Card style={{ padding: 18, opacity: converted ? 0.62 : 1, display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="row gap8" style={{ alignItems: "center" }}>
          <StatusDot band={c.band} size={9} />
          <span className="faint" style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.label} signal</span>
        </div>
        {dup && <Pill style={{ fontSize: 10, color: "var(--accent-text)", background: "var(--accent-soft)", border: "none" }}>possible dup</Pill>}
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 3 }}>{item.name}</div>
        <div className="muted clamp2" style={{ fontSize: 13, lineHeight: 1.5 }}>{item.one_liner}</div>
      </div>
      <div className="row gap6" style={{ flexWrap: "wrap" }}>
        {(item.tags || []).slice(0, 3).map(t => <Pill key={t} style={{ fontSize: 10.5 }}>{t}</Pill>)}
      </div>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <span className="faint" style={{ fontSize: 11.5 }}>{(item.extracted_memories || []).length} memories</span>
        {converted
          ? <Btn variant="ghost" size="sm" onClick={() => item.converted_idea_id && go({ screen: "workspace", ideaId: item.converted_idea_id, tab: "overview" })}>Open project <Icons.chevR size={14} /></Btn>
          : <div className="row gap6">
              <Btn variant="ghost" size="sm" onClick={() => onQuickLook(item)}>Quick look</Btn>
              <Btn variant="soft" size="sm" onClick={() => onConvert(item.id)}><Icons.plus size={13} /> Convert</Btn>
            </div>}
      </div>
    </Card>
  );
}

function ImportedView({ batches, importedIdeas, ideas, onOpenWizard, onConvert, onQuickLook, onRestore, go }) {
  const [showDismissed, setShowDismissed] = useState(false);
  const live = importedIdeas.filter(i => i.status !== "dismissed");
  const dismissed = importedIdeas.filter(i => i.status === "dismissed");

  if (importedIdeas.length === 0) {
    return (
      <div style={{ padding: "30px 0" }}>
        <Empty icon={Icons.sparkle} title="Mine your first ideas" body="Pull the ideas you've already talked through with ChatGPT, Claude, or Gemini into Hatchly — no integration, your chats stay yours."
          action={<Btn variant="primary" onClick={onOpenWizard}><Icons.plus size={15} /> Import ideas</Btn>} />
      </div>
    );
  }

  const clusters = [];
  live.forEach(i => { if (!clusters.includes(i.cluster_label)) clusters.push(i.cluster_label); });
  const batchById = Object.fromEntries(batches.map(b => [b.id, b]));
  const staged = live.filter(i => i.status === "staged").length;

  return (
    <div>
      {/* batches strip */}
      <div className="row gap10" style={{ flexWrap: "wrap", marginBottom: 22 }}>
        {batches.map(b => (
          <div key={b.id} className="row gap8" style={{ alignItems: "center", padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <span style={{ color: "var(--text-muted)" }}><Icons.doc size={14} /></span>
            <span style={{ fontSize: 12.5, fontWeight: 500 }}>{b.source_label}</span>
            <span className="faint" style={{ fontSize: 11.5 }}>· {b.parsed_count} ideas · {b.created_at}</span>
            {b.status === "partial" && <Pill style={{ fontSize: 10, color: "var(--accent-text)", background: "var(--accent-soft)", border: "none" }}>partial</Pill>}
          </div>
        ))}
      </div>

      {/* clusters */}
      <div className="col gap28">
        {clusters.map(cl => {
          const items = live.filter(i => i.cluster_label === cl);
          return (
            <div key={cl}>
              <div className="row gap10" style={{ marginBottom: 14, alignItems: "center" }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>{cl}</h3>
                <span className="faint" style={{ fontSize: 12 }}>{items.length}</span>
                <div className="hr" style={{ flex: 1 }}></div>
              </div>
              <Stagger className="grid" step={55} style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {items.map(it => <ImportedIdeaCard key={it.id} item={it} batch={batchById[it.batch_id]} ideas={ideas} onConvert={onConvert} onQuickLook={onQuickLook} go={go} />)}
              </Stagger>
            </div>
          );
        })}
      </div>

      {/* dismissed */}
      {dismissed.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <button onClick={() => setShowDismissed(s => !s)} className="row gap6" style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 12.5, cursor: "pointer", padding: 0 }}>
            <Icons.chevR size={14} style={{ transform: showDismissed ? "rotate(90deg)" : "none", transition: "transform 160ms" }} /> Dismissed · {dismissed.length}
          </button>
          {showDismissed && (
            <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 14 }}>
              {dismissed.map(it => (
                <Card key={it.id} style={{ padding: 16, opacity: 0.6 }}>
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{it.name}</div>
                    <Btn variant="ghost" size="sm" onClick={() => onRestore(it.id)}><Icons.restore size={13} /> Restore</Btn>
                  </div>
                  <div className="muted clamp2" style={{ fontSize: 12.5, marginTop: 4 }}>{it.one_liner}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- quick look drawer ---------- */
function ImportQuickLook({ item, batch, ideas, onClose, onConvert, onDismiss, go }) {
  if (!item) return null;
  const c = CONF[item.confidence] || CONF.medium;
  const converted = item.status === "converted";
  return (
    <>
      <Scrim onClose={onClose} />
      <div className="drawer" style={{ width: 440 }}>
        <DrawerHead title="Quick look" onClose={onClose} />
        <div className="scrollarea" style={{ padding: 22, flex: 1 }}>
          <div className="row gap8" style={{ marginBottom: 12 }}>
            <span className="row gap5" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: c.band === "strong" ? "var(--success-text)" : c.band === "weak" ? "var(--danger-text)" : "var(--accent-text)" }}><StatusDot band={c.band} size={7} />{c.label} signal</span>
            <Pill style={{ fontSize: 10 }}>{item.cluster_label}</Pill>
          </div>
          <h2 style={{ fontSize: 24, margin: "0 0 8px", letterSpacing: "-0.01em" }}>{item.name}</h2>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 18px" }}>{item.one_liner}</p>

          <div className="row gap6" style={{ flexWrap: "wrap", marginBottom: 20 }}>
            {(item.tags || []).map(t => <Pill key={t}>{t}</Pill>)}
            {item.suggested_archetype && <Pill accent style={{ textTransform: "capitalize" }}>{item.suggested_archetype.replace("_", " ")}</Pill>}
          </div>

          <SectionLabel style={{ marginBottom: 10 }}>Extracted memories · {(item.extracted_memories || []).length}</SectionLabel>
          <div className="col gap8">
            {(item.extracted_memories || []).map((m, i) => (
              <div key={i} className="row gap10" style={{ padding: "11px 12px", border: "1px solid var(--border)", borderRadius: 10, alignItems: "flex-start", background: "var(--surface-raised)" }}>
                <span style={{ color: "var(--text-muted)", marginTop: 1 }}><Icons.brain size={15} /></span>
                <span style={{ fontSize: 13, lineHeight: 1.5 }}>{m}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, padding: 12, background: "var(--surface)", borderRadius: 10 }}>
            <div className="row gap8" style={{ alignItems: "flex-start" }}><Avatar kind="ai" label="H" size={24} /><div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--text-secondary)" }}>Converting lands this in Ideation as a real project — name, one-liner, and these {(item.extracted_memories || []).length} memories already attached. From {batch ? batch.source_label : "your import"}.</div></div>
          </div>
        </div>
        <div className="row gap10" style={{ padding: 16, borderTop: "1px solid var(--border)", alignItems: "center" }}>
          {converted ? (
            <Btn variant="primary" onClick={() => { item.converted_idea_id && go({ screen: "workspace", ideaId: item.converted_idea_id, tab: "overview" }); }}>Open project <Icons.chevR size={15} /></Btn>
          ) : (
            <>
              <Btn variant="ghost" style={{ color: "var(--danger-text)" }} onClick={() => { onDismiss(item.id); onClose(); }}>Dismiss</Btn>
              <div className="spacer"></div>
              <Btn variant="primary" onClick={() => { onConvert(item.id); onClose(); }}><Icons.plus size={15} /> Convert to project</Btn>
            </>
          )}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { parseSeal, archFromTags, ImportWizard, ImportedView, ImportQuickLook, CONF });
