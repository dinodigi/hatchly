// ===== App: routing + state =====

function App() {
  const [theme, setThemeState] = useState(()=>localStorage.getItem("hatchly-theme")||"light");
  const [loggedIn, setLoggedIn] = useState(()=>localStorage.getItem("hatchly-auth")==="1");
  const [ideas, setIdeas] = useState(()=>JSON.parse(JSON.stringify(IDEAS)));
  const [importBatches, setImportBatches] = useState(()=>JSON.parse(JSON.stringify(IMPORT_BATCHES)));
  const [importedIdeas, setImportedIdeas] = useState(()=>JSON.parse(JSON.stringify(IMPORTED_IDEAS)));
  const [route, setRoute] = useState(()=>{
    try { const r = JSON.parse(localStorage.getItem("hatchly-route")); if (r) return r; } catch(e){}
    return { screen: localStorage.getItem("hatchly-auth")==="1" ? "ideas" : "marketing" };
  });

  const setTheme = (t)=>{ setThemeState(t); localStorage.setItem("hatchly-theme",t); document.documentElement.setAttribute("data-theme",t); };
  useEffect(()=>{ document.documentElement.setAttribute("data-theme",theme); }, []);

  const go = (r)=>{ const next = typeof r==="string"?{screen:r}:r; setRoute(next); localStorage.setItem("hatchly-route", JSON.stringify(next));
    const sa = document.querySelector(".scrollarea"); if(sa) sa.scrollTop=0; };

  const updateIdea = (id, fn)=> setIdeas(list=>list.map(i=>i.id===id?fn(i):i));
  const archiveIdea = (id)=> setIdeas(list=>list.map(i=>i.id===id?{...i, archived:!i.archived}:i));

  const newIdea = ()=>{
    const id = "i_new"+Date.now();
    const idea = { id, name:"Untitled idea", one_liner:"A new idea, still taking shape.", phase:"ideation", archetype:null,
      completeness:0, current_score:null, last_activity:"just now", lastTab:"overview", dimsWithSignal:0,
      next_move:"Tell me about the idea in the chat — a sentence is enough.",
      memories:[], tasks:[], brand_candidates:[], domains:[],
      activity:[{ type:"memory_added", summary:"Idea created", at:"now" }] };
    setIdeas(list=>[idea, ...list]);
    CHATS[id] = [{ role:"assistant", content:"What's the idea? A sentence is enough — or paste a link, or just talk." }];
    go({ screen:"workspace", ideaId:id, tab:"overview" });
  };

  const onAuth = ()=>{ localStorage.setItem("hatchly-auth","1"); setLoggedIn(true); go({ screen:"ideas" }); };

  // ---- imported ideas ("the Seal") ----
  const importSeal = (res, label)=>{
    if(!res || !res.ideas?.length) return;
    const bid = "b_"+Date.now();
    const batch = { id:bid, source_label: label || "Imported chat", declared_count: res.declared, parsed_count: res.parsed, status: res.status, created_at:"just now" };
    const mined = res.ideas.map((it,i)=>({
      id:"ii_"+Date.now()+"_"+i, batch_id:bid, name:it.name, one_liner:it.one_liner,
      cluster_label: it.cluster || res.clusters[0] || "Ideas",
      confidence: it.confidence || "medium", tags: Array.isArray(it.tags)?it.tags:[],
      extracted_memories: Array.isArray(it.memories)?it.memories:[],
      suggested_archetype: archFromTags(it.tags), status:"staged", converted_idea_id:null,
    }));
    setImportBatches(b=>[batch, ...b]);
    setImportedIdeas(list=>[...mined, ...list]);
  };

  const convertImport = (impId)=>{
    const x = importedIdeas.find(i=>i.id===impId);
    if(!x || x.status==="converted") return;
    const batch = importBatches.find(b=>b.id===x.batch_id);
    const srcLabel = "Imported · " + (batch?batch.source_label:"chat");
    const id = "i_imp"+Date.now();
    const mems = (x.extracted_memories||[]).map((m,i)=>({ id:id+"_m"+i, content:m, tags:(x.tags||[]).slice(0,2), confidence:x.confidence||"medium", src:"import", srcLabel, edited:false }));
    const idea = { id, name:x.name, one_liner:x.one_liner, phase:"ideation", archetype:x.suggested_archetype||null,
      completeness: Math.min(15 + mems.length*9, 50), current_score:null, last_activity:"just now", lastTab:"overview",
      dimsWithSignal: Math.min(mems.length+1, 6), imported:true,
      next_move:"Imported from your chats with "+mems.length+" memories. Keep shaping it — tell me what's missing.",
      memories:mems, tasks:[], brand_candidates:[], domains:[],
      activity:[{ type:"memory_added", summary:"Converted from imported idea · "+(batch?batch.source_label:"chat"), at:"now" }] };
    setIdeas(list=>[idea, ...list]);
    CHATS[id] = [{ role:"assistant", content:`I pulled "${x.name}" out of your chats — it's here in Ideation with ${mems.length} memories already attached. Want to keep shaping it, or should I tell you which dimensions are still blank?` }];
    setImportedIdeas(list=>list.map(i=>i.id===impId?{...i, status:"converted", converted_idea_id:id}:i));
  };

  const dismissImport = (impId)=> setImportedIdeas(list=>list.map(i=>i.id===impId?{...i, status:"dismissed"}:i));
  const restoreImport = (impId)=> setImportedIdeas(list=>list.map(i=>i.id===impId?{...i, status:"staged"}:i));

  const setTab = (tab)=>{ const next={...route, tab}; setRoute(next); localStorage.setItem("hatchly-route",JSON.stringify(next));
    if(route.ideaId) updateIdea(route.ideaId, d=>({...d, lastTab:tab})); };

  // render
  if (route.screen==="marketing") return <Landing go={go} loggedIn={loggedIn}/>;
  if (route.screen==="how")       return <HowItWorks go={go} loggedIn={loggedIn}/>;
  if (route.screen==="auth")      return <Auth go={go} mode={route.mode} onAuth={onAuth}/>;
  if (route.screen==="settings")  return <Settings go={go} theme={theme} setTheme={setTheme}/>;
  if (route.screen==="workspace") {
    const idea = ideas.find(i=>i.id===route.ideaId);
    if (!idea) { go({screen:"ideas"}); return null; }
    return <Workspace idea={idea} tab={route.tab||idea.lastTab||"overview"} setTab={setTab} go={go} theme={theme} setTheme={setTheme} updateIdea={updateIdea} onArchive={archiveIdea}/>;
  }
  return <Dashboard ideas={ideas} go={go} theme={theme} setTheme={setTheme} onNewIdea={newIdea} onArchive={archiveIdea}
    importedIdeas={importedIdeas} importBatches={importBatches} onImport={importSeal} onConvertImport={convertImport} onDismissImport={dismissImport} onRestoreImport={restoreImport}/>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
