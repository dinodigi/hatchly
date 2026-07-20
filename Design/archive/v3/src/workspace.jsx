// ===== Workspace shell: sidebar + phase tracker + tab view + persistent chat =====

const NAV = [
  { key:"overview", label:"Overview", icon:Icons.compass },
  { key:"memory",   label:"Memory",   icon:Icons.brain },
  { key:"scorecard",label:"Scorecard",icon:Icons.target, lockIn:["ideation"] },
  { key:"plan",     label:"Plan",     icon:Icons.board },
  { key:"brand",    label:"Brand",    icon:Icons.tag, lockIn:["ideation"], dot:(idea)=>idea.phase==="validation" },
];

function PhaseTracker({ phase }) {
  const cur = PHASE_ORDER.indexOf(phase);
  return (
    <div className="col gap2" style={{ padding:"4px 0" }}>
      {PHASE_ORDER.map((k,i)=>{
        const ph = PHASES[k];
        const state = i<cur ? "done" : i===cur ? "current" : "future";
        return (
          <div key={k} className="row gap10" style={{ padding:"5px 0", alignItems:"center" }}>
            <span style={{ width:18, height:18, borderRadius:999, flex:"none", display:"flex", alignItems:"center", justifyContent:"center",
              background: state==="current"?ph.soft:"transparent", color: state==="done"?"var(--success)":state==="current"?ph.color:"var(--text-muted)",
              border: state==="future"?"1px solid var(--border-strong)":"none" }}>
              {state==="done" ? <Icons.check size={12} sw={2.5}/> : state==="current" ? <span className="dot" style={{ width:7, height:7, background:ph.color }}/> : <Icons.lock size={10}/>}
            </span>
            <span style={{ fontSize:12.5, fontWeight: state==="current"?600:400, color: state==="future"?"var(--text-muted)":"var(--text-primary)" }}>{ph.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Sidebar({ idea, tab, setTab, go, onSettings }) {
  return (
    <div style={{ width:212, flex:"none", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", background:"var(--surface)", height:"100%" }}>
      <div style={{ padding:"16px 16px 0" }}>
        <button className="row gap6 muted" style={{ background:"none", border:"none", fontSize:12.5, padding:"4px 0", marginBottom:14 }} onClick={()=>go({screen:"ideas"})}><Icons.back size={14}/> All ideas</button>
        <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:18, fontWeight:600, letterSpacing:"-0.01em" }}>{idea.name}</div>
            <div className="muted clamp2" style={{ fontSize:11.5, lineHeight:1.4, marginTop:2 }}>{idea.one_liner}</div>
          </div>
          {idea.phase==="ideation"
            ? <ScoreRing value={idea.completeness} size={40} stroke={4} color="var(--accent)" animate={false}/>
            : <ScoreRing value={idea.current_score} size={40} stroke={4} animate={false}/>}
        </div>
      </div>
      <div style={{ padding:"14px 12px 10px", margin:"14px 12px 0", borderTop:"1px solid var(--border)" }}>
        <PhaseTracker phase={idea.phase}/>
      </div>
      <div className="hr" style={{ margin:"6px 16px" }}/>
      <div className="col gap2 scrollarea" style={{ padding:"6px 12px", flex:1 }}>
        {NAV.map(n=>{
          const locked = n.lockIn?.includes(idea.phase);
          const active = tab===n.key;
          return (
            <button key={n.key} onClick={()=>!locked&&setTab(n.key)} title={locked?"Unlocks as your idea progresses":""}
              className="row gap10" style={{ padding:"9px 11px", borderRadius:9, border:"none", textAlign:"left", width:"100%", cursor: locked?"not-allowed":"pointer",
                background: active?"var(--surface-raised)":"transparent", boxShadow: active?"var(--shadow-card)":"none",
                color: locked?"var(--text-muted)":active?"var(--text-primary)":"var(--text-secondary)", fontSize:13.5, fontWeight: active?600:500, position:"relative" }}>
              <n.icon size={16}/> <span style={{ flex:1 }}>{n.label}</span>
              {locked && <Icons.lock size={13}/>}
              {!locked && n.dot?.(idea) && <span className="dot" style={{ width:6, height:6, background:"var(--accent)" }}/>}
            </button>
          );
        })}
      </div>
      <div style={{ padding:"10px 12px", borderTop:"1px solid var(--border)" }}>
        <button onClick={onSettings} className="row gap10" style={{ padding:"9px 11px", borderRadius:9, border:"none", width:"100%", background:"transparent", color:"var(--text-secondary)", fontSize:13.5, fontWeight:500 }}><Icons.settings size={16}/> Idea settings</button>
      </div>
    </div>
  );
}

/* ---------------- CHAT RAIL ---------------- */
function ChatRail({ idea, collapsed, setCollapsed }) {
  const script = CHATS[idea.id] || [{ role:"assistant", content:"What's the idea? A sentence is enough — or paste a link, or just talk." }];
  const [shown, setShown] = useState(()=>[script[0]]);
  const [idx, setIdx] = useState(1);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [animating, setAnimating] = useState(false);
  const bodyRef = useRef(null);

  useEffect(()=>{ setShown([script[0]]); setIdx(1); setTyping(false); setDraft(""); }, [idea.id]);
  useEffect(()=>{ if(bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [shown, typing]);

  const nextUserChip = script[idx]?.role==="user" ? script[idx].content : null;

  const send = (text) => {
    if (!text.trim() || typing || animating) return;
    setDraft("");
    setShown(s=>[...s, { role:"user", content:text }]);
    // advance past matching user turn
    let p = idx; if (script[p]?.role==="user") p++;
    const nextAsst = (()=>{ while(p<script.length && script[p].role!=="assistant") p++; return script[p]; })();
    setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      const msg = nextAsst || { role:"assistant", content:"Got it — I've saved that to memory and tagged it. Keep going whenever you're ready.", tool:"save_memory" };
      setShown(s=>[...s, { ...msg, _new:true }]);
      setIdx(nextAsst ? p+1 : idx);
      setAnimating(true);
    }, 850);
  };

  if (collapsed) {
    return (
      <div style={{ width:48, flex:"none", borderLeft:"1px solid var(--border)", background:"var(--surface)", display:"flex", flexDirection:"column", alignItems:"center", paddingTop:14, gap:14, height:"100%" }}>
        <IconBtn onClick={()=>setCollapsed(false)} title="Open chat"><Icons.chevL size={18}/></IconBtn>
        <div style={{ writingMode:"vertical-rl", fontSize:12, fontWeight:600, color:"var(--text-secondary)", letterSpacing:"0.04em", marginTop:6 }}>Chat</div>
        <Avatar kind="ai" label="H" size={26}/>
      </div>
    );
  }

  return (
    <div style={{ width:336, flex:"none", borderLeft:"1px solid var(--border)", display:"flex", flexDirection:"column", background:"var(--background)", height:"100%" }}>
      <div className="row gap8" style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)" }}>
        <Avatar kind="ai" label="H" size={28}/>
        <div style={{ flex:1 }}><div className="row gap6" style={{ alignItems:"center" }}><span style={{ fontWeight:600, fontSize:13.5 }}>Hatchly</span><LiveDot/></div><div className="faint" style={{ fontSize:11 }}>{PHASES[idea.phase].label} · phase-aware</div></div>
        <IconBtn onClick={()=>setCollapsed(true)} title="Collapse"><Icons.chevR size={18}/></IconBtn>
      </div>

      <div ref={bodyRef} className="scrollarea" style={{ flex:1, padding:"16px 14px", display:"flex", flexDirection:"column", gap:12 }}>
        {shown.map((m,i)=><ChatMsg key={i} m={m} onTyped={()=>{ if(bodyRef.current) bodyRef.current.scrollTop=bodyRef.current.scrollHeight; setAnimating(false); }}/>)}
        {typing && <div className="row gap8" style={{ alignItems:"flex-end" }}><Avatar kind="ai" label="H" size={24}/><div style={{ background:"var(--surface)", padding:"11px 13px", borderRadius:13 }}><TypingDots/></div></div>}
      </div>

      {nextUserChip && !typing && !animating && (
        <div style={{ padding:"0 14px 10px" }}>
          <button onClick={()=>send(nextUserChip)} className="row gap6" style={{ width:"100%", textAlign:"left", padding:"9px 12px", borderRadius:10, border:"1px dashed var(--border-strong)", background:"var(--surface-raised)", color:"var(--text-secondary)", fontSize:12.5, cursor:"pointer" }}>
            <Icons.arrowUp size={13}/> <span style={{ flex:1 }}>{nextUserChip}</span>
          </button>
        </div>
      )}

      <div style={{ padding:"12px 14px 14px", borderTop:"1px solid var(--border)" }}>
        <div style={{ background:"var(--surface-raised)", border:"1px solid var(--border-strong)", borderRadius:13, padding:"6px 6px 6px 12px" }}>
          <textarea value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(draft); } }}
            rows={1} placeholder="Type, paste a link, or record…"
            style={{ width:"100%", border:"none", background:"transparent", resize:"none", outline:"none", fontSize:13.5, lineHeight:1.5, padding:"5px 0", maxHeight:90 }}/>
          <div className="row gap4" style={{ alignItems:"center" }}>
            <IconBtn style={{ width:28, height:28 }} title="Attach link"><Icons.link size={15}/></IconBtn>
            <IconBtn style={{ width:28, height:28 }} title="Record voice"><Icons.mic size={15}/></IconBtn>
            <div className="spacer"/>
            <button onClick={()=>send(draft)} disabled={!draft.trim()} className="btn btn-primary btn-sm" style={{ width:30, height:30, padding:0, borderRadius:8 }}><Icons.arrowUp size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatMsg({ m, onTyped }) {
  const ai = m.role==="assistant";
  return (
    <div className="col gap5" style={{ alignItems: ai?"flex-start":"flex-end" }}>
      <div className="row gap8" style={{ alignItems:"flex-end", flexDirection: ai?"row":"row-reverse", maxWidth:"92%" }}>
        <Avatar kind={ai?"ai":"user"} label={ai?"H":USER.avatar} size={24}/>
        <div style={{ background: ai?"var(--surface)":"var(--accent-soft)", padding:"10px 13px", borderRadius:13, fontSize:13.5, lineHeight:1.55 }}>
          {ai && m._new ? <Typewriter text={m.content} onDone={onTyped}/> : m.content}
        </div>
      </div>
      {m.tool && <div className="row gap5 faint" style={{ fontSize:11, paddingLeft:32, color:"var(--accent-text)" }}><Icons.bolt size={12}/> {m.tool}</div>}
    </div>
  );
}

/* ---------------- WORKSPACE ---------------- */
function Workspace({ idea, tab, setTab, go, theme, setTheme, updateIdea, onArchive }) {
  const [collapsed, setCollapsed] = useState(idea.phase==="launch"||idea.phase==="operating");
  const [overlay, setOverlay] = useState(null); // {type, data}
  const [chatPulse, setChatPulse] = useState(0);

  useEffect(()=>{ setCollapsed(idea.phase==="launch"||idea.phase==="operating"); }, [idea.id]);

  const openChat = () => { setCollapsed(false); setChatPulse(p=>p+1); };

  // task ops
  const moveTask = (taskId, status) => updateIdea(idea.id, d=>({ ...d, tasks:d.tasks.map(t=>t.id===taskId?{...t,status}:t) }));
  const toggleSub = (taskId, i) => updateIdea(idea.id, d=>({ ...d, tasks:d.tasks.map(t=>t.id===taskId?{...t, subtasks:t.subtasks.map((s,j)=>j===i?{...s,d:!s.d}:s)}:t) }));
  const addTask = ({ title, origin_ref }) => {
    updateIdea(idea.id, d=>({ ...d, tasks:[...d.tasks, { id:"nt"+Date.now(), title, status:"todo", category:"validation", origin:"scorecard", origin_ref, description:"Added from the scorecard. I'll track signal that this moves the dimension.", subtasks:[] }] }));
    setTab("plan");
  };
  const saveMemory = (id, content) => { updateIdea(idea.id, d=>({ ...d, memories:d.memories.map(m=>m.id===id?{...m,content,edited:true}:m) })); setOverlay(null); };
  const chooseName = (name) => updateIdea(idea.id, d=>({ ...d, name, brand_candidates:d.brand_candidates.map(c=>({...c, chosen:c.name===name})) }));

  const task = overlay?.type==="task" ? idea.tasks.find(t=>t.id===overlay.data) : null;

  let body;
  if (tab==="overview")  body = <OverviewTab idea={idea} go={go} openChat={openChat}/>;
  else if (tab==="memory")    body = <MemoryTab idea={idea} onEdit={m=>setOverlay({type:"memEdit", data:m})}/>;
  else if (tab==="scorecard") body = <ScorecardTab idea={idea} onRegenerate={()=>setOverlay({type:"report"})} onAddTask={addTask}/>;
  else if (tab==="plan")      body = <PlanTab idea={idea} onMoveTask={moveTask} onOpenTask={id=>setOverlay({type:"task", data:id})} onGenerate={()=>setOverlay({type:"report"})}/>;
  else if (tab==="brand")     body = <BrandTab idea={idea} onOpenDomain={d=>setOverlay({type:"domain", data:d})} onChooseName={chooseName}/>;

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
      {/* top strip */}
      <div className="row gap12" style={{ height:52, flex:"none", borderBottom:"1px solid var(--border)", padding:"0 18px", background:"var(--background)" }}>
        <div className="row gap8" style={{ cursor:"pointer" }} onClick={()=>go({screen:"ideas"})}><span style={{ color:"var(--accent)" }}><Icons.logo size={19}/></span><span style={{ fontWeight:600, fontSize:15 }}>Hatchly</span></div>
        <div className="spacer"/>
        {idea.phase==="validation" && <Btn variant="secondary" size="sm" onClick={()=>setOverlay({type:"launch"})}><Icons.flag size={14}/> Advance to Launch</Btn>}
        <ThemeToggle theme={theme} setTheme={setTheme}/>
        <div onClick={()=>go({screen:"settings"})} style={{ cursor:"pointer" }}><Avatar kind="user" label={USER.avatar} size={28}/></div>
      </div>
      {/* 3-column */}
      <div style={{ flex:1, display:"flex", minHeight:0 }}>
        <Sidebar idea={idea} tab={tab} setTab={setTab} go={go} onSettings={()=>setOverlay({type:"ideaSettings"})}/>
        <div className="scrollarea" style={{ flex:1, padding:"28px 32px 60px", minWidth:0 }}>
          <div style={{ maxWidth: tab==="brand"?1080:780, margin:"0 auto" }}>{body}</div>
        </div>
        <ChatRail key={idea.id+chatPulse} idea={idea} collapsed={collapsed} setCollapsed={setCollapsed}/>
      </div>

      {/* overlays */}
      {task && <TaskDrawer task={task} onClose={()=>setOverlay(null)} onToggleSub={toggleSub} onMove={(id,s)=>{ moveTask(id,s); }}/>}
      {overlay?.type==="memEdit" && <MemoryEditDrawer mem={overlay.data} onClose={()=>setOverlay(null)} onViewSource={()=>setOverlay({type:"memSource", data:overlay.data})} onSave={saveMemory}/>}
      {overlay?.type==="memSource" && <MemorySourceModal mem={overlay.data} onClose={()=>setOverlay(null)}/>}
      {overlay?.type==="report" && <ReportGenModal idea={idea} onClose={()=>setOverlay(null)} onDone={()=>{ setOverlay(null); setTab("scorecard"); }}/>}
      {overlay?.type==="launch" && <LaunchUnlockModal idea={idea} onClose={()=>setOverlay(null)} onConfirm={(arch)=>{ updateIdea(idea.id, d=>({...d, phase:"launch", archetype:arch, lastTab:"plan"})); setOverlay(null); setTab("plan"); setCollapsed(true); }}/>}
      {overlay?.type==="domain" && <DomainModal domain={overlay.data} idea={idea} onClose={()=>setOverlay(null)}/>}
      {overlay?.type==="ideaSettings" && <IdeaSettingsModal idea={idea} onClose={()=>setOverlay(null)} onSave={(patch)=>{ updateIdea(idea.id, d=>({...d,...patch})); setOverlay(null); }} onArchive={onArchive}/>}
    </div>
  );
}

Object.assign(window, { Workspace });
