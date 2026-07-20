// ===== Lean idea workspace (chat center · PRD right · memory left) + dashboard =====

const VIS = {
  private: { label:"Private", icon:Icons.lock,   note:"Only you can see this.", votable:false },
  link:    { label:"Link-only", icon:Icons.link, note:"Anyone with the link can view & comment.", votable:false },
  public:  { label:"Public",  icon:Icons.globe,  note:"Discoverable on the stream · backable with bucks.", votable:true },
};

function VisibilityMenu({ idea, onChange }) {
  const [open, setOpen] = useState(false);
  const cur = VIS[idea.visibility];
  const CurIcon = cur.icon;
  return (
    <div style={{ position:"relative" }}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        display:"flex", alignItems:"center", gap:8, padding:"7px 12px", borderRadius:9, fontSize:13, fontWeight:500,
        border:"1px solid var(--border-strong)", background:"var(--surface-raised)", color:"var(--text-primary)",
      }}><CurIcon size={15}/> {cur.label} <Icons.chevD size={14} style={{ color:"var(--text-muted)" }}/></button>
      {open && <>
        <div style={{ position:"fixed", inset:0, zIndex:40 }} onClick={()=>setOpen(false)} />
        <div className="card" style={{ position:"absolute", right:0, top:42, width:280, padding:7, zIndex:41, boxShadow:"var(--shadow-modal)" }}>
          {Object.entries(VIS).map(([k,v]) => {
            const I = v.icon; const active = idea.visibility===k;
            return (
              <button key={k} onClick={()=>{ onChange(k); setOpen(false); }} className="vis-item" style={{ background: active?"var(--surface)":"transparent" }}>
                <I size={16} style={{ color: active?"var(--accent-text)":"var(--text-secondary)", flex:"none", marginTop:1 }}/>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontWeight:600, fontSize:13.5, display:"flex", alignItems:"center", gap:7 }}>{v.label} {active && <Icons.check size={14} style={{color:"var(--accent-text)"}}/>}</div>
                  <div className="faint" style={{ fontSize:12, lineHeight:1.4 }}>{v.note}</div>
                </div>
              </button>
            );
          })}
        </div>
      </>}
    </div>
  );
}

// ---- left rail: brief nav + memory ----
function WorkspaceRail({ idea, active, setActive }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div>
        <SectionLabel style={{ marginBottom:10 }}>Brief</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
          {PRD_SECTIONS.map(s => {
            const v = idea.prd?.[s.key];
            const filled = s.list ? (v||[]).length : !!v;
            return (
              <button key={s.key} onClick={()=>setActive(s.key)} className="rail-item" style={{ background: active===s.key?"var(--surface)":"transparent" }}>
                <StatusDot color={filled?"var(--success)":"var(--border-strong)"} size={7} />
                <span style={{ flex:1, textAlign:"left", color: active===s.key?"var(--text-primary)":"var(--text-secondary)" }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <SectionLabel style={{ marginBottom:10, display:"flex", alignItems:"center", gap:6 }}><Icons.brain size={13}/> Memory · {idea.memories.length}</SectionLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {idea.memories.map(m => {
            const I = m.src==="voice"?Icons.voice : m.src==="link"?Icons.link : Icons.chat;
            return (
              <div key={m.id} style={{ display:"flex", gap:8, fontSize:12.5, lineHeight:1.45 }}>
                <I size={13} style={{ color:"var(--text-muted)", flex:"none", marginTop:3 }}/>
                <div><div style={{ color:"var(--text-secondary)" }}>{m.content}</div><div className="faint mono" style={{ fontSize:10.5, marginTop:2 }}>{m.srcLabel}</div></div>
              </div>
            );
          })}
        </div>
        <p className="faint" style={{ fontSize:11.5, margin:"12px 0 0", lineHeight:1.5 }}>Auto-captured as you chat. Feeds the brief.</p>
      </div>
    </div>
  );
}

// ---- center: chat ----
function ChatPanel({ idea, thread, onSend }) {
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  useEffect(()=>{ const el=scrollRef.current; if(el) el.scrollTop=el.scrollHeight; }, [thread.length, typing]);
  const send = ()=>{
    if(!draft.trim()) return;
    const text = draft.trim(); setDraft(""); setTyping(true);
    onSend(text, ()=>setTyping(false));
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>
      <div ref={scrollRef} className="scrollarea" style={{ flex:1, padding:"8px 4px 18px", minHeight:0 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:620, margin:"0 auto" }}>
          {thread.map((m,i) => (
            <div key={i} style={{ display:"flex", gap:11, flexDirection: m.role==="user"?"row-reverse":"row" }}>
              {m.role==="assistant"
                ? <span className="avatar avatar-ai" style={{ width:30, height:30, fontSize:12, flex:"none" }}>H</span>
                : <Avatar label={USER.avatar} kind="user" size={30} />}
              <div style={{ maxWidth:"78%" }}>
                <div style={{
                  padding:"11px 15px", borderRadius:14, fontSize:14.5, lineHeight:1.55,
                  background: m.role==="user"?"var(--accent)":"var(--surface-raised)",
                  color: m.role==="user"?"#fff":"var(--text-primary)",
                  border: m.role==="user"?"none":"1px solid var(--border)",
                  borderTopRightRadius: m.role==="user"?4:14, borderTopLeftRadius: m.role==="user"?14:4,
                }}>{m.content}</div>
                {m.tool && <div className="faint mono" style={{ fontSize:10.5, marginTop:5, display:"flex", alignItems:"center", gap:5 }}><Icons.sparkle size={11}/> {m.tool}</div>}
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display:"flex", gap:11 }}>
              <span className="avatar avatar-ai" style={{ width:30, height:30, fontSize:12, flex:"none" }}>H</span>
              <div style={{ padding:"13px 16px", borderRadius:14, borderTopLeftRadius:4, background:"var(--surface-raised)", border:"1px solid var(--border)" }}><TypingDots/></div>
            </div>
          )}
        </div>
      </div>
      <div style={{ maxWidth:620, margin:"0 auto", width:"100%" }}>
        <div className="chat-input" style={{ display:"flex", alignItems:"flex-end", gap:8, padding:"10px 10px 10px 16px", background:"var(--surface-raised)", border:"1px solid var(--border-strong)", borderRadius:16, boxShadow:"var(--shadow-card)" }}>
          <textarea value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); } }}
            rows={1} placeholder="Type, paste a link, or record…" style={{ flex:1, border:"none", background:"none", resize:"none", outline:"none", fontSize:14.5, lineHeight:1.5, maxHeight:120, padding:"6px 0" }} />
          <IconBtn><Icons.link size={17}/></IconBtn>
          <IconBtn><Icons.mic size={17}/></IconBtn>
          <button onClick={send} disabled={!draft.trim()} className="btn btn-primary" style={{ width:38, height:38, padding:0, borderRadius:11 }}><Icons.arrowUp size={18}/></button>
        </div>
        <p className="faint" style={{ fontSize:11, textAlign:"center", margin:"9px 0 0" }}>The chat fills your brief as you talk · {idea.memories.length} memories captured</p>
      </div>
    </div>
  );
}

// ---- right: live PRD + build gate ----
function PRDPanel({ idea, onBuild, highlight }) {
  const prd = idea.prd || {};
  const ready = prdComplete(prd);
  const pct = prdProgress(prd);
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}><Icons.doc size={16} style={{ color:"var(--accent-text)" }}/><span style={{ fontWeight:600, fontSize:14.5 }}>Product brief</span></div>
        <span className="mono faint" style={{ fontSize:12 }}>{pct}%</span>
      </div>
      <ProgressBar value={pct} height={5} />
      <div className="scrollarea" style={{ flex:1, minHeight:0, margin:"16px 0", paddingRight:4 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          {PRD_SECTIONS.map(sec => {
            const val = prd[sec.key];
            const empty = sec.list ? !(val||[]).length : !val;
            const hl = highlight===sec.key;
            return (
              <div key={sec.key} style={{ padding: hl?"10px 12px":"0", margin: hl?"-10px -12px":"0", borderRadius:10, background: hl?"var(--accent-softer)":"transparent", transition:"all 300ms ease" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
                  <StatusDot color={empty?"var(--border-strong)":"var(--success)"} size={7}/>
                  <SectionLabel>{sec.label}</SectionLabel>
                </div>
                {empty ? <p className="faint" style={{ fontSize:13, margin:0, fontStyle:"italic", paddingLeft:14 }}>Not captured yet.</p>
                  : sec.list ? (
                    <ul style={{ margin:0, padding:"0 0 0 14px", listStyle:"none", display:"flex", flexDirection:"column", gap:6 }}>
                      {val.map((it,i)=><li key={i} style={{ fontSize:13.5, lineHeight:1.5, display:"flex", gap:8 }}><span style={{color:sec.key==="open"?"var(--info-text)":"var(--accent-text)",flex:"none"}}>{sec.key==="open"?"?":"•"}</span>{it}</li>)}
                    </ul>
                  ) : <p style={{ fontSize:13.5, lineHeight:1.55, margin:0, paddingLeft:14 }}>{val}</p>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ borderTop:"1px solid var(--border)", paddingTop:16 }}>
        {ready ? (
          <Btn size="lg" style={{ width:"100%" }} onClick={onBuild}><Icons.rocket size={17}/> I'm ready — build my project</Btn>
        ) : (
          <button disabled className="btn btn-secondary btn-lg" style={{ width:"100%", opacity:0.6 }}><Icons.lock size={16}/> Complete the brief to build</button>
        )}
        <p className="faint" style={{ fontSize:11.5, textAlign:"center", margin:"9px 0 0", lineHeight:1.5 }}>
          {ready ? "Brief's complete. Next: MVP → plan → build prompt." : "Needs a problem, an audience, a core value, and one feature."}
        </p>
      </div>
    </div>
  );
}

// ---- downstream build drawer (past the gate) ----
function BuildDrawer({ idea, onClose }) {
  const steps = [
    { t:"MVP definition", I:Icons.target, body:`Core loop: ${idea.prd.features[0].toLowerCase()}. Wow moment: the first time it pays off. Scope lock: one loop, nothing else, shipped in 2 weeks.` },
    { t:"Execution plan", I:Icons.layers, body:"3 epics · 11 tasks. Onboarding, the core loop, and a thin settings surface. Tasks are ordered so the loop works end-to-end by day 6." },
    { t:"Build prompt", I:Icons.rocket, body:`A ready-to-paste prompt for Replit or Claude Code that scaffolds ${idea.name} from this brief — schema, screens, and the core loop wired.` },
  ];
  return <>
    <Scrim onClose={onClose} />
    <div className="drawer" style={{ width:520 }}>
      <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
        <Icons.rocket size={20} style={{ color:"var(--accent-text)" }}/>
        <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:16 }}>Build {idea.name}</div><div className="faint" style={{ fontSize:12.5 }}>The same chat, continued past the gate.</div></div>
        <IconBtn onClick={onClose}><Icons.x size={18}/></IconBtn>
      </div>
      <div className="scrollarea" style={{ flex:1, padding:24 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {steps.map((s,i)=>(
            <Card key={i} style={{ padding:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <span style={{ width:28, height:28, borderRadius:8, background:"var(--accent-soft)", color:"var(--accent-text)", display:"flex", alignItems:"center", justifyContent:"center" }}><s.I size={16}/></span>
                <span style={{ fontWeight:600, fontSize:14.5 }}>{s.t}</span>
                <span className="mono faint" style={{ fontSize:11, marginLeft:"auto" }}>step {i+1}</span>
              </div>
              <p className="muted" style={{ fontSize:13.5, lineHeight:1.55, margin:0 }}>{s.body}</p>
            </Card>
          ))}
          <div className="card" style={{ padding:16, background:"var(--surface)", fontFamily:"'Geist Mono',monospace", fontSize:12, lineHeight:1.7, color:"var(--text-secondary)" }}>
            <span style={{ color:"var(--text-muted)" }}># build prompt · {idea.name}</span><br/>
            Build a {idea.prd.who.split(",")[0].toLowerCase()} tool that {idea.prd.value.toLowerCase().replace(/\.$/,"")}.<br/>
            Core loop: {idea.prd.features[0]}. Ship the MVP only.
          </div>
        </div>
      </div>
      <div style={{ padding:"16px 24px", borderTop:"1px solid var(--border)", display:"flex", gap:10 }}>
        <Btn variant="secondary" style={{ flex:1 }} onClick={onClose}>Keep shaping</Btn>
        <Btn style={{ flex:1 }}><Icons.copy size={16}/> Copy build prompt</Btn>
      </div>
    </div>
  </>;
}

function Workspace({ idea, go, onSend, onVisibility }) {
  const [active, setActive] = useState("problem");
  const [building, setBuilding] = useState(false);
  const [toast, setToast] = useState(null);
  const thread = idea._thread || [];
  const pub = idea.visibility==="public";
  const streamIdea = pub && idea.streamId ? STREAM_BY_ID[idea.streamId] : null;

  const changeVis = (v)=>{
    onVisibility(v);
    if(v==="public") setToast("Published to the stream — now backable with bucks.");
    else if(v==="link") setToast("Link-only — share it for feedback. Not votable.");
    else setToast("Back to private.");
    setTimeout(()=>setToast(null), 3200);
  };

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", minHeight:0 }}>
      {/* header */}
      <div style={{ borderBottom:"1px solid var(--border)", padding:"16px 28px", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
        <button onClick={()=>go({screen:"dashboard"})} style={{ border:"none", background:"none", color:"var(--text-secondary)", fontSize:13, display:"flex", alignItems:"center", gap:5, padding:0 }}><Icons.back size={16}/> Ideas</button>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <h1 style={{ fontSize:21, margin:0, letterSpacing:"-0.01em" }}>{idea.name}</h1>
          <StageBadge stage={idea.stage} />
        </div>
        <div style={{ flex:1 }}/>
        {pub && streamIdea && (
          <div style={{ display:"flex", alignItems:"center", gap:16, marginRight:4 }}>
            <div style={{ textAlign:"right" }}><Bucks amount={streamIdea.bucks} size={16} fontSize={14} style={{ color:"var(--accent-text)" }}/><div className="faint" style={{ fontSize:10.5 }}>{streamIdea.backers} backers</div></div>
            <button onClick={()=>go({screen:"idea", ideaId:idea.streamId})} className="btn btn-ghost btn-sm"><Icons.ext size={14}/> View public page</button>
          </div>
        )}
        <VisibilityMenu idea={idea} onChange={changeVis} />
      </div>

      {/* 3-col body */}
      <div className="ws-grid" style={{ flex:1, display:"grid", gridTemplateColumns:"186px 1fr 322px", minHeight:0 }}>
        <div className="ws-rail scrollarea" style={{ borderRight:"1px solid var(--border)", padding:"22px 18px", minHeight:0 }}>
          <WorkspaceRail idea={idea} active={active} setActive={setActive} />
        </div>
        <div style={{ padding:"18px 22px", minHeight:0, display:"flex", flexDirection:"column" }}>
          <ChatPanel idea={idea} thread={thread} onSend={onSend} />
        </div>
        <div className="ws-prd" style={{ borderLeft:"1px solid var(--border)", padding:"22px 22px", minHeight:0 }}>
          <PRDPanel idea={idea} highlight={active} onBuild={()=>setBuilding(true)} />
        </div>
      </div>

      {toast && <div className="toast"><Icons.check size={16} style={{ color:"var(--success-text)" }}/> {toast}</div>}
      {building && <BuildDrawer idea={idea} onClose={()=>setBuilding(false)} />}
    </div>
  );
}

// ===== dashboard — your ideas + your backing =====
function MyIdeaCard({ idea, go }) {
  const pub = idea.visibility==="public";
  const streamIdea = pub && idea.streamId ? STREAM_BY_ID[idea.streamId] : null;
  const Vis = VIS[idea.visibility];
  const pct = prdProgress(idea.prd);
  return (
    <Card hover onClick={()=>go({screen:"workspace", ideaId:idea.id})} style={{ padding:20, display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <StageBadge stage={idea.stage} />
        <span className="pill" style={{ fontSize:11 }}><Vis.icon size={12}/> {Vis.label}</span>
      </div>
      <div>
        <div style={{ fontWeight:600, fontSize:17, marginBottom:4 }}>{idea.name}</div>
        <p className="muted" style={{ fontSize:13.5, lineHeight:1.45, margin:0 }}>{idea.one_liner}</p>
      </div>
      <div style={{ marginTop:"auto" }}>
        {streamIdea ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <Bucks amount={streamIdea.bucks} size={17} fontSize={14} style={{ color:"var(--accent-text)" }}/>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--success-text)", display:"flex", alignItems:"center", gap:3 }}><Icons.trend size={13}/> +{streamIdea.today}</span>
          </div>
        ) : (
          <div><div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><span className="faint" style={{ fontSize:12 }}>Brief</span><span className="mono faint" style={{ fontSize:12 }}>{pct}%</span></div><ProgressBar value={pct} height={5}/></div>
        )}
        <div className="faint" style={{ fontSize:11.5, marginTop:9 }}>Active {idea.lastActive}</div>
      </div>
    </Card>
  );
}

function Dashboard({ ideas, go, econ, onClaim, onNewIdea }) {
  const [tab, setTab] = useState("ideas");
  const backed = STREAM.filter(s => ["loop","clipline","drop"].includes(s.id)).map(s => ({ ...s, stake: s.id==="loop"?250:s.id==="clipline"?100:75 }));
  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 28px 100px" }}>
        {/* bucks summary */}
        <Card style={{ padding:0, overflow:"hidden", marginBottom:28, display:"grid", gridTemplateColumns:"1.4fr 1fr 1fr 1fr" }}>
          <div style={{ padding:"22px 24px", background:"var(--accent-soft)", display:"flex", flexDirection:"column", justifyContent:"center", gap:8 }}>
            <div className="faint" style={{ fontSize:11.5, textTransform:"uppercase", letterSpacing:"0.08em" }}>Your balance</div>
            <Bucks amount={econ.balance} size={30} fontSize={28} animate style={{ color:"var(--accent-text)" }}/>
            {!econ.claimedToday
              ? <button onClick={onClaim} className="claim-btn" style={{ alignSelf:"flex-start" }}>Claim +{econ.dailyClaim} today</button>
              : <span className="faint" style={{ fontSize:12, display:"flex", alignItems:"center", gap:5 }}><Icons.check size={13}/> {econ.streak}🔥 day streak</span>}
          </div>
          {[["Invested",econ.invested,true],["Leaderboard","#"+econ.rank,false],["Returns",econ.returns,false]].map(([l,v,coin])=>(
            <div key={l} style={{ padding:"22px 24px", borderLeft:"1px solid var(--border)", display:"flex", flexDirection:"column", justifyContent:"center", gap:6 }}>
              <div className="faint" style={{ fontSize:11.5, textTransform:"uppercase", letterSpacing:"0.08em" }}>{l}</div>
              {coin ? <Bucks amount={v} size={22} fontSize={20}/> : <div style={{ fontSize:24, fontWeight:600 }}>{v}</div>}
            </div>
          ))}
        </Card>

        <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:20 }}>
          {[["ideas","Your ideas"],["backing","Your backing"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{ border:"none", background:"none", fontSize:22, fontWeight:600, letterSpacing:"-0.01em", padding:0, color: tab===k?"var(--text-primary)":"var(--text-muted)" }}>{l}</button>
          ))}
          <div style={{ flex:1 }}/>
          <Btn onClick={onNewIdea}><Icons.plus size={16}/> New idea</Btn>
        </div>

        {tab==="ideas" ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
            {ideas.map(i => <MyIdeaCard key={i.id} idea={i} go={go}/>)}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {backed.map(b => (
              <Card key={b.id} hover onClick={()=>go({screen:"idea", ideaId:b.id})} style={{ display:"flex", alignItems:"center", gap:18, padding:"16px 20px" }}>
                <Avatar label={b.name[0]} kind="user" size={40} color={PEOPLE[b.author].color}/>
                <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:15.5 }}>{b.name}</div><p className="muted" style={{ fontSize:13, margin:"2px 0 0" }}>{b.one_liner}</p></div>
                <div style={{ textAlign:"right" }}><div className="faint" style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em" }}>Your stake</div><Bucks amount={b.stake} size={17} fontSize={14} style={{ justifyContent:"flex-end", color:"var(--accent-text)" }}/></div>
                <div style={{ textAlign:"right" }}><div className="faint" style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em" }}>Momentum</div><span style={{ fontSize:14, fontWeight:600, color:"var(--success-text)", display:"flex", alignItems:"center", gap:3, justifyContent:"flex-end" }}><Icons.trend size={13}/> +{b.today}</span></div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Workspace, Dashboard, VisibilityMenu, VIS });
