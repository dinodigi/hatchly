// ===== Quick Ideas — a Reddit-style board of one-line "someone should build this" posts =====

const QI_TAGS = ["AI","SaaS","Consumer","Marketplace","Fintech","Productivity","Creator","Education","Health"];
const QI_TEMPLATES = [
  { label:"___ for ___", fill:"Netflix for " },
  { label:"___ but ___", fill:"Airbnb but " },
  { label:"An app that ___", fill:"An app that " },
];

function QuickComposer({ onPost, postedToday }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("Consumer");
  const post = ()=>{ if(!title.trim()) return; onPost({ title:title.trim(), desc:desc.trim(), tag }); setTitle(""); setDesc(""); setOpen(false); };

  if (postedToday) return (
    <Card style={{ padding:"16px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:12, background:"var(--surface)" }}>
      <span style={{ width:36, height:36, borderRadius:999, background:"var(--success-soft)", color:"var(--success-text)", display:"flex", alignItems:"center", justifyContent:"center", flex:"none" }}><Icons.check size={18}/></span>
      <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14 }}>That's your idea for today</div><div className="faint" style={{ fontSize:12.5 }}>One a day keeps the board fresh. Come back tomorrow.</div></div>
    </Card>
  );

  if (!open) return (
    <div onClick={()=>setOpen(true)} className="card card-hover" style={{ display:"flex", alignItems:"center", gap:14, padding:"15px 18px", cursor:"text", marginBottom:20 }}>
      <Avatar label={USER.avatar} kind="user" size={34} />
      <span className="muted" style={{ flex:1, fontSize:15 }}>Got a "someone should build this"? Drop it — one a day.</span>
      <Btn size="sm"><Icons.bolt size={15}/> Post idea</Btn>
    </div>
  );

  return (
    <Card style={{ padding:20, marginBottom:20, border:"1px solid var(--accent)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
        <SectionLabel>Your one-liner</SectionLabel>
        <span className="faint" style={{ fontSize:11.5 }}>one idea per day</span>
      </div>
      <input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Uber for cats"
        style={{ width:"100%", border:"none", borderBottom:"2px solid var(--border-strong)", background:"none", outline:"none", fontSize:22, fontWeight:600, letterSpacing:"-0.01em", padding:"8px 0", marginBottom:10 }} />
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
        <span className="faint" style={{ fontSize:12 }}>Need a start?</span>
        {QI_TEMPLATES.map(t => (
          <button key={t.label} onClick={()=>setTitle(t.fill)} className="tag-pick">{t.label}</button>
        ))}
      </div>
      <div className="faint" style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Add detail (optional)</div>
      <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={2} placeholder="A sentence on why it should exist…"
        className="edit-area" style={{ width:"100%", fontSize:14, lineHeight:1.55, marginBottom:14 }} />
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span className="faint" style={{ fontSize:12.5 }}>Tag</span>
        <select value={tag} onChange={e=>setTag(e.target.value)} className="mini-select">
          {QI_TAGS.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{ flex:1 }}/>
        <Btn size="sm" variant="secondary" onClick={()=>{ setOpen(false); setTitle(""); setDesc(""); }}>Cancel</Btn>
        <Btn size="sm" disabled={!title.trim()} onClick={post}><Icons.bolt size={14}/> Post idea</Btn>
      </div>
    </Card>
  );
}

function QuickCard({ q, rank, onUpvote, onClone, onOpen }) {
  const author = PEOPLE[q.author];
  const tagColor = { AI:"var(--info)", Fintech:"var(--success)", Marketplace:"#B57BD0", Productivity:"var(--accent)", Consumer:"#D98C5F", Creator:"var(--info)", Education:"var(--success)" };
  return (
    <div className="card card-hover" style={{ display:"flex", alignItems:"stretch", gap:0, padding:0, overflow:"hidden" }}>
      {/* vote column */}
      <div style={{ width:64, flex:"none", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, background:"var(--surface)", borderRight:"1px solid var(--border)" }}>
        <button onClick={(e)=>{ e.stopPropagation(); onUpvote(q.id); }} className={"vote-btn "+(q.voted?"voted":"")}><Icons.chevUp size={18}/></button>
        <span className="mono" style={{ fontSize:14, fontWeight:700, color: q.voted?"var(--accent-text)":"var(--text-primary)" }}>{q.upvotes}</span>
      </div>
      <div style={{ flex:1, padding:"14px 18px", cursor:"pointer", minWidth:0 }} onClick={()=>onOpen(q)}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
          <span className="tag-pill" style={{ borderColor:"transparent", background:"var(--surface)" }}><span className="dot" style={{ width:6, height:6, background:tagColor[q.tag]||"var(--text-muted)" }}/> {q.tag}</span>
          <span className="faint" style={{ fontSize:12 }}>· {q.ago}</span>
        </div>
        <div style={{ fontWeight:600, fontSize:16.5, lineHeight:1.3, marginBottom:q.desc?4:8 }}>{q.title}</div>
        {q.desc && <p className="muted" style={{ fontSize:13.5, lineHeight:1.45, margin:"0 0 8px" }}>{q.desc}</p>}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12.5, color:"var(--text-secondary)" }}><Avatar label={author.avatar} kind="user" size={18} color={author.color}/> {author.name}</span>
          <span className="faint" style={{ fontSize:12, display:"flex", alignItems:"center", gap:4 }}><Icons.chat size={13}/> {(q.comments||[]).length}</span>
          {q.cloned>0 && <span className="faint" style={{ fontSize:12, display:"flex", alignItems:"center", gap:4 }}><Icons.copy size={12}/> {q.cloned} building</span>}
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", padding:"0 18px", flex:"none" }}>
        <Btn variant="soft" size="sm" onClick={(e)=>{ e.stopPropagation(); onClone(q); }}><Icons.sparkle size={14}/> I'll build this</Btn>
      </div>
    </div>
  );
}

function QuickIdeas({ quickIdeas, postedToday, onPost, onUpvote, onClone, onOpen }) {
  const [sort, setSort] = useState("top");
  const [detail, setDetail] = useState(null);
  const detailIdea = detail ? quickIdeas.find(q=>q.id===detail) : null;
  const sorted = useMemo(()=>{
    const a = [...quickIdeas];
    if (sort==="top") a.sort((x,y)=> y.upvotes - x.upvotes);
    else a.sort((x,y)=> (y.id>x.id?1:-1));
    return a;
  }, [quickIdeas, sort]);
  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <div style={{ maxWidth:820, margin:"0 auto", padding:"30px 28px 100px" }}>
        <div style={{ marginBottom:22 }}>
          <div className="eyebrow" style={{ fontSize:10.5, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--accent-text)", marginBottom:10 }}>Quick Ideas</div>
          <h1 style={{ fontSize:32, lineHeight:1.05, letterSpacing:"-0.02em", margin:"0 0 10px", maxWidth:560 }}>Ideas you wish <span className="serif" style={{ fontStyle:"italic" }}>someone would build</span></h1>
          <p className="muted" style={{ fontSize:15.5, margin:0, maxWidth:520 }}>One-liners, not pitches. Post one a day, upvote the ones you'd use, and clone any of them into a real idea to start building.</p>
        </div>

        <QuickComposer onPost={onPost} postedToday={postedToday} />

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", gap:4 }}>
            {[["top","Top",Icons.flame],["new","New",Icons.sparkle]].map(([k,l,I])=>(
              <button key={k} onClick={()=>setSort(k)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:999, fontSize:13, fontWeight:500,
                border:"1px solid "+(sort===k?"transparent":"var(--border)"), background: sort===k?"var(--text-primary)":"var(--surface-raised)", color: sort===k?"var(--background)":"var(--text-secondary)" }}><I size={15}/> {l}</button>
            ))}
          </div>
          <span className="faint" style={{ fontSize:12.5 }}>{quickIdeas.length} ideas</span>
        </div>

        <Stagger style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {sorted.map((q,i) => <QuickCard key={q.id} q={q} rank={i+1} onUpvote={onUpvote} onClone={onClone} onOpen={()=>setDetail(q.id)} />)}
        </Stagger>
      </div>
      {detailIdea && <QuickDetail q={detailIdea} onClose={()=>setDetail(null)} onUpvote={onUpvote} onClone={onClone} />}
    </div>
  );
}

// quick idea detail + comments
function QuickDetail({ q, onClose, onUpvote, onClone }) {
  const author = PEOPLE[q.author];
  const comments = q.comments || [];
  return <>
    <Scrim onClose={onClose} />
    <div className="drawer" style={{ width:480 }}>
      <div style={{ padding:"16px 22px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
        <span className="tag-pill">{q.tag}</span>
        <div style={{ flex:1 }}/>
        <IconBtn onClick={onClose}><Icons.x size={18}/></IconBtn>
      </div>
      <div className="scrollarea" style={{ flex:1, padding:"22px 24px" }}>
        <div style={{ display:"flex", gap:14, marginBottom:16 }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, flex:"none" }}>
            <button onClick={()=>onUpvote(q.id)} className={"vote-btn "+(q.voted?"voted":"")}><Icons.chevUp size={20}/></button>
            <span className="mono" style={{ fontSize:15, fontWeight:700, color:q.voted?"var(--accent-text)":"var(--text-primary)" }}>{q.upvotes}</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <h1 style={{ fontSize:22, margin:"0 0 8px", letterSpacing:"-0.01em", lineHeight:1.25 }}>{q.title}</h1>
            {q.desc && <p className="muted" style={{ fontSize:14.5, lineHeight:1.55, margin:"0 0 10px" }}>{q.desc}</p>}
            <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12.5, color:"var(--text-secondary)" }}><Avatar label={author.avatar} kind="user" size={20} color={author.color}/> {author.name} · {q.ago}</span>
          </div>
        </div>
        <Btn style={{ width:"100%", marginBottom:22 }} onClick={()=>onClone(q)}><Icons.sparkle size={15}/> I'll build this</Btn>
        <SectionLabel style={{ marginBottom:12 }}>Comments · {comments.length}</SectionLabel>
        {comments.length ? (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {comments.map(c => {
              const ca = PEOPLE[c.author] || { avatar:"?", name:c.author, color:"var(--surface)" };
              return (
                <div key={c.id} style={{ display:"flex", gap:11 }}>
                  <Avatar label={ca.avatar} kind="user" size={30} color={ca.color}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}><span style={{ fontWeight:600, fontSize:13 }}>{ca.name}</span><span className="faint" style={{ fontSize:11.5 }}>· {c.ago}</span></div>
                    <p style={{ fontSize:13.5, lineHeight:1.55, margin:0, color:"var(--text-secondary)" }}>{c.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p className="faint" style={{ fontSize:13, fontStyle:"italic" }}>No comments yet — be the first.</p>}
      </div>
      <div style={{ padding:"12px 24px", borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
        <input placeholder="Add a comment…" className="field" style={{ flex:1 }} />
        <Btn size="sm"><Icons.send size={14}/></Btn>
      </div>
    </div>
  </>;
}

// clone confirmation
function CloneModal({ q, onClose, onConfirm }) {
  return <>
    <Scrim onClose={onClose} />
    <div className="modal" style={{ width:440 }}>
      <div style={{ padding:"24px 26px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:14 }}>
          <span style={{ width:40, height:40, borderRadius:10, background:"var(--accent-soft)", color:"var(--accent-text)", display:"flex", alignItems:"center", justifyContent:"center" }}><Icons.sparkle size={20}/></span>
          <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:16 }}>Build on this idea</div><div className="faint" style={{ fontSize:12.5 }}>by {PEOPLE[q.author]?.name}</div></div>
          <IconBtn onClick={onClose}><Icons.x size={18}/></IconBtn>
        </div>
        <div className="card" style={{ padding:14, background:"var(--surface)", marginBottom:18 }}>
          <div style={{ fontWeight:600, fontSize:15, marginBottom:q.desc?4:0 }}>{q.title}</div>
          {q.desc && <p className="muted" style={{ fontSize:13, margin:0, lineHeight:1.45 }}>{q.desc}</p>}
        </div>
        <p className="muted" style={{ fontSize:13.5, lineHeight:1.55, margin:"0 0 18px" }}>We'll spin this into a private idea in your workspace — a fresh chat, seeded with this one-liner, ready to shape into a real brief.</p>
        <Btn size="lg" style={{ width:"100%" }} onClick={()=>onConfirm(q)}><Icons.plus size={17}/> Clone into my ideas</Btn>
      </div>
    </div>
  </>;
}

Object.assign(window, { QuickIdeas, CloneModal });
