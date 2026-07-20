// ===== Auth: centered card, signup/login toggle =====

function Auth({ go, mode:initialMode="signup", onAuth }) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const signup = mode === "signup";

  const submit = (e) => {
    e && e.preventDefault();
    setErr(""); setLoading(true);
    setTimeout(() => { setLoading(false); onAuth(); }, 850);
  };

  return (
    <div style={{ minHeight:"100%", display:"flex", flexDirection:"column", background:"var(--background)" }}>
      <div style={{ padding:"28px 40px" }}>
        <div className="row gap8" style={{ cursor:"pointer", width:"fit-content" }} onClick={()=>go({screen:"marketing"})}>
          <span style={{ color:"var(--accent)" }}><Icons.logo size={22}/></span>
          <span style={{ fontWeight:600, fontSize:17 }}>Hatchly</span>
        </div>
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 20px 80px" }}>
        <div style={{ width:400, maxWidth:"100%", animation:"scaleIn 320ms cubic-bezier(.22,1,.36,1)" }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <h1 className="serif italic" style={{ fontSize:34, margin:"0 0 6px", fontWeight:400 }}>{signup?"Start an idea":"Welcome back"}</h1>
            <p className="muted" style={{ fontSize:14, margin:0 }}>{signup?"A sentence is enough to begin.":"Pick up where you left off."}</p>
          </div>
          <Card style={{ padding:26 }}>
            <div className="col gap10" style={{ marginBottom:14 }}>
              <Btn variant="secondary" onClick={submit}><Icons.globe size={16}/> Continue with Google</Btn>
              <Btn variant="secondary" onClick={submit}><Icons.ext size={16}/> Continue with GitHub</Btn>
            </div>
            <div className="row gap10" style={{ margin:"4px 0 16px", color:"var(--text-muted)", fontSize:12 }}>
              <div className="hr" style={{ flex:1 }}/> or <div className="hr" style={{ flex:1 }}/>
            </div>
            <form onSubmit={submit} className="col gap12">
              {signup && <div><label className="label">Name</label><input className="field" placeholder="Alex Rivera" defaultValue="Alex Rivera"/></div>}
              <div><label className="label">Email</label><input className="field" type="email" placeholder="you@founder.co" defaultValue="alex@rivera.co"/></div>
              <div>
                <label className="label">Password</label>
                <input className="field" type="password" placeholder="••••••••" defaultValue="hatchly-demo"/>
                {err && <div style={{ color:"var(--danger-text)", fontSize:12, marginTop:6 }}>{err}</div>}
              </div>
              <Btn variant="primary" type="submit" disabled={loading} style={{ marginTop:4 }}>
                {loading ? <TypingDots/> : (signup?"Continue":"Log in")}
              </Btn>
            </form>
          </Card>
          <div className="muted" style={{ textAlign:"center", fontSize:13, marginTop:18 }}>
            {signup ? "Already have an account? " : "New to Hatchly? "}
            <a style={{ color:"var(--accent-text)", fontWeight:500 }} onClick={()=>{ setErr(""); setMode(signup?"login":"signup"); }}>
              {signup ? "Log in" : "Create one"}
            </a>
          </div>
          {!signup && <div className="muted" style={{ textAlign:"center", fontSize:12.5, marginTop:8 }}><a style={{ textDecoration:"underline" }}>Forgot password?</a></div>}
        </div>
      </div>
    </div>
  );
}

window.Auth = Auth;
