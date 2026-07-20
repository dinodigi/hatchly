// ===== Workspace tabs: Overview · Memory · Scorecard · Plan · Brand =====

const ACT_ICON = { score_changed:Icons.trend, memory_added:Icons.brain, link_captured:Icons.link, voice_added:Icons.voice, task_done:Icons.check, gate_unlocked:Icons.lock, phase_advanced:Icons.flag };

function TabHeader({ title, sub, right }) {
  return (
    <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-end", marginBottom:22, gap:14 }}>
      <div><h1 style={{ fontSize:26, margin:"0 0 4px", letterSpacing:"-0.02em", fontWeight:600 }}>{title}</h1>{sub && <p className="muted" style={{ margin:0, fontSize:13.5 }}>{sub}</p>}</div>
      {right}
    </div>
  );
}

function LockedTab({ title, body, progress }) {
  return (
    <div style={{ maxWidth:440, margin:"60px auto", textAlign:"center" }}>
      <div style={{ width:52, height:52, borderRadius:14, background:"var(--surface)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", color:"var(--text-muted)" }}><Icons.lock size={24}/></div>
      <h2 style={{ fontSize:20, margin:"0 0 8px", fontWeight:600 }}>{title}</h2>
      <p className="muted" style={{ fontSize:14, lineHeight:1.6, margin:"0 0 20px" }}>{body}</p>
      {progress!=null && (
        <div style={{ maxWidth:280, margin:"0 auto" }}>
          <div className="row" style={{ justifyContent:"space-between", fontSize:12, marginBottom:6 }}><span className="faint">Rubric filled</span><span style={{ fontWeight:600 }}>{progress}%</span></div>
          <ProgressBar value={progress}/>
        </div>
      )}
    </div>
  );
}

/* ---------------- OVERVIEW ---------------- */
function OverviewTab({ idea, go, openChat }) {
  const ideation = idea.phase==="ideation";
  const dims = idea.snapshot?.dimensions;
  const strongest = dims && [...dims].sort((a,b)=>b.value-a.value)[0];
  const weakest = dims && [...dims].sort((a,b)=>a.value-b.value)[0];
  return (
    <div>
      <TabHeader title="Overview" sub="The command center for this idea — and the single most useful next move."/>
      <Stagger className="col gap14">
        {/* what's next */}
        <Card style={{ borderColor:"var(--accent)", borderWidth:1.5, background:"var(--accent-softer)" }}>
          <div className="row gap8" style={{ marginBottom:8 }}>
            <span style={{ color:"var(--accent-text)" }}><Icons.sparkle size={16}/></span>
            <SectionLabel style={{ color:"var(--accent-text)" }}>What's next</SectionLabel>
          </div>
          <div style={{ fontSize:16, lineHeight:1.5, fontWeight:500, marginBottom:14, maxWidth:620 }}>{idea.next_move}</div>
          <Btn variant="primary" size="sm" onClick={openChat}><Icons.sparkle size={14}/> Work on it in chat</Btn>
        </Card>

        {/* metrics row */}
        <div className="grid gap14" style={{ gridTemplateColumns:"1.1fr 1fr 1fr" }}>
          <Card className="row gap16" style={{ alignItems:"center" }}>
            {ideation
              ? <ScoreRing value={idea.completeness} size={84} color="var(--accent)" label="shaped"/>
              : <ScoreRing value={idea.current_score} size={84} label={`v${idea.snapshot.version}`}/>}
            <div>
              <SectionLabel style={{ marginBottom:6 }}>{ideation?"Completeness":"Overall score"}</SectionLabel>
              <PhaseBadge phase={idea.phase}/>
              <div className="faint" style={{ fontSize:12, marginTop:8 }}>{ideation?`${idea.dimsWithSignal||5} of 13 dimensions have signal`:idea.snapshot.inputs}</div>
            </div>
          </Card>
          {ideation ? (
            <Card style={{ gridColumn:"span 2" }}>
              <SectionLabel style={{ marginBottom:10 }}>What I still need to know</SectionLabel>
              <div className="col gap8">
                {["Who exactly is this for, in one sentence","How it'll make money","Who you're really up against"].map((t,i)=>(
                  <div key={i} className="row gap8" style={{ fontSize:13.5 }}><StatusDot color="var(--text-muted)"/> {t}</div>
                ))}
              </div>
            </Card>
          ) : (
            <>
              <MetricCard label="Strongest" dim={strongest} band="strong"/>
              <MetricCard label="Weakest" dim={weakest} band="weak"/>
            </>
          )}
        </div>

        {/* activity feed */}
        <Card>
          <SectionLabel style={{ marginBottom:14 }}>Recent activity</SectionLabel>
          <div className="col gap2">
            {idea.activity.map((a,i)=>{ const I = ACT_ICON[a.type]||Icons.dots; return (
              <div key={i} className="row gap12" style={{ padding:"10px 0", borderBottom: i<idea.activity.length-1?"1px solid var(--border)":"none", alignItems:"center" }}>
                <span style={{ width:30, height:30, borderRadius:8, background:"var(--surface)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-secondary)", flex:"none" }}><I size={15}/></span>
                <div style={{ flex:1, fontSize:13.5 }}>{a.summary}</div>
                <span className="faint" style={{ fontSize:12 }}>{a.at}</span>
              </div>
            );})}
          </div>
        </Card>
      </Stagger>
    </div>
  );
}
function MetricCard({ label, dim, band }) {
  if (!dim) return <Card/>;
  return (
    <Card>
      <SectionLabel style={{ marginBottom:10 }}>{label}</SectionLabel>
      <div className="row gap8" style={{ alignItems:"baseline" }}>
        <span style={{ fontSize:28, fontWeight:600, letterSpacing:"-0.02em" }} className={`band-${dim.band||band}`}>{dim.value}</span>
        {dim.delta!=null && <Pill style={{ fontSize:11, color: dim.delta>=0?"var(--success-text)":"var(--danger-text)" }}>{dim.delta>=0?"+":""}{dim.delta}</Pill>}
      </div>
      <div style={{ fontSize:13.5, fontWeight:500, marginTop:4 }}>{dim.label}</div>
    </Card>
  );
}

/* ---------------- MEMORY ---------------- */
const TAG_LABEL = (t) => DIM[t]?.label || ({problem:"Problem",customer:"Customer",competitor:"Competitor",risk:"Risk",decision:"Decision",founder:"Founder",feature:"Feature"}[t] || t);

function MemoryTab({ idea, onEdit }) {
  const [tag, setTag] = useState("all");
  const [q, setQ] = useState("");
  const allTags = [...new Set(idea.memories.flatMap(m=>m.tags))];
  const filtered = idea.memories.filter(m =>
    (tag==="all"||m.tags.includes(tag)) && (q==="" || m.content.toLowerCase().includes(q.toLowerCase())));

  if (idea.memories.length===0) return <div><TabHeader title="Memory"/><Empty icon={Icons.brain} title="Nothing captured yet" body="Start talking in the chat and memories appear here — tagged and traceable."/></div>;

  return (
    <div>
      <TabHeader title="Memory" sub="What I know about this idea — browsable, traceable, and yours to correct."/>
      <div className="row gap10" style={{ marginBottom:16 }}>
        <div style={{ position:"relative", flex:1, maxWidth:320 }}>
          <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}><Icons.search size={15}/></span>
          <input className="field" style={{ paddingLeft:33 }} placeholder="Search memory…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
      </div>
      <div className="row gap6" style={{ marginBottom:18, flexWrap:"wrap" }}>
        <FilterChip active={tag==="all"} onClick={()=>setTag("all")}>All · {idea.memories.length}</FilterChip>
        {allTags.map(t=>(<FilterChip key={t} active={tag===t} onClick={()=>setTag(t)}>{TAG_LABEL(t)}</FilterChip>))}
      </div>
      <Stagger className="col gap10" step={50}>
        {filtered.map(m=>(
          <Card key={m.id} className="row gap14" style={{ alignItems:"flex-start", padding:16 }}>
            <SourceGlyph type={m.src}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, lineHeight:1.5, marginBottom:8 }}>{m.content}</div>
              <div className="row gap6" style={{ flexWrap:"wrap", alignItems:"center" }}>
                {m.tags.map(t=><Pill key={t} accent={!!DIM[t]} style={{ fontSize:10.5 }}>{TAG_LABEL(t)}</Pill>)}
                <span className="faint" style={{ fontSize:11, marginLeft:4 }}>·</span>
                <ConfBadge c={m.confidence}/>
                {m.edited && <span className="faint" style={{ fontSize:11 }}>· edited</span>}
              </div>
            </div>
            <div className="col gap4" style={{ alignItems:"flex-end" }}>
              <button className="row gap4 faint" style={{ fontSize:11.5, background:"none", border:"none", color:"var(--text-muted)" }} onClick={()=>onEdit(m)}><Icons.link size={12}/> {m.srcLabel}</button>
              <IconBtn style={{ width:26, height:26 }} onClick={()=>onEdit(m)} title="Edit memory"><Icons.edit size={14}/></IconBtn>
            </div>
          </Card>
        ))}
        {filtered.length===0 && <div className="faint" style={{ textAlign:"center", padding:30, fontSize:13 }}>No memories match.</div>}
      </Stagger>
    </div>
  );
}
function FilterChip({ active, onClick, children }) {
  return <button onClick={onClick} className="pill" style={{ cursor:"pointer", border:"1px solid", borderColor: active?"var(--text-muted)":"var(--border)", background: active?"var(--surface-raised)":"var(--surface)", color: active?"var(--text-primary)":"var(--text-secondary)", padding:"5px 11px" }}>{children}</button>;
}
function ConfBadge({ c }) {
  const col = c==="high"?"var(--success-text)":c==="medium"?"var(--accent-text)":"var(--text-muted)";
  return <span className="row gap4" style={{ fontSize:11, color:col }}><StatusDot color={col} size={6}/>{c} confidence</span>;
}

/* ---------------- SCORECARD ---------------- */
function ScorecardTab({ idea, onRegenerate, onAddTask }) {
  const [open, setOpen] = useState(null);
  if (idea.phase==="ideation") {
    const left = 13 - (idea.dimsWithSignal||5);
    return <div><TabHeader title="Scorecard"/><LockedTab title="Not unlocked yet" body={`Unlocks when your idea is clear enough to assess — about ${left} of 13 dimensions to go. Keep talking in the chat.`} progress={idea.completeness}/></div>;
  }
  const s = idea.snapshot;
  const ranked = [...s.dimensions].sort((a,b)=>b.value-a.value);
  return (
    <div>
      <TabHeader title="Scorecard" sub={`Version ${s.version} · ${s.inputs}`} right={<Btn variant="secondary" size="sm" onClick={onRegenerate}><Icons.sparkle size={14}/> Regenerate</Btn>}/>
      <Stagger className="col gap14">
        {/* headline */}
        <Card className="row gap24" style={{ alignItems:"center", flexWrap:"wrap" }}>
          <ScoreRing value={s.overall} size={112} stroke={8} label={`v${s.version}`}/>
          <div style={{ flex:1, minWidth:260 }}>
            <div className="row gap8" style={{ marginBottom:8 }}><PhaseBadge phase={idea.phase}/><ConfBadge c={s.confidence}/></div>
            <div className="serif italic" style={{ fontSize:23, lineHeight:1.3 }}>"{s.verdict}"</div>
          </div>
        </Card>

        {/* category scoreboard */}
        <div className="grid gap12" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
          {Object.entries(s.category_scores).map(([k,v])=>(
            <Card key={k} style={{ padding:16 }}>
              <div className="row" style={{ justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:600, textTransform:"capitalize" }}>{k}</span>
                <span style={{ fontSize:20, fontWeight:600 }} className={`band-${bandOf(v)}`}><CountUp to={v}/></span>
              </div>
              <ProgressBar value={v} color={v>=75?"var(--success)":v>=60?"var(--accent)":"var(--danger)"}/>
              <div className="faint" style={{ fontSize:11, marginTop:8 }}>{CATEGORIES[k]?.blurb}</div>
            </Card>
          ))}
        </div>

        {/* 13 dimensions ranked */}
        <Card>
          <SectionLabel style={{ marginBottom:14 }}>All 13 dimensions · ranked</SectionLabel>
          <div className="col">
            {ranked.map((d,i)=>(
              <div key={d.key}>
                <div className="row gap12" style={{ padding:"9px 0", cursor: d.evidence?"pointer":"default", alignItems:"center" }} onClick={()=>d.evidence&&setOpen(open===d.key?null:d.key)}>
                  <span className="faint mono" style={{ fontSize:11, width:18 }}>{String(i+1).padStart(2,"0")}</span>
                  <StatusDot band={d.band}/>
                  <span style={{ fontSize:13.5, fontWeight:500, width:150 }}>{d.label}</span>
                  <div style={{ flex:1 }}><ProgressBar value={d.value} color={d.band==="strong"?"var(--success)":d.band==="moderate"?"var(--accent)":"var(--danger)"}/></div>
                  <span style={{ fontSize:14, fontWeight:600, width:30, textAlign:"right" }} className={`band-${d.band}`}>{d.value}</span>
                  {d.delta!=null ? <span style={{ fontSize:11.5, width:34, textAlign:"right", color: d.delta>=0?"var(--success-text)":"var(--danger-text)" }}>{d.delta>=0?"+":""}{d.delta}</span> : <span style={{ width:34 }}/>}
                  {d.evidence ? <span style={{ color:"var(--text-muted)", transform:open===d.key?"rotate(90deg)":"none", transition:"transform 160ms" }}><Icons.chevR size={14}/></span> : <span style={{ width:14 }}/>}
                </div>
                {open===d.key && d.evidence && (
                  <div style={{ padding:"4px 0 16px 42px", animation:"fadeIn 200ms ease" }}>
                    <div className="grid gap16" style={{ gridTemplateColumns:"1fr 1fr" }}>
                      <DimList title="Evidence" items={d.evidence} color="var(--success-text)"/>
                      <DimList title="Risks" items={d.risks} color="var(--danger-text)"/>
                    </div>
                    {d.improvements?.length>0 && (
                      <div style={{ marginTop:12, padding:12, background:"var(--accent-softer)", borderRadius:10 }}>
                        <SectionLabel style={{ color:"var(--accent-text)", marginBottom:8 }}>Improve this</SectionLabel>
                        {d.improvements.map((im,j)=>(
                          <div key={j} className="row" style={{ justifyContent:"space-between", alignItems:"center", padding:"4px 0", gap:10 }}>
                            <span style={{ fontSize:13 }}>{im}</span>
                            <Btn variant="soft" size="sm" onClick={()=>onAddTask({ title:im, origin_ref:d.key })}><Icons.plus size={12}/> Add to plan</Btn>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {i<ranked.length-1 && <div className="hr"/>}
              </div>
            ))}
          </div>
        </Card>

        {/* SWOT */}
        <div className="grid gap12" style={{ gridTemplateColumns:"repeat(2,1fr)" }}>
          {[["strengths","Strengths","var(--success-text)"],["weaknesses","Weaknesses","var(--danger-text)"],["opportunities","Opportunities","var(--info-text)"],["threats","Threats","var(--accent-text)"]].map(([k,l,c])=>(
            <Card key={k} style={{ padding:16 }}>
              <SectionLabel style={{ color:c, marginBottom:10 }}>{l}</SectionLabel>
              <div className="col gap6">{s.swot[k].map((t,i)=><div key={i} className="row gap8" style={{ fontSize:13 }}><StatusDot color={c} size={6}/>{t}</div>)}</div>
            </Card>
          ))}
        </div>

        {/* competitors */}
        {s.competitors.length>0 && (
          <Card>
            <SectionLabel style={{ marginBottom:12 }}>Competitive landscape</SectionLabel>
            <div className="col gap8">
              {s.competitors.map((c,i)=>(
                <div key={i} className="row gap12" style={{ padding:"8px 0", borderBottom: i<s.competitors.length-1?"1px solid var(--border)":"none", alignItems:"center" }}>
                  <span style={{ fontSize:13.5, fontWeight:600, width:110 }}>{c.name}</span>
                  <Pill style={{ fontSize:10.5 }}>{c.stance}</Pill>
                  <span className="muted" style={{ fontSize:13, flex:1 }}>{c.gap}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* action plan */}
        {s.action_plan.length>0 && (
          <Card>
            <SectionLabel style={{ marginBottom:12 }}>Top action plan</SectionLabel>
            <div className="col gap8">
              {s.action_plan.map((a,i)=>(
                <div key={i} className="row gap12" style={{ alignItems:"center" }}>
                  <span className="mono faint" style={{ fontSize:12, width:16 }}>{i+1}</span>
                  <div style={{ flex:1, fontSize:13.5 }}>{a.text}</div>
                  <Pill style={{ fontSize:10.5 }}>{DIM[a.closes]?.label} · {a.current}</Pill>
                  <Btn variant="soft" size="sm" onClick={()=>onAddTask({ title:a.text, origin_ref:a.closes })}><Icons.plus size={12}/> Add</Btn>
                </div>
              ))}
            </div>
          </Card>
        )}
      </Stagger>
    </div>
  );
}
function DimList({ title, items, color }) {
  if (!items||items.length===0) return <div><SectionLabel style={{ marginBottom:8 }}>{title}</SectionLabel><div className="faint" style={{ fontSize:12.5 }}>None noted.</div></div>;
  return <div><SectionLabel style={{ marginBottom:8 }}>{title}</SectionLabel><div className="col gap5">{items.map((t,i)=><div key={i} className="row gap8" style={{ fontSize:12.5, lineHeight:1.45 }}><StatusDot color={color} size={6}/>{t}</div>)}</div></div>;
}

Object.assign(window, { OverviewTab, MemoryTab, ScorecardTab, TabHeader, LockedTab, TAG_LABEL });
