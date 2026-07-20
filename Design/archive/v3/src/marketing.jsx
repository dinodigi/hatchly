// ===== Marketing: landing + how it works =====

function MarkNav({ go, loggedIn }) {
  return (
    <div style={{ position:"sticky", top:0, zIndex:10, background:"color-mix(in srgb, var(--background) 86%, transparent)", backdropFilter:"blur(10px)", borderBottom:"1px solid var(--border)" }}>
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 40px", height:64, display:"flex", alignItems:"center", gap:14 }}>
        <div className="row gap8" style={{ cursor:"pointer" }} onClick={()=>go({screen:"marketing"})}>
          <span style={{ color:"var(--accent)" }}><Icons.logo size={22}/></span>
          <span style={{ fontWeight:600, fontSize:17, letterSpacing:"-0.01em" }}>Hatchly</span>
        </div>
        <div className="spacer" />
        <a className="muted" style={{ fontSize:13.5, padding:"6px 10px" }} onClick={()=>go({screen:"how"})}>How it works</a>
        {loggedIn
          ? <Btn variant="primary" size="sm" onClick={()=>go({screen:"ideas"})}>Open Hatchly</Btn>
          : <><a className="muted" style={{ fontSize:13.5, padding:"6px 10px" }} onClick={()=>go({screen:"auth", mode:"login"})}>Log in</a>
             <Btn variant="primary" size="sm" onClick={()=>go({screen:"auth", mode:"signup"})}>Start an idea</Btn></>}
      </div>
    </div>
  );
}

function PhaseStrip({ compact }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden", background:"var(--surface-raised)" }}>
      {PHASE_ORDER.map((k,i)=>{ const ph=PHASES[k]; return (
        <div key={k} style={{ padding:"22px 22px", borderRight:i<3?"1px solid var(--border)":"none" }}>
          <PhaseBadge phase={k} />
          <div style={{ fontWeight:600, fontSize:16, margin:"12px 0 4px", letterSpacing:"-0.01em" }}>{ph.verb}</div>
          {!compact && <div className="muted" style={{ fontSize:12.5, lineHeight:1.5 }}>{[
            "Chat captures the idea, builds tagged memory, fills the rubric.",
            "Score the 13 dimensions, generate the report, run action items.",
            "Archetype playbook becomes a real task board: legal, payments, ops.",
            "Chat becomes the standing advisor and source of truth.",
          ][i]}</div>}
        </div>
      );})}
    </div>
  );
}

function Landing({ go, loggedIn }) {
  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <MarkNav go={go} loggedIn={loggedIn} />
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 40px 120px" }}>
        {/* hero */}
        <header style={{ padding:"96px 0 64px" }}>
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--accent-text)", marginBottom:22 }}>From a sentence to a business</div>
          <h1 style={{ fontSize:72, lineHeight:1.0, letterSpacing:"-0.02em", margin:"0 0 26px", fontWeight:600, maxWidth:820 }}>
            The AI that takes your idea<br/><span className="serif italic" style={{ fontWeight:400 }}>all the way to launched.</span>
          </h1>
          <p className="muted" style={{ fontSize:19, lineHeight:1.6, maxWidth:600, margin:"0 0 32px" }}>
            Hatchly carries one idea from a rough sentence to a running business — shaping it, pressure-testing it, and walking the launch with you. One chat that remembers everything along the way.
          </p>
          <div className="row gap12">
            <Btn variant="primary" size="lg" onClick={()=>go(loggedIn?{screen:"ideas"}:{screen:"auth",mode:"signup"})}>Start an idea <Icons.chevR size={16}/></Btn>
            <Btn variant="secondary" size="lg" onClick={()=>go({screen:"how"})}>See how it works</Btn>
          </div>
          <div className="row gap24" style={{ marginTop:44, color:"var(--text-muted)", fontSize:13 }}>
            <div className="row gap8"><b style={{ color:"var(--text-primary)", fontSize:18, fontWeight:600 }}>12,400+</b> ideas shaped</div>
            <div className="row gap8"><b style={{ color:"var(--text-primary)", fontSize:18, fontWeight:600 }}>840</b> businesses launched</div>
            <div className="row gap8"><LiveDot/> live now</div>
          </div>
        </header>

        {/* lifecycle */}
        <section style={{ paddingTop:24 }}>
          <SectionLabel style={{ marginBottom:14 }}>The lifecycle · four phases</SectionLabel>
          <PhaseStrip />
        </section>

        {/* a chat that remembers */}
        <section style={{ paddingTop:80, display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }}>
          <div>
            <h2 className="serif italic" style={{ fontSize:40, margin:"0 0 16px", fontWeight:400, letterSpacing:"-0.01em" }}>A chat that remembers everything.</h2>
            <p className="muted" style={{ fontSize:15.5, lineHeight:1.65 }}>Every message becomes tagged memory. The agent reads the whole idea each turn — so "the distribution problem" resolves to a real dimension, and "that task" to a real card. It pressure-tests honestly, never flatters, and writes into every tab as you talk.</p>
            <div className="row gap8" style={{ marginTop:20, flexWrap:"wrap" }}>
              <Pill>Text</Pill><Pill>Paste a link</Pill><Pill>Voice</Pill><Pill accent>Tagged memory</Pill>
            </div>
          </div>
          <Card style={{ padding:0, overflow:"hidden" }}>
            <div className="row gap8" style={{ padding:"14px 18px", borderBottom:"1px solid var(--border)" }}>
              <Avatar kind="ai" label="H" size={24}/><span style={{ fontWeight:600, fontSize:13 }}>Loop</span>
              <Pill accent style={{ fontSize:10 }}>Validation</Pill>
            </div>
            <div className="col gap12" style={{ padding:18 }}>
              <ChatBubblePreview role="user" text="what's actually holding distribution back?"/>
              <ChatBubblePreview role="assistant" text="Two things in memory: the channel is crowded and you have no audience seed. The fix is a wedge — weekly essays + three founder podcasts. Want me to add both as action items?"/>
              <div className="row gap6" style={{ fontSize:11, color:"var(--text-muted)" }}><Icons.bolt size={13}/> create_action_item · tagged Distribution</div>
            </div>
          </Card>
        </section>

        {/* scorecard preview */}
        <section style={{ paddingTop:80 }}>
          <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-end", marginBottom:18 }}>
            <div><SectionLabel style={{ marginBottom:8 }}>Honest, not encouraging</SectionLabel><h2 style={{ fontSize:30, margin:0, letterSpacing:"-0.02em", fontWeight:600 }}>A 13-dimension scorecard</h2></div>
          </div>
          <Card>
            <div className="row gap24" style={{ alignItems:"center", flexWrap:"wrap" }}>
              <ScoreRing value={84} size={104} label="Loop · v2" />
              <div style={{ flex:1, minWidth:260 }}>
                <div className="serif italic" style={{ fontSize:22, marginBottom:10 }}>"Promising. A defensible bet with a clear ICP and a soft GTM."</div>
                <div className="grid" style={{ gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                  {Object.entries({Foundation:84,Position:68,Business:67,Execution:74}).map(([k,v])=>(
                    <div key={k}><div className="faint" style={{ fontSize:11, marginBottom:4 }}>{k}</div><ProgressBar value={v}/><div style={{ fontSize:13, fontWeight:600, marginTop:5 }}>{v}</div></div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* footer cta */}
        <section style={{ paddingTop:84 }}>
          <Card style={{ textAlign:"center", padding:"52px 24px", background:"var(--surface)" }}>
            <h2 className="serif italic" style={{ fontSize:38, margin:"0 0 10px", fontWeight:400 }}>What will you hatch?</h2>
            <p className="muted" style={{ fontSize:15, margin:"0 0 24px" }}>A sentence is enough to start.</p>
            <Btn variant="primary" size="lg" onClick={()=>go(loggedIn?{screen:"ideas"}:{screen:"auth",mode:"signup"})}>Start an idea</Btn>
          </Card>
          <div className="row" style={{ justifyContent:"space-between", marginTop:40, color:"var(--text-muted)", fontSize:12.5 }}>
            <div className="row gap8"><span style={{ color:"var(--accent)" }}><Icons.logo size={16}/></span> Hatchly</div>
            <div>© 2026 · A standalone product</div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ChatBubblePreview({ role, text }) {
  const ai = role==="assistant";
  return (
    <div className="row gap8" style={{ alignItems:"flex-start", flexDirection: ai?"row":"row-reverse" }}>
      <Avatar kind={ai?"ai":"user"} label={ai?"H":"A"} size={24}/>
      <div style={{ background: ai?"var(--surface)":"var(--accent-soft)", color: ai?"var(--text-primary)":"var(--text-primary)", padding:"9px 12px", borderRadius:12, fontSize:13, lineHeight:1.5, maxWidth:"82%" }}>{text}</div>
    </div>
  );
}

function HowItWorks({ go, loggedIn }) {
  const blocks = [
    { phase:"ideation", title:"Shape it", body:"You start with a sentence — or a link, or just talk. The agent interviews you as a conversation, extracting tagged memory and quietly filling a 13-dimension rubric. No forms.", does:"Captures memory · auto-tags · fills the rubric" },
    { phase:"validation", title:"Pressure-test it", body:"Once the idea is clear enough, the agent scores all 13 dimensions honestly and generates a versioned report — strongest, weakest, SWOT, competitors, and a ranked action plan. It will tell you when something is a 58.", does:"Scores dimensions · generates the report · seeds action items" },
    { phase:"launch", title:"Ship it", body:"Confirm your business type and the agent instantiates a real launch board from a proven playbook — legal, payments, ops, marketing — customized to your idea, with vendor suggestions.", does:"Instantiates the playbook · suggests vendors · tracks blockers" },
    { phase:"operating", title:"Run it", body:"After launch, the chat becomes your standing advisor and source of truth — answering from everything it remembers, logging decisions, and creating ongoing operational tasks.", does:"Retrieves context · logs decisions · advises" },
  ];
  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <MarkNav go={go} loggedIn={loggedIn} />
      <div style={{ maxWidth:840, margin:"0 auto", padding:"0 40px 120px" }}>
        <header style={{ padding:"80px 0 48px" }}>
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--accent-text)", marginBottom:20 }}>How it works</div>
          <h1 style={{ fontSize:54, lineHeight:1.04, letterSpacing:"-0.02em", margin:"0 0 18px", fontWeight:600 }}>Four phases,<br/><span className="serif italic" style={{ fontWeight:400 }}>one growing idea.</span></h1>
          <p className="muted" style={{ fontSize:18, maxWidth:560 }}>Phases are views over one record that accumulates state — not separate apps. Here's the whole arc.</p>
        </header>
        <Stagger className="col gap14">
          {blocks.map((b,i)=>(
            <Card key={b.phase} className="row gap24" style={{ alignItems:"flex-start", padding:28 }}>
              <div style={{ flex:"none", width:48, textAlign:"right" }}>
                <span className="mono" style={{ fontSize:22, color:"var(--text-muted)", fontWeight:500 }}>0{i+1}</span>
              </div>
              <div style={{ flex:1 }}>
                <div className="row gap10" style={{ marginBottom:10 }}><PhaseBadge phase={b.phase}/><span style={{ fontWeight:600, fontSize:18 }}>{b.title}</span></div>
                <p className="muted" style={{ fontSize:14.5, lineHeight:1.6, margin:"0 0 12px" }}>{b.body}</p>
                <div className="row gap6" style={{ fontSize:12, color:"var(--accent-text)" }}><Icons.sparkle size={14}/> {b.does}</div>
              </div>
            </Card>
          ))}
        </Stagger>
        <Card style={{ marginTop:24, background:"var(--surface)" }}>
          <div style={{ fontWeight:600, marginBottom:6 }}>Gates between phases</div>
          <p className="muted" style={{ fontSize:13.5, lineHeight:1.6, margin:0 }}>You advance only when a gate is met: enough of the rubric filled to validate, action items closed and archetype confirmed to launch, blocking tasks done to go live. Phase is status — you can't skip it.</p>
        </Card>
        <div style={{ textAlign:"center", marginTop:40 }}>
          <Btn variant="primary" size="lg" onClick={()=>go(loggedIn?{screen:"ideas"}:{screen:"auth",mode:"signup"})}>Start an idea</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Landing, HowItWorks, PhaseStrip });
