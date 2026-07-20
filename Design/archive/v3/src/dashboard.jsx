// ===== All-ideas dashboard: insights strip + idea grid =====

function TopBar({ go, theme, setTheme, active }) {
  return (
    <div style={{ position:"sticky", top:0, zIndex:10, background:"color-mix(in srgb, var(--background) 88%, transparent)", backdropFilter:"blur(10px)", borderBottom:"1px solid var(--border)" }}>
      <div style={{ maxWidth:1140, margin:"0 auto", padding:"0 36px", height:60, display:"flex", alignItems:"center", gap:16 }}>
        <div className="row gap8" style={{ cursor:"pointer" }} onClick={()=>go({screen:"ideas"})}>
          <span style={{ color:"var(--accent)" }}><Icons.logo size={21}/></span>
          <span style={{ fontWeight:600, fontSize:16 }}>Hatchly</span>
        </div>
        <div className="spacer"/>
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <IconBtn onClick={()=>go({screen:"settings"})} title="Settings"><Icons.settings size={18}/></IconBtn>
        <div onClick={()=>go({screen:"settings"})} style={{ cursor:"pointer" }}><Avatar kind="user" label={USER.avatar} size={30}/></div>
      </div>
    </div>
  );
}

function ThemeToggle({ theme, setTheme }) {
  return (
    <div style={{ display:"inline-flex", gap:2, padding:3, borderRadius:9, background:"var(--surface)", border:"1px solid var(--border)" }}>
      {["light","dark"].map(t=>(
        <button key={t} onClick={()=>setTheme(t)} style={{ padding:"5px 11px", borderRadius:6, border:"none", fontSize:12, fontWeight:500, background: theme===t?"var(--surface-raised)":"transparent", color: theme===t?"var(--text-primary)":"var(--text-secondary)", boxShadow: theme===t?"var(--shadow-card)":"none", textTransform:"capitalize" }}>{t}</button>
      ))}
    </div>
  );
}

function InsightStrip({ ideas, go }) {
  const active = ideas.filter(i=>!i.archived);
  if (active.length === 0) return null;
  if (active.length === 1) {
    return (
      <Card className="row gap12" style={{ background:"var(--surface)", alignItems:"center", marginBottom:22 }}>
        <span style={{ color:"var(--accent-text)" }}><Icons.sparkle size={18}/></span>
        <div style={{ fontSize:13.5 }}>Keep going — the more you tell me, the sharper the picture gets.</div>
      </Card>
    );
  }
  const insights = [
    { kind:"stalled", icon:Icons.clock, color:"var(--danger)", tone:"var(--danger-soft)", label:"Stalled", text:"Pantry idle 9 days — 3 dimensions from validation", ideaId:"i_pantry", tab:"overview", fresh:false },
    { kind:"ready", icon:Icons.flag, color:"var(--success)", tone:"var(--success-soft)", label:"Ready to advance", text:"Loop is ready to move to Launch", ideaId:"i_loop", tab:"scorecard", fresh:true },
    { kind:"mover", icon:Icons.trend, color:"var(--info)", tone:"var(--info-soft)", label:"Top mover", text:"Drop +5 this week", ideaId:"i_drop", tab:"overview", fresh:false },
    { kind:"focus", icon:Icons.target, color:"var(--accent)", tone:"var(--accent-soft)", label:"Suggested focus", text:"Loop's distribution gap — the wedge to work next", ideaId:"i_loop", tab:"plan", fresh:false },
  ];
  return (
    <div style={{ marginBottom:26 }}>
      <div className="row gap8" style={{ marginBottom:12 }}>
        <span style={{ color:"var(--accent-text)" }}><Icons.sparkle size={16}/></span>
        <SectionLabel>Smart insights</SectionLabel>
        <div className="hr" style={{ flex:1 }}/>
      </div>
      <Stagger className="grid" step={60} style={{ gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {insights.map(ins=>(
          <Card key={ins.kind} hover onClick={()=>go({screen:"workspace", ideaId:ins.ideaId, tab:ins.tab})} style={{ padding:16, position:"relative" }}>
            {ins.fresh && <span className="dot" style={{ position:"absolute", top:14, right:14, width:7, height:7, background:"var(--accent)" }}/>}
            <div className="row gap8" style={{ marginBottom:10 }}>
              <span style={{ width:26, height:26, borderRadius:7, background:ins.tone, color:ins.color, display:"flex", alignItems:"center", justifyContent:"center" }}><ins.icon size={15}/></span>
              <span className="faint" style={{ fontSize:10.5, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>{ins.label}</span>
            </div>
            <div style={{ fontSize:13, lineHeight:1.45, fontWeight:500 }}>{ins.text}</div>
          </Card>
        ))}
      </Stagger>
    </div>
  );
}

function IdeaCard({ idea, go, onArchive }) {
  const [menu, setMenu] = useState(false);
  const ideation = idea.phase === "ideation";
  return (
    <Card hover onClick={()=>go({screen:"workspace", ideaId:idea.id, tab:idea.lastTab})} style={{ padding:20, position:"relative", opacity:idea.archived?0.55:1 }}>
      <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <PhaseBadge phase={idea.phase}/>
        <div style={{ position:"relative" }}>
          <IconBtn onClick={(e)=>{ e.stopPropagation(); setMenu(m=>!m); }} style={{ width:26, height:26 }}><Icons.dots size={16}/></IconBtn>
          {menu && (
            <>
              <div style={{ position:"fixed", inset:0, zIndex:5 }} onClick={(e)=>{ e.stopPropagation(); setMenu(false); }}/>
              <div className="card" style={{ position:"absolute", top:30, right:0, zIndex:6, padding:5, width:150, boxShadow:"var(--shadow-lift)" }} onClick={e=>e.stopPropagation()}>
                {[["Rename",Icons.edit],["Archive",Icons.archive]].map(([t,I])=>(
                  <div key={t} className="row gap8" style={{ padding:"7px 9px", borderRadius:7, fontSize:13, cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background="var(--surface)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    onClick={()=>{ setMenu(false); if(t==="Archive") onArchive(idea.id); }}><I size={14}/> {t}</div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-start", gap:14 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:19, fontWeight:600, letterSpacing:"-0.01em", marginBottom:4 }}>{idea.name}</div>
          <div className="muted clamp2" style={{ fontSize:13, lineHeight:1.5 }}>{idea.one_liner}</div>
        </div>
        {ideation
          ? <ScoreRing value={idea.completeness} size={62} stroke={5} color="var(--accent)" label="shaped" animate={false}/>
          : <ScoreRing value={idea.current_score} size={62} stroke={5} animate={false}/>}
      </div>
      <div className="row gap8" style={{ marginTop:16, paddingTop:14, borderTop:"1px solid var(--border)", alignItems:"flex-start" }}>
        <span style={{ color:"var(--accent-text)", marginTop:1 }}><Icons.sparkle size={14}/></span>
        <div style={{ flex:1, fontSize:12.5, lineHeight:1.45, color:"var(--text-secondary)" }}>{idea.next_move}</div>
      </div>
      <div className="row" style={{ justifyContent:"space-between", marginTop:14, alignItems:"center" }}>
        {idea.archetype
          ? <Pill style={{ textTransform:"capitalize" }}>{idea.archetype.replace("_"," ")}</Pill>
          : <Pill className="faint">unset type</Pill>}
        <span className="faint" style={{ fontSize:11.5 }}>{idea.stalled && <span style={{ color:"var(--danger-text)" }}>● </span>}{idea.last_activity}</span>
      </div>
    </Card>
  );
}

function Dashboard({ ideas, go, theme, setTheme, onNewIdea, onArchive, importedIdeas, importBatches, onImport, onConvertImport, onDismissImport, onRestoreImport }) {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("active"); // active | archived
  const [mainTab, setMainTab] = useState("ideas"); // ideas | imported
  const [wizard, setWizard] = useState(false);
  const [quickLook, setQuickLook] = useState(null);
  const visible = ideas.filter(i => view==="archived" ? i.archived : !i.archived)
    .filter(i => filter==="all" ? true : i.phase===filter);
  const firstRun = ideas.filter(i=>!i.archived).length === 0;
  const stagedCount = (importedIdeas||[]).filter(i=>i.status==="staged").length;
  const qlBatch = quickLook ? (importBatches||[]).find(b=>b.id===quickLook.batch_id) : null;

  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <TopBar go={go} theme={theme} setTheme={setTheme}/>
      <div style={{ maxWidth:1140, margin:"0 auto", padding:"32px 36px 100px" }}>

        {/* main tabs */}
        <div className="row gap4" style={{ borderBottom:"1px solid var(--border)", marginBottom:26 }}>
          {[["ideas","Your ideas",null],["imported","Imported ideas",stagedCount]].map(([k,l,badge])=>(
            <button key={k} onClick={()=>setMainTab(k)} style={{ background:"none", border:"none", cursor:"pointer", padding:"0 2px 12px", marginRight:22, position:"relative", display:"flex", alignItems:"center", gap:7,
              color: mainTab===k?"var(--text-primary)":"var(--text-secondary)", fontSize:15, fontWeight: mainTab===k?600:500 }}>
              {l}
              {badge>0 && <span style={{ fontSize:11, fontWeight:600, color: mainTab===k?"var(--accent-text)":"var(--text-muted)", background: mainTab===k?"var(--accent-soft)":"var(--surface)", borderRadius:999, padding:"1px 7px" }}>{badge}</span>}
              {mainTab===k && <span style={{ position:"absolute", left:0, right:0, bottom:-1, height:2, background:"var(--accent)", borderRadius:2 }}/>}
            </button>
          ))}
        </div>

        {mainTab==="imported" ? (
          <>
            <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-end", marginBottom:24 }}>
              <div>
                <h1 style={{ fontSize:30, margin:"0 0 4px", letterSpacing:"-0.02em", fontWeight:600 }}>Imported ideas</h1>
                <p className="muted" style={{ margin:0, fontSize:14 }}>Sparks mined from your chats. Convert the ones worth building — the rest stay out of your way.</p>
              </div>
              {(importedIdeas||[]).length>0 && <Btn variant="primary" onClick={()=>setWizard(true)}><Icons.plus size={16}/> Import more</Btn>}
            </div>
            <ImportedView batches={importBatches||[]} importedIdeas={importedIdeas||[]} ideas={ideas} go={go}
              onOpenWizard={()=>setWizard(true)} onConvert={onConvertImport} onDismiss={onDismissImport} onRestore={onRestoreImport}
              onQuickLook={setQuickLook}/>
          </>
        ) : (
        <>
        <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-end", marginBottom:26 }}>
          <div>
            <h1 style={{ fontSize:30, margin:"0 0 4px", letterSpacing:"-0.02em", fontWeight:600 }}>Your ideas</h1>
            <p className="muted" style={{ margin:0, fontSize:14 }}>One founder, {ideas.filter(i=>!i.archived).length} ideas in flight.</p>
          </div>
          <div className="row gap8">
            <Btn variant="secondary" onClick={()=>setWizard(true)}><Icons.sparkle size={15}/> Import from chats</Btn>
            <Btn variant="primary" onClick={onNewIdea}><Icons.plus size={16}/> New idea</Btn>
          </div>
        </div>

        {firstRun ? (
          <div style={{ textAlign:"center", padding:"100px 24px" }}>
            <h2 className="serif italic" style={{ fontSize:38, margin:"0 0 8px", fontWeight:400 }}>What will you hatch first?</h2>
            <p className="muted" style={{ fontSize:15, margin:"0 0 24px" }}>A sentence is enough. We'll shape it together from there.</p>
            <div className="row gap10" style={{ justifyContent:"center" }}>
              <Btn variant="primary" size="lg" onClick={onNewIdea}>Start your first idea</Btn>
              <Btn variant="secondary" size="lg" onClick={()=>setWizard(true)}><Icons.sparkle size={16}/> Import from your chats</Btn>
            </div>
          </div>
        ) : (
          <>
            {view==="active" && <InsightStrip ideas={ideas} go={go}/>}

            <div className="row gap8" style={{ marginBottom:18, flexWrap:"wrap" }}>
              {[["all","All"],["ideation","Ideation"],["validation","Validation"],["launch","Launch"]].map(([k,l])=>(
                <button key={k} onClick={()=>{ setFilter(k); setView("active"); }} className="pill" style={{ cursor:"pointer", border:"1px solid", borderColor: filter===k&&view==="active"?"var(--text-muted)":"var(--border)", background: filter===k&&view==="active"?"var(--surface-raised)":"var(--surface)", color: filter===k&&view==="active"?"var(--text-primary)":"var(--text-secondary)", padding:"6px 13px" }}>{l}</button>
              ))}
              <div className="spacer"/>
              <button onClick={()=>setView(v=>v==="archived"?"active":"archived")} className="pill" style={{ cursor:"pointer", padding:"6px 13px", color: view==="archived"?"var(--text-primary)":"var(--text-secondary)" }}><Icons.archive size={13}/> Archived</button>
            </div>

            {visible.length === 0
              ? <Empty icon={Icons.archive} title={view==="archived"?"Nothing archived":"No ideas here"} body={view==="archived"?"Archived ideas stay out of the main grid and insights.":"Try a different filter, or start something new."}/>
              : <Stagger className="grid" step={70} style={{ gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
                  {visible.map(idea=>(
                    view==="archived"
                      ? <Card key={idea.id} style={{ padding:20, opacity:0.7 }}>
                          <div className="row" style={{ justifyContent:"space-between" }}><div style={{ fontWeight:600, fontSize:17 }}>{idea.name}</div><Btn variant="ghost" size="sm" onClick={()=>onArchive(idea.id)}><Icons.restore size={14}/> Restore</Btn></div>
                          <div className="muted clamp2" style={{ fontSize:13, marginTop:4 }}>{idea.one_liner}</div>
                        </Card>
                      : <IdeaCard key={idea.id} idea={idea} go={go} onArchive={onArchive}/>
                  ))}
                </Stagger>}
          </>
        )}
        </>
        )}
      </div>

      {wizard && <ImportWizard onClose={()=>setWizard(false)} onImport={(res,label)=>{ onImport(res,label); setWizard(false); setMainTab("imported"); }}/>}
      {quickLook && <ImportQuickLook item={quickLook} batch={qlBatch} ideas={ideas} onClose={()=>setQuickLook(null)} onConvert={onConvertImport} onDismiss={onDismissImport} go={go}/>}
    </div>
  );
}

Object.assign(window, { Dashboard, TopBar, ThemeToggle });
