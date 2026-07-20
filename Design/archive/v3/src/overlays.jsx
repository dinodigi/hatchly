// ===== Overlays: task drawer · memory source · report gen · launch unlock · domain · settings =====

function Scrim({ onClose }) { return <div className="scrim" onClick={onClose}/>; }
function DrawerHead({ title, onClose }) {
  return <div className="row" style={{ justifyContent:"space-between", padding:"18px 20px", borderBottom:"1px solid var(--border)" }}>
    <span style={{ fontSize:13, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", color:"var(--text-secondary)" }}>{title}</span>
    <IconBtn onClick={onClose}><Icons.x size={18}/></IconBtn></div>;
}

/* ---- Task detail drawer ---- */
function TaskDrawer({ task, onClose, onToggleSub, onMove }) {
  if (!task) return null;
  return (
    <>
      <Scrim onClose={onClose}/>
      <div className="drawer">
        <DrawerHead title="Task" onClose={onClose}/>
        <div className="scrollarea" style={{ padding:22, flex:1 }}>
          <div className="row gap8" style={{ marginBottom:12 }}>
            <span className="row gap5" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", color:CAT_META[task.category]?.color }}><StatusDot color={CAT_META[task.category]?.color} size={6}/>{CAT_META[task.category]?.label}</span>
            {task.blocking && <Pill style={{ fontSize:10, color:"var(--danger-text)", background:"var(--danger-soft)", border:"none" }}>blocking</Pill>}
            {task.origin && <Pill style={{ fontSize:10 }}>from {task.origin}</Pill>}
          </div>
          <h2 style={{ fontSize:21, margin:"0 0 12px", letterSpacing:"-0.01em", lineHeight:1.25 }}>{task.title}</h2>
          {task.description && <p className="muted" style={{ fontSize:14, lineHeight:1.6, margin:"0 0 20px" }}>{task.description}</p>}

          <SectionLabel style={{ marginBottom:8 }}>Status</SectionLabel>
          <div className="row gap6" style={{ marginBottom:20 }}>
            {STATUS_COLS.map(c=>(
              <button key={c.key} onClick={()=>onMove(task.id, c.key)} className="pill" style={{ cursor:"pointer", padding:"6px 12px", border:"1px solid", borderColor: task.status===c.key?"var(--text-muted)":"var(--border)", background: task.status===c.key?"var(--surface-raised)":"var(--surface)", color: task.status===c.key?"var(--text-primary)":"var(--text-secondary)" }}>{c.label}</button>
            ))}
          </div>

          {task.subtasks?.length>0 && (
            <div style={{ marginBottom:20 }}>
              <SectionLabel style={{ marginBottom:10 }}>Subtasks · {task.subtasks.filter(s=>s.d).length}/{task.subtasks.length}</SectionLabel>
              <div className="col gap8">
                {task.subtasks.map((s,i)=>(
                  <div key={i} className="row gap10" style={{ cursor:"pointer", alignItems:"center" }} onClick={()=>onToggleSub(task.id,i)}>
                    <span style={{ width:18, height:18, borderRadius:6, border:"1.5px solid", borderColor: s.d?"var(--success)":"var(--border-strong)", background: s.d?"var(--success)":"transparent", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flex:"none" }}>{s.d && <Icons.check size={12} sw={2.5}/>}</span>
                    <span style={{ fontSize:13.5, textDecoration: s.d?"line-through":"none", color: s.d?"var(--text-muted)":"var(--text-primary)" }}>{s.t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.vendor_suggestions?.length>0 && (
            <div style={{ marginBottom:20 }}>
              <SectionLabel style={{ marginBottom:10 }}>Vendor suggestions</SectionLabel>
              <div className="col gap8">
                {task.vendor_suggestions.map((v,i)=>(
                  <div key={i} className="row" style={{ justifyContent:"space-between", padding:"10px 12px", border:"1px solid var(--border)", borderRadius:10, alignItems:"center" }}>
                    <div><div style={{ fontSize:13.5, fontWeight:600 }}>{v.name}</div>{v.note && <div className="faint" style={{ fontSize:12 }}>{v.note}</div>}</div>
                    <Btn variant="ghost" size="sm"><Icons.ext size={13}/> Open</Btn>
                  </div>
                ))}
              </div>
            </div>
          )}

          <SectionLabel style={{ marginBottom:8 }}>Agent note</SectionLabel>
          <div className="row gap10" style={{ padding:12, background:"var(--surface)", borderRadius:10, alignItems:"flex-start" }}>
            <Avatar kind="ai" label="H" size={24}/>
            <div style={{ fontSize:13, lineHeight:1.5, color:"var(--text-secondary)" }}>I authored this from {task.origin==="scorecard"?"a weak dimension in your scorecard":task.origin==="playbook"?"the launch playbook for your archetype":"our conversation"}. Tell me when it's done and I'll update the board and re-score.</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---- Memory source viewer ---- */
function MemorySourceModal({ mem, onClose }) {
  if (!mem) return null;
  const raw = {
    chat:`…Alex: Most of my users are solo founders in that first messy year after going full-time. The pain isn't tools — it's losing rhythm around 3pm with no one to push back…`,
    link:`Sunsama — Daily planner\nPlan your day across calendar and tasks. Drag tasks in, set durations, reflect at end of day. Manual, deliberate, forms-driven workflow…`,
    voice:`[transcript] "…the honest worry is distribution. IndieHackers and Twitter are where these founders are, but everyone's shouting there. It's crowded…"`,
    file:`[document excerpt]`,
  }[mem.src];
  const hl = mem.content;
  return (
    <>
      <Scrim onClose={onClose}/>
      <div className="modal">
        <DrawerHead title={`Source · ${mem.srcLabel}`} onClose={onClose}/>
        <div className="scrollarea" style={{ padding:22 }}>
          <div className="row gap8" style={{ marginBottom:14 }}><SourceGlyph type={mem.src}/><div><div style={{ fontWeight:600, fontSize:13.5, textTransform:"capitalize" }}>{mem.src} source</div><div className="faint" style={{ fontSize:12 }}>The original input this memory was extracted from.</div></div></div>
          <div style={{ padding:16, background:"var(--surface)", borderRadius:12, fontSize:13.5, lineHeight:1.7, color:"var(--text-secondary)", whiteSpace:"pre-wrap", fontFamily: mem.src==="link"?"'Geist Mono', monospace":"inherit" }}>{raw}</div>
          <SectionLabel style={{ margin:"20px 0 8px" }}>Extracted memory</SectionLabel>
          <div style={{ padding:14, background:"var(--accent-softer)", border:"1px solid var(--accent)", borderRadius:12 }}>
            <div style={{ fontSize:14, marginBottom:8 }}>{hl}</div>
            <div className="row gap6">{mem.tags.map(t=><Pill key={t} accent style={{ fontSize:10 }}>{TAG_LABEL(t)}</Pill>)}</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---- Memory edit drawer ---- */
function MemoryEditDrawer({ mem, onClose, onViewSource, onSave }) {
  const [text, setText] = useState(mem?.content || "");
  useEffect(()=>{ setText(mem?.content||""); }, [mem]);
  if (!mem) return null;
  return (
    <>
      <Scrim onClose={onClose}/>
      <div className="drawer" style={{ width:420 }}>
        <DrawerHead title="Edit memory" onClose={onClose}/>
        <div className="scrollarea" style={{ padding:22, flex:1 }}>
          <label className="label">Memory</label>
          <textarea className="field" rows={4} value={text} onChange={e=>setText(e.target.value)} style={{ resize:"vertical", lineHeight:1.5 }}/>
          <div className="row gap6" style={{ margin:"14px 0", flexWrap:"wrap" }}>{mem.tags.map(t=><Pill key={t} accent={!!DIM[t]}>{TAG_LABEL(t)} <span style={{ marginLeft:2, opacity:0.5 }}>×</span></Pill>)}<Pill style={{ cursor:"pointer" }}><Icons.plus size={11}/> tag</Pill></div>
          <div style={{ padding:12, background:"var(--surface)", borderRadius:10 }}>
            <div className="faint" style={{ fontSize:11.5, marginBottom:6 }}>Correcting a memory re-scores the affected dimensions.</div>
            <button className="row gap6" style={{ fontSize:12.5, color:"var(--accent-text)", background:"none", border:"none" }} onClick={onViewSource}><Icons.link size={13}/> View source · {mem.srcLabel}</button>
          </div>
        </div>
        <div className="row gap10" style={{ padding:16, borderTop:"1px solid var(--border)" }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn><div className="spacer"/><Btn variant="primary" onClick={()=>onSave(mem.id,text)}>Save & re-score</Btn>
        </div>
      </div>
    </>
  );
}

/* ---- Report generation (Ideation -> Validation moment) ---- */
function ReportGenModal({ idea, onClose, onDone }) {
  const [stage, setStage] = useState(0); // 0 intro, 1 scoring, 2 done
  const dims = idea.snapshot?.dimensions || [];
  useEffect(()=>{ if(stage===1){ const t=setTimeout(()=>setStage(2), 2600); return ()=>clearTimeout(t); } }, [stage]);
  return (
    <>
      <Scrim onClose={stage===1?undefined:onClose}/>
      <div className="modal" style={{ width:560 }}>
        <div className="scrollarea" style={{ padding:30 }}>
          {stage===0 && (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:52, height:52, borderRadius:14, background:"var(--info-soft)", color:"var(--info-text)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}><Icons.target size={24}/></div>
              <h2 style={{ fontSize:22, margin:"0 0 8px" }}>Generate the scorecard</h2>
              <p className="muted" style={{ fontSize:14, lineHeight:1.6, maxWidth:380, margin:"0 auto 22px" }}>I'll score all 13 dimensions against everything in memory — honestly, not generously. This becomes version {(idea.snapshot?.version||0)+1}.</p>
              <Btn variant="primary" size="lg" onClick={()=>setStage(1)}><Icons.sparkle size={16}/> Score it</Btn>
            </div>
          )}
          {stage===1 && (
            <div style={{ textAlign:"center" }}>
              <ScoreRing value={idea.snapshot?.overall||0} size={120} stroke={9}/>
              <div className="row gap8" style={{ justifyContent:"center", margin:"18px 0 6px" }}><TypingDots/><span className="muted" style={{ fontSize:13 }}>Scoring dimensions…</span></div>
              <div className="col gap5" style={{ maxWidth:300, margin:"14px auto 0" }}>
                {dims.slice(0,5).map((d,i)=>(
                  <div key={d.key} className="row gap8" style={{ fontSize:12.5, opacity:0, animation:`fadeUp 400ms ease forwards`, animationDelay:`${i*340}ms` }}>
                    <StatusDot band={d.band}/><span style={{ flex:1, textAlign:"left" }}>{d.label}</span><span style={{ fontWeight:600 }} className={`band-${d.band}`}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {stage===2 && (
            <div style={{ textAlign:"center" }}>
              <ScoreRing value={idea.snapshot?.overall||0} size={120} stroke={9} label="overall"/>
              <h2 className="serif italic" style={{ fontSize:24, margin:"16px 0 6px", fontWeight:400 }}>Scorecard ready.</h2>
              <p className="muted" style={{ fontSize:14, maxWidth:380, margin:"0 auto 22px" }}>"{idea.snapshot?.verdict}"</p>
              <Btn variant="primary" size="lg" onClick={onDone}>Open the scorecard <Icons.chevR size={15}/></Btn>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ---- Launch unlock (Validation -> Launch) ---- */
const ARCHETYPES = [
  ["physical_ecom","Physical e-com"],["dropship","Dropship"],["saas","SaaS"],["marketplace","Marketplace"],["service","Service"],["content","Content"],["mobile_app","Mobile app"],["other","Other"]
];
function LaunchUnlockModal({ idea, onClose, onConfirm }) {
  const [arch, setArch] = useState(idea.archetype || "saas");
  const [stage, setStage] = useState(0);
  return (
    <>
      <Scrim onClose={onClose}/>
      <div className="modal" style={{ width:540 }}>
        <div className="scrollarea" style={{ padding:30 }}>
          {stage===0 ? (
            <>
              <div style={{ width:52, height:52, borderRadius:14, background:"var(--success-soft)", color:"var(--success-text)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 0 16px" }}><Icons.flag size={24}/></div>
              <h2 style={{ fontSize:22, margin:"0 0 6px" }}>Ready to launch {idea.name}</h2>
              <p className="muted" style={{ fontSize:14, lineHeight:1.6, margin:"0 0 22px" }}>Confirm the business type and I'll instantiate the launch playbook into your Plan — legal, payments, ops, marketing — customized to {idea.name}.</p>
              <SectionLabel style={{ marginBottom:10 }}>Business archetype</SectionLabel>
              <div className="grid gap8" style={{ gridTemplateColumns:"repeat(4,1fr)", marginBottom:24 }}>
                {ARCHETYPES.map(([k,l])=>(
                  <button key={k} onClick={()=>setArch(k)} style={{ padding:"12px 8px", borderRadius:10, border:"1.5px solid", borderColor: arch===k?"var(--success)":"var(--border-strong)", background: arch===k?"var(--success-soft)":"var(--surface-raised)", fontSize:12, fontWeight:500, color: arch===k?"var(--success-text)":"var(--text-secondary)", cursor:"pointer" }}>{l}</button>
                ))}
              </div>
              <div className="row gap10"><Btn variant="ghost" onClick={onClose}>Not yet</Btn><div className="spacer"/><Btn variant="primary" onClick={()=>setStage(1)} style={{ background:"var(--success)" }}><Icons.bolt size={15}/> Build the launch board</Btn></div>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"10px 0" }}>
              <div style={{ width:56, height:56, borderRadius:16, background:"var(--success-soft)", color:"var(--success-text)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", animation:"scaleIn 400ms ease" }}><Icons.check size={28} sw={2.5}/></div>
              <h2 className="serif italic" style={{ fontSize:26, margin:"0 0 6px", fontWeight:400 }}>{idea.name} is in Launch.</h2>
              <p className="muted" style={{ fontSize:14, maxWidth:360, margin:"0 auto 22px" }}>I've built {idea.tasks?.length||9} tasks from the {ARCHETYPES.find(a=>a[0]===arch)?.[1]} playbook. Blocking tasks are flagged.</p>
              <Btn variant="primary" size="lg" style={{ background:"var(--success)" }} onClick={()=>onConfirm(arch)}>Open the board <Icons.chevR size={15}/></Btn>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ---- Domain detail / handoff ---- */
function DomainModal({ domain, idea, onClose }) {
  if (!domain) return null;
  return (
    <>
      <Scrim onClose={onClose}/>
      <div className="modal" style={{ width:480 }}>
        <DrawerHead title="Domain · BrandBucket" onClose={onClose}/>
        <div className="scrollarea" style={{ padding:26 }}>
          <div className="row gap12" style={{ alignItems:"center", marginBottom:18 }}>
            <span style={{ width:44, height:44, borderRadius:12, background:"var(--surface)", color:"var(--text-secondary)", display:"flex", alignItems:"center", justifyContent:"center" }}><Icons.globe size={22}/></span>
            <div><div style={{ fontSize:22, fontWeight:600, letterSpacing:"-0.01em" }}>{domain.name}</div><div className="faint" style={{ fontSize:12.5 }}>Premium domain · curated listing</div></div>
            <div className="spacer"/><div style={{ fontSize:22, fontWeight:600 }}>${domain.price.toLocaleString()}</div>
          </div>
          <SectionLabel style={{ marginBottom:8 }}>Why it fits {idea.name}</SectionLabel>
          <p style={{ fontSize:14, lineHeight:1.6, margin:"0 0 20px", color:"var(--text-secondary)" }}>{domain.fit_reason}</p>
          <div style={{ padding:14, background:"var(--surface)", borderRadius:12, marginBottom:20 }}>
            <div className="row gap8" style={{ alignItems:"flex-start" }}><Avatar kind="ai" label="H" size={24}/><div style={{ fontSize:13, lineHeight:1.5, color:"var(--text-secondary)" }}>This isn't an ad — it surfaced because your positioning and ICP are clear enough for me to match names to what you're building.</div></div>
          </div>
          <div className="row gap10">
            <Btn variant="secondary" onClick={onClose}>Maybe later</Btn><div className="spacer"/>
            <Btn variant="primary" onClick={onClose}><Icons.ext size={15}/> Acquire on BrandBucket</Btn>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---- Idea settings modal ---- */
function IdeaSettingsModal({ idea, onClose, onSave, onArchive }) {
  const [name, setName] = useState(idea.name);
  const [oneLiner, setOneLiner] = useState(idea.one_liner);
  const [arch, setArch] = useState(idea.archetype||"");
  return (
    <>
      <Scrim onClose={onClose}/>
      <div className="modal" style={{ width:500 }}>
        <DrawerHead title="Idea settings" onClose={onClose}/>
        <div className="scrollarea" style={{ padding:24 }}>
          <div className="col gap16">
            <div><label className="label">Name</label><input className="field" value={name} onChange={e=>setName(e.target.value)}/></div>
            <div><label className="label">One-liner</label><textarea className="field" rows={2} value={oneLiner} onChange={e=>setOneLiner(e.target.value)} style={{ resize:"vertical" }}/></div>
            <div>
              <label className="label">Business archetype</label>
              <div className="grid gap8" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
                {ARCHETYPES.map(([k,l])=>(<button key={k} onClick={()=>setArch(k)} style={{ padding:"9px 6px", borderRadius:9, border:"1.5px solid", borderColor: arch===k?"var(--accent)":"var(--border-strong)", background: arch===k?"var(--accent-softer)":"var(--surface-raised)", fontSize:11.5, color: arch===k?"var(--accent-text)":"var(--text-secondary)", cursor:"pointer" }}>{l}</button>))}
              </div>
              {arch && arch!==idea.archetype && <div className="faint" style={{ fontSize:11.5, marginTop:8 }}>Changing the archetype can re-derive launch tasks.</div>}
            </div>
          </div>
          <div className="hr" style={{ margin:"22px 0" }}/>
          <div className="row gap10">
            <Btn variant="ghost" style={{ color:"var(--danger-text)" }} onClick={()=>{ onArchive(idea.id); onClose(); }}><Icons.archive size={14}/> Archive</Btn>
            <div className="spacer"/>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={()=>onSave({ name, one_liner:oneLiner, archetype:arch||null })}>Save</Btn>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { TaskDrawer, MemorySourceModal, MemoryEditDrawer, ReportGenModal, LaunchUnlockModal, DomainModal, IdeaSettingsModal });
