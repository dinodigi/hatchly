// ===== Idea sub-tabs: editable Memory · Page editor · Kanban w/ tasks · Public-page builder =====

const FEED_OPTS = ["Problem", "Who it's for", "Core value", "Features", "Open questions"];

// ---------- small editable primitives ----------
function EditableText({ value, placeholder, onSave, className = "", style, big }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value || "");
  useEffect(() => setV(value || ""), [value]);
  if (editing) return (
    <textarea autoFocus value={v} onChange={(e) => setV(e.target.value)}
    onBlur={() => {setEditing(false);onSave(v.trim());}}
    onKeyDown={(e) => {if (e.key === "Enter" && !e.shiftKey) {e.preventDefault();e.target.blur();}if (e.key === "Escape") {setV(value || "");setEditing(false);}}}
    rows={big ? 2 : 1} className={"edit-area " + className}
    style={{ width: "100%", fontSize: big ? 15.5 : 14.5, lineHeight: 1.6, ...style }} />);

  return (
    <div onClick={() => setEditing(true)} className={"editable " + className} style={{ fontSize: big ? 15.5 : 14.5, lineHeight: 1.6, ...style }}>
      {value ? value : <span className="faint" style={{ fontStyle: "italic" }}>{placeholder}</span>}
      <Icons.edit size={12} className="edit-hint" />
    </div>);

}

// ---------- Memory ----------
const memIcon = (src) => src === "voice" ? Icons.voice : src === "link" ? Icons.link : src === "manual" ? Icons.user : Icons.chat;

function MemoryCard({ m, active, onOpen }) {
  const I = memIcon(m.src);
  return (
    <Card hover onClick={onOpen} style={{ padding: 16, display: "flex", flexDirection: "column", gap: 11, border: active ? "1px solid var(--accent)" : "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <StatusDot color="var(--accent)" size={8} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, lineHeight: 1.5, fontWeight: 500 }}>{m.content}</div>
          {m.feeds && <span className="pill pill-accent" style={{ fontSize: 10.5, marginTop: 8 }}><Icons.doc size={11} /> feeds · {m.feeds}</span>}
        </div>
        <Icons.chevR size={15} style={{ color: "var(--text-muted)", flex: "none", marginTop: 2 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
        <I size={12} /> {m.srcLabel}
      </div>
    </Card>);

}

// side panel for a single memory — read-only; changes happen through chat
function MemoryPanel({ m, idea, go, onClose, onRefine }) {
  const manual = m.src === "manual";
  const I = memIcon(m.src);
  const fromChat = idea.chats?.find((c) => c.title === m.chatTitle);
  return <>
    <Scrim onClose={onClose} />
    <div className="drawer" style={{ width: 460 }}>
      <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icons.brain size={16} /></span>
        <span style={{ fontWeight: 600, fontSize: 15, flex: 1 }}>Memory</span>
        <IconBtn onClick={onClose}><Icons.x size={18} /></IconBtn>
      </div>
      <div className="scrollarea" style={{ flex: 1, padding: "22px 24px" }}>
        <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>The memory</div>
        <div style={{ fontSize: 16, lineHeight: 1.55, fontWeight: 500 }}>{m.content}</div>
        {m.feeds && <span className="pill pill-accent" style={{ fontSize: 11, marginTop: 12 }}><Icons.doc size={12} /> feeds · {m.feeds}</span>}

        <div style={{ height: 1, background: "var(--border)", margin: "20px 0" }} />

        <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Where it came from</div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--surface)", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", border: "1px solid var(--border)" }}><I size={15} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>{m.srcLabel}</div>
            <div className="faint" style={{ fontSize: 12 }}>{manual ? "Added by you" : "Auto-captured from chat"}</div>
          </div>
          {fromChat && <button onClick={() => go({ screen: "workspace", ideaId: idea.id, tab: "overview", chatId: fromChat.id })} className="btn btn-ghost btn-sm"><Icons.chat size={14} /> Open source chat</button>}
        </div>
        <div style={{ padding: "13px 15px", background: "var(--surface)", borderRadius: 10, borderLeft: "2px solid var(--accent)" }}>
          <div className="faint mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{manual ? "Note" : "What you said"}</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)", fontStyle: "italic" }}>“{m.input}”</div>
        </div>
      </div>
      <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)" }}>
        <Btn style={{ width: "100%" }} onClick={() => onRefine(m)}><Icons.chat size={16} /> Refine this in chat</Btn>
        <p className="faint" style={{ fontSize: 11.5, textAlign: "center", margin: "10px 0 0" }}>Memory is shaped by the conversation — talk to change it.</p>
      </div>
    </div>
  </>;
}

function MemoryView({ idea, go, onRefine, activity }) {
  const [selId, setSelId] = useState(null);
  const [tab, setTab] = useState("memory");
  const sel = idea.memories.find((m) => m.id === selId);
  const acts = activity || [];
  return (
    <div className="scrollarea" style={{ height: "100%" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 28px 80px" }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 24, margin: "0 0 6px", letterSpacing: "-0.01em" }}>Memory &amp; activity</h2>
          <p className="muted" style={{ fontSize: 14.5, margin: 0, maxWidth: 560 }}>What the idea knows, and how it got here. Memory is the pieces of your brief; activity is the trail — including where you changed your mind.</p>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 22, borderBottom: "1px solid var(--border)" }}>
          {[["memory", "Memory", idea.memories.length], ["activity", "Activity", acts.length]].map(([k, l, n]) =>
          <button key={k} onClick={() => setTab(k)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 4px", marginRight: 18, border: "none", background: "none", fontSize: 14, fontWeight: 500,
            color: tab === k ? "var(--text-primary)" : "var(--text-secondary)", borderBottom: tab === k ? "2px solid var(--accent)" : "2px solid transparent", marginBottom: -1, borderRadius: 0 }}>
              {l} <span className="faint mono" style={{ fontSize: 12 }}>{n}</span>
            </button>
          )}
        </div>

        {tab === "memory" ? <>
          <div className="mem-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 14 }}>
            {idea.memories.map((m) => <MemoryCard key={m.id} m={m} active={m.id === selId} onOpen={() => setSelId(m.id)} />)}
          </div>
          {idea.memories.length === 0 && <Empty icon={Icons.brain} title="No memory yet" body="Start a chat — Hatchly captures the meaningful pieces as you talk, and they build your brief." action={<Btn onClick={() => go({ screen: "workspace", ideaId: idea.id, tab: "overview" })}>Start a chat</Btn>} />}
        </> :
        <ActivityTimeline acts={acts} />
        }
      </div>
      {sel && <MemoryPanel m={sel} idea={idea} go={go} onClose={() => setSelId(null)} onRefine={(mem) => {setSelId(null);onRefine(mem);}} />}
    </div>);

}

// change log / activity timeline
const ACT_META = {
  chat: { I: Icons.chat, color: "var(--text-secondary)", bg: "var(--surface)" },
  memory: { I: Icons.brain, color: "var(--accent-text)", bg: "var(--accent-soft)" },
  change: { I: Icons.edit, color: "var(--info-text)", bg: "var(--info-soft)" },
  artifact: { I: Icons.doc, color: "var(--accent-text)", bg: "var(--accent-soft)" },
  publish: { I: Icons.globe, color: "var(--success-text)", bg: "var(--success-soft)" }
};
function ActivityTimeline({ acts }) {
  if (!acts.length) return <Empty icon={Icons.clock} title="No activity yet" body="As you chat, publish, and change your mind, the trail shows up here." />;
  return (
    <div style={{ position: "relative", paddingLeft: 6 }}>
      <div style={{ position: "absolute", left: 20, top: 8, bottom: 8, width: 1.5, background: "var(--border)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {acts.map((a) => {
          const m = ACT_META[a.type] || ACT_META.change;
          return (
            <div key={a.id} style={{ display: "flex", gap: 14, position: "relative", padding: "10px 0" }}>
              <span style={{ width: 30, height: 30, borderRadius: 999, background: m.bg, color: m.color, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", border: "2px solid var(--background)", zIndex: 1 }}><m.I size={14} /></span>
              <div style={{ flex: 1, paddingTop: 2 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{a.text}</span>
                  <span className="faint" style={{ fontSize: 11.5, marginLeft: "auto", flex: "none" }}>{a.at}</span>
                </div>
                {a.type === "change" && (a.from || a.to) &&
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    <span className="change-chip old">{a.from || "—"}</span>
                    <Icons.arrowR size={13} style={{ color: "var(--text-muted)" }} />
                    <span className="change-chip new">{a.to || "—"}</span>
                  </div>
                }
                {a.note && <div className="faint" style={{ fontSize: 12.5, marginTop: 6, fontStyle: "italic" }}>{a.note}</div>}
              </div>
            </div>);

        })}
      </div>
    </div>);

}

// ---------- Artifacts list + library picker ----------
function ArtifactPicker({ existing, onPick, onClose }) {
  return <>
    <Scrim onClose={onClose} />
    <div className="modal" style={{ width: 560, maxHeight: "82vh" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icons.sparkle size={17} /></span>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 16 }}>Generate an artifact</div><div className="faint" style={{ fontSize: 12.5 }}>The AI drafts each one from your idea to help you think it through.</div></div>
        <IconBtn onClick={onClose}><Icons.x size={18} /></IconBtn>
      </div>
      <div className="scrollarea" style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {ARTIFACT_TYPES.map((t) => {
          const have = existing.includes(t.key);
          return (
            <button key={t.key} disabled={have} onClick={() => onPick(t)} className="artifact-opt" style={{ opacity: have ? 0.5 : 1 }}>
              <span className="file-glyph glyph-page" style={{ width: 34, height: 34, flex: "none" }}><Icons.doc size={16} /></span>
              <div style={{ textAlign: "left", minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}>{t.title} {have && <Icons.check size={13} style={{ color: "var(--success-text)" }} />}</div>
                <div className="faint" style={{ fontSize: 11.5, lineHeight: 1.4 }}>{t.desc}</div>
              </div>
            </button>);

        })}
        </div>
      </div>
    </div>
  </>;
}

function FilesList({ idea, go, mutate }) {
  const [picking, setPicking] = useState(false);
  const existing = idea.files.map((f) => f.source === "prd" ? "brief" : f.artifactKey || f.title);
  const addArtifact = (t) => {
    const id = idea.id + "_a" + Date.now();
    const file = { id, type: "page", artifactKey: t.key, title: t.title, subtitle: "Drafted by the agent", updated: "just now",
      body: t.sections.map((s) => ({ h: s, p: "" })) };
    mutate((i) => ({ ...i, files: [...i.files, file], activity: [{ id: "ac" + Date.now(), type: "artifact", text: "Agent drafted '" + t.title + "'", at: "just now" }, ...(i.activity || [])] }));
    setPicking(false);
    go({ screen: "workspace", ideaId: idea.id, tab: "files", fileId: id });
  };
  return (
    <div className="scrollarea" style={{ height: "100%" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 28px 80px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <h2 style={{ fontSize: 24, margin: "0 0 6px", letterSpacing: "-0.01em" }}>Artifacts</h2>
            <p className="muted" style={{ fontSize: 14.5, margin: 0, maxWidth: 560 }}>AI-generated documents that help you understand your idea — the brief, scope, positioning, and more. The AI drafts them from your conversation.</p>
          </div>
          <Btn variant="secondary" size="sm" onClick={() => setPicking(true)}><Icons.sparkle size={15} /> Generate artifact</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
          {idea.files.map((f) =>
          <Card key={f.id} hover onClick={() => go({ screen: "workspace", ideaId: idea.id, tab: "files", fileId: f.id })} style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span className="file-glyph glyph-page" style={{ width: 38, height: 38 }}><Icons.doc size={18} /></span>
                <span className="pill" style={{ fontSize: 10.5 }}>Artifact</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{f.title}</div>
              <div className="faint" style={{ fontSize: 12.5 }}>{f.subtitle} · {f.updated}</div>
            </Card>
          )}
          <button onClick={() => setPicking(true)} className="card" style={{ padding: 18, borderStyle: "dashed", display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, background: "transparent", textAlign: "left" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 600, fontSize: 13.5, color: "var(--text-secondary)" }}><Icons.sparkle size={15} style={{ color: "var(--accent-text)" }} /> Generate an artifact</span>
            <p className="faint" style={{ fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>Pick from the library — scope, pricing, positioning, landing copy and more.</p>
          </button>
        </div>
      </div>
      {picking && <ArtifactPicker existing={existing} onPick={addArtifact} onClose={() => setPicking(false)} />}
    </div>);

}

// ---------- Page editor (the PRD as an editable doc) ----------
function PageDoc({ idea, go, onBuild, mutate }) {
  const prd = idea.prd || {};
  const ready = prdComplete(prd);const pct = prdProgress(prd);
  const setText = (key, val) => mutate((i) => ({ ...i, prd: { ...i.prd, [key]: val } }));
  const setItem = (key, idx, val) => mutate((i) => {const arr = [...(i.prd[key] || [])];if (!val.trim()) arr.splice(idx, 1);else arr[idx] = val;return { ...i, prd: { ...i.prd, [key]: arr } };});
  const addItem = (key) => mutate((i) => ({ ...i, prd: { ...i.prd, [key]: [...(i.prd[key] || []), "New item"] } }));
  return (
    <div className="scrollarea" style={{ height: "100%" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 28px 90px" }}>
        <button onClick={() => go({ screen: "workspace", ideaId: idea.id, tab: "files" })} style={{ border: "none", background: "none", color: "var(--text-secondary)", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 20, padding: 0 }}><Icons.back size={15} /> Files</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span className="file-glyph glyph-page" style={{ width: 40, height: 40 }}><Icons.doc size={19} /></span>
          <div>
            <h1 className="serif" style={{ fontSize: 34, margin: 0, fontStyle: "italic" }}>Product brief</h1>
            <div className="faint" style={{ fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}><Icons.sparkle size={12} style={{ color: "var(--accent-text)" }} /> Written by the agent · you can edit any section · {pct}%</div>
          </div>
        </div>
        <div style={{ margin: "18px 0 26px" }}><ProgressBar value={pct} height={6} /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {PRD_SECTIONS.map((sec) =>
          <div key={sec.key}>
              <SectionLabel style={{ marginBottom: 9 }}>{sec.label}</SectionLabel>
              {sec.list ?
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                  {(prd[sec.key] || []).map((it, i) =>
              <li key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                      <span style={{ color: sec.key === "open" ? "var(--info-text)" : "var(--accent-text)", flex: "none", marginTop: 5 }}>{sec.key === "open" ? <Icons.search size={15} /> : <Icons.check size={15} />}</span>
                      <div style={{ flex: 1 }}><EditableText value={it} placeholder="Empty" onSave={(v) => setItem(sec.key, i, v)} big /></div>
                    </li>
              )}
                  {!(prd[sec.key] || []).length && <li className="faint" style={{ fontSize: 15, fontStyle: "italic" }}>Not captured yet — keep chatting, or add one.</li>}
                  <li><button onClick={() => addItem(sec.key)} className="add-line"><Icons.plus size={13} /> Add {sec.key === "open" ? "question" : "feature"}</button></li>
                </ul> :

            <EditableText value={prd[sec.key]} placeholder="Not captured yet — keep chatting, or write it here." onSave={(v) => setText(sec.key, v)} big />
            }
            </div>
          )}
        </div>
        <div style={{ marginTop: 34, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {ready ?
          <><Btn size="lg" onClick={onBuild}><Icons.rocket size={17} /> I'm ready — build my project</Btn><span className="faint" style={{ fontSize: 12.5 }}>Brief's complete. Next: MVP → plan → build prompt.</span></> :
          <><button disabled className="btn btn-secondary btn-lg"><Icons.lock size={16} /> Complete the brief to build</button><span className="faint" style={{ fontSize: 12.5 }}>Needs a problem, an audience, a core value, and one feature.</span></>}
        </div>
      </div>
    </div>);

}

// ---------- generic content page (agent-written or user-created; editable) ----------
function ContentPage({ idea, file, go, mutate }) {
  const setFile = (patch) => mutate((i) => ({ ...i, files: i.files.map((f) => f.id === file.id ? { ...f, ...patch, updated: "just now" } : f) }));
  const setSection = (idx, patch) => setFile({ body: file.body.map((b, j) => j === idx ? { ...b, ...patch } : b) });
  const addSection = () => setFile({ body: [...(file.body || []), { h: "New section", p: "" }] });
  const delSection = (idx) => setFile({ body: file.body.filter((_, j) => j !== idx) });
  return (
    <div className="scrollarea" style={{ height: "100%" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 28px 90px" }}>
        <button onClick={() => go({ screen: "workspace", ideaId: idea.id, tab: "files" })} style={{ border: "none", background: "none", color: "var(--text-secondary)", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 20, padding: 0 }}><Icons.back size={15} /> Files</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <span className="file-glyph glyph-page" style={{ width: 40, height: 40, flex: "none" }}><Icons.doc size={19} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <EditableText value={file.title} placeholder="Untitled artifact" onSave={(v) => setFile({ title: v || "Untitled artifact" })} big className="serif" style={{ fontSize: 34, fontStyle: "italic", lineHeight: 1.1 }} />
            <div className="faint" style={{ fontSize: 12.5, display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}><Icons.sparkle size={12} style={{ color: "var(--accent-text)" }} /> {file.custom ? "Created by you" : file.subtitle} · you can edit any section</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {(file.body || []).map((b, i) =>
          <div key={i} className="artifact-section">
              {b.list ?
            <>
                  {b.lh && <SectionLabel style={{ marginBottom: 10 }}>{b.lh}</SectionLabel>}
                  <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                    {b.list.map((it, j) => <li key={j} style={{ display: "flex", gap: 11, fontSize: 15.5, lineHeight: 1.55 }}><span style={{ color: "var(--accent-text)", flex: "none", marginTop: 1 }}><Icons.check size={16} /></span><span>{it}</span></li>)}
                  </ul>
                </> :
            <>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <EditableText value={b.h} placeholder="Section heading" onSave={(v) => setSection(i, { h: v })} big style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.01em" }} />
                      <div style={{ marginTop: 6 }}><EditableText value={b.p} placeholder="Write here, or ask the chat to fill it…" onSave={(v) => setSection(i, { p: v })} big style={{ color: "var(--text-secondary)", lineHeight: 1.65 }} /></div>
                    </div>
                    <button onClick={() => delSection(i)} className="iconbtn section-del" style={{ width: 28, height: 28, flex: "none" }}><Icons.trash size={14} /></button>
                  </div>
                </>}
            </div>
          )}
          <button onClick={addSection} className="add-line"><Icons.plus size={13} /> Add section</button>
        </div>
      </div>
    </div>);

}

// ---------- Feedback tab ----------
// ---------- Community: Feedback + Contact list grouped ----------
function CommunityView({ idea, route, go, feedback, contacts, unlocked, onUnlock }) {
  const [sub, setSub] = useState(route.sub || "feedback");
  return (
    <div className="scrollarea" style={{ height: "100%" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 28px 80px" }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 24, margin: "0 0 6px", letterSpacing: "-0.01em" }}>Community</h2>
          <p className="muted" style={{ fontSize: 14.5, margin: 0, maxWidth: 560 }}>Everything the public gives back — feedback on your idea, and the people waiting to hear when it launches.</p>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 22, borderBottom: "1px solid var(--border)" }}>
          {[["feedback", "Feedback", (feedback || []).length], ["contacts", "Contact list", (contacts || []).length]].map(([k, l, n]) =>
          <button key={k} onClick={() => setSub(k)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 4px", marginRight: 18, border: "none", background: "none", fontSize: 14, fontWeight: 500,
            color: sub === k ? "var(--text-primary)" : "var(--text-secondary)", borderBottom: sub === k ? "2px solid var(--accent)" : "2px solid transparent", marginBottom: -1, borderRadius: 0 }}>
            {l} <span className="faint mono" style={{ fontSize: 12 }}>{n}</span>
          </button>
          )}
        </div>
        {sub === "feedback" ?
        <FeedbackView idea={idea} feedback={feedback} embedded /> :
        <ContactsView idea={idea} contacts={contacts} unlocked={unlocked} onUnlock={onUnlock} embedded />}
      </div>
    </div>);

}

// ---------- Feedback tab ----------
function FeedbackView({ idea, feedback, embedded }) {
  const list = feedback || [];
  const inner =
    idea.visibility !== "public" ?
    <Empty icon={Icons.chat} title="Publish to collect feedback" body="Feedback comes from your public page. Make this idea public and notes will land here." /> :
    list.length ?
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map((f) =>
      <Card key={f.id} style={{ padding: "16px 18px", display: "flex", gap: 13 }}>
            <Avatar label={f.avatar} kind="user" size={36} color={f.color} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</span>
                {f.you && <span className="badge b-idea" style={{ fontSize: 9 }}>You</span>}
                <span className="faint" style={{ fontSize: 12 }}>· {f.at}</span>
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0, color: "var(--text-secondary)" }}>{f.text}</p>
            </div>
          </Card>
      )}
      </div> :
    <Empty icon={Icons.chat} title="No feedback yet" body="When people leave notes on your public page, they'll appear here." />;
  if (embedded) return inner;
  return (
    <div className="scrollarea" style={{ height: "100%" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 28px 80px" }}>
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 24, margin: "0 0 6px", letterSpacing: "-0.01em" }}>Feedback</h2>
          <p className="muted" style={{ fontSize: 14.5, margin: 0, maxWidth: 560 }}>What people left for you on the public page.</p>
        </div>
        {inner}
      </div>
    </div>);

}

// ---------- Contact list tab (notify-list, unlockable with a fee) ----------
function ContactsView({ idea, contacts, unlocked, onUnlock, embedded }) {
  const list = contacts || [];
  const n = list.length;
  if (idea.visibility !== "public") {
    const empty = <Empty icon={Icons.users} title="Publish to grow a list" body="When your idea is public, anyone can ask to be notified at launch. They'll collect here." />;
    if (embedded) return empty;
    return (
      <div className="scrollarea" style={{ height: "100%" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 28px 80px" }}>{empty}</div>
      </div>);

  }
  const inner = <>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16, gap: 16 }}>
        <p className="muted" style={{ fontSize: 13.5, margin: 0, maxWidth: 520 }}>{n} {n === 1 ? "person" : "people"} asked to be notified when {idea.name} launches. Your warmest leads.</p>
        {unlocked && <span className="badge b-launch" style={{ fontSize: 9.5 }}><Icons.check size={11} /> Unlocked</span>}
      </div>
      <Card style={{ padding: 0, overflow: "hidden", position: "relative" }}>
        {list.map((c, i) =>
        <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 20px", borderBottom: i < n - 1 ? "1px solid var(--border)" : "none", filter: unlocked ? "none" : "blur(5px)", userSelect: unlocked ? "auto" : "none" }}>
            <Avatar label={unlocked ? c.avatar : "•"} kind="user" size={36} color={c.color} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{unlocked ? c.name : "Someone interested"}</div>
              <div className="faint" style={{ fontSize: 12.5 }}>{unlocked ? "@" + c.handle : "hidden"} · joined {c.at}</div>
            </div>
            {c.note && <span className="pill" style={{ fontSize: 11 }}>{unlocked ? c.note : "note hidden"}</span>}
          </div>
        )}
        {!unlocked &&
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "color-mix(in srgb, var(--background) 55%, transparent)" }}>
            <Card style={{ width: 340, padding: 24, textAlign: "center", boxShadow: "var(--shadow-modal)" }}>
              <span style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent-soft)", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Icons.lock size={22} /></span>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Unlock your contact list</div>
              <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, margin: "0 auto 18px", maxWidth: 260 }}>See the {n} people who want to hear when {idea.name} launches — names, handles, and their notes.</p>
              <Btn size="lg" style={{ width: "100%" }} onClick={onUnlock}><Coin size={17} /> Unlock for {CONTACTS_FEE} bucks</Btn>
              <p className="faint" style={{ fontSize: 11.5, margin: "12px 0 0" }}>One-time. Future sign-ups stay unlocked.</p>
            </Card>
          </div>
        }
      </Card>
      {unlocked &&
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Btn variant="secondary"><Icons.send size={15} /> Email the list</Btn>
          <Btn variant="ghost"><Icons.copy size={15} /> Export CSV</Btn>
        </div>
      }
    </>;
  if (embedded) return inner;
  return (
    <div className="scrollarea" style={{ height: "100%" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 28px 80px" }}>
        <h2 style={{ fontSize: 24, margin: "0 0 16px", letterSpacing: "-0.01em" }}>Contact list</h2>
        {inner}
      </div>
    </div>);

}

function FilesView({ idea, route, go, onBuild, mutate }) {
  const file = route.fileId ? idea.files.find((f) => f.id === route.fileId) : null;
  if (!file) return <FilesList idea={idea} go={go} mutate={mutate} />;
  if (file.source === "prd") return <PageDoc idea={idea} go={go} onBuild={onBuild} mutate={mutate} />;
  return <ContentPage idea={idea} file={file} go={go} mutate={mutate} />;
}

// ---------- cover ----------
function coverStyle(cover) {
  if (cover?.type === "image") return { backgroundImage: `url(${cover.url})`, backgroundSize: "cover", backgroundPosition: "center" };
  if (cover?.type === "tone" && COVERS[cover.key]) return { background: COVERS[cover.key].css };
  return { background: "var(--surface)" };
}

function CoverEditor({ cover, onChange }) {
  const fileRef = useRef(null);
  const onFile = (e) => {const f = e.target.files[0];if (!f) return;const r = new FileReader();r.onload = () => onChange({ type: "image", url: r.result });r.readAsDataURL(f);};
  return (
    <div className="cover-band" style={{ ...coverStyle(cover), position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: 14 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {Object.entries(COVERS).map(([k, v]) =>
          <button key={k} title={v.label} onClick={() => onChange({ type: "tone", key: k })} className="cover-swatch" style={{ background: v.css, outline: cover?.type === "tone" && cover.key === k ? "2px solid var(--text-primary)" : "none" }} />
          )}
        </div>
        <button onClick={() => fileRef.current?.click()} className="btn btn-secondary btn-sm"><Icons.plus size={14} /> Upload cover</button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
      </div>
    </div>);

}

// ---------- Public page builder ----------
function PublicManage({ idea, go, onVisibility, onToast, mutate }) {
  const pub = idea.visibility === "public";
  const streamIdea = idea.streamId ? STREAM_BY_ID[idea.streamId] : null;
  const prd = idea.prd || {};
  const [show, setShow] = useState({ problem: true, who: true, value: true, features: true });
  const [addingDoc, setAddingDoc] = useState(false);
  const toggle = (k) => setShow((s) => ({ ...s, [k]: !s[k] }));
  const shareUrl = "hatchly.com/i/" + idea.id;
  const docToggle = (fid) => mutate((i) => ({ ...i, publicDocs: i.publicDocs.includes(fid) ? i.publicDocs.filter((x) => x !== fid) : [...i.publicDocs, fid] }));
  const [copied, setCopied] = useState(false);

  return (
    <div className="scrollarea" style={{ height: "100%" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 28px 80px" }}>
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 24, margin: "0 0 6px", letterSpacing: "-0.01em" }}>Public page</h2>
          <p className="muted" style={{ fontSize: 14.5, margin: 0, maxWidth: 600 }}>Build the listing people see on the stream. Set a cover, link a live app if it's already built, and choose what to pull from your files.</p>
        </div>

        <div className="pub-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>
          {/* controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <CoverEditor cover={idea.cover} onChange={(c) => mutate((i) => ({ ...i, cover: c }))} />
              <div style={{ padding: 16 }}><SectionLabel>Cover</SectionLabel><p className="faint" style={{ fontSize: 12.5, margin: "6px 0 0" }}>Pick a wash or upload your own. Shows at the top of your public listing.</p></div>
            </Card>

            <Card style={{ padding: 20 }}>
              <SectionLabel style={{ marginBottom: 14 }}>Visibility</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(VIS).map(([k, v]) => {
                  const I = v.icon;const active = idea.visibility === k;
                  return (
                    <button key={k} onClick={() => {onVisibility(k);onToast(k === "public" ? "Published to the stream — now backable with bucks." : k === "link" ? "Link-only — shareable for feedback." : "Set to private.");}}
                    style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "12px 14px", borderRadius: 11, textAlign: "left",
                      border: "1px solid " + (active ? "var(--accent)" : "var(--border-strong)"), background: active ? "var(--accent-soft)" : "var(--surface-raised)" }}>
                      <I size={17} style={{ color: active ? "var(--accent-text)" : "var(--text-secondary)", flex: "none", marginTop: 1 }} />
                      <div><div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 7 }}>{v.label} {active && <Icons.check size={14} style={{ color: "var(--accent-text)" }} />}</div><div className="faint" style={{ fontSize: 12.5, lineHeight: 1.45 }}>{v.note}</div></div>
                    </button>);

                })}
              </div>
            </Card>

            <Card style={{ padding: 20 }}>
              <SectionLabel style={{ marginBottom: 10 }}>Idea details</SectionLabel>
              <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Description</div>
              <EditableText value={idea.description} placeholder="Describe the idea for the public page…" onSave={(v) => mutate((i) => ({ ...i, description: v }))} big />
              <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", margin: "18px 0 9px" }}>Tags</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {TAGS.map((t) => {
                  const on = (idea.tags || []).includes(t);
                  return <button key={t} onClick={() => mutate((i) => ({ ...i, tags: (i.tags || []).includes(t) ? i.tags.filter((x) => x !== t) : [...(i.tags || []), t] }))}
                  className="tag-pick" style={{ borderColor: on ? "var(--accent)" : "var(--border-strong)", background: on ? "var(--accent-soft)" : "var(--surface-raised)", color: on ? "var(--accent-text)" : "var(--text-secondary)" }}>{on && <Icons.check size={12} />} {t}</button>;
                })}
              </div>
            </Card>

            <Card style={{ padding: 20 }}>
              <SectionLabel style={{ marginBottom: 6 }}>Live app</SectionLabel>
              <p className="faint" style={{ fontSize: 12.5, margin: "0 0 12px" }}>Already built it? Link the live app so backers can try it.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border-strong)", borderRadius: 10, padding: "4px 4px 4px 12px" }}>
                <Icons.globe size={15} style={{ color: "var(--text-muted)", flex: "none" }} />
                <input value={idea.liveUrl} onChange={(e) => mutate((i) => ({ ...i, liveUrl: e.target.value }))} placeholder="https://your-app.com" style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 13.5 }} />
                {idea.liveUrl && <span className="badge b-launch" style={{ fontSize: 9.5 }}><LiveDot /> Live</span>}
              </div>
            </Card>

            <Card style={{ padding: 20 }}>
              <SectionLabel style={{ marginBottom: 6 }}>Artifacts on your page</SectionLabel>
              <p className="faint" style={{ fontSize: 12.5, margin: "0 0 14px" }}>Choose which artifacts to feature on the public listing. Add only the ones that tell the story.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {idea.publicDocs.map((fid) => {
                  const f = idea.files.find((x) => x.id === fid);if (!f) return null;
                  return (
                    <div key={fid} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface-raised)" }}>
                      <span className="file-glyph glyph-page" style={{ width: 30, height: 30 }}><Icons.doc size={14} /></span>
                      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 500, fontSize: 13.5 }}>{f.title}</div><div className="faint" style={{ fontSize: 11.5 }}>Artifact</div></div>
                      <IconBtn onClick={() => docToggle(f.id)} title="Remove"><Icons.x size={16} /></IconBtn>
                    </div>);

                })}
                {idea.publicDocs.length === 0 && <div className="faint" style={{ fontSize: 12.5, padding: "4px 2px 8px" }}>No artifacts on the page yet.</div>}
                {idea.files.some((f) => !idea.publicDocs.includes(f.id)) &&
                <div style={{ position: "relative" }}>
                    <button onClick={() => setAddingDoc((a) => !a)} className="add-line" style={{ padding: "6px 2px" }}><Icons.plus size={14} /> Add an artifact</button>
                    {addingDoc && <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setAddingDoc(false)} />
                      <div className="card" style={{ position: "absolute", left: 0, top: 32, width: 280, padding: 7, zIndex: 41, boxShadow: "var(--shadow-modal)" }}>
                        {idea.files.filter((f) => !idea.publicDocs.includes(f.id)).map((f) =>
                      <button key={f.id} onClick={() => {docToggle(f.id);setAddingDoc(false);}} className="acct-item">
                            <span className="file-glyph glyph-page" style={{ width: 26, height: 26, flex: "none" }}><Icons.doc size={13} /></span>
                            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.title}</span>
                          </button>
                      )}
                      </div>
                    </>}
                  </div>
                }
              </div>
            </Card>
          </div>

          {/* live preview */}
          <div style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <SectionLabel>Listing preview</SectionLabel>
              <button onClick={() => {setCopied(true);setTimeout(() => setCopied(false), 1600);}} className="link-btn" style={{ display: "flex", alignItems: "center", gap: 5 }}>{copied ? <><Icons.check size={13} /> copied</> : <><Icons.copy size={13} /> {shareUrl}</>}</button>
            </div>
            <div className="card" style={{ padding: 0, overflow: "hidden", opacity: pub ? 1 : 0.6 }}>
              <div className="cover-band cover-sm" style={coverStyle(idea.cover)} />
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{idea.name}</span>
                  {pub && <span className="badge b-launch" style={{ fontSize: 9.5 }}>On the stream</span>}
                </div>
                <p className="muted" style={{ fontSize: 13.5, margin: "0 0 10px", lineHeight: 1.45 }}>{idea.one_liner}</p>
                {(idea.tags || []).length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>{idea.tags.slice(0, 4).map((t) => <span key={t} className="tag-pill">{t}</span>)}</div>}
                {idea.liveUrl && <a className="btn btn-secondary btn-sm" style={{ width: "100%", marginBottom: 12 }}><Icons.ext size={14} /> Visit live app</a>}
                {show.problem && prd.problem && <div style={{ marginBottom: 10 }}><div className="faint mono" style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Problem</div><div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--text-secondary)" }}>{prd.problem}</div></div>}
                {idea.publicDocs.length > 0 &&
                <div style={{ marginBottom: 12 }}>
                    <div className="faint mono" style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Resources</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {idea.publicDocs.map((fid) => {const f = idea.files.find((x) => x.id === fid);if (!f) return null;return (
                        <div key={fid} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 9px", border: "1px solid var(--border)", borderRadius: 8 }}>
                          <span className="file-glyph glyph-page" style={{ width: 24, height: 24 }}><Icons.doc size={12} /></span>
                          <span style={{ fontSize: 12.5, fontWeight: 500 }}>{f.title}</span>
                        </div>);
                    })}
                    </div>
                  </div>
                }
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                  <Bucks amount={streamIdea ? streamIdea.bucks : 0} size={16} fontSize={14} style={{ color: "var(--accent-text)" }} />
                  <span className="faint" style={{ fontSize: 12 }}>{streamIdea ? streamIdea.backers : 0} backers</span>
                </div>
              </div>
            </div>
            {pub ?
            <Btn variant="secondary" onClick={() => streamIdea ? go({ screen: "idea", ideaId: idea.streamId }) : onToast("Not linked to a stream entry in this demo.")}><Icons.ext size={15} /> View public page</Btn> :

            <Card style={{ padding: 16, textAlign: "center" }}>
                <p className="muted" style={{ fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>Not public yet. Publish to make it discoverable and backable.</p>
                <Btn onClick={() => {onVisibility("public");onToast("Published to the stream — now backable with bucks.");}} style={{ width: "100%" }}><Icons.globe size={16} /> Publish to the stream</Btn>
              </Card>
            }
          </div>
        </div>
      </div>
    </div>);

}

Object.assign(window, { MemoryView, FilesView, PublicManage, coverStyle, FeedbackView, ContactsView, CommunityView });