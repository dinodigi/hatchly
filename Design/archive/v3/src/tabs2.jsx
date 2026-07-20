// ===== Plan board (draggable) + Brand tab =====

const CAT_META = {
  validation:{ label:"Validation", color:"var(--info)" },
  legal:{ label:"Legal", color:"var(--accent)" },
  payments:{ label:"Payments", color:"var(--success)" },
  ops:{ label:"Ops", color:"var(--text-secondary)" },
  marketing:{ label:"Marketing", color:"var(--info)" },
  product:{ label:"Product", color:"var(--accent)" },
  ongoing:{ label:"Ongoing", color:"var(--text-secondary)" },
};
const STATUS_COLS = [
  { key:"todo", label:"To do" },
  { key:"in_progress", label:"In progress" },
  { key:"done", label:"Done" },
];

function PlanTab({ idea, onMoveTask, onOpenTask, onGenerate }) {
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const launch = idea.phase==="launch" || idea.phase==="operating";

  if (idea.tasks.length===0) {
    return <div><TabHeader title="Plan"/>
      <Empty icon={Icons.board} title="No plan yet"
        body={idea.phase==="ideation" ? "Your validation plan appears once the scorecard is generated." : "Generate your validation plan from the scorecard's action items."}
        action={idea.phase!=="ideation" && <Btn variant="primary" onClick={onGenerate}><Icons.sparkle size={14}/> Generate validation plan</Btn>}/>
    </div>;
  }

  const done = idea.tasks.filter(t=>t.status==="done").length;
  return (
    <div>
      <TabHeader title="Plan" sub={launch ? "Your launch board — instantiated from the playbook, customized to the idea." : "Validation action items from the scorecard."}
        right={<div className="row gap10"><span className="faint" style={{ fontSize:12.5 }}>{done} / {idea.tasks.length} done</span><div style={{ width:90 }}><ProgressBar value={Math.round(done/idea.tasks.length*100)} color="var(--success)"/></div></div>}/>
      <div className="grid gap12" style={{ gridTemplateColumns:"repeat(3,1fr)", alignItems:"start" }}>
        {STATUS_COLS.map(col=>{
          const items = idea.tasks.filter(t=>t.status===col.key);
          return (
            <div key={col.key}
              onDragOver={e=>{ e.preventDefault(); setOver(col.key); }}
              onDragLeave={()=>setOver(o=>o===col.key?null:o)}
              onDrop={()=>{ if(drag) onMoveTask(drag, col.key); setDrag(null); setOver(null); }}
              style={{ background: over===col.key?"var(--accent-softer)":"var(--surface)", border:"1px solid", borderColor: over===col.key?"var(--accent)":"var(--border)", borderRadius:14, padding:10, minHeight:120, transition:"background 140ms, border-color 140ms" }}>
              <div className="row" style={{ justifyContent:"space-between", padding:"4px 6px 10px" }}>
                <span style={{ fontSize:12, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", color:"var(--text-secondary)" }}>{col.label}</span>
                <span className="faint mono" style={{ fontSize:11 }}>{items.length}</span>
              </div>
              <div className="col gap8">
                {items.map(t=>(
                  <div key={t.id} draggable onDragStart={()=>setDrag(t.id)} onDragEnd={()=>{ setDrag(null); setOver(null); }}
                    onClick={()=>onOpenTask(t.id)}
                    className="card" style={{ padding:13, cursor:"grab", opacity: drag===t.id?0.4:1, boxShadow:"var(--shadow-card)" }}>
                    <div className="row gap6" style={{ marginBottom:8, alignItems:"center" }}>
                      <span className="row gap5" style={{ fontSize:10.5, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", color:CAT_META[t.category]?.color }}>
                        <StatusDot color={CAT_META[t.category]?.color} size={6}/>{CAT_META[t.category]?.label}</span>
                      {t.blocking && <Pill style={{ fontSize:9.5, color:"var(--danger-text)", background:"var(--danger-soft)", border:"none" }}>blocking</Pill>}
                      <div className="spacer"/>
                      {t.completed_via==="chat_detected" && <span title="Detected from chat" style={{ color:"var(--accent-text)" }}><Icons.sparkle size={13}/></span>}
                    </div>
                    <div style={{ fontSize:13.5, fontWeight:500, lineHeight:1.4, marginBottom: t.subtasks?.length?8:0 }}>{t.title}</div>
                    {t.subtasks?.length>0 && (
                      <div className="row gap8" style={{ alignItems:"center" }}>
                        <div style={{ flex:1 }}><ProgressBar value={Math.round(t.subtasks.filter(s=>s.d).length/t.subtasks.length*100)} height={4}/></div>
                        <span className="faint mono" style={{ fontSize:10.5 }}>{t.subtasks.filter(s=>s.d).length}/{t.subtasks.length}</span>
                      </div>
                    )}
                    {t.vendor_suggestions?.length>0 && (
                      <div className="row gap4" style={{ marginTop:8, flexWrap:"wrap" }}>
                        {t.vendor_suggestions.slice(0,3).map((v,i)=><span key={i} className="kbd">{v.name}</span>)}
                      </div>
                    )}
                  </div>
                ))}
                {items.length===0 && <div className="faint" style={{ fontSize:12, textAlign:"center", padding:"14px 0" }}>—</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="faint row gap6" style={{ fontSize:12, marginTop:14, justifyContent:"center" }}><Icons.bolt size={13}/> Drag cards between columns — or just tell the chat "the bank account is open" and it moves itself.</div>
    </div>
  );
}

Object.assign(window, { PlanTab, CAT_META });
