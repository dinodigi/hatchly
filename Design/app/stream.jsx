// ===== Public idea stream (homepage) + investor leaderboard =====

function CategoryDot({ category }) {
  const colors = { "Founder tools":"var(--accent)", "Creator tools":"var(--info)", "Commerce":"var(--success)", "Marketplace":"#B57BD0", "Consumer":"#D98C5F" };
  return <span className="dot" style={{ width:7, height:7, background:colors[category]||"var(--text-muted)" }} />;
}

function AuthorChip({ handle, size=20 }) {
  const p = PEOPLE[handle]; if (!p) return null;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12.5, color:"var(--text-secondary)" }}>
    <Avatar label={p.avatar} kind="user" size={size} color={p.color} /> {p.name}
  </span>;
}

// the compose entry — posting a new idea
function ComposeBar({ onPost }) {
  return (
    <div onClick={onPost} className="card card-hover" style={{ display:"flex", alignItems:"center", gap:14, padding:"15px 18px", cursor:"text", marginBottom:22 }}>
      <Avatar label={USER.avatar} kind="user" size={34} />
      <span className="muted" style={{ flex:1, fontSize:15 }}>Share an idea — a sentence is enough.</span>
      <Btn size="sm"><Icons.sparkle size={15}/> Start</Btn>
    </div>
  );
}

function SortTabs({ sort, setSort }) {
  const tabs = [["top","Top today",Icons.flame],["trending","Trending",Icons.trend],["new","New",Icons.sparkle]];
  return (
    <div style={{ display:"flex", gap:4 }}>
      {tabs.map(([k,label,I]) => (
        <button key={k} onClick={()=>setSort(k)} style={{
          display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:999, fontSize:13, fontWeight:500,
          border:"1px solid "+(sort===k?"transparent":"var(--border)"),
          background: sort===k?"var(--text-primary)":"var(--surface-raised)",
          color: sort===k?"var(--background)":"var(--text-secondary)",
        }}><I size={15}/> {label}</button>
      ))}
    </div>
  );
}

function TagPills({ tags, max=3 }) {
  if(!tags?.length) return null;
  return <span style={{ display:"inline-flex", gap:6, flexWrap:"wrap" }}>
    {tags.slice(0,max).map(t => <span key={t} className="tag-pill">{t}</span>)}
  </span>;
}

// big featured idea — an auctioned spotlight slot
function Spotlight({ idea, spotlight, go, onBack, onBidSpotlight, loggedIn }) {
  if(!idea) return null;
  const youHold = spotlight.holder==="you";
  return (
    <div className="card" style={{ padding:0, overflow:"hidden", marginBottom:26, border:"1px solid color-mix(in srgb, var(--accent) 34%, var(--border))" }}>
      <div style={{ position:"relative", height:128, ...coverStyle({type:"tone", key:idea.cover}) }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.06), transparent 60%)" }}/>
        <div style={{ position:"absolute", top:13, left:16, display:"flex", alignItems:"center", gap:7, padding:"5px 11px", borderRadius:999, background:"color-mix(in srgb, var(--background) 82%, transparent)", backdropFilter:"blur(6px)", border:"1px solid var(--border)" }}>
          <Icons.flame size={14} style={{ color:"var(--accent-text)" }} />
          <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--accent-text)" }}>Featured spotlight</span>
        </div>
        <div style={{ position:"absolute", top:13, right:16, display:"flex", alignItems:"center", gap:8, padding:"6px 12px", borderRadius:999, background:"color-mix(in srgb, var(--background) 82%, transparent)", backdropFilter:"blur(6px)", border:"1px solid var(--border)" }}>
          <span className="faint" style={{ fontSize:11.5 }}>{youHold?"You hold this slot":"Held by "+spotlight.holderName}</span>
          <span style={{ width:1, height:12, background:"var(--border-strong)" }}/>
          <Bucks amount={spotlight.amount} size={15} fontSize={13} style={{ color:"var(--accent-text)" }} />
        </div>
      </div>
      <div className="spot-grid" style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr" }}>
        <div style={{ padding:"22px 28px", cursor:"pointer" }} onClick={()=>go({screen:"idea", ideaId:idea.id})}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <h2 className="serif" style={{ fontSize:32, margin:0, fontStyle:"italic" }}>{idea.name}</h2>
            <Pill><CategoryDot category={idea.category}/> {idea.category}</Pill>
          </div>
          <p style={{ fontSize:16, lineHeight:1.5, margin:"0 0 12px", color:"var(--text-primary)", maxWidth:440 }}>{idea.one_liner}</p>
          <TagPills tags={idea.tags} />
          <div style={{ marginTop:16 }}><AuthorChip handle={idea.author} size={22} /></div>
        </div>
        <div style={{ padding:"22px 26px", borderLeft:"1px solid var(--border)", background:"var(--surface)", display:"flex", flexDirection:"column", justifyContent:"center", gap:16 }}>
          <div>
            <Bucks amount={idea.bucks} size={26} fontSize={28} animate />
            <div className="faint" style={{ fontSize:12, marginTop:3 }}>{idea.backers} backers · +{idea.today} today</div>
          </div>
          <Btn size="lg" onClick={()=>onBack(idea)}><Coin size={18}/> Back this idea</Btn>
          <button onClick={onBidSpotlight} className="btn btn-secondary btn-sm" style={{ width:"100%" }}>
            <Icons.flame size={14}/> {youHold?"Raise your bid":"Bid to feature yours"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedCard({ idea, rank, go, onBack }) {
  return (
    <div className="card card-hover feed-card" style={{ display:"flex", alignItems:"stretch", gap:0, padding:0, overflow:"hidden" }}>
      <div style={{ position:"relative", width:74, flex:"none", ...coverStyle({type:"tone", key:idea.cover}) }}>
        <span className="mono" style={{ position:"absolute", top:8, left:8, fontSize:11, fontWeight:700, color:"#fff", background:"rgba(0,0,0,0.42)", borderRadius:6, padding:"1px 7px" }}>{rank}</span>
      </div>
      <div style={{ flex:1, padding:"15px 18px", cursor:"pointer", minWidth:0 }} onClick={()=>go({screen:"idea", ideaId:idea.id})}>
        <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:5, flexWrap:"wrap" }}>
          <span style={{ fontWeight:600, fontSize:16 }}>{idea.name}</span>
          <TagPills tags={idea.tags} max={2} />
          {idea.owner && <span className="badge b-idea" style={{ fontSize:9.5 }}>Yours</span>}
        </div>
        <p className="muted" style={{ fontSize:14, lineHeight:1.45, margin:"0 0 10px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{idea.one_liner}</p>
        <AuthorChip handle={idea.author} />
      </div>
      <div className="feed-stats" style={{ display:"flex", alignItems:"center", gap:18, padding:"0 20px", flex:"none" }}>
        <div style={{ textAlign:"right" }}>
          <Bucks amount={idea.bucks} size={17} fontSize={15} style={{ justifyContent:"flex-end" }} />
          <div style={{ fontSize:11.5, fontWeight:600, color:"var(--success-text)", marginTop:3, display:"flex", alignItems:"center", gap:3, justifyContent:"flex-end" }}><Icons.trend size={12}/> +{idea.today}</div>
        </div>
        <Spark data={idea.spark} w={56} h={26} color="var(--accent)" />
        <Btn variant="soft" size="sm" onClick={(e)=>{ e.stopPropagation(); onBack(idea); }}><Coin size={15}/> Back</Btn>
      </div>
    </div>
  );
}

function Stream({ stream, go, onBack, onPost, loggedIn, spotlight, onBidSpotlight }) {
  const [sort, setSort] = useState("top");
  const spotIdea = stream.find(s=>s.id===spotlight?.ideaId) || [...stream].sort((x,y)=>y.today-x.today)[0];
  const sorted = useMemo(() => {
    const a = stream.filter(s=>s.id!==spotIdea.id);
    if (sort==="top") a.sort((x,y)=> y.today - x.today);
    else if (sort==="trending") a.sort((x,y)=> (y.today/y.bucks) - (x.today/x.bucks));
    else a.sort((x,y)=> x.ageDays - y.ageDays);
    return a;
  }, [stream, sort, spotIdea]);

  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <div style={{ maxWidth:1180, margin:"0 auto", padding:"30px 28px 100px" }}>
        <div className="stream-grid" style={{ display:"grid", gridTemplateColumns:"1fr 308px", gap:34, alignItems:"start" }}>
          <div>
            {!loggedIn ? (
              <div style={{ marginBottom:24 }}>
                <div className="eyebrow" style={{ fontSize:10.5, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--accent-text)", marginBottom:10 }}>The idea stream</div>
                <h1 style={{ fontSize:38, lineHeight:1.05, letterSpacing:"-0.02em", margin:"0 0 12px", maxWidth:560 }}>
                  Where ideas get <span className="serif" style={{ fontStyle:"italic" }}>backed</span> before they get built.
                </h1>
                <p className="muted" style={{ fontSize:16, margin:0, maxWidth:520 }}>Browse what founders are shaping right now. Back the ones you believe in with Hatchly Bucks — no account needed to look.</p>
              </div>
            ) : (
              <h1 style={{ fontSize:26, letterSpacing:"-0.02em", margin:"0 0 18px" }}>The stream</h1>
            )}
            <ComposeBar onPost={onPost} />
            <Spotlight idea={spotIdea} spotlight={spotlight||{holder:"",holderName:"",amount:0}} go={go} onBack={onBack} onBidSpotlight={onBidSpotlight} loggedIn={loggedIn} />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <SortTabs sort={sort} setSort={setSort} />
              <span className="faint" style={{ fontSize:12.5 }}>{stream.length} ideas live</span>
            </div>
            <Stagger style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {sorted.map((idea, i) => <FeedCard key={idea.id} idea={idea} rank={i+2} go={go} onBack={onBack} />)}
            </Stagger>
          </div>
          <StreamRail go={go} onBack={onBack} stream={stream} />
        </div>
      </div>
    </div>
  );
}

// right rail: movers + top backers teaser
function StreamRail({ go, onBack, stream }) {
  const movers = [...stream].sort((a,b)=> (b.today/b.bucks)-(a.today/a.bucks)).slice(0,4);
  return (
    <div style={{ position:"sticky", top:86, display:"flex", flexDirection:"column", gap:16 }}>
      <Card style={{ padding:18 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:14 }}>
          <Icons.flame size={16} style={{ color:"var(--accent-text)" }} />
          <span style={{ fontWeight:600, fontSize:14 }}>Biggest movers</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
          {movers.map(m => (
            <div key={m.id} onClick={()=>go({screen:"idea", ideaId:m.id})} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:13.5 }}>{m.name}</div>
                <div className="faint" style={{ fontSize:11.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.category}</div>
              </div>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--success-text)", display:"flex", alignItems:"center", gap:3 }}><Icons.trend size={12}/> +{m.today}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{ padding:18, background:"var(--surface)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
          <Icons.trophy size={16} style={{ color:"var(--accent-text)" }} />
          <span style={{ fontWeight:600, fontSize:14 }}>Top backers</span>
        </div>
        <p className="muted" style={{ fontSize:13, margin:"0 0 12px", lineHeight:1.5 }}>Back winners early and climb. Returns are prestige — never real money.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {LEADERBOARD.slice(0,3).map(p => (
            <div key={p.handle} style={{ display:"flex", alignItems:"center", gap:9 }}>
              <span className="mono" style={{ fontSize:12, fontWeight:600, color:"var(--accent-text)", width:14 }}>{p.rank}</span>
              <Avatar label={p.avatar} kind="user" size={24} color={p.color} />
              <span style={{ fontSize:13, fontWeight:500, flex:1 }}>{p.name}</span>
              <span className="mono faint" style={{ fontSize:12 }}>{window.fmt(p.invested)}</span>
            </div>
          ))}
        </div>
        <button onClick={()=>go({screen:"leaderboard"})} style={{ border:"none", background:"none", color:"var(--accent-text)", fontSize:13, fontWeight:600, marginTop:12, padding:0, display:"flex", alignItems:"center", gap:5 }}>
          Full leaderboard <Icons.arrowR size={14}/>
        </button>
      </Card>
    </div>
  );
}

// ---------- investor leaderboard (loud) ----------
function Leaderboard({ go, econ }) {
  const topIdeas = [...STREAM].sort((a,b)=>b.bucks-a.bucks).slice(0,5);
  const me = { rank:econ.rank, name:USER.name, avatar:USER.avatar, invested:econ.invested, returns:econ.returns, backed:9 };
  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <div style={{ maxWidth:1180, margin:"0 auto", padding:"36px 28px 100px" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div className="eyebrow" style={{ fontSize:10.5, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--accent-text)", marginBottom:10 }}>Hall of backers</div>
          <h1 style={{ fontSize:42, letterSpacing:"-0.02em", margin:"0 0 10px" }}>The ones with a <span className="serif" style={{ fontStyle:"italic" }}>track record</span></h1>
          <p className="muted" style={{ fontSize:16, margin:0 }}>Ranked by bucks invested and Returns earned backing ideas before they trended.</p>
        </div>

        {/* podium */}
        <div className="podium" style={{ display:"grid", gridTemplateColumns:"1fr 1.15fr 1fr", gap:16, alignItems:"end", marginBottom:30 }}>
          {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((p,i) => {
            const h = i===1 ? 200 : 168;
            return (
              <Card key={p.handle} style={{ textAlign:"center", padding:"24px 18px", height:h, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6,
                border: i===1?"1px solid color-mix(in srgb, var(--accent) 38%, var(--border))":"1px solid var(--border)" }}>
                <div style={{ position:"relative" }}>
                  <Avatar label={p.avatar} kind="user" size={i===1?60:50} color={p.color} />
                  <span style={{ position:"absolute", bottom:-6, right:-6, width:24, height:24, borderRadius:999, background: p.rank===1?"var(--accent)":"var(--surface-raised)", color:p.rank===1?"#fff":"var(--text-secondary)", border:"2px solid var(--background)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700 }} className="mono">{p.rank}</span>
                </div>
                <div style={{ fontWeight:600, fontSize:15, marginTop:6 }}>{p.name}</div>
                <Bucks amount={p.invested} size={18} fontSize={16} style={{ color:"var(--accent-text)" }} />
                <div className="faint" style={{ fontSize:11.5 }}>{p.returns} returns · {p.backed} backed</div>
              </Card>
            );
          })}
        </div>

        {/* full list */}
        <Card style={{ padding:0, overflow:"hidden", marginBottom:26 }}>
          {LEADERBOARD.slice(3).map(p => (
            <div key={p.handle} style={{ display:"flex", alignItems:"center", gap:14, padding:"15px 22px", borderBottom:"1px solid var(--border)" }}>
              <span className="mono" style={{ fontSize:15, fontWeight:600, color:"var(--text-muted)", width:24 }}>{p.rank}</span>
              <Avatar label={p.avatar} kind="user" size={36} color={p.color} />
              <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14.5 }}>{p.name}</div><div className="faint" style={{ fontSize:12 }}>{p.backed} ideas backed</div></div>
              {p.hot && <span className="badge b-idea" style={{ fontSize:9.5 }}><Icons.flame size={11}/> Hot streak</span>}
              <div style={{ textAlign:"right", display:"flex", alignItems:"center", gap:20 }}>
                <div><div className="mono faint" style={{ fontSize:10.5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Returns</div><div style={{ fontWeight:600, fontSize:15 }}>{p.returns}</div></div>
                <Bucks amount={p.invested} size={18} fontSize={15} style={{ minWidth:64, justifyContent:"flex-end" }} />
              </div>
            </div>
          ))}
          {/* you */}
          <div style={{ display:"flex", alignItems:"center", gap:14, padding:"15px 22px", background:"var(--accent-soft)" }}>
            <span className="mono" style={{ fontSize:15, fontWeight:600, color:"var(--accent-text)", width:24 }}>{me.rank}</span>
            <Avatar label={me.avatar} kind="user" size={36} />
            <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14.5 }}>{me.name} <span className="faint" style={{ fontWeight:400 }}>· you</span></div><div className="faint" style={{ fontSize:12 }}>{me.backed} ideas backed</div></div>
            <div style={{ textAlign:"right", display:"flex", alignItems:"center", gap:20 }}>
              <div><div className="mono faint" style={{ fontSize:10.5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Returns</div><div style={{ fontWeight:600, fontSize:15 }}>{me.returns}</div></div>
              <Bucks amount={me.invested} size={18} fontSize={15} style={{ minWidth:64, justifyContent:"flex-end", color:"var(--accent-text)" }} />
            </div>
          </div>
        </Card>

        <div>
          <SectionLabel style={{ marginBottom:12 }}>Most-backed ideas</SectionLabel>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
            {topIdeas.map((idea,i) => (
              <Card key={idea.id} hover onClick={()=>go({screen:"idea", ideaId:idea.id})} style={{ padding:16 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <span className="mono" style={{ fontSize:12, fontWeight:600, color:"var(--accent-text)" }}>#{i+1}</span>
                  <Spark data={idea.spark} w={48} h={20} color="var(--accent)" />
                </div>
                <div style={{ fontWeight:600, fontSize:15, marginBottom:4 }}>{idea.name}</div>
                <Bucks amount={idea.bucks} size={16} fontSize={14} style={{ color:"var(--accent-text)" }} />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Wallet — balance + transaction history =====
const TXN_META = {
  claim:     { I:Icons.coin,   color:"var(--success-text)", glyph:"var(--success-soft)" },
  bonus:     { I:Icons.sparkle,color:"var(--success-text)", glyph:"var(--success-soft)" },
  refund:    { I:Icons.back,   color:"var(--success-text)", glyph:"var(--success-soft)" },
  invest:    { I:Icons.trend,  color:"var(--text-primary)", glyph:"var(--surface)" },
  spotlight: { I:Icons.flame,  color:"var(--accent-text)",  glyph:"var(--accent-soft)" },
};

function Wallet({ econ, txns, spotlight, stream, go, onClaim }) {
  const youHold = spotlight?.holder==="you";
  const spotIdea = youHold ? stream.find(s=>s.id===spotlight.ideaId) : null;
  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <div style={{ maxWidth:860, margin:"0 auto", padding:"34px 28px 90px" }}>
        <h1 style={{ fontSize:28, letterSpacing:"-0.02em", margin:"0 0 4px" }}>Wallet</h1>
        <p className="muted" style={{ fontSize:14.5, margin:"0 0 26px" }}>Hatchly Bucks are play-money — prestige, never real currency.</p>

        {/* balance row */}
        <div className="wallet-summary" style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr 1fr", gap:14, marginBottom:14 }}>
          <Card style={{ padding:"22px 24px", background:"var(--accent-soft)", display:"flex", flexDirection:"column", gap:10 }}>
            <div className="faint" style={{ fontSize:11.5, textTransform:"uppercase", letterSpacing:"0.08em" }}>Available balance</div>
            <Bucks amount={econ.balance} size={34} fontSize={32} animate style={{ color:"var(--accent-text)" }} />
            {!econ.claimedToday
              ? <button onClick={onClaim} className="claim-btn" style={{ alignSelf:"flex-start" }}>Claim +{econ.dailyClaim} today</button>
              : <span className="faint" style={{ fontSize:12, display:"flex", alignItems:"center", gap:5 }}><Icons.check size={13}/> {econ.streak}🔥 day streak</span>}
          </Card>
          <Card style={{ padding:"22px 24px", display:"flex", flexDirection:"column", justifyContent:"center", gap:8 }}>
            <div className="faint" style={{ fontSize:11.5, textTransform:"uppercase", letterSpacing:"0.08em" }}>In escrow</div>
            <Bucks amount={econ.escrow||0} size={22} fontSize={20} />
            <div className="faint" style={{ fontSize:11.5, lineHeight:1.4 }}>{youHold && spotIdea ? "Spotlight bid on "+spotIdea.name : "Locked in active bids"}</div>
          </Card>
          <Card style={{ padding:"22px 24px", display:"flex", flexDirection:"column", justifyContent:"center", gap:8 }}>
            <div className="faint" style={{ fontSize:11.5, textTransform:"uppercase", letterSpacing:"0.08em" }}>Lifetime invested</div>
            <Bucks amount={econ.invested} size={22} fontSize={20} />
            <div className="faint" style={{ fontSize:11.5 }}>#{econ.rank} on the leaderboard</div>
          </Card>
        </div>

        {youHold && spotIdea && (
          <Card style={{ padding:"14px 18px", marginBottom:24, display:"flex", alignItems:"center", gap:12, border:"1px solid color-mix(in srgb, var(--accent) 34%, var(--border))" }}>
            <span style={{ width:34, height:34, borderRadius:9, background:"var(--accent-soft)", color:"var(--accent-text)", display:"flex", alignItems:"center", justifyContent:"center", flex:"none" }}><Icons.flame size={17}/></span>
            <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14 }}>You hold the spotlight — {spotIdea.name}</div><div className="faint" style={{ fontSize:12.5 }}>{spotlight.amount} bucks in escrow · returned the moment you're outbid.</div></div>
            <Btn size="sm" variant="secondary" onClick={()=>go({screen:"stream"})}>View on stream</Btn>
          </Card>
        )}

        <SectionLabel style={{ marginBottom:12 }}>Transactions</SectionLabel>
        <Card style={{ padding:0, overflow:"hidden" }}>
          {txns.map((t,i) => {
            const meta = TXN_META[t.type] || TXN_META.invest; const I = meta.I; const pos = t.amount>0;
            return (
              <div key={t.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px", borderBottom: i<txns.length-1?"1px solid var(--border)":"none" }}>
                <span style={{ width:34, height:34, borderRadius:9, background:meta.glyph, color:meta.color, display:"flex", alignItems:"center", justifyContent:"center", flex:"none" }}><I size={16}/></span>
                <div style={{ flex:1 }}><div style={{ fontWeight:500, fontSize:14 }}>{t.label}</div><div className="faint" style={{ fontSize:12 }}>{t.at}</div></div>
                <span style={{ display:"flex", alignItems:"center", gap:5, fontWeight:600, fontSize:14.5, fontVariantNumeric:"tabular-nums", color: pos?"var(--success-text)":"var(--text-primary)" }}>
                  {pos?"+":"−"}<Coin size={15}/>{Math.abs(t.amount).toLocaleString()}
                </span>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

// ===== Spotlight bid modal =====
function SpotlightBidModal({ myIdeas, econ, spotlight, onClose, onConfirm }) {
  const eligible = myIdeas.filter(i=>i.visibility==="public" && i.streamId);
  const min = spotlight.amount + 25;
  const [sel, setSel] = useState(eligible[0]?.streamId || null);
  const [amount, setAmount] = useState(Math.min(econ.balance, min));
  const ok = sel && amount>=min && amount<=econ.balance;
  return <>
    <Scrim onClose={onClose} />
    <div className="modal" style={{ width:460 }}>
      <div style={{ padding:"22px 26px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:6 }}>
          <span style={{ width:38, height:38, borderRadius:10, background:"var(--accent-soft)", color:"var(--accent-text)", display:"flex", alignItems:"center", justifyContent:"center" }}><Icons.flame size={19}/></span>
          <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:16 }}>Bid for the spotlight</div><div className="faint" style={{ fontSize:12.5 }}>Current bid: {spotlight.amount} · held by {spotlight.holder==="you"?"you":spotlight.holderName}</div></div>
          <IconBtn onClick={onClose}><Icons.x size={18}/></IconBtn>
        </div>
        <p className="muted" style={{ fontSize:13, lineHeight:1.55, margin:"6px 0 18px" }}>Feature one of your public ideas at the top of the stream. Your bucks go into escrow and come straight back the moment someone outbids you.</p>

        {eligible.length===0 ? (
          <div className="card" style={{ padding:16, textAlign:"center", background:"var(--surface)" }}>
            <p className="muted" style={{ fontSize:13, margin:"0 0 12px" }}>You need a public idea to bid. Publish one first.</p>
            <Btn variant="secondary" onClick={onClose}>Got it</Btn>
          </div>
        ) : <>
          <SectionLabel style={{ marginBottom:8 }}>Idea to feature</SectionLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:18 }}>
            {eligible.map(i => {
              const active = sel===i.streamId;
              return (
                <button key={i.id} onClick={()=>setSel(i.streamId)} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 13px", borderRadius:10, textAlign:"left",
                  border:"1px solid "+(active?"var(--accent)":"var(--border-strong)"), background: active?"var(--accent-soft)":"var(--surface-raised)" }}>
                  <span className="dot" style={{ width:8, height:8, background:active?"var(--accent)":"var(--border-strong)" }}/>
                  <span style={{ flex:1, fontWeight:600, fontSize:14 }}>{i.name}</span>
                  {active && <Icons.check size={15} style={{ color:"var(--accent-text)" }}/>}
                </button>
              );
            })}
          </div>
          <SectionLabel style={{ marginBottom:8 }}>Your bid · min {min}</SectionLabel>
          <div style={{ textAlign:"center", padding:"4px 0 14px" }}>
            <Bucks amount={amount} size={36} fontSize={34} style={{ justifyContent:"center" }} />
            <div className="faint" style={{ fontSize:12, marginTop:5 }}>of your {econ.balance.toLocaleString()} available</div>
          </div>
          <input type="range" min={min} max={Math.max(min, econ.balance)} step="25" value={amount} onChange={e=>setAmount(+e.target.value)} className="bucks-range" style={{ width:"100%" }} />
          <Btn size="lg" style={{ width:"100%", marginTop:18 }} disabled={!ok} onClick={()=>onConfirm(sel, amount)}>
            <Icons.flame size={17}/> {ok?`Bid ${amount} for the spotlight`:"Bid too low"}
          </Btn>
          <p className="faint" style={{ fontSize:11, textAlign:"center", margin:"12px 0 0" }}>Escrow, not spend. Outbid = full refund.</p>
        </>}
      </div>
    </div>
  </>;
}

Object.assign(window, { Stream, Leaderboard, AuthorChip, CategoryDot, Wallet, SpotlightBidModal });
