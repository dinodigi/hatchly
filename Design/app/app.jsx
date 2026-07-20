// ===== App: routing + state + economy wiring =====

// canned PRD fills (chat → brief), applied in sequence per idea
const FILL_SCRIPT = {
  pantry: [
    { section:"value", value:"Tell it what's in your fridge and it hands back a dinner plan you can cook tonight — it kills the 6pm decision instead of adding another recipe feed.", reply:"Got it — that's the core value. I've written it into the brief: Pantry removes the decision, it doesn't add a feed. That actually sharpens the money question too.", mem:"Core value: removes the 6pm decision, doesn't add a feed", feeds:"Core value" },
    { section:"features", value:"A 'what can I make right now' answer from a fridge photo or a quick list", reply:"Added that as the first feature. The fridge-photo input is the wedge — it's the thing recipe apps can't do. Want to pin down monetization next?", mem:"Wedge feature: 'what can I make now' from a fridge photo", feeds:"Features" },
    { section:"value-money", reply:"On money: for a parent at 6pm, a thin $5/mo subscription fits the habit better than grocery affiliate — affiliate pulls you toward upsells, which fights the 'less decision' promise. I'd note subscription as the lean.", mem:"Leaning to a thin subscription over grocery affiliate", feeds:"Open questions" },
  ],
};
const SECTION_LABEL = { problem:"Problem", who:"Who it's for", value:"Core value", features:"Features", open:"Open questions" };

function App() {
  const [theme, setThemeState] = useState(()=>localStorage.getItem("hatchly4-theme")||"light");
  const [loggedIn, setLoggedIn] = useState(()=>localStorage.getItem("hatchly4-auth")==="1");
  const [route, setRoute] = useState(()=>{ try{ const r=JSON.parse(localStorage.getItem("hatchly4-route")); if(r) return r; }catch(e){} return { screen:"stream" }; });
  const [econ, setEcon] = useState(()=>({ ...ECONOMY, escrow:0 }));
  const [stream, setStream] = useState(()=>JSON.parse(JSON.stringify(STREAM)));
  const [myIdeas, setMyIdeas] = useState(()=>JSON.parse(JSON.stringify(MY_IDEAS)).map(it=>({
    ...it,
    prd: it.prd || (it.streamId ? JSON.parse(JSON.stringify(STREAM_BY_ID[it.streamId].prd)) : null),
    chats: JSON.parse(JSON.stringify(IDEA_CHATS[it.id] || [])),
    files: JSON.parse(JSON.stringify(IDEA_FILES[it.id] || [])),
    cover: it.cover || null, liveUrl: it.liveUrl || "", publicDocs: it.publicDocs || [], tags: it.tags || [],
    activity: JSON.parse(JSON.stringify(ACTIVITY[it.id] || [])),
    _fillIdx: 0,
  })));
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimKey, setClaimKey] = useState(0);
  const [investTarget, setInvestTarget] = useState(null);
  const [txns, setTxns] = useState(()=>JSON.parse(JSON.stringify(TXNS)));
  const [spotlight, setSpotlight] = useState(()=>({ ...SPOTLIGHT }));
  const [bidOpen, setBidOpen] = useState(false);
  const [unlockedContacts, setUnlockedContacts] = useState({});
  const [quickIdeas, setQuickIdeas] = useState(()=>JSON.parse(JSON.stringify(QUICK_IDEAS)));
  const [postedQuickToday, setPostedQuickToday] = useState(false);
  const [apiKey, setApiKey] = useState(()=>localStorage.getItem("hatchly4-apikey")||"");
  const saveApiKey = (k)=>{ setApiKey(k); if(k) localStorage.setItem("hatchly4-apikey",k); else localStorage.removeItem("hatchly4-apikey"); };
  const [cloneTarget, setCloneTarget] = useState(null);
  const addTxn = (t)=> setTxns(list=>[{ id:"tx"+Date.now(), at:"just now", ...t }, ...list]);

  const setTheme = (t)=>{ setThemeState(t); localStorage.setItem("hatchly4-theme",t); document.documentElement.setAttribute("data-theme",t); };
  useEffect(()=>{ document.documentElement.setAttribute("data-theme",theme); }, []);

  const go = (r)=>{ const next=typeof r==="string"?{screen:r}:r; setRoute(next); localStorage.setItem("hatchly4-route",JSON.stringify(next));
    const sa=document.querySelector(".scrollarea"); if(sa) sa.scrollTop=0; };

  const onAuth = ()=>{ localStorage.setItem("hatchly4-auth","1"); setLoggedIn(true); setEcon(e=>({ ...e, balance:e.balance+e.dailyClaim, claimedToday:true })); addTxn({ type:"claim", label:"Daily login bonus", amount:100 }); go({ screen: route.afterAuth || "stream" }); };
  const onLogout = ()=>{ localStorage.removeItem("hatchly4-auth"); setLoggedIn(false); go({screen:"stream"}); };

  // ---- daily claim ----
  const openClaim = ()=> setClaimOpen(true);
  const confirmClaim = ()=>{ setEcon(e=>({ ...e, balance:e.balance+e.dailyClaim, claimedToday:true, streak:e.streak+1 })); addTxn({ type:"claim", label:"Daily login bonus", amount:100 }); setClaimKey(k=>k+1); };

  // ---- backing / invest ----
  const onBack = (idea)=>{ if(!loggedIn){ go({ screen:"auth", mode:"signup", afterAuth:"stream", reason:"Create an account to claim bucks and back ideas." }); return; } setInvestTarget(idea); };
  const confirmInvest = (amount)=>{
    setEcon(e=>({ ...e, balance:e.balance-amount, invested:e.invested+amount }));
    setStream(list=>list.map(s=> s.id===investTarget.id ? { ...s, bucks:s.bucks+amount, today:s.today+amount, backers:s.backers+1, spark:[...s.spark.slice(1), s.spark[s.spark.length-1]+ amount/100] } : s));
    addTxn({ type:"invest", label:"Backed "+investTarget.name, amount:-amount });
    setClaimKey(k=>k+1);
  };

  // ---- spotlight auction (escrow until outbid) ----
  const onBidSpotlight = ()=>{ if(!loggedIn){ go({ screen:"auth", mode:"signup", afterAuth:"stream", reason:"Sign in to bid for the spotlight." }); return; } setBidOpen(true); };
  const confirmBid = (ideaId, amount)=>{
    setEcon(e=>{
      let bal=e.balance, esc=e.escrow||0;
      if(spotlight.holder==="you"){ bal+=spotlight.amount; esc-=spotlight.amount; }
      bal-=amount; esc+=amount;
      return { ...e, balance:bal, escrow:esc };
    });
    if(spotlight.holder==="you") addTxn({ type:"refund", label:"Spotlight re-bid — escrow returned", amount:spotlight.amount });
    const si = STREAM_BY_ID[ideaId] || stream.find(s=>s.id===ideaId);
    addTxn({ type:"spotlight", label:"Spotlight bid — "+(si?si.name:"idea"), amount:-amount });
    setSpotlight({ ideaId, holder:"you", holderName:USER.name, amount });
    setClaimKey(k=>k+1);
    setBidOpen(false);
  };

  // ---- Quick Ideas ----
  const postQuick = ({ title, desc, tag })=>{
    const q = { id:"q"+Date.now(), title, desc, tag, author:"alexr", upvotes:1, comments:0, ago:"just now", cloned:0, voted:true };
    setQuickIdeas(list=>[q, ...list]); setPostedQuickToday(true);
  };
  const upvoteQuick = (id)=> setQuickIdeas(list=>list.map(q=> q.id===id ? { ...q, voted:!q.voted, upvotes:q.upvotes+(q.voted?-1:1) } : q));
  const cloneQuick = (q)=>{
    setQuickIdeas(list=>list.map(x=> x.id===q.id ? { ...x, cloned:x.cloned+1 } : x));
    const id = "clone_"+Date.now();
    const idea = { id, name:q.title, stage:"ideation", visibility:"private", lastActive:"just now",
      one_liner:q.desc || q.title, description:"Cloned from Quick Ideas — "+(q.desc||q.title),
      prd:{ problem:"", who:"", value:"", features:[], open:[] }, memories:[],
      chats:[{ id:"clone_c"+Date.now(), title:"From a quick idea", at:"just now", refiningMemId:null, thread:[{ role:"assistant", content:`You cloned "${q.title}". Nice pick. Let's turn it into something real — who feels this problem the most sharply?` }] }],
      files:[{ id:id+"_f1", type:"page", title:"Product brief", subtitle:"Auto-written from chat", source:"prd", updated:"just now" }],
      cover:null, liveUrl:"", publicDocs:[], tags:[q.tag], activity:[{ id:"ac"+Date.now(), type:"chat", text:"Cloned from Quick Ideas", at:"just now" }], _fillIdx:0 };
    setMyIdeas(list=>[idea, ...list]); setCloneTarget(null);
    go({ screen:"workspace", ideaId:id, tab:"overview", chatId:idea.chats[0].id });
  };
  const onCloneQuick = (q)=>{ if(!loggedIn){ go({screen:"auth",mode:"signup",afterAuth:"quick",reason:"Sign in to clone this into your workspace."}); return; } setCloneTarget(q); };

  // ---- new idea ----
  const newIdea = ()=>{
    if(!apiKey){ go({ screen:"settings", reason:"Add your API key to start creating ideas — the chat that shapes them runs on it." }); return; }
    const id = "new_"+Date.now();
    const idea = { id, name:"Untitled idea", stage:"ideation", visibility:"private", lastActive:"just now",
      one_liner:"A new idea, still taking shape.",
      description:"A fresh idea. Start a chat and Hatchly will shape the brief with you.",
      prd:{ problem:"", who:"", value:"", features:[], open:[] }, memories:[],
      chats:[], files:[{ id:id+"_f1", type:"page", title:"Product brief", subtitle:"Auto-written from chat", source:"prd", updated:"just now" }], _fillIdx:0 };
    setMyIdeas(list=>[idea, ...list]);
    go({ screen:"workspace", ideaId:id, tab:"overview" });
  };

  // ---- start a new chat within an idea ----
  const newChat = (ideaId, firstMessage)=>{
    const cid = "chat_"+Date.now();
    const title = firstMessage ? (firstMessage.length>40?firstMessage.slice(0,38)+"…":firstMessage) : "New chat";
    const thread = firstMessage ? [] : [{ role:"assistant", content:"What's on your mind for this one? I'll capture the meaningful pieces into your brief as we talk." }];
    setMyIdeas(list=>list.map(i=> i.id===ideaId ? { ...i, chats:[{ id:cid, title, at:"just now", thread }, ...i.chats] } : i));
    go({ screen:"workspace", ideaId, tab:"overview", chatId:cid });
    if(firstMessage) setTimeout(()=>onSend(ideaId, cid, firstMessage), 80);
  };

  // ---- refine a memory: open a chat pinned to it ----
  const refineMemory = (ideaId, mem)=>{
    const cid = "chat_"+Date.now();
    const title = "Refining: "+(mem.content.length>28?mem.content.slice(0,26)+"…":mem.content);
    const thread = [{ role:"assistant", content:`Let's refine this memory:\n\n“${mem.content}”${mem.feeds?`\n\nRight now it feeds your brief's ${mem.feeds}.`:""}\n\nWhat should it say instead — or is it wrong and should be dropped? I'll update it and re-sync the brief.` }];
    setMyIdeas(list=>list.map(i=> i.id===ideaId ? { ...i, chats:[{ id:cid, title, at:"just now", thread, refiningMemId:mem.id }, ...i.chats] } : i));
    go({ screen:"workspace", ideaId, tab:"overview", chatId:cid });
  };

  // ---- chat send → appends to the chat + fills the brief + captures memory ----
  const onSend = (ideaId, chatId, text, done)=>{
    setMyIdeas(list=>list.map(i=> i.id===ideaId ? { ...i, chats:i.chats.map(c=> c.id===chatId ? { ...c, thread:[...c.thread, { role:"user", content:text }] } : c) } : i));
    setTimeout(()=>{
      setMyIdeas(list=>list.map(i=>{
        if(i.id!==ideaId) return i;
        const chat = i.chats.find(c=>c.id===chatId);
        const script = FILL_SCRIPT[ideaId];
        let prd = i.prd ? { ...i.prd } : { problem:"", who:"", value:"", features:[], open:[] };
        let reply, tool=null, idx=i._fillIdx||0, memContent=null, feeds=null;
        if(script && idx < script.length){
          const step = script[idx]; reply = step.reply; memContent = step.mem; feeds = step.feeds;
          if(step.section==="value"){ prd.value = step.value; tool="updated brief · core value"; }
          else if(step.section==="features"){ prd.features=[...prd.features, step.value]; tool="updated brief · features"; }
          idx++;
        } else {
          let sec;
          if(!prd.problem){ prd.problem = text; sec="problem"; reply="Noted — I've set that as the problem in your brief. Who feels it most sharply?"; }
          else if(!prd.who){ prd.who = text; sec="who"; reply="Got it, that's your audience. In one line, what's the core value for them?"; }
          else if(!prd.value){ prd.value = text; sec="value"; reply="That's the core value, written in. What's the first feature that delivers it?"; }
          else if(prd.features.length<3){ prd.features=[...prd.features, text]; sec="features"; reply="Added to features. The brief's filling in nicely."; }
          else { prd.open=[...prd.open, text]; sec="open"; reply="Logged that as an open question to resolve before you build."; }
          tool="updated brief · "+SECTION_LABEL[sec].toLowerCase(); feeds=SECTION_LABEL[sec];
          memContent = text.length>70?text.slice(0,68)+"…":text;
        }
        const newChats = i.chats.map(c=> c.id===chatId ? { ...c, thread:[...c.thread, { role:"assistant", content:reply, tool }] } : c);
        const mem = memContent ? { id:"mm"+Date.now(), content:memContent, input:text, src:"chat", chatTitle:chat?.title, srcLabel:(chat?.title||"Chat")+" · just now", feeds } : null;
        return { ...i, prd, _fillIdx:idx, chats:newChats, memories: mem ? [...i.memories, mem] : i.memories };
      }));
      done&&done();
    }, 900);
  };

  const setVisibility = (ideaId, v)=> setMyIdeas(list=>list.map(i=> i.id===ideaId ? { ...i, visibility:v, stage: v==="public"?"public": (i.stage==="public"?"ideation":i.stage) } : i));
  const mutateIdea = (ideaId, fn)=> setMyIdeas(list=>list.map(i=> i.id===ideaId ? fn(i) : i));
  const onFeedback = (streamId, text)=> setStream(list=>list.map(s=> s.id===streamId ? { ...s, feedback:[{ id:"fb"+Date.now(), name:USER.name, avatar:USER.avatar, color:"var(--surface)", text, at:"just now", you:true }, ...(s.feedback||[]) ] } : s));
  const onUnlockContacts = (ideaId, streamId)=>{ const si = STREAM_BY_ID[streamId] || stream.find(s=>s.id===streamId); setEcon(e=>({ ...e, balance:e.balance-CONTACTS_FEE })); addTxn({ type:"invest", label:"Unlocked contact list — "+(si?si.name:"idea"), amount:-CONTACTS_FEE }); setUnlockedContacts(u=>({ ...u, [ideaId]:true })); setClaimKey(k=>k+1); };

  // ---- render ----
  const needAuth = (!loggedIn && (route.screen==="workspace" || route.screen==="dashboard"));
  const navProps = { go, route, loggedIn, theme, setTheme, econ, onClaim:openClaim, onLogout, claimKey, onWallet:()=>go({screen:"wallet"}), onNewIdea: loggedIn?newIdea:()=>go({screen:"auth",mode:"signup"}) };
  const showNav = !(route.screen==="auth" || needAuth || route.screen==="workspace");

  let body;
  if (route.screen==="auth" || needAuth) {
    body = <AuthGate mode={route.mode||"signup"} reason={route.reason} go={go} onAuth={onAuth} />;
  } else if (route.screen==="leaderboard") {
    body = <Leaderboard go={go} econ={econ} />;
  } else if (route.screen==="settings") {
    body = <Settings apiKey={apiKey} onSaveKey={saveApiKey} go={go} reason={route.reason} />;
  } else if (route.screen==="quick") {
    body = <QuickIdeas quickIdeas={quickIdeas} postedToday={postedQuickToday} onPost={postQuick} onUpvote={upvoteQuick} onClone={onCloneQuick} onOpen={onCloneQuick} />;
  } else if (route.screen==="wallet") {
    body = <Wallet econ={econ} txns={txns} spotlight={spotlight} stream={stream} go={go} onClaim={openClaim} />;
  } else if (route.screen==="idea") {
    const idea = stream.find(s=>s.id===route.ideaId);
    body = idea ? <IdeaPage idea={idea} go={go} onBack={onBack} econ={econ} onFeedback={onFeedback} />
      : <Empty title="Idea not found" body="It may have been unpublished." action={<Btn onClick={()=>go({screen:"stream"})}>Back to the stream</Btn>} />;
  } else if (route.screen==="workspace") {
    const idea = myIdeas.find(i=>i.id===route.ideaId) || myIdeas[0];
    const streamMatch = idea && idea.streamId ? stream.find(s=>s.id===idea.streamId) : null;
    const ideaFeedback = streamMatch?.feedback || [];
    const ideaContacts = streamMatch?.contacts || [];
    body = idea ? <IdeaHub idea={idea} route={route} go={go} onSend={onSend} onNewChat={newChat} onVisibility={(v)=>setVisibility(idea.id,v)} mutate={(fn)=>mutateIdea(idea.id, fn)} feedback={ideaFeedback} contacts={ideaContacts} contactsUnlocked={!!unlockedContacts[idea.id]} onUnlockContacts={()=>onUnlockContacts(idea.id, idea.streamId)}
      chrome={{ econ, onClaim:openClaim, onWallet:()=>go({screen:"wallet"}), claimKey, onNewIdea:newIdea, theme, setTheme, onLogout }} onRefineMemory={(mem)=>refineMemory(idea.id, mem)} /> : null;
  } else if (route.screen==="dashboard") {
    body = <Dashboard ideas={myIdeas} go={go} econ={econ} onClaim={openClaim} onNewIdea={newIdea} />;
  } else {
    body = <Stream stream={stream} go={go} onBack={onBack} loggedIn={loggedIn} spotlight={spotlight} onBidSpotlight={onBidSpotlight}
      onPost={ loggedIn ? newIdea : ()=>go({screen:"auth",mode:"signup",afterAuth:"dashboard",reason:"Create an account to post an idea and claim 100 bucks."}) } />;
  }

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", minHeight:0 }}>
      {showNav && <TopNav {...navProps} />}
      <div style={{ flex:1, minHeight:0 }}>{body}</div>
      {claimOpen && <ClaimModal econ={econ} onClose={()=>setClaimOpen(false)} onConfirm={confirmClaim} />}
      {investTarget && <InvestModal idea={investTarget} econ={econ} onClose={()=>setInvestTarget(null)} onConfirm={confirmInvest} />}
      {bidOpen && <SpotlightBidModal idea={myIdeas} myIdeas={myIdeas} econ={econ} spotlight={spotlight} onClose={()=>setBidOpen(false)} onConfirm={confirmBid} />}
      {cloneTarget && <CloneModal q={cloneTarget} onClose={()=>setCloneTarget(null)} onConfirm={cloneQuick} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
