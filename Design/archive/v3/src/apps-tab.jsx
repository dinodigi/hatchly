/* ===================== apps-tab.jsx ===================== */
/* Idea-level Apps tab: Connectors + MCP servers, with detail pages.
   Loaded AFTER apps.jsx. */

const { useState: useStateT } = React;

/* segmented control */
function Segmented({ value, onChange, options }) {
  return (
    <div style={{ display: "inline-flex", gap: 2, padding: 3, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
      {options.map(o => {
        const sel = value === o.k;
        return (
          <button key={o.k} onClick={() => onChange(o.k)} className="row gap6" style={{ padding: "6px 13px", borderRadius: 7, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer",
            background: sel ? "var(--surface-raised)" : "transparent", color: sel ? "var(--text-primary)" : "var(--text-secondary)", boxShadow: sel ? "var(--shadow-card)" : "none" }}>
            {o.label}
            {o.count != null && <span style={{ fontSize: 11, fontWeight: 600, color: sel ? "var(--accent-text)" : "var(--text-muted)", background: sel ? "var(--accent-soft)" : "var(--surface)", borderRadius: 999, padding: "1px 6px" }}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

function StatTile({ label, value, sub, accent }) {
  return (
    <div className="card" style={{ padding: "15px 16px" }}>
      <div className="faint" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 6, color: accent ? "var(--accent-text)" : "var(--text-primary)" }}>{value}</div>
      {sub && <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function StatusLabel({ status }) {
  const st = APP_ST[status] || APP_ST.not_connected;
  return <span className="row gap6 nowrap" style={{ fontSize: 12, color: st.color }}><StatusDot color={st.color} size={7} />{st.label}</span>;
}

/* ============================================================
   APPS TAB
   ============================================================ */
function AppsTab({ idea, setFocusApp }) {
  const seed = APPS[idea.id] || { connectors: [], mcp: [] };
  const [connectors, setConnectors] = useStateT(seed.connectors);
  const [servers, setServers] = useStateT(seed.mcp);
  const [cat, setCat] = useStateT("connector");
  const [view, setView] = useStateT(null);   // { cat:"connector", id } | { cat:"mcp", id }
  const [adding, setAdding] = useStateT(false);
  const [form, setForm] = useStateT({ name: "", endpoint: "" });

  const updateConnector = (key, patch) => setConnectors(cs => cs.map(c => c.key === key ? { ...c, ...patch } : c));
  const updateServer = (id, patch) => setServers(ss => ss.map(s => s.id === id ? { ...s, ...patch } : s));

  const openConnector = (c) => { const def = CONNECTOR_DEFS[c.key]; setView({ cat: "connector", id: c.key }); setFocusApp({ kind: "connector", key: c.key, name: def.name, status: c.status }); };
  const openServer = (s) => { setView({ cat: "mcp", id: s.id }); setFocusApp({ kind: "mcp", id: s.id, name: s.name, status: s.status }); };
  const back = () => { setView(null); setFocusApp(null); };

  // ---- detail views ----
  if (view?.cat === "connector") {
    const c = connectors.find(x => x.key === view.id);
    if (c) return <ConnectorPage idea={idea} conn={c} onBack={back} onUpdate={(patch) => updateConnector(c.key, patch)} />;
  }
  if (view?.cat === "mcp") {
    const s = servers.find(x => x.id === view.id);
    if (s) return <McpPage server={s} onBack={back} onUpdate={(patch) => updateServer(s.id, patch)} />;
  }

  // ---- list view ----
  const addable = Object.keys(CONNECTOR_DEFS).filter(k => !connectors.some(c => c.key === k));
  const addConnector = (key) => { setConnectors(cs => [...cs, { key, status: "not_connected", label: null, meta: "" }]); };
  const addServer = () => {
    if (!form.name.trim() || !form.endpoint.trim()) return;
    setServers(ss => [...ss, { id: "mcp_" + Date.now(), name: form.name.trim(), endpoint: form.endpoint.trim(), status: "connected", auto: "ask_each",
      tools: [{ name: "discovering…", desc: "Tools advertised by the server appear here", writes: false, enabled: false }], recent: [] }]);
    setForm({ name: "", endpoint: "" }); setAdding(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 6px" }}>Apps</h1>
        <p className="muted" style={{ fontSize: 14, margin: 0, maxWidth: 580, lineHeight: 1.5 }}>Integrations this idea runs on. Everything here is scoped to <b style={{ color: "var(--text-primary)", fontWeight: 600 }}>{idea.name}</b> — nothing is shared across your other ideas.</p>
      </div>

      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <Segmented value={cat} onChange={(k) => { setCat(k); setAdding(false); }} options={[
          { k: "connector", label: "Connectors", count: connectors.length },
          { k: "mcp", label: "MCP servers", count: servers.length },
        ]} />
        {cat === "connector" && addable.length > 0 && <span className="faint" style={{ fontSize: 12 }}>{addable.length} more available</span>}
      </div>

      {/* explainer of the two categories */}
      <div className="row gap10" style={{ padding: "11px 14px", borderRadius: 11, background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 18, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
        <span style={{ color: "var(--accent-text)", marginTop: 1, flex: "none" }}>{cat === "connector" ? <Icons.plug size={15} /> : <Icons.server size={15} />}</span>
        {cat === "connector"
          ? <span><b style={{ color: "var(--text-primary)" }}>Connectors</b> are first-party surfaces this idea runs on — Hatchly builds and maintains them. You operate them by hand; the chat reads from them.</span>
          : <span><b style={{ color: "var(--text-primary)" }}>MCP servers</b> give the agent hands. Any tool that speaks the protocol can plug in — the agent calls them (with your consent) and every call shows up in chat.</span>}
      </div>

      {cat === "connector" ? (
        connectors.length === 0 ? (
          <Empty icon={Icons.plug} title="No connectors yet" body="Connectors come online as you approach launch — Stripe, your store, email. They turn this view into a live dashboard for the running business." />
        ) : (
          <div className="col gap10">
            {connectors.map(c => {
              const def = CONNECTOR_DEFS[c.key];
              return (
                <button key={c.key} onClick={() => openConnector(c)} className="card card-hover row gap14" style={{ padding: "15px 18px", textAlign: "left", width: "100%", alignItems: "center" }}>
                  <Tile icon={def.icon} size={40} accent={c.status === "connected"} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row gap8"><span style={{ fontWeight: 600, fontSize: 14.5 }}>{def.name}</span><span className="faint" style={{ fontSize: 12 }}>{def.note}</span></div>
                    <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{c.label || c.meta || "Not connected"}</div>
                  </div>
                  <StatusLabel status={c.status} />
                  <span className="faint"><Icons.chevR size={16} /></span>
                </button>
              );
            })}
            {addable.length > 0 && (
              <div className="card" style={{ padding: "12px 14px" }}>
                <div className="row gap8" style={{ flexWrap: "wrap", alignItems: "center" }}>
                  <span className="faint" style={{ fontSize: 12.5, marginRight: 2 }}>Add a connector:</span>
                  {addable.map(k => (
                    <button key={k} onClick={() => addConnector(k)} className="row gap6" style={{ padding: "5px 10px", borderRadius: 8, border: "1px dashed var(--border-strong)", background: "transparent", color: "var(--text-secondary)", fontSize: 12.5, cursor: "pointer" }}>
                      <Icons.plus size={13} /> {CONNECTOR_DEFS[k].name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="col gap10">
          {servers.map(s => (
            <button key={s.id} onClick={() => openServer(s)} className="card card-hover row gap14" style={{ padding: "15px 18px", textAlign: "left", width: "100%", alignItems: "center" }}>
              <Tile icon="server" size={40} accent={s.status === "connected"} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row gap8"><span style={{ fontWeight: 600, fontSize: 14.5 }}>{s.name}</span><span className="pill" style={{ fontSize: 10.5 }}>{`${s.tools.length} ${s.tools.length === 1 ? "tool" : "tools"}`}</span></div>
                <div className="faint mono" style={{ fontSize: 11.5, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.endpoint}</div>
              </div>
              <span className="pill" style={{ fontSize: 10.5, color: s.auto === "ask_each" ? "var(--text-secondary)" : "var(--accent-text)", background: s.auto === "ask_each" ? "var(--surface)" : "var(--accent-soft)", borderColor: "transparent" }}>{s.auto === "ask_each" ? "Ask each" : "Auto"}</span>
              <StatusLabel status={s.status} />
              <span className="faint"><Icons.chevR size={16} /></span>
            </button>
          ))}
          {adding ? (
            <div className="card col gap10" style={{ padding: 16 }}>
              <div className="row gap10">
                <div style={{ flex: 1 }}><label className="label">Server name</label><input className="field" placeholder="e.g. Notion" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus /></div>
                <div style={{ flex: 1.4 }}><label className="label">Endpoint</label><input className="field mono" placeholder="https://mcp.example.com/sse" value={form.endpoint} onChange={e => setForm(f => ({ ...f, endpoint: e.target.value }))} style={{ fontSize: 12.5 }} /></div>
              </div>
              <div className="row gap8"><div className="spacer" /><Btn variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Btn><Btn variant="primary" size="sm" onClick={addServer}><Icons.plus size={14} /> Add server</Btn></div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="row gap8" style={{ padding: "13px 16px", borderRadius: 12, border: "1px dashed var(--border-strong)", background: "transparent", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", justifyContent: "center" }}>
              <Icons.plus size={15} /> Add an MCP server
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* back header shared by detail pages */
function DetailHead({ icon, title, sub, status, onBack, right, accent }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <button className="row gap6 muted" style={{ background: "none", border: "none", fontSize: 12.5, padding: "2px 0", marginBottom: 14, cursor: "pointer" }} onClick={onBack}><Icons.back size={14} /> Apps</button>
      <div className="row gap14" style={{ alignItems: "center" }}>
        <Tile icon={icon} size={48} accent={accent} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row gap10"><h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", margin: 0 }}>{title}</h1>{status && <StatusLabel status={status} />}</div>
          {sub && <div className="faint mono" style={{ fontSize: 12, marginTop: 3 }}>{sub}</div>}
        </div>
        {right}
      </div>
    </div>
  );
}

/* reads / actions chips */
function ReadsActions({ def }) {
  return (
    <Card>
      <div className="grid gap20" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <SectionLabel style={{ marginBottom: 10 }}>The chat can read</SectionLabel>
          <div className="row gap6" style={{ flexWrap: "wrap" }}>{def.reads.map(r => <span key={r} className="pill" style={{ fontSize: 11.5 }}>{r}</span>)}</div>
        </div>
        <div>
          <SectionLabel style={{ marginBottom: 10 }}>You can act</SectionLabel>
          {def.actions.length ? <div className="row gap6" style={{ flexWrap: "wrap" }}>{def.actions.map(a => <span key={a} className="pill pill-accent" style={{ fontSize: 11.5 }}>{a}</span>)}</div>
            : <span className="faint" style={{ fontSize: 12.5 }}>View-only — no write actions.</span>}
        </div>
      </div>
    </Card>
  );
}

/* ============================================================
   CONNECTOR DETAIL PAGE
   ============================================================ */
function ConnectorPage({ idea, conn, onBack, onUpdate }) {
  const def = CONNECTOR_DEFS[conn.key];
  const [charges, setCharges] = useStateT(STRIPE_DASH.charges);
  const [refunding, setRefunding] = useStateT(null);

  const right = conn.status === "connected"
    ? <div className="row gap8"><span className="faint row gap5 nowrap" style={{ fontSize: 11.5 }}><Icons.sparkle size={12} /> Managed by Hatchly</span><Btn variant="ghost" size="sm" style={{ color: "var(--danger-text)" }} onClick={() => onUpdate({ status: "not_connected", label: null })}>Disconnect</Btn></div>
    : null;

  return (
    <div>
      <DetailHead icon={def.icon} title={def.name} sub={conn.status === "connected" ? (conn.label || def.note) : def.auth} status={conn.status} onBack={onBack} right={right} accent={conn.status === "connected"} />

      {conn.status !== "connected" ? (
        <Card className="col gap16" style={{ alignItems: "center", textAlign: "center", padding: "34px 24px" }}>
          <Tile icon={def.icon} size={52} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Connect {def.name}</div>
            <div className="muted" style={{ fontSize: 13.5, maxWidth: 360, lineHeight: 1.5 }}>{conn.status === "error" ? "This connection needs to be re-authorized." : `Once connected, this becomes a live ${def.note.toLowerCase()} surface and the chat can read from it.`}</div>
          </div>
          <div className="row gap8">
            <Btn variant="primary" onClick={() => onUpdate({ status: "connected", label: idea.name + " · " + def.name })}>{def.auth.includes("OAuth") ? `Authorize ${def.name}` : "Connect with API key"}</Btn>
          </div>
          <div style={{ width: "100%", maxWidth: 420, marginTop: 4 }}><ReadsActions def={def} /></div>
        </Card>
      ) : conn.key === "stripe" ? (
        <div className="col gap14">
          <div className="grid gap10" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            <StatTile label="Available" value={money(STRIPE_DASH.balance)} sub="Ready to pay out" accent />
            <StatTile label="Pending" value={money(STRIPE_DASH.pending)} sub="Clearing" />
            <StatTile label="Sales · 7d" value={STRIPE_DASH.weekCount} sub={money(STRIPE_DASH.weekAmount)} />
            <StatTile label="MRR" value={money(STRIPE_DASH.mrr)} sub={STRIPE_DASH.subs + " subscribers"} />
          </div>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="row" style={{ justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
              <SectionLabel>Recent payments</SectionLabel>
              <span className="faint" style={{ fontSize: 11.5 }}>{charges.filter(c => c.status === "succeeded").length} succeeded · {charges.filter(c => c.status === "refunded").length} refunded</span>
            </div>
            {charges.map((c, i) => (
              <div key={c.id} className="row gap12" style={{ padding: "12px 18px", borderBottom: i < charges.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.who}</div>
                  <div className="faint mono" style={{ fontSize: 11, marginTop: 1 }}>{c.id} · {c.when}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{money(c.amt)}</div>
                <div style={{ width: 96, textAlign: "right" }}>
                  {c.status === "refunded"
                    ? <span className="pill" style={{ fontSize: 10.5 }}>Refunded</span>
                    : refunding === c.id
                      ? <span className="row gap6" style={{ justifyContent: "flex-end" }}>
                          <button onClick={() => { setCharges(cs => cs.map(x => x.id === c.id ? { ...x, status: "refunded" } : x)); setRefunding(null); }} style={{ border: "none", background: "var(--danger)", color: "#fff", fontSize: 11.5, fontWeight: 600, padding: "4px 9px", borderRadius: 6, cursor: "pointer" }}>Confirm</button>
                          <button onClick={() => setRefunding(null)} className="iconbtn" style={{ width: 24, height: 24 }}><Icons.x size={13} /></button>
                        </span>
                      : <Btn variant="ghost" size="sm" onClick={() => setRefunding(c.id)}>Refund</Btn>}
                </div>
              </div>
            ))}
          </Card>

          <div className="row gap10" style={{ padding: "11px 14px", borderRadius: 11, background: "var(--accent-softer)", border: "1px solid var(--accent-soft)", fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            <span style={{ color: "var(--accent-text)", flex: "none", marginTop: 1 }}><Icons.sparkle size={15} /></span>
            <span>Hatchly reads from this connection — ask the chat <i>"how are sales this week?"</i> or <i>"refund the last order from Tan"</i>.</span>
          </div>

          <ReadsActions def={def} />
        </div>
      ) : (
        <div className="col gap14">
          {CONN_STATS[conn.key] && (
            <div className="grid gap10" style={{ gridTemplateColumns: `repeat(${CONN_STATS[conn.key].length}, 1fr)` }}>
              {CONN_STATS[conn.key].map(([l, v], i) => <StatTile key={l} label={l} value={v} accent={i === 0} />)}
            </div>
          )}
          {def.actions.length > 0 && (
            <Card className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontWeight: 600, fontSize: 14 }}>{def.actions[0]}</div><div className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>Run this directly, or ask the chat to do it.</div></div>
              <Btn variant="secondary" size="sm">{def.actions[0]}</Btn>
            </Card>
          )}
          <ReadsActions def={def} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MCP SERVER DETAIL PAGE
   ============================================================ */
function McpPage({ server, onBack, onUpdate }) {
  const toggleTool = (name) => onUpdate({ tools: server.tools.map(t => t.name === name ? { ...t, enabled: !t.enabled } : t) });
  const right = <Btn variant="ghost" size="sm" style={{ color: "var(--danger-text)" }} onClick={onBack}><Icons.trash size={14} /> Remove</Btn>;

  return (
    <div>
      <DetailHead icon="server" title={server.name} sub={server.endpoint} status={server.status} onBack={onBack} right={right} accent={server.status === "connected"} />

      {/* consent */}
      <Card style={{ marginBottom: 14 }}>
        <SectionLabel style={{ marginBottom: 4 }}>Consent</SectionLabel>
        <p className="muted" style={{ fontSize: 13, margin: "0 0 14px", lineHeight: 1.5 }}>The agent can call this server's tools. Decide how much it can do on its own. Writes always ask first, regardless of this setting.</p>
        <div className="col gap8">
          {[
            ["ask_each", "Ask before each call", "The agent pauses for your OK every time it wants to use a tool here."],
            ["allow_enabled", "Allow enabled tools", "Enabled read-only tools run automatically. Anything that writes still asks."],
          ].map(([k, h, b]) => {
            const sel = server.auto === k;
            return (
              <button key={k} onClick={() => onUpdate({ auto: k })} className="row gap12" style={{ textAlign: "left", padding: "12px 14px", borderRadius: 11, cursor: "pointer", width: "100%",
                border: "1.5px solid", borderColor: sel ? "var(--accent)" : "var(--border)", background: sel ? "var(--accent-softer)" : "transparent" }}>
                <span style={{ width: 18, height: 18, borderRadius: 999, flex: "none", marginTop: 1, border: "1.5px solid", borderColor: sel ? "var(--accent)" : "var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {sel && <span className="dot" style={{ width: 9, height: 9, background: "var(--accent)" }} />}
                </span>
                <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{h}</div><div className="muted" style={{ fontSize: 12.5, marginTop: 2, lineHeight: 1.45 }}>{b}</div></div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* tools */}
      <Card style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
        <div className="row" style={{ justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <SectionLabel>Advertised tools · {server.tools.length}</SectionLabel>
          <span className="faint" style={{ fontSize: 11.5 }}>{server.tools.filter(t => t.enabled).length} enabled</span>
        </div>
        {server.tools.map((t, i) => (
          <div key={t.name} className="row gap12" style={{ padding: "13px 18px", borderBottom: i < server.tools.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center" }}>
            <span style={{ color: t.writes ? "var(--accent-text)" : "var(--text-muted)", flex: "none" }}><Icons.wrench size={15} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row gap8"><span className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</span>{t.writes && <span className="pill" style={{ fontSize: 9.5, color: "var(--accent-text)", background: "var(--accent-soft)", borderColor: "transparent", letterSpacing: "0.06em", textTransform: "uppercase" }}>Writes</span>}</div>
              <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{t.desc}</div>
            </div>
            <button onClick={() => toggleTool(t.name)} title={t.enabled ? "Enabled" : "Disabled"} style={{ width: 40, height: 23, borderRadius: 999, border: "none", flex: "none", cursor: "pointer", padding: 2, background: t.enabled ? "var(--accent)" : "var(--border-strong)", transition: "background 160ms ease" }}>
              <span style={{ display: "block", width: 19, height: 19, borderRadius: 999, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.25)", transform: t.enabled ? "translateX(17px)" : "translateX(0)", transition: "transform 160ms cubic-bezier(.22,1,.36,1)" }} />
            </button>
          </div>
        ))}
      </Card>

      {/* recent invocations */}
      {server.recent && server.recent.length > 0 && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div className="row gap8" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
            <SectionLabel>Recent calls</SectionLabel>
            <span className="faint" style={{ fontSize: 11.5 }}>· surfaced in your chat</span>
          </div>
          {server.recent.map((r, i) => (
            <div key={i} className="row gap10" style={{ padding: "11px 18px", borderBottom: i < server.recent.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center", fontSize: 12.5 }}>
              <span style={{ color: "var(--accent-text)", flex: "none" }}><Icons.bolt size={13} /></span>
              <span className="mono" style={{ fontWeight: 500, flex: "none" }}>{r[0]}</span>
              <span className="muted" style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r[1]}</span>
              <span className="faint nowrap">{r[2]}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

Object.assign(window, { AppsTab, ConnectorPage, McpPage, Segmented, StatTile });
