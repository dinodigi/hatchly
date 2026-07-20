// ===== Public idea page — PRD snapshot + invest panel + community signals =====

function PRDSnapshot({ prd }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      {PRD_SECTIONS.map(sec => {
        const val = prd[sec.key === "open" ? "open" : sec.key];
        const empty = sec.list ? !(val||[]).length : !val;
        return (
          <div key={sec.key}>
            <SectionLabel style={{ marginBottom:8 }}>{sec.label}</SectionLabel>
            {empty ? (
              <p className="faint" style={{ fontSize:14, margin:0, fontStyle:"italic" }}>Not captured yet.</p>
            ) : sec.list ? (
              <ul style={{ margin:0, paddingLeft:0, listStyle:"none", display:"flex", flexDirection:"column", gap:8 }}>
                {val.map((it,i) => (
                  <li key={i} style={{ display:"flex", gap:10, fontSize:14.5, lineHeight:1.5 }}>
                    <span style={{ color: sec.key==="open"?"var(--info-text)":"var(--accent-text)", flex:"none", marginTop:1 }}>
                      {sec.key==="open" ? <Icons.search size={15}/> : <Icons.check size={15}/>}
                    </span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize:14.5, lineHeight:1.6, margin:0 }}>{val}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// would-you-use-it voter
function DemandVoter({ pct }) {
  const [vote, setVote] = useState(null);
  const shown = vote ? Math.min(99, pct + (vote==="yes"?1:0)) : pct;
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:13.5, fontWeight:600 }}>Would you use this?</span>
        <span style={{ fontSize:13.5, fontWeight:600, color:"var(--success-text)" }}><CountUp to={shown} />% yes</span>
      </div>
      <ProgressBar value={shown} color="var(--success)" height={7} />
      {vote ? (
        <p className="faint" style={{ fontSize:12.5, margin:"10px 0 0" }}>Thanks — your signal's counted.</p>
      ) : (
        <div style={{ display:"flex", gap:8, marginTop:11 }}>
          {[["yes","Yes, I'd use it"],["maybe","Maybe"],["no","Not for me"]].map(([k,l]) => (
            <button key={k} onClick={()=>setVote(k)} style={{
              flex:1, padding:"8px 0", borderRadius:8, fontSize:12.5, fontWeight:500,
              border:"1px solid var(--border-strong)", background:"var(--surface-raised)", color:"var(--text-primary)",
            }}>{l}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackBox({ idea, onFeedback }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const send = ()=>{ if(!text.trim()) return; onFeedback && onFeedback(idea.id, text.trim()); setText(""); setSent(true); };
  return (
    <div style={{ marginTop:28 }}>
      <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:14 }}>
        <Icons.chat size={17} style={{ color:"var(--accent-text)" }}/>
        <h2 style={{ fontSize:18, margin:0, letterSpacing:"-0.01em" }}>Feedback for the founder</h2>
      </div>
      <Card style={{ padding:18 }}>
        {sent ? (
          <div style={{ display:"flex", alignItems:"center", gap:11, padding:"6px 2px" }}>
            <span style={{ width:34, height:34, borderRadius:999, background:"var(--success-soft)", color:"var(--success-text)", display:"flex", alignItems:"center", justifyContent:"center", flex:"none" }}><Icons.check size={18}/></span>
            <div><div style={{ fontWeight:600, fontSize:14 }}>Sent to {PEOPLE[idea.author]?.name?.split(" ")[0] || "the founder"}</div><div className="faint" style={{ fontSize:12.5 }}>It shows up on their idea dashboard. <button onClick={()=>setSent(false)} className="link-btn">Leave more</button></div></div>
          </div>
        ) : <>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={3} placeholder="What would make this better? What would make you use it? Be honest — it goes straight to the founder."
            className="edit-area" style={{ width:"100%", fontSize:14, lineHeight:1.55, marginBottom:12 }} />
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span className="faint" style={{ fontSize:12, flex:1 }}>Posting as {USER.name}</span>
            <Btn size="sm" disabled={!text.trim()} onClick={send}><Icons.send size={14}/> Send feedback</Btn>
          </div>
        </>}
      </Card>
    </div>
  );
}

function IdeaPage({ idea, go, onBack, econ, onFeedback }) {
  const author = PEOPLE[idea.author];
  const [notified, setNotified] = useState(false);
  const topBackers = ["maya","devon","jules","priya","noah"];
  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"22px 28px 100px" }}>
        <button onClick={()=>go({screen:"stream"})} style={{ border:"none", background:"none", color:"var(--text-secondary)", fontSize:13.5, display:"flex", alignItems:"center", gap:6, marginBottom:18, padding:0 }}>
          <Icons.back size={16}/> The stream
        </button>

        {idea.cover && <div className="cover-band" style={{ ...coverStyle({type:"tone", key:idea.cover}), borderRadius:14, marginBottom:20, height:150 }} />}

        <div className="idea-grid" style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:34, alignItems:"start" }}>
          {/* left: the idea + PRD */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, flexWrap:"wrap" }}>
              <h1 className="serif" style={{ fontSize:44, margin:0, fontStyle:"italic", lineHeight:1 }}>{idea.name}</h1>
              <Pill><CategoryDot category={idea.category}/> {idea.category}</Pill>
              <StageBadge stage="public" />
            </div>
            <p style={{ fontSize:18, lineHeight:1.5, margin:"0 0 14px", maxWidth:560 }}>{idea.one_liner}</p>
            {idea.tags?.length>0 && <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:16 }}>{idea.tags.map(t=><span key={t} className="tag-pill">{t}</span>)}</div>}
            {idea.description && idea.description!==idea.one_liner && <p className="muted" style={{ fontSize:15, lineHeight:1.6, margin:"0 0 18px", maxWidth:560 }}>{idea.description}</p>}
            <div style={{ display:"flex", alignItems:"center", gap:14, paddingBottom:22, marginBottom:24, borderBottom:"1px solid var(--border)" }}>
              <AuthorChip handle={idea.author} size={26} />
              <span className="faint" style={{ fontSize:12.5 }}>· posted {idea.ageDays}d ago</span>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:18 }}>
              <Icons.doc size={17} style={{ color:"var(--accent-text)" }}/>
              <h2 style={{ fontSize:18, margin:0, letterSpacing:"-0.01em" }}>Product brief</h2>
              <span className="faint" style={{ fontSize:12.5 }}>· shaped in chat, kept live</span>
            </div>
            <Card style={{ padding:"26px 28px" }}>
              <PRDSnapshot prd={idea.prd} />
            </Card>

            <FeedbackBox idea={idea} onFeedback={onFeedback} />
          </div>

          {/* right: invest + signals */}
          <div style={{ position:"sticky", top:86, display:"flex", flexDirection:"column", gap:16 }}>
            <Card style={{ padding:22, position:"relative", overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:4 }}>
                <Bucks amount={idea.bucks} size={30} fontSize={30} animate style={{ color:"var(--accent-text)" }} />
                <span style={{ fontSize:13, fontWeight:600, color:"var(--success-text)", display:"flex", alignItems:"center", gap:4 }}><Icons.trend size={15}/> +{idea.today} today</span>
              </div>
              <div className="faint" style={{ fontSize:12.5, marginBottom:16 }}>bucks invested · {idea.backers} backers</div>
              <Spark data={idea.spark} w={290} h={44} color="var(--accent)" />
              <Btn size="lg" style={{ width:"100%", marginTop:18 }} onClick={()=>onBack(idea)}><Coin size={18}/> Back this idea</Btn>
              {idea.liveUrl && <a href={idea.liveUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width:"100%", marginTop:8 }}><LiveDot/> Visit live app <Icons.ext size={14}/></a>}
              <div style={{ display:"flex", alignItems:"center", gap:0, marginTop:14 }}>
                <div style={{ display:"flex" }}>
                  {topBackers.map((h,i) => (
                    <span key={h} style={{ marginLeft:i?-8:0 }}><Avatar label={PEOPLE[h].avatar} kind="user" size={26} color={PEOPLE[h].color} /></span>
                  ))}
                </div>
                <span className="faint" style={{ fontSize:12.5, marginLeft:10 }}>+{idea.backers-5} others backing</span>
              </div>
              <p className="faint" style={{ fontSize:11, textAlign:"center", margin:"14px 0 0", lineHeight:1.5 }}>Hatchly Bucks are play-money. Prestige, not equity.</p>
            </Card>

            <Card style={{ padding:22 }}>
              <SectionLabel style={{ marginBottom:16 }}>Community signal</SectionLabel>
              <DemandVoter pct={idea.signals.wouldUse} />
              <div style={{ height:1, background:"var(--border)", margin:"18px 0" }}/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
                <div><div className="faint" style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Demand</div><div style={{ fontWeight:600, fontSize:15 }}>{idea.signals.demand}</div></div>
                <div><div className="faint" style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Willing to pay</div><div style={{ fontWeight:600, fontSize:15 }}>{idea.signals.wtp}</div></div>
              </div>
              <button onClick={()=>setNotified(true)} disabled={notified} style={{
                width:"100%", padding:"11px 0", borderRadius:10, fontSize:13.5, fontWeight:500, display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                border:"1px solid var(--border-strong)", background: notified?"var(--success-soft)":"var(--surface-raised)", color: notified?"var(--success-text)":"var(--text-primary)",
              }}>
                {notified ? <><Icons.check size={16}/> You'll be notified</> : <><Icons.bell size={16}/> Notify me if it launches</>}
              </button>
              <p className="faint" style={{ fontSize:12, textAlign:"center", margin:"10px 0 0" }}>{idea.signals.notify + (notified?1:0)} want to know when it ships</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { IdeaPage, PRDSnapshot });
