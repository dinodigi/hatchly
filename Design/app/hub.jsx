// ===== Idea hub — an idea is a project: many chats + memory + files + public page =====

const HUB_TABS = [
{ key: "overview", label: "Overview", icon: Icons.grid },
{ key: "memory", label: "Memory", icon: Icons.brain },
{ key: "files", label: "Artifacts", icon: Icons.doc },
{ key: "community", label: "Community", icon: Icons.users },
{ key: "public", label: "Public page", icon: Icons.globe }];


function HubHeader({ idea, tab, go, onVisibility, onToast, chrome }) {
  const changeVis = (v) => {onVisibility(v);onToast(v === "public" ? "Published to the stream — now backable with bucks." : v === "link" ? "Link-only — shareable for feedback. Not votable." : "Set to private.");};
  return (
    <div style={{ borderBottom: "1px solid var(--border)", padding: "14px 28px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 13 }}>
        <button onClick={() => go({ screen: "dashboard" })} style={{ border: "none", background: "none", color: "var(--text-secondary)", fontSize: 13, display: "flex", alignItems: "center", gap: 5, padding: 0 }}><Icons.back size={16} /> Ideas</button>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <h1 style={{ fontSize: 21, margin: 0, letterSpacing: "-0.01em" }}>{idea.name}</h1>
          <StageBadge stage={idea.stage} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <VisibilityMenu idea={idea} onChange={changeVis} />
          {chrome && <>
            <span style={{ width: 1, height: 24, background: "var(--border)" }} />
            <BucksChip econ={chrome.econ} onClaim={chrome.onClaim} onWallet={chrome.onWallet} animateKey={chrome.claimKey} />
            <Btn size="sm" onClick={chrome.onNewIdea}><Icons.plus size={15} /> New idea</Btn>
            <AccountMenu go={go} theme={chrome.theme} setTheme={chrome.setTheme} onLogout={chrome.onLogout} />
          </>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {HUB_TABS.map((t) => {
          const active = tab === t.key;const I = t.icon;
          return (
            <button key={t.key} onClick={() => go({ screen: "workspace", ideaId: idea.id, tab: t.key })} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", border: "none", background: "none", fontSize: 13.5, fontWeight: 500,
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
              borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent", marginBottom: -1, borderRadius: 0
            }}><I size={15} /> {t.label}</button>);

        })}
      </div>
    </div>);

}

// ---- Overview: the project home (chat-first, Claude-Projects style) ----
function Overview({ idea, go, onNewChat, mutate, feedback }) {
  const [draft, setDraft] = useState("");
  const start = () => {if (!draft.trim()) return;onNewChat(idea.id, draft.trim());setDraft("");};
  const pct = prdProgress(idea.prd);
  const prdFile = idea.files.find((f) => f.source === "prd");
  return (
    <div className="scrollarea" style={{ height: "100%" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "34px 28px 90px" }}>
        <div className="hub-grid" style={{ display: "grid", gridTemplateColumns: "1fr 312px", gap: 30, alignItems: "start" }}>
          {/* main */}
          <div style={{ minWidth: 0 }}>
            <p className="muted" style={{ fontSize: 15, lineHeight: 1.55, margin: "0 0 20px" }}>{idea.description}</p>

            {/* composer */}
            <div className="card composer" style={{ padding: "16px 18px" }}>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter" && !e.shiftKey) {e.preventDefault();start();}}}
              rows={2} placeholder="Start a new chat — describe a piece of the idea, paste a link, or talk it through…"
              style={{ width: "100%", border: "none", background: "none", resize: "none", outline: "none", fontSize: 15, lineHeight: 1.55 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <IconBtn><Icons.link size={17} /></IconBtn>
                <IconBtn><Icons.mic size={17} /></IconBtn>
                <div style={{ flex: 1 }} />
                <Btn size="sm" onClick={start}><Icons.chat size={15} /> Start chat</Btn>
              </div>
            </div>

            {/* chats list */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "26px 0 12px" }}>
              <SectionLabel>Chats · {idea.chats.length}</SectionLabel>
              <span className="faint" style={{ fontSize: 12 }}>Each chat feeds your brief</span>
            </div>
            {idea.chats.length ?
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {idea.chats.map((c) => {
                const last = c.thread[c.thread.length - 1];
                return (
                  <Card key={c.id} hover onClick={() => go({ screen: "workspace", ideaId: idea.id, tab: "overview", chatId: c.id })} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
                      <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--surface)", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icons.chat size={17} /></span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 2 }}>{c.title}</div>
                        <div className="muted" style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{last?.content}</div>
                      </div>
                      <span className="faint" style={{ fontSize: 12, flex: "none" }}>{c.at}</span>
                      <Icons.chevR size={16} style={{ color: "var(--text-muted)", flex: "none" }} />
                    </Card>);

              })}
              </div> :

            <div className="card" style={{ padding: "30px 20px", textAlign: "center", borderStyle: "dashed", background: "transparent" }}>
                <div className="muted" style={{ fontSize: 13.5 }}>No chats yet. Start one above to keep conversations organized and reuse what the idea knows.</div>
              </div>
            }
          </div>

          {/* knowledge panel */}
          <aside style={{ position: "sticky", top: 24 }}>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {/* memory */}
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 7 }}><Icons.brain size={15} /> Memory</span>
                  <button onClick={() => go({ screen: "workspace", ideaId: idea.id, tab: "memory" })} className="link-btn">{idea.memories.length}</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {idea.memories.slice(0, 3).map((m) =>
                  <div key={m.id} style={{ display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.45 }}>
                      <StatusDot color="var(--accent)" size={6} />
                      <span style={{ color: "var(--text-secondary)" }}>{m.content}</span>
                    </div>
                  )}
                  {!idea.memories.length && <span className="faint" style={{ fontSize: 12.5 }}>Captured as you chat.</span>}
                </div>
              </div>
              <div style={{ height: 1, background: "var(--border)" }} />
              {/* files */}
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 7 }}><Icons.doc size={15} /> Artifacts</span>
                  <button onClick={() => go({ screen: "workspace", ideaId: idea.id, tab: "files" })} className="link-btn">{idea.files.length}</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {idea.files.map((f) =>
                  <button key={f.id} onClick={() => go({ screen: "workspace", ideaId: idea.id, tab: "files", fileId: f.id })} className="file-row">
                      <span className="file-glyph glyph-page"><Icons.doc size={14} /></span>
                      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}><div style={{ fontWeight: 500, fontSize: 13 }}>{f.title}</div></div>
                    </button>
                  )}
                </div>
              </div>
              <div style={{ height: 1, background: "var(--border)" }} />
              {/* completeness */}
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>Brief</span>
                  <span className="mono faint" style={{ fontSize: 12 }}>{pct}%</span>
                </div>
                <ProgressBar value={pct} height={6} />
                <button onClick={() => go({ screen: "workspace", ideaId: idea.id, tab: "files", fileId: prdFile?.id })} className="btn btn-secondary btn-sm" style={{ width: "100%", marginTop: 12 }}>Open the brief</button>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>);

}

// ---- chat switcher (jump between chats / start new — without leaving) ----
function ChatSwitcher({ idea, chat, go, onNewChat }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 8, border: "none", background: "none", padding: "4px 8px", borderRadius: 8, fontWeight: 600, fontSize: 14.5 }}>
        <Icons.chat size={15} style={{ color: "var(--text-secondary)" }} /> {chat.title} <Icons.chevD size={14} style={{ color: "var(--text-muted)" }} />
      </button>
      {open && <>
        <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
        <div className="card" style={{ position: "absolute", left: 0, top: 40, width: 260, padding: 7, zIndex: 41, boxShadow: "var(--shadow-modal)" }}>
          <div className="faint" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", padding: "6px 10px 8px" }}>Chats · {idea.chats.length}</div>
          {idea.chats.map((c) =>
          <button key={c.id} onClick={() => {setOpen(false);go({ screen: "workspace", ideaId: idea.id, tab: "overview", chatId: c.id });}} className="acct-item" style={{ background: c.id === chat.id ? "var(--surface)" : "transparent" }}>
              <Icons.chat size={15} style={{ color: "var(--text-muted)" }} /><span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</span>{c.id === chat.id && <Icons.check size={14} style={{ color: "var(--accent-text)" }} />}
            </button>
          )}
          <div style={{ height: 1, background: "var(--border)", margin: "5px 0" }} />
          <button onClick={() => {setOpen(false);onNewChat(idea.id);}} className="acct-item" style={{ color: "var(--accent-text)", fontWeight: 600 }}><Icons.plus size={15} /> New chat</button>
        </div>
      </>}
    </div>);

}

// ---- Chat view: focused chat (no clutter); brief lives in Files now ----
function ChatView({ idea, chat, go, onSend, onNewChat }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ padding: "10px 28px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => go({ screen: "workspace", ideaId: idea.id, tab: "overview" })} className="iconbtn" title="All chats"><Icons.back size={17} /></button>
        <ChatSwitcher idea={idea} chat={chat} go={go} onNewChat={onNewChat} />
        <div style={{ flex: 1 }} />
        <Btn size="sm" variant="secondary" onClick={() => onNewChat(idea.id)}><Icons.plus size={14} /> New chat</Btn>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", padding: "18px 22px" }}>
        <div style={{ flex: 1, minHeight: 0, width: "100%", maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column" }}>
          <ChatPanel idea={idea} thread={chat.thread} onSend={onSend} />
        </div>
      </div>
    </div>);

}

function IdeaHub({ idea, route, go, onSend, onNewChat, onVisibility, mutate, chrome, feedback, contacts, contactsUnlocked, onUnlockContacts, onRefineMemory }) {
  const tab = route.tab || "overview";
  const [toast, setToast] = useState(null);
  const [building, setBuilding] = useState(false);
  const showToast = (t) => {setToast(t);setTimeout(() => setToast(null), 3200);};

  const chat = route.chatId ? idea.chats.find((c) => c.id === route.chatId) : null;

  let body;
  if (chat) {
    body = <ChatView idea={idea} chat={chat} go={go} onSend={(t, d) => onSend(idea.id, chat.id, t, d)} onNewChat={onNewChat} />;
  } else if (tab === "memory") {
    body = <MemoryView idea={idea} go={go} onRefine={onRefineMemory} activity={idea.activity} />;
  } else if (tab === "files") {
    body = <FilesView idea={idea} route={route} go={go} onBuild={() => setBuilding(true)} mutate={mutate} onToast={showToast} />;
  } else if (tab === "community") {
    body = <CommunityView idea={idea} route={route} go={go} feedback={feedback} contacts={contacts} unlocked={contactsUnlocked} onUnlock={onUnlockContacts} />;
  } else if (tab === "public") {
    body = <PublicManage idea={idea} go={go} onVisibility={onVisibility} onToast={showToast} mutate={mutate} />;
  } else {
    body = <Overview idea={idea} go={go} onNewChat={onNewChat} mutate={mutate} feedback={feedback} />;
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <HubHeader idea={idea} tab={tab} go={go} onVisibility={onVisibility} onToast={showToast} chrome={chrome} />
      <div style={{ flex: 1, minHeight: 0 }}>{body}</div>
      {toast && <div className="toast"><Icons.check size={16} style={{ color: "var(--success-text)" }} /> {toast}</div>}
      {building && <BuildDrawer idea={idea} onClose={() => setBuilding(false)} />}
    </div>);

}

Object.assign(window, { IdeaHub });