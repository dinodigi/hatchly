// ===== Shared chrome: top nav, bucks chip, account menu + overlays =====

function Scrim({ onClose }) { return <div className="scrim" onClick={onClose} />; }

function ThemeToggle({ theme, setTheme }) {
  const dark = theme==="dark";
  return (
    <button onClick={()=>setTheme(dark?"light":"dark")} className="iconbtn" title={dark?"Switch to light":"Switch to dark"} aria-label="Toggle theme">
      {dark ? <Icons.sun size={17}/> : <Icons.moon size={17}/>}
    </button>
  );
}

function AccountMenu({ go, theme, setTheme, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <button onClick={()=>setOpen(o=>!o)} className="avatar avatar-user" style={{ width:34, height:34, fontSize:13, cursor:"pointer" }}>{USER.avatar}</button>
      {open && <>
        <div style={{ position:"fixed", inset:0, zIndex:40 }} onClick={()=>setOpen(false)} />
        <div className="card" style={{ position:"absolute", right:0, top:42, width:248, padding:8, zIndex:41, boxShadow:"var(--shadow-modal)" }}>
          <div style={{ padding:"8px 10px 10px", borderBottom:"1px solid var(--border)", marginBottom:6 }}>
            <div style={{ fontWeight:600, fontSize:14 }}>{USER.name}</div>
            <div className="faint" style={{ fontSize:12 }}>@{USER.handle}</div>
          </div>
          {[
            ["My ideas", Icons.layers, ()=>go({screen:"dashboard"})],
            ["My backing", Icons.coin, ()=>go({screen:"dashboard", tab:"backing"})],
            ["Leaderboard", Icons.trophy, ()=>go({screen:"leaderboard"})],
            ["API & settings", Icons.settings, ()=>go({screen:"settings"})],
          ].map(([label,I,fn]) => (
            <button key={label} onClick={()=>{ setOpen(false); fn(); }} className="acct-item">
              <I size={16}/><span>{label}</span>
            </button>
          ))}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", marginTop:4, borderTop:"1px solid var(--border)" }}>
            <span className="faint" style={{ fontSize:12 }}>Theme</span>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
          <button onClick={()=>{ setOpen(false); onLogout(); }} className="acct-item" style={{ color:"var(--text-secondary)" }}>
            <Icons.back size={16}/><span>Log out</span>
          </button>
        </div>
      </>}
    </div>
  );
}

// the gold balance chip + claim affordance
function BucksChip({ econ, onClaim, onWallet, animateKey }) {
  const canClaim = !econ.claimedToday;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <button onClick={onWallet} title="Open wallet" style={{ position:"relative", display:"inline-flex", alignItems:"center", gap:8, padding:"6px 12px 6px 9px",
        borderRadius:999, background:"var(--accent-soft)", border:"1px solid color-mix(in srgb, var(--accent) 28%, transparent)", cursor:"pointer" }}>
        <GoldBurst fire={animateKey} />
        <Coin size={19} />
        <CountUp to={econ.balance} className="mono" style={{ fontSize:14, fontWeight:600, color:"var(--accent-text)" }} />
      </button>
      {canClaim
        ? <button onClick={onClaim} className="claim-btn">+{econ.dailyClaim} today</button>
        : <span className="faint" style={{ fontSize:11.5, display:"flex", alignItems:"center", gap:4 }}><Icons.check size={13}/> claimed</span>}
    </div>
  );
}

function TopNav({ go, route, loggedIn, theme, setTheme, econ, onClaim, onLogout, claimKey, onNewIdea, onWallet }) {
  const screen = route.screen;
  const link = (label, target) => (
    <button onClick={()=>go({screen:target})} style={{
      border:"none", background:"none", fontSize:13.5, fontWeight:500, padding:"6px 2px",
      color: screen===target ? "var(--text-primary)" : "var(--text-secondary)",
      borderBottom: screen===target ? "2px solid var(--accent)" : "2px solid transparent", borderRadius:0,
    }}>{label}</button>
  );
  return (
    <div style={{ position:"sticky", top:0, zIndex:30, background:"color-mix(in srgb, var(--background) 86%, transparent)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--border)" }}>
      <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 28px", height:62, display:"flex", alignItems:"center", gap:26 }}>
        <button onClick={()=>go({screen:"stream"})} style={{ border:"none", background:"none", padding:0, display:"flex", alignItems:"center" }}>
          <span className="hatchly-logo" style={{ display:"inline-flex", alignItems:"center", height:26 }}>
            <img className="hatchly-logo-light" src="crop/hatchly-logo.png" alt="Hatchly" style={{ height:26, width:"auto" }}/>
            <img className="hatchly-logo-dark" src="crop/hatchly-logo-dark.png" alt="Hatchly" style={{ height:26, width:"auto" }}/>
          </span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          {link("Stream","stream")}
          {link("Quick Ideas","quick")}
          {link("Leaderboard","leaderboard")}
          {loggedIn && link("My ideas","dashboard")}
        </div>
        <div style={{ flex:1 }} />
        {loggedIn ? (
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <BucksChip econ={econ} onClaim={onClaim} onWallet={onWallet} animateKey={claimKey} />
            <Btn size="sm" onClick={onNewIdea}><Icons.plus size={15}/> New idea</Btn>
            <AccountMenu go={go} theme={theme} setTheme={setTheme} onLogout={onLogout} />
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <button onClick={()=>go({screen:"auth", mode:"login"})} style={{ border:"none", background:"none", fontSize:13.5, fontWeight:500, color:"var(--text-secondary)" }}>Sign in</button>
            <Btn size="sm" onClick={()=>go({screen:"auth", mode:"signup"})}>Get started</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- daily claim modal ----------
function ClaimModal({ econ, onClose, onConfirm }) {
  const [done, setDone] = useState(false);
  return <>
    <Scrim onClose={onClose} />
    <div className="modal" style={{ width:400, padding:"34px 32px", textAlign:"center" }}>
      <div style={{ position:"relative", width:84, height:84, margin:"0 auto 8px", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <GoldBurst fire={done?1:0} />
        <div style={{ width:72, height:72, borderRadius:999, background:"var(--accent-soft)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Coin size={46} />
        </div>
      </div>
      <h2 className="serif" style={{ fontSize:30, margin:"10px 0 6px", fontStyle:"italic" }}>Your daily {econ.dailyClaim}</h2>
      <p className="muted" style={{ fontSize:14, margin:"0 auto 20px", maxWidth:280 }}>
        {done ? "Banked. Go back a winner — your early bets are what build a track record." : `Claim ${econ.dailyClaim} Hatchly Bucks. Spend them backing public ideas you believe in.`}
      </p>
      <div style={{ display:"flex", justifyContent:"center", gap:24, marginBottom:22 }}>
        <div><div className="mono" style={{ fontSize:22, fontWeight:600 }}>{econ.streak}🔥</div><div className="faint" style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em" }}>Day streak</div></div>
        <div style={{ width:1, background:"var(--border)" }}/>
        <div><Bucks amount={done?econ.balance+econ.dailyClaim:econ.balance} size={22} animate={done} /><div className="faint" style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", marginTop:2 }}>Balance</div></div>
      </div>
      {done
        ? <Btn variant="secondary" style={{ width:"100%" }} onClick={onClose}>Done</Btn>
        : <Btn style={{ width:"100%" }} onClick={()=>{ setDone(true); onConfirm(); }}><Coin size={17}/> Claim {econ.dailyClaim} bucks</Btn>}
    </div>
  </>;
}

// ---------- lightweight auth gate ----------
function AuthGate({ mode:initial="signup", reason, go, onAuth }) {
  const [mode, setMode] = useState(initial);
  const signup = mode==="signup";
  return (
    <div style={{ minHeight:"100%", display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 24px" }}>
      <div style={{ width:404 }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <span className="hatchly-logo" style={{ display:"inline-flex", height:30, marginBottom:18 }}>
            <img className="hatchly-logo-light" src="crop/hatchly-logo.png" alt="Hatchly" style={{ height:30 }}/>
            <img className="hatchly-logo-dark" src="crop/hatchly-logo-dark.png" alt="Hatchly" style={{ height:30 }}/>
          </span>
          <h1 className="serif" style={{ fontSize:32, margin:"0 0 8px", fontStyle:"italic" }}>{signup ? "Start backing ideas" : "Welcome back"}</h1>
          <p className="muted" style={{ fontSize:14, margin:0 }}>{reason || (signup ? "Claim 100 bucks a day. Back the ideas you believe in." : "Pick up where you left off.")}</p>
        </div>
        <Card style={{ padding:24 }}>
          {signup && <div style={{ marginBottom:14 }}><label className="label">Name</label><input className="field" defaultValue="Alex Rivera" /></div>}
          <div style={{ marginBottom:14 }}><label className="label">Email</label><input className="field" defaultValue="alex@rivera.co" /></div>
          <div style={{ marginBottom:18 }}><label className="label">Password</label><input className="field" type="password" defaultValue="••••••••" /></div>
          <Btn style={{ width:"100%" }} size="lg" onClick={onAuth}>{signup ? "Create account & claim 100 bucks" : "Sign in"}</Btn>
          {signup && <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:14, fontSize:12.5 }} className="faint"><Coin size={15}/> 100 Hatchly Bucks credited on signup</div>}
        </Card>
        <div style={{ textAlign:"center", marginTop:16, fontSize:13 }} className="muted">
          {signup ? "Already have an account? " : "New here? "}
          <button onClick={()=>setMode(signup?"login":"signup")} style={{ border:"none", background:"none", color:"var(--accent-text)", fontWeight:600, fontSize:13 }}>{signup ? "Sign in" : "Get started"}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- invest modal (loud) ----------
function InvestModal({ idea, econ, onClose, onConfirm }) {
  const presets = [25, 50, 100, 250];
  const [amount, setAmount] = useState(50);
  const [stage, setStage] = useState("pick"); // pick | done
  const max = econ.balance;
  const set = (v)=> setAmount(Math.max(0, Math.min(max, v)));
  const author = PEOPLE[idea.author];
  return <>
    <Scrim onClose={onClose} />
    <div className="modal" style={{ width:440, overflow:"visible" }}>
      <div style={{ padding:"24px 26px" }}>
        {stage==="pick" ? <>
          <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:18 }}>
            <Avatar label={idea.name[0]} kind="user" size={40} color={author.color} />
            <div><div style={{ fontWeight:600, fontSize:16 }}>Back {idea.name}</div><div className="faint" style={{ fontSize:12.5 }}>{idea.backers} backers · {window.fmt(idea.bucks)} bucks in</div></div>
            <div style={{ flex:1 }}/>
            <IconBtn onClick={onClose}><Icons.x size={18}/></IconBtn>
          </div>
          <div style={{ textAlign:"center", padding:"10px 0 18px" }}>
            <Bucks amount={amount} size={40} fontSize={40} style={{ justifyContent:"center" }} />
            <div className="faint" style={{ fontSize:12.5, marginTop:6 }}>of your {max.toLocaleString()} available</div>
          </div>
          <input type="range" min="0" max={max} step="5" value={amount} onChange={e=>set(+e.target.value)} className="bucks-range" style={{ width:"100%" }} />
          <div style={{ display:"flex", gap:8, marginTop:16 }}>
            {presets.map(p => (
              <button key={p} onClick={()=>set(p)} disabled={p>max} style={{
                flex:1, padding:"9px 0", borderRadius:9, fontSize:13, fontWeight:600,
                border:"1px solid "+(amount===p?"var(--accent)":"var(--border-strong)"),
                background: amount===p?"var(--accent-soft)":"var(--surface-raised)",
                color: amount===p?"var(--accent-text)":"var(--text-primary)", opacity:p>max?0.4:1,
              }}>{p}</button>
            ))}
          </div>
          <Btn style={{ width:"100%", marginTop:18 }} size="lg" disabled={amount<=0} onClick={()=>{ setStage("done"); onConfirm(amount); }}>
            <Coin size={18}/> Invest {amount} bucks
          </Btn>
          <p className="faint" style={{ fontSize:11.5, textAlign:"center", margin:"12px 0 0" }}>Play-money. Prestige, not equity — bucks are never real money.</p>
        </> : (
          <div style={{ textAlign:"center", padding:"14px 6px 6px" }}>
            <div style={{ position:"relative", width:88, height:88, margin:"0 auto 10px", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <GoldBurst fire={2} />
              <div style={{ width:74, height:74, borderRadius:999, background:"var(--success-soft)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--success-text)" }}><Icons.check size={38}/></div>
            </div>
            <h2 className="serif" style={{ fontSize:28, margin:"6px 0 6px", fontStyle:"italic" }}>You're in for {amount}</h2>
            <p className="muted" style={{ fontSize:14, margin:"0 auto 20px", maxWidth:300 }}>You're now backing <b style={{color:"var(--text-primary)"}}>{idea.name}</b>. If it trends, you earn a Return — and climb the leaderboard.</p>
            <Btn variant="secondary" style={{ width:"100%" }} onClick={onClose}>Back to the stream</Btn>
          </div>
        )}
      </div>
    </div>
  </>;
}

// ---------- Settings + API key management ----------
function Settings({ apiKey, onSaveKey, go, reason }) {
  const [draft, setDraft] = useState(apiKey || "");
  const [saved, setSaved] = useState(false);
  const save = ()=>{ onSaveKey(draft.trim()); setSaved(true); setTimeout(()=>setSaved(false), 1800); };
  const masked = apiKey && apiKey.length>8 ? apiKey.slice(0,5)+"•".repeat(10)+apiKey.slice(-4) : apiKey;
  return (
    <div className="scrollarea" style={{ height:"100%" }}>
      <div style={{ maxWidth:640, margin:"0 auto", padding:"36px 28px 90px" }}>
        <h1 style={{ fontSize:28, letterSpacing:"-0.02em", margin:"0 0 4px" }}>Settings</h1>
        <p className="muted" style={{ fontSize:14.5, margin:"0 0 28px" }}>Manage the API key that powers your idea chats.</p>

        {reason && !apiKey && (
          <div className="card" style={{ padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:12, border:"1px solid color-mix(in srgb, var(--accent) 34%, var(--border))", background:"var(--accent-soft)" }}>
            <Icons.lock size={18} style={{ color:"var(--accent-text)", flex:"none" }}/>
            <div style={{ fontSize:13.5, color:"var(--text-primary)" }}>{reason}</div>
          </div>
        )}

        <Card style={{ padding:22 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontWeight:600, fontSize:15 }}>Anthropic API key</span>
            {apiKey ? <span className="badge b-launch" style={{ fontSize:9.5 }}><Icons.check size={11}/> Connected</span> : <span className="badge b-cut" style={{ fontSize:9.5, background:"var(--danger-soft)", color:"var(--danger-text)" }}>Not set</span>}
          </div>
          <p className="faint" style={{ fontSize:12.5, margin:"0 0 14px", lineHeight:1.5 }}>Your key is stored locally and used to run the chat that shapes your ideas. You need one before creating an idea.</p>
          {apiKey && <div className="mono" style={{ fontSize:12.5, color:"var(--text-secondary)", padding:"8px 12px", background:"var(--surface)", borderRadius:8, marginBottom:12 }}>{masked}</div>}
          <label className="label">{apiKey ? "Replace key" : "Paste your key"}</label>
          <div style={{ display:"flex", gap:8 }}>
            <input className="field" placeholder="sk-ant-…" value={draft} onChange={e=>setDraft(e.target.value)} style={{ flex:1 }} />
            <Btn onClick={save} disabled={!draft.trim()}>{saved ? "Saved" : "Save key"}</Btn>
          </div>
          {apiKey && <button onClick={()=>{ onSaveKey(""); setDraft(""); }} className="btn btn-ghost btn-sm" style={{ marginTop:12, color:"var(--danger-text)" }}><Icons.trash size={14}/> Remove key</button>}
        </Card>

        <Card style={{ padding:22, marginTop:16 }}>
          <div style={{ fontWeight:600, fontSize:15, marginBottom:10 }}>Usage</div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--border)" }}><span className="muted" style={{ fontSize:13.5 }}>This month</span><span style={{ fontWeight:600, fontSize:13.5 }}>{apiKey ? "1,284 messages" : "—"}</span></div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0" }}><span className="muted" style={{ fontSize:13.5 }}>Model</span><span style={{ fontWeight:600, fontSize:13.5 }}>Claude Sonnet</span></div>
        </Card>
      </div>
    </div>);

}

Object.assign(window, { Scrim, ThemeToggle, AccountMenu, BucksChip, TopNav, ClaimModal, AuthGate, InvestModal, Settings });
