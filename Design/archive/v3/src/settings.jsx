// ===== Account & settings =====

const CONN_ICON = { stripe:Icons.card, email:Icons.bell, shopify:Icons.building, bank:Icons.building, domain:Icons.globe, analytics:Icons.trend };
const CONN_STATE = {
  connected:{ label:"Connected", color:"var(--success)" },
  not_connected:{ label:"Not connected", color:"var(--text-muted)" },
  error:{ label:"Needs attention", color:"var(--danger)" },
};
const SETTINGS_NAV = [
  { key:"profile", label:"Profile", icon:Icons.user },
  { key:"billing", label:"Billing", icon:Icons.card },
  { key:"connections", label:"Connections", icon:Icons.plug },
  { key:"notifications", label:"Notifications", icon:Icons.bell },
  { key:"security", label:"Security", icon:Icons.shield },
];

function Settings({ go, theme, setTheme }) {
  const [tab, setTab] = useState("profile");
  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <TopBar go={go} theme={theme} setTheme={setTheme}/>
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"36px 36px 100px" }}>
        <h1 style={{ fontSize:30, margin:"0 0 24px", letterSpacing:"-0.02em", fontWeight:600 }}>Settings</h1>
        <div className="row gap28" style={{ alignItems:"flex-start", gap:32 }}>
          <div className="col gap2" style={{ width:184, flex:"none", position:"sticky", top:80 }}>
            {SETTINGS_NAV.map(n=>(
              <button key={n.key} onClick={()=>setTab(n.key)} className="row gap10" style={{ padding:"9px 11px", borderRadius:9, border:"none", textAlign:"left", width:"100%", background: tab===n.key?"var(--surface-raised)":"transparent", boxShadow: tab===n.key?"var(--shadow-card)":"none", color: tab===n.key?"var(--text-primary)":"var(--text-secondary)", fontSize:13.5, fontWeight: tab===n.key?600:500, cursor:"pointer" }}><n.icon size={16}/> {n.label}</button>
            ))}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            {tab==="profile" && <ProfilePane/>}
            {tab==="billing" && <BillingPane/>}
            {tab==="connections" && <ConnectionsPane/>}
            {tab==="notifications" && <NotificationsPane/>}
            {tab==="security" && <SecurityPane/>}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaneHead({ title, sub }) { return <div style={{ marginBottom:18 }}><h2 style={{ fontSize:19, margin:"0 0 4px", fontWeight:600 }}>{title}</h2>{sub && <p className="muted" style={{ margin:0, fontSize:13.5 }}>{sub}</p>}</div>; }

function ProfilePane() {
  return (
    <div>
      <PaneHead title="Profile" sub="Your founder info — this also feeds Founder–Market Fit scoring."/>
      <Card className="col gap16">
        <div className="row gap14" style={{ alignItems:"center" }}>
          <Avatar kind="user" label={USER.avatar} size={56}/>
          <div><Btn variant="secondary" size="sm">Change photo</Btn></div>
        </div>
        <div className="grid gap14" style={{ gridTemplateColumns:"1fr 1fr" }}>
          <div><label className="label">Name</label><input className="field" defaultValue={USER.name}/></div>
          <div><label className="label">Email</label><input className="field" defaultValue={USER.email}/></div>
        </div>
        <div><label className="label">Background / bio</label><textarea className="field" rows={3} defaultValue={USER.bio} style={{ resize:"vertical", lineHeight:1.5 }}/>
          <div className="faint row gap6" style={{ fontSize:11.5, marginTop:6 }}><Icons.sparkle size={12}/> The agent reads this when scoring how well you fit the markets you explore.</div>
        </div>
        <div className="row"><div className="spacer"/><Btn variant="primary">Save changes</Btn></div>
      </Card>
    </div>
  );
}

function BillingPane() {
  return (
    <div>
      <PaneHead title="Billing" sub="Your plan and payment method."/>
      <Card className="row" style={{ justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div className="row gap12"><span style={{ width:40, height:40, borderRadius:10, background:"var(--accent-soft)", color:"var(--accent-text)", display:"flex", alignItems:"center", justifyContent:"center" }}><Icons.bolt size={20}/></span>
          <div><div className="row gap8"><span style={{ fontWeight:600, fontSize:15, textTransform:"capitalize" }}>{USER.plan} plan</span><Pill accent style={{ fontSize:10 }}>Current</Pill></div><div className="faint" style={{ fontSize:12.5 }}>$29 / month · renews Jul 2, 2026</div></div></div>
        <Btn variant="secondary" size="sm">Change plan</Btn>
      </Card>
      <Card>
        <SectionLabel style={{ marginBottom:12 }}>Payment method</SectionLabel>
        <div className="row gap12" style={{ alignItems:"center" }}><span style={{ color:"var(--text-secondary)" }}><Icons.card size={22}/></span><div style={{ flex:1 }}><div style={{ fontSize:13.5, fontWeight:500 }}>Visa ending 4242</div><div className="faint" style={{ fontSize:12 }}>Expires 09 / 27</div></div><Btn variant="ghost" size="sm">Update</Btn></div>
        <div className="hr" style={{ margin:"14px 0" }}/>
        <SectionLabel style={{ marginBottom:10 }}>Recent invoices</SectionLabel>
        {[["Jun 2, 2026","$29.00"],["May 2, 2026","$29.00"],["Apr 2, 2026","$29.00"]].map(([d,a],i)=>(
          <div key={i} className="row" style={{ justifyContent:"space-between", padding:"7px 0", fontSize:13, borderBottom: i<2?"1px solid var(--border)":"none" }}><span className="muted">{d}</span><span className="row gap10">{a} <a style={{ color:"var(--accent-text)" }}>PDF</a></span></div>
        ))}
      </Card>
    </div>
  );
}

function ConnectionsPane() {
  const [conns, setConns] = useState(CONNECTIONS);
  const toggle = (kind) => setConns(cs=>cs.map(c=>c.kind===kind?{...c, status:c.status==="connected"?"not_connected":"connected"}:c));
  return (
    <div>
      <PaneHead title="Connections" sub="Account-level integrations, reused across every idea. Surfaced contextually during launch."/>
      <Card style={{ padding:8 }}>
        {conns.map((c,i)=>{ const I=CONN_ICON[c.kind]; const st=CONN_STATE[c.status]; return (
          <div key={c.kind} className="row gap14" style={{ padding:"14px 12px", borderBottom: i<conns.length-1?"1px solid var(--border)":"none", alignItems:"center" }}>
            <span style={{ width:38, height:38, borderRadius:10, background:"var(--surface)", color:"var(--text-secondary)", display:"flex", alignItems:"center", justifyContent:"center", flex:"none" }}><I size={19}/></span>
            <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:600 }}>{c.label}</div><div className="faint" style={{ fontSize:12 }}>{c.note}</div></div>
            <span className="row gap6" style={{ fontSize:12, color:st.color }}><StatusDot color={st.color} size={7}/>{st.label}</span>
            <Btn variant={c.status==="connected"?"ghost":"secondary"} size="sm" onClick={()=>toggle(c.kind)}>{c.status==="connected"?"Manage":c.status==="error"?"Reconnect":"Connect"}</Btn>
          </div>
        );})}
      </Card>
    </div>
  );
}

function NotificationsPane() {
  const [prefs, setPrefs] = useState({ stalled:true, gate:true, score:false, digest:true });
  const items = [["stalled","Stalled ideas","When an idea goes quiet for a week"],["gate","Gate unlocked","When an idea is ready to advance a phase"],["score","Score moved","Every time a dimension score changes"],["digest","Weekly digest","A Monday summary across all ideas"]];
  return (
    <div>
      <PaneHead title="Notifications" sub="What's worth interrupting you for."/>
      <Card style={{ padding:8 }}>
        {items.map(([k,t,d],i)=>(
          <div key={k} className="row gap14" style={{ padding:"14px 12px", borderBottom: i<items.length-1?"1px solid var(--border)":"none", alignItems:"center" }}>
            <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:500 }}>{t}</div><div className="faint" style={{ fontSize:12 }}>{d}</div></div>
            <Toggle on={prefs[k]} onClick={()=>setPrefs(p=>({...p,[k]:!p[k]}))}/>
          </div>
        ))}
      </Card>
    </div>
  );
}
function Toggle({ on, onClick }) {
  return <button onClick={onClick} style={{ width:40, height:23, borderRadius:999, border:"none", background: on?"var(--accent)":"var(--border-strong)", position:"relative", cursor:"pointer", transition:"background 160ms", flex:"none" }}>
    <span style={{ position:"absolute", top:2.5, left: on?20:2.5, width:18, height:18, borderRadius:999, background:"#fff", transition:"left 180ms cubic-bezier(.22,1,.36,1)", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/></button>;
}

function SecurityPane() {
  return (
    <div>
      <PaneHead title="Security" sub="Password and active sessions."/>
      <Card className="col gap14" style={{ marginBottom:14 }}>
        <SectionLabel>Change password</SectionLabel>
        <div><label className="label">Current password</label><input className="field" type="password" defaultValue="••••••••"/></div>
        <div className="grid gap14" style={{ gridTemplateColumns:"1fr 1fr" }}>
          <div><label className="label">New password</label><input className="field" type="password"/></div>
          <div><label className="label">Confirm</label><input className="field" type="password"/></div>
        </div>
        <div className="row"><div className="spacer"/><Btn variant="primary">Update password</Btn></div>
      </Card>
      <Card>
        <SectionLabel style={{ marginBottom:12 }}>Active sessions</SectionLabel>
        {[["MacBook Pro · San Francisco","Active now",true],["iPhone 15 · San Francisco","2 days ago",false]].map(([d,t,cur],i)=>(
          <div key={i} className="row" style={{ justifyContent:"space-between", padding:"9px 0", borderBottom: i<1?"1px solid var(--border)":"none", alignItems:"center" }}>
            <div><div style={{ fontSize:13.5, fontWeight:500 }}>{d}</div><div className="faint" style={{ fontSize:12 }}>{t}</div></div>
            {cur ? <Pill style={{ fontSize:10, color:"var(--success-text)" }}>This device</Pill> : <Btn variant="ghost" size="sm">Sign out</Btn>}
          </div>
        ))}
        <div className="hr" style={{ margin:"14px 0" }}/>
        <Btn variant="ghost" style={{ color:"var(--danger-text)" }}><Icons.shield size={14}/> Sign out everywhere</Btn>
      </Card>
    </div>
  );
}

Object.assign(window, { Settings });
