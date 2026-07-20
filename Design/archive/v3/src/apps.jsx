/* ===================== apps.jsx ===================== */
/* Apps & Keys feature: account model key (BYOK), idea-level Apps tab
   (Connectors + MCP servers), connector dashboards, MCP consent.
   Loaded AFTER bundle.jsx — relies on its window globals (Icons, Card,
   Btn, IconBtn, Pill, StatusDot, SectionLabel, Avatar, Empty, USER). */

const { useState: useStateA } = React;

const money = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const APP_ST = {
  connected:     { label: "Connected",       color: "var(--success)" },
  not_connected: { label: "Not connected",   color: "var(--text-muted)" },
  error:         { label: "Needs attention", color: "var(--danger)" },
};

/* ---- connector registry (definitions) ---- */
const CONNECTOR_DEFS = {
  stripe:  { name: "Stripe",        note: "Payments",         icon: "card",     auth: "API key · BYOK", reads: ["Balance", "Payouts", "Recent charges", "Subscriptions"], actions: ["Refund a charge", "Pause a subscription"] },
  shopify: { name: "Shopify",       note: "Store & orders",   icon: "building", auth: "OAuth",          reads: ["Orders", "Products", "Inventory"],                     actions: ["Fulfill an order", "Edit a product"] },
  email:   { name: "Elastic Email", note: "Email & lists",    icon: "bell",     auth: "API key · BYOK", reads: ["Lists", "Campaign stats", "Deliverability"],            actions: ["Send a campaign", "Add to a list"] },
  bank:    { name: "Mercury",       note: "Business banking", icon: "building", auth: "OAuth",          reads: ["Balance", "Transactions"],                             actions: [] },
  domain:  { name: "Domain",        note: "DNS & hosting",    icon: "globe",    auth: "API key",        reads: ["DNS records", "Status"],                               actions: ["Update DNS"] },
};

/* ---- per-idea apps (connectors + MCP servers) ---- */
const APPS = {
  i_drop: {
    connectors: [
      { key: "stripe",  status: "connected",     label: "Drop's Stripe", meta: "acct_1Q · USD" },
      { key: "shopify", status: "connected",     label: "getdrop.shop",  meta: "OAuth" },
      { key: "email",   status: "connected",     label: "Drop campaigns",meta: "2,140 contacts" },
      { key: "bank",    status: "error",         label: "Mercury",       meta: "Re-auth needed" },
    ],
    mcp: [
      { id: "mcp_research", name: "Web Research", endpoint: "https://mcp.exa.ai/sse", status: "connected", auto: "allow_enabled",
        tools: [{ name: "web_search", desc: "Search the live web", writes: false, enabled: true }, { name: "fetch_url", desc: "Fetch & read a page", writes: false, enabled: true }],
        recent: [["web_search", "funko resale price trends", "2h ago"], ["fetch_url", "popmart Q1 earnings", "1d ago"]] },
      { id: "mcp_ship", name: "Shipping Rates", endpoint: "https://mcp.shippo.dev/sse", status: "connected", auto: "ask_each",
        tools: [{ name: "get_rates", desc: "Quote carrier rates", writes: false, enabled: true }, { name: "buy_label", desc: "Purchase a shipping label", writes: true, enabled: false }],
        recent: [["get_rates", "USPS vs UPS · 1lb box", "4h ago"]] },
    ],
  },
  i_loop: {
    connectors: [
      { key: "stripe", status: "not_connected", label: null, meta: "Connect at launch" },
      { key: "email",  status: "not_connected", label: null, meta: "" },
    ],
    mcp: [
      { id: "mcp_research", name: "Web Research", endpoint: "https://mcp.exa.ai/sse", status: "connected", auto: "allow_enabled",
        tools: [{ name: "web_search", desc: "Search the live web", writes: false, enabled: true }, { name: "fetch_url", desc: "Fetch & read a page", writes: false, enabled: true }],
        recent: [["web_search", "solo-founder planner competitors", "3h ago"], ["web_search", "Sunsama pricing 2026", "3h ago"]] },
      { id: "mcp_reddit", name: "Reddit Signals", endpoint: "https://mcp.reddit-tools.dev/sse", status: "connected", auto: "ask_each",
        tools: [{ name: "search_subreddits", desc: "Find relevant communities", writes: false, enabled: true }, { name: "thread_sentiment", desc: "Summarize a thread's sentiment", writes: false, enabled: true }, { name: "post_comment", desc: "Reply in a thread", writes: true, enabled: false }],
        recent: [["search_subreddits", "r/indiehackers, r/solopreneur", "2d ago"]] },
    ],
  },
  i_pantry: {
    connectors: [],
    mcp: [
      { id: "mcp_research", name: "Web Research", endpoint: "https://mcp.exa.ai/sse", status: "connected", auto: "ask_each",
        tools: [{ name: "web_search", desc: "Search the live web", writes: false, enabled: true }],
        recent: [["web_search", "grocery affiliate margins", "9d ago"]] },
    ],
  },
};

/* ---- Stripe dashboard sample (for Drop's connected Stripe) ---- */
const STRIPE_DASH = {
  balance: 4182.50, pending: 1290.00, weekCount: 47, weekAmount: 2914.00, subs: 112, mrr: 3360.00,
  charges: [
    { id: "ch_8f2a", who: "maya.k@gmail.com",    amt: 62.00,  when: "2h ago",     status: "succeeded" },
    { id: "ch_7d10", who: "j.okafor@hey.com",    amt: 62.00,  when: "5h ago",     status: "succeeded" },
    { id: "ch_6b93", who: "reece@fastmail.com",  amt: 124.00, when: "Yesterday",  status: "succeeded" },
    { id: "ch_5a37", who: "tan.lim@proton.me",   amt: 62.00,  when: "Yesterday",  status: "succeeded" },
    { id: "ch_4c70", who: "dev@buildbox.io",     amt: 62.00,  when: "2 days ago", status: "refunded" },
    { id: "ch_3e21", who: "sara@studio9.co",     amt: 186.00, when: "3 days ago", status: "succeeded" },
  ],
};

/* ---- light per-connector stats (non-Stripe) ---- */
const CONN_STATS = {
  shopify: [["Open orders", "8"], ["Revenue · 30d", "$6,420"], ["Units in stock", "310"]],
  email:   [["Contacts", "2,140"], ["Last open rate", "38%"], ["Campaigns sent", "11"]],
  bank:    [["Available", "$12,840"], ["Pending", "$1,290"], ["Transactions · 30d", "63"]],
};

/* ---- model-key providers ---- */
const PROVIDERS = [
  { id: "anthropic", name: "Claude",  model: "Anthropic", icon: "sparkle", ph: "sk-ant-api03-••••", link: "console.anthropic.com → API keys", demo: "sk-ant-api03-9f2a77c4e1b8d3a6" },
  { id: "openai",    name: "ChatGPT", model: "OpenAI",    icon: "bolt",    ph: "sk-proj-••••",     link: "platform.openai.com → API keys", demo: "sk-proj-Tn8x2Lq7Vb4Kd9Rs1Wu5Yz" },
];
const maskKey = (v) => (v && v.length > 12) ? v.slice(0, 8) + " •••• " + v.slice(-4) : "sk-•••• " + (v || "").slice(-4);

/* small icon tile */
function Tile({ icon, size = 38, accent }) {
  const I = typeof icon === "string" ? Icons[icon] : icon;
  return (
    <span style={{ width: size, height: size, borderRadius: 10, flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
      background: accent ? "var(--accent-soft)" : "var(--surface)", color: accent ? "var(--accent-text)" : "var(--text-secondary)" }}>
      <I size={Math.round(size * 0.5)} />
    </span>
  );
}

/* ============================================================
   ONBOARDING GATE — connect a model key before the workspace
   ============================================================ */
function KeySetup({ onConnect, go }) {
  const [prov, setProv] = useStateA("anthropic");
  const [val, setVal] = useStateA(PROVIDERS[0].demo);
  const [loading, setLoading] = useStateA(false);
  const P = PROVIDERS.find(p => p.id === prov);

  const pick = (id) => { setProv(id); setVal(PROVIDERS.find(p => p.id === id).demo); };
  const connect = () => { if (!val.trim() || loading) return; setLoading(true); setTimeout(() => onConnect(prov, maskKey(val.trim())), 850); };

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: "var(--background)" }}>
      <div style={{ padding: "28px 40px" }}>
        <div className="row gap8" style={{ cursor: "pointer", width: "fit-content" }} onClick={() => go({ screen: "marketing" })}><Logo h={30} /></div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px 80px" }}>
        <div style={{ width: 460, maxWidth: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--accent-soft)", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Icons.key size={22} /></div>
            <h1 className="serif italic" style={{ fontSize: 32, margin: "0 0 6px", fontWeight: 400 }}>Power your Hatchly AI</h1>
            <p className="muted" style={{ fontSize: 14, margin: "0 auto", maxWidth: 340, lineHeight: 1.5 }}>Hatchly is free — you bring your own model key. It runs every idea's chat and scoring. One thing to connect, then you're in.</p>
          </div>
          <Card style={{ padding: 22 }}>
            <SectionLabel style={{ marginBottom: 10 }}>Choose a provider</SectionLabel>
            <div className="grid gap10" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
              {PROVIDERS.map(p => {
                const sel = prov === p.id;
                return (
                  <button key={p.id} onClick={() => pick(p.id)} className="row gap10" style={{ textAlign: "left", padding: "13px 14px", borderRadius: 12, cursor: "pointer",
                    border: "1.5px solid", borderColor: sel ? "var(--accent)" : "var(--border-strong)", background: sel ? "var(--accent-softer)" : "var(--surface-raised)" }}>
                    <Tile icon={p.icon} size={34} accent={sel} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      <div className="faint" style={{ fontSize: 11.5 }}>{p.model}</div>
                    </div>
                    {sel && <span style={{ marginLeft: "auto", color: "var(--accent-text)" }}><Icons.check size={16} sw={2.4} /></span>}
                  </button>
                );
              })}
            </div>
            <label className="label">{P.name} API key</label>
            <input className="field mono" value={val} onChange={e => setVal(e.target.value)} style={{ fontSize: 12.5 }} spellCheck={false} />
            <div className="row" style={{ justifyContent: "space-between", marginTop: 7 }}>
              <a className="faint row gap5" style={{ fontSize: 11.5, cursor: "pointer" }}><Icons.ext size={12} /> Where to find it · {P.link}</a>
            </div>
            <div className="row gap8" style={{ marginTop: 16, padding: "10px 12px", background: "var(--surface)", borderRadius: 9, color: "var(--text-secondary)", fontSize: 11.5, lineHeight: 1.45, alignItems: "flex-start" }}>
              <span style={{ color: "var(--text-muted)", marginTop: 1 }}><Icons.lock size={13} /></span>
              <span>Encrypted at rest and stored server-side. Never shown again after this, never written to logs, never placed in chat context.</span>
            </div>
            <Btn variant="primary" onClick={connect} disabled={loading} style={{ width: "100%", marginTop: 16 }}>
              {loading ? <TypingDots /> : <><Icons.key size={15} /> Connect &amp; continue</>}
            </Btn>
          </Card>
          <div className="faint" style={{ textAlign: "center", fontSize: 12, marginTop: 16 }}>You can switch or add the other provider any time in Settings.</div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SETTINGS — Model key (BYOK) pane
   ============================================================ */
function ModelKeyPane({ keyApi }) {
  const { modelKey, connect, setActive, disconnect } = keyApi;
  const [adding, setAdding] = useStateA(null);   // provider id being connected
  const [val, setVal] = useStateA("");

  const startAdd = (id) => { setAdding(id); setVal(PROVIDERS.find(p => p.id === id).demo); };
  const saveAdd = () => { if (!val.trim()) return; connect(adding, maskKey(val.trim())); setAdding(null); setVal(""); };

  const active = modelKey?.active;
  const activeP = active && PROVIDERS.find(p => p.id === active);

  return (
    <div>
      <PaneHead title="Model key" sub="Bring your own key — it powers every idea's AI. The platform is free; you pay your own model usage. One provider active at a time." />

      {activeP ? (
        <Card style={{ marginBottom: 14, background: "var(--accent-softer)", borderColor: "var(--accent-soft)" }}>
          <div className="row gap14" style={{ alignItems: "center" }}>
            <Tile icon={activeP.icon} size={44} accent />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row gap8"><span style={{ fontWeight: 600, fontSize: 15 }}>{activeP.name}</span><Pill accent style={{ fontSize: 10 }}>Active</Pill></div>
              <div className="faint mono" style={{ fontSize: 12, marginTop: 2 }}>{modelKey.providers[active].masked} · added {modelKey.providers[active].since}</div>
            </div>
            <span className="row gap6" style={{ fontSize: 12.5, color: "var(--success-text)" }}><span className="live-dot" /> Powering your AI</span>
          </div>
        </Card>
      ) : (
        <Card style={{ marginBottom: 14, borderColor: "var(--danger-soft)", background: "var(--danger-soft)" }}>
          <div className="row gap10" style={{ alignItems: "flex-start" }}>
            <span style={{ color: "var(--danger-text)", marginTop: 1 }}><Icons.alert size={18} /></span>
            <div style={{ fontSize: 13, color: "var(--text-primary)" }}><b>No active key.</b> <span className="muted">Chat and scoring are disabled across every idea until you connect one below.</span></div>
          </div>
        </Card>
      )}

      <Card style={{ padding: 8, marginBottom: 14 }}>
        {PROVIDERS.map((p, i) => {
          const conn = modelKey?.providers?.[p.id];
          const isActive = active === p.id;
          return (
            <div key={p.id} style={{ borderBottom: i < PROVIDERS.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div className="row gap14" style={{ padding: "14px 12px", alignItems: "center" }}>
                <Tile icon={p.icon} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name} <span className="faint" style={{ fontWeight: 400, fontSize: 12 }}>· {p.model}</span></div>
                  <div className="faint mono" style={{ fontSize: 11.5, marginTop: 1 }}>{conn ? conn.masked : "Not connected"}</div>
                </div>
                {conn ? (
                  <div className="row gap8">
                    {isActive ? <Pill accent style={{ fontSize: 10 }}>Active</Pill>
                      : <Btn variant="soft" size="sm" onClick={() => setActive(p.id)}>Make active</Btn>}
                    <Btn variant="ghost" size="sm" style={{ color: "var(--danger-text)" }} onClick={() => disconnect(p.id)}>Disconnect</Btn>
                  </div>
                ) : (
                  adding === p.id
                    ? null
                    : <Btn variant="secondary" size="sm" onClick={() => startAdd(p.id)}>Connect</Btn>
                )}
              </div>
              {adding === p.id && (
                <div style={{ padding: "0 12px 14px" }}>
                  <label className="label">{p.name} API key</label>
                  <div className="row gap8">
                    <input className="field mono" value={val} onChange={e => setVal(e.target.value)} style={{ fontSize: 12.5 }} spellCheck={false} autoFocus />
                    <Btn variant="primary" size="sm" onClick={saveAdd}>Save</Btn>
                    <Btn variant="ghost" size="sm" onClick={() => { setAdding(null); setVal(""); }}>Cancel</Btn>
                  </div>
                  <a className="faint row gap5" style={{ fontSize: 11.5, marginTop: 7, cursor: "pointer" }}><Icons.ext size={12} /> {p.link}</a>
                </div>
              )}
            </div>
          );
        })}
      </Card>

      <Card>
        <SectionLabel style={{ marginBottom: 10 }}>How your key is handled</SectionLabel>
        <div className="col gap8">
          {[
            ["Encrypted at rest", "Stored server-side and encrypted. After you enter it, it's never returned to the browser."],
            ["Never in logs or chat", "The raw key is never written to logs and never placed in the model's chat context."],
            ["Account-wide, one active", "The active key runs every idea. Switching is a single toggle — nothing changes per idea."],
          ].map(([h, b]) => (
            <div key={h} className="row gap10" style={{ alignItems: "flex-start" }}>
              <span style={{ color: "var(--success)", marginTop: 1, flex: "none" }}><Icons.shield size={15} /></span>
              <div style={{ fontSize: 13 }}><b>{h}.</b> <span className="muted">{b}</span></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { KeySetup, ModelKeyPane, Tile, APPS, CONNECTOR_DEFS, APP_ST, STRIPE_DASH, CONN_STATS, PROVIDERS, money, maskKey });
