import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import ArtifactActions from "@/components/ArtifactActions";
import ArtifactPicker from "@/components/ArtifactPicker";
import ChatPanel from "@/components/ChatPanel";
import CoverEditor from "@/components/CoverEditor";
import DeckCollapse from "@/components/DeckCollapse";
import RailSection from "@/components/RailSection";
import GateChecklist, { GATE_HELP } from "@/components/GateChecklist";
import NewIdeaButton from "@/components/NewIdeaButton";
import SignalMap from "@/components/SignalMap";
import SignalPanel from "@/components/SignalPanel";
import VisibilityMenu from "@/components/VisibilityMenu";
import WalletChip from "@/components/WalletChip";
import { Icons } from "@/components/icons";
import { Card, Pill, SectionLabel, StageBadge, Bucks, Empty } from "@/components/ui";
import { briefGate, topicCounts, type Brief } from "@/lib/agent";
import { clerkEnabled } from "@/lib/clerk";
import { callTool } from "@/lib/mcp";

/* The idea hub — v4's IdeaHub, markup ported from Design/app/hub.jsx.
   Tabs via ?tab= · chat view via ?chat= · sub-tabs via ?sub= */

interface Entry<T> {
  id: string;
  data: T;
}
interface IdeaData {
  owner_id: string;
  name: string;
  one_liner?: string;
  description?: string;
  stage: string;
  visibility: string;
  brief?: Brief;
  cover_preset?: string;
  cover_image?: { id: string; url: string; contentType: string };
  live_url?: string;
}
interface ChatRow {
  id: string;
  data: { title: string; last_message_at?: string; template_key?: string };
}
interface MessageRow {
  id: string;
  data: { role: "user" | "assistant"; content: string; turn: number; tool_trace?: string[]; suggestions?: string[] };
}
interface MemoryRow {
  id: string;
  data: {
    content: string;
    verbatim?: string;
    feeds?: string;
    topic?: string;
    source_type?: string;
    source_label?: string;
    chat?: { id: string; label: string };
    intent_key?: string;
    kind?: string;
    entities?: string[];
  };
}
interface ActivityRow {
  id: string;
  data: { type: string; text: string; old_value?: string; new_value?: string; created_at?: string };
}
interface ArtifactSection {
  heading: string;
  paragraph?: string;
  list_heading?: string;
  list_items?: string[];
}
interface ArtifactRow {
  id: string;
  data: {
    type: string;
    title: string;
    subtitle?: string;
    is_brief?: boolean;
    on_public_page?: boolean;
    body?: ArtifactSection[];
  };
}
interface ListingRow {
  id: string;
  data: { status: string; bucks_total: number; distinct_backers: number };
}
interface FeedbackRow {
  id: string;
  data: { text: string; author?: { label: string }; created_at?: string };
}

const HUB_TABS = [
  { key: "overview", label: "Overview", icon: Icons.grid },
  { key: "chats", label: "Chats", icon: Icons.chat },
  { key: "memory", label: "Memory", icon: Icons.brain },
  { key: "artifacts", label: "Artifacts", icon: Icons.doc },
  { key: "community", label: "Community", icon: Icons.users },
  { key: "public", label: "Public page", icon: Icons.globe },
] as const;

const FEEDS_LABEL: Record<string, string> = {
  problem: "Problem",
  who: "Who it's for",
  value: "Core value",
  features: "Features",
  open_questions: "Open questions",
};

const COVER_CSS: Record<string, string> = {
  meadow: "linear-gradient(120deg, #E7EDE0, #CFE0CB 55%, #B8D0BE)",
  linen: "linear-gradient(120deg, #F3ECDF, #E7D9C3 60%, #DCC9AC)",
  dusk: "linear-gradient(120deg, #E3E0EC, #D2CCE0 55%, #BFC2DC)",
  gold: "linear-gradient(120deg, #F6E6C4, #EDCF8E 55%, #DCA032)",
  slate: "linear-gradient(120deg, #E4E6E7, #CDD2D4 55%, #B4BBBD)",
};

function ago(iso?: string) {
  if (!iso) return "";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export default async function IdeaHub({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; chat?: string; sub?: string; doc?: string }>;
}) {
  if (!clerkEnabled) redirect("/");
  const { userId } = await auth();
  if (!userId) redirect("/");
  const { id } = await params;
  const sp = await searchParams;
  const tab = HUB_TABS.some((t) => t.key === sp.tab) ? sp.tab! : "overview";
  const openDoc = tab === "artifacts" ? sp.doc : undefined;

  let idea: Entry<IdeaData>;
  try {
    idea = await callTool<Entry<IdeaData>>("get_entry", { collection: "ideas", id });
  } catch {
    notFound();
  }
  if (idea.data.owner_id !== userId) notFound();

  const [chats, memories, activity, artifacts, listings] = await Promise.all([
    callTool<{ entries: ChatRow[] }>("query_entries", {
      collection: "chats",
      where: [{ field: "idea", op: "eq", value: id }],
      select: ["title", "last_message_at", "template_key"],
      limit: 30,
    }),
    callTool<{ entries: MemoryRow[] }>("query_entries", {
      collection: "memories",
      where: [
        { field: "idea", op: "eq", value: id },
        { field: "superseded", op: "ne", value: true },
      ],
      select: ["content", "verbatim", "feeds", "topic", "source_type", "source_label", "chat", "intent_key", "kind", "entities"],
      limit: 200,
    }),
    callTool<{ entries: ActivityRow[] }>("query_entries", {
      collection: "activity",
      where: [{ field: "idea", op: "eq", value: id }],
      select: ["type", "text", "old_value", "new_value", "created_at"],
      orderBy: { field: "created_at", dir: "desc" },
      limit: 50,
    }),
    callTool<{ entries: ArtifactRow[] }>("query_entries", {
      collection: "artifacts",
      where: [{ field: "idea", op: "eq", value: id }],
      // No `body` here — the grid only needs headers, and bodies are large.
      select: ["type", "title", "subtitle", "is_brief", "on_public_page"],
      limit: 30,
    }),
    callTool<{ entries: ListingRow[] }>("query_entries", {
      collection: "listings",
      where: [{ field: "idea", op: "eq", value: id }],
      select: ["status", "bucks_total", "distinct_backers"],
      limit: 1,
    }),
  ]);

  const brief = idea.data.brief ?? {};
  const gate = briefGate(brief);
  const counts = topicCounts(memories.entries.map((m) => ({ topic: m.data.topic })));
  // The brief is live state shown separately; the panel lists the real generated docs.
  const generatedArtifacts = artifacts.entries.filter((a) => !a.data.is_brief && a.data.type !== "brief");
  const listing = listings.entries[0] ?? null;
  const isLive = listing?.data.status === "live";
  const chatList = [...chats.entries].sort((a, b) =>
    (b.data.last_message_at ?? "").localeCompare(a.data.last_message_at ?? ""),
  );
  const activeChat = sp.chat ? chatList.find((c) => c.id === sp.chat) ?? null : null;

  // Only the open document needs its body loaded.
  const doc =
    openDoc && openDoc !== "brief"
      ? await callTool<ArtifactRow>("get_entry", { collection: "artifacts", id: openDoc })
          .then((a) => (a.data.type && artifacts.entries.some((x) => x.id === a.id) ? a : null))
          .catch(() => null)
      : null;

  const messages = activeChat
    ? await callTool<{ entries: MessageRow[] }>("query_entries", {
        collection: "messages",
        where: [{ field: "chat", op: "eq", value: activeChat.id }],
        orderBy: { field: "turn", dir: "asc" },
        select: ["role", "content", "turn", "tool_trace", "suggestions"],
        limit: 200,
      })
    : { entries: [] as MessageRow[] };

  // A pre-made chat renders its template opening + curated questions until the
  // founder answers. Load it only for the open chat.
  interface QOpt { label: string; expands_to?: string }
  interface TplQuestion { text: string; options?: QOpt[]; allow_help?: boolean }
  let chatTemplate: { opening: string; initiation_prompt?: string; questions: { text: string; options: QOpt[]; allow_help?: boolean }[] } | undefined;
  if (activeChat?.data.template_key) {
    const tplRes = await callTool<{ entries: { data: { opening: string; questions?: string; initiation_prompt?: string } }[] }>("query_entries", {
      collection: "chat_templates",
      where: [{ field: "key", op: "eq", value: activeChat.data.template_key }],
      select: ["opening", "questions", "initiation_prompt"],
      limit: 1,
    }).catch(() => null);
    const t = tplRes?.entries[0]?.data;
    if (t) {
      let questions: { text: string; options: QOpt[]; allow_help?: boolean }[] = [];
      try {
        questions = (JSON.parse(t.questions || "[]") as TplQuestion[]).map((q) => ({
          text: q.text,
          options: q.options ?? [],
          allow_help: q.allow_help,
        }));
      } catch {
        questions = [];
      }
      chatTemplate = { opening: t.opening, initiation_prompt: t.initiation_prompt, questions };
    }
  }

  // Templates map — labels the deck cards, and links each empty brief line to the
  // chat that fills it. Loaded whenever the deck or the brief panel is on screen.
  const deckTemplates = new Map<string, { icon?: string; role?: string; produces?: string; feeds_brief?: string; subtitle?: string; question_arc?: string; order?: number }>();
  if (tab === "chats" || tab === "overview" || activeChat) {
    const all = await callTool<{ entries: { data: { key: string; icon?: string; role?: string; produces?: string; feeds_brief?: string; subtitle?: string; question_arc?: string; order?: number } }[] }>(
      "query_entries",
      { collection: "chat_templates", select: ["key", "icon", "role", "produces", "feeds_brief", "subtitle", "question_arc", "order"], limit: 50 },
    ).catch(() => null);
    for (const e of all?.entries ?? []) deckTemplates.set(e.data.key, e.data);
  }

  // Coverage — how many of a chat's REQUIRED arc intents already have a memory
  // node (answered in any chat). This is the progress signal that replaced the
  // build gate: honest counts, no invented percentage.
  // The conversations render in FIXED pitch order (template order), never
  // recency — the sequence is the product (Firas: hardlined and rigid).
  const orderedChats = [...chatList].sort(
    (a, b) =>
      (deckTemplates.get(a.data.template_key ?? "")?.order ?? 99) -
      (deckTemplates.get(b.data.template_key ?? "")?.order ?? 99),
  );

  const answeredIntents = new Set(memories.entries.map((m) => m.data.intent_key).filter(Boolean));
  const coverage = (tk?: string): { covered: number; total: number } | null => {
    const raw = tk ? deckTemplates.get(tk)?.question_arc : undefined;
    if (!raw) return null;
    try {
      const req = (JSON.parse(raw) as { key: string; required?: boolean }[]).filter((a) => a.required);
      if (!req.length) return null;
      return { covered: req.filter((a) => answeredIntents.has(a.key)).length, total: req.length };
    } catch {
      return null;
    }
  };
  // The card's explainer line — the template's own subtitle, so a founder knows
  // what each chat is for without opening it (Firas: don't rely on the title).
  const deckSub = (tk?: string) => {
    const t = tk ? deckTemplates.get(tk) : undefined;
    if (!t) return "Chat";
    if (t.subtitle) return t.subtitle;
    if (t.role === "foundation") return "Writes your brief";
    if (t.role === "free") return "Free-form";
    return t.produces ? `→ ${t.produces}` : "Sharpen";
  };
  // brief field → the chat (title + id) that fills it, via the template's feeds_brief.
  const chatByTemplateKey = new Map(chatList.map((c) => [c.data.template_key, c]));
  const briefChat = (field: string) => {
    const feeds = field === "features" ? "value" : field; // features come from the "what it does" chat
    for (const [key, tpl] of deckTemplates) {
      if (tpl.feeds_brief === feeds) return chatByTemplateKey.get(key);
    }
    return undefined;
  };

  const href = (q: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(q)) if (v) p.set(k, v);
    const s = p.toString();
    return `/ideas/${id}${s ? `?${s}` : ""}`;
  };

  // The chat card deck — the scrollable strip of chats above the conversation.
  // Collapsible: mid-conversation it's context, not content.
  const arcsWithCoverage = orderedChats
    .map((c) => coverage(c.data.template_key))
    .filter((x): x is { covered: number; total: number } => x !== null);
  const deckSummary = `${arcsWithCoverage.filter((x) => x.covered >= x.total).length}/${arcsWithCoverage.length} covered`;
  const chatDeck = (
    <DeckCollapse count={chatList.length} summary={deckSummary}>
      <div style={{ display: "flex", gap: 9, padding: "0 24px 15px", overflowX: "auto" }}>
        {orderedChats.map((c) => (
          <Link
            key={c.id}
            href={href({ tab: "chats", chat: c.id })}
            prefetch={false}
            className="chat-card"
            data-active={activeChat?.id === c.id}
          >
            <span className="cc-ic">{deckTemplates.get(c.data.template_key ?? "")?.icon ?? "◆"}</span>
            <b>{c.data.title}</b>
            {(() => {
              const cov = coverage(c.data.template_key);
              return (
                <span className="cc-sub" style={cov && cov.covered >= cov.total ? { color: "var(--success-text)" } : undefined}>
                  {cov ? (cov.covered >= cov.total ? "✓ covered" : `${cov.covered}/${cov.total} covered`) : deckSub(c.data.template_key)}
                </span>
              );
            })()}
          </Link>
        ))}
      </div>
    </DeckCollapse>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ---- HubHeader (hub.jsx) — tabs now live in the left icon rail ---- */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "14px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/ideas" style={{ color: "var(--text-secondary)", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
            <Icons.back size={16} /> Ideas
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
            <h1 style={{ fontSize: 21, margin: 0, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{idea.data.name}</h1>
            {/* The quick pitch stays NEXT TO the brand name everywhere — a name
                like "Cakefinder" doesn't say what it is; the tagline does. */}
            {idea.data.one_liner && (
              <span className="muted" style={{ fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                — {idea.data.one_liner}
              </span>
            )}
            <StageBadge stage={idea.data.stage} />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <VisibilityMenu ideaId={id} visibility={idea.data.visibility} />
            <span style={{ width: 1, height: 24, background: "var(--border)" }} />
            <WalletChip />
            <NewIdeaButton />
            <UserButton />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {/* ---- left icon rail: the workspace tabs ---- */}
        <nav
          style={{
            width: 60,
            flex: "none",
            borderRight: "1px solid var(--border)",
            background: "var(--surface)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "12px 0",
            gap: 4,
          }}
        >
          {HUB_TABS.map((t) => {
            // An open chat lights the Chats tab, whichever tab it was opened from.
            const active = activeChat ? t.key === "chats" : tab === t.key;
            const I = t.icon;
            return (
              <Link
                key={t.key}
                href={href({ tab: t.key === "overview" ? undefined : t.key })}
                prefetch={false}
                title={t.label}
                aria-label={t.label}
                className="hub-rail-btn"
                data-active={active}
              >
                <I size={18} />
              </Link>
            );
          })}
        </nav>

        <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
        {/* ---- ChatView (hub.jsx) ---- */}
        {activeChat && (
          // Cap the chat column to the viewport (minus the 57px hub header) so the
          // message list is the only thing that scrolls and the composer stays pinned
          // — feedback d3a64e2e (input pushed off-screen, no auto-scroll).
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0, height: "calc(100vh - 62px)", overflow: "hidden" }}>
            {chatDeck}
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", padding: "18px 22px" }}>
              <div style={{ flex: 1, minHeight: 0, width: "100%", maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column" }}>
                <ChatPanel
                  // Remount on chat switch so the thread reflects the open chat — a
                  // shared instance kept stale messages (feedback 4c4cf668).
                  key={activeChat.id}
                  ideaId={id}
                  chatId={activeChat.id}
                  template={chatTemplate}
                  initialMessages={messages.entries.map((m) => ({
                    role: m.data.role,
                    content: m.data.content,
                    traces: m.data.tool_trace ?? [],
                  }))}
                  // Re-offer the last question's chips after a reload — they're
                  // persisted on the assistant message, not just client state.
                  initialSuggestions={
                    messages.entries.at(-1)?.data.role === "assistant"
                      ? messages.entries.at(-1)?.data.suggestions ?? []
                      : []
                  }
                />
              </div>
            </div>
          </div>
        )}

        {tab === "chats" && !activeChat && (
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}>
            {chatDeck}
            <div style={{ padding: "50px 24px", textAlign: "center" }}>
              <p className="muted" style={{ fontSize: 14, margin: "0 0 14px" }}>
                {chatList.length ? "Pick a chat above to open it." : "No chats yet."}
              </p>
            </div>
          </div>
        )}

        {/* ---- Overview (hub.jsx) ---- */}
        {tab === "overview" && !activeChat && (
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "34px 28px 90px" }}>
            <div className="hub-grid" style={{ display: "grid", gridTemplateColumns: "1fr 312px", gap: 30, alignItems: "start" }}>
              <div style={{ minWidth: 0 }}>
                {idea.data.description && (
                  <p className="muted" style={{ fontSize: 15, lineHeight: 1.55, margin: "0 0 20px" }}>
                    {idea.data.description}
                  </p>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 6px" }}>
                  <SectionLabel>Your conversations · {orderedChats.length}</SectionLabel>
                  <span className="faint" style={{ fontSize: 12 }}>Work through them in order</span>
                </div>
                <p className="muted" style={{ fontSize: 13, lineHeight: 1.55, margin: "0 0 14px" }}>
                  Each one fills a part of your idea. Open one and it starts itself — you land on
                  a first take you can push back on.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {orderedChats.map((c, i) => {
                    const cov = coverage(c.data.template_key);
                    return (
                      <Link key={c.id} href={href({ chat: c.id })} prefetch={false}>
                        <Card hover style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "15px 18px" }}>
                          <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--surface)", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", fontSize: 14 }}>
                            {deckTemplates.get(c.data.template_key ?? "")?.icon ?? String(i + 1)}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 2 }}>{c.data.title}</div>
                            <div className="faint" style={{ fontSize: 12.5, lineHeight: 1.45 }}>{deckSub(c.data.template_key)}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flex: "none" }}>
                            {cov && (
                              <span
                                className="mono"
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 600,
                                  padding: "2px 8px",
                                  borderRadius: 999,
                                  background: cov.covered >= cov.total ? "var(--success-soft)" : "var(--surface)",
                                  color: cov.covered >= cov.total ? "var(--success-text)" : "var(--text-muted)",
                                  border: cov.covered >= cov.total ? "none" : "1px solid var(--border)",
                                }}
                              >
                                {cov.covered >= cov.total ? "✓ covered" : `${cov.covered}/${cov.total} covered`}
                              </span>
                            )}
                            {c.data.last_message_at && (
                              <span className="faint" style={{ fontSize: 11 }}>{ago(c.data.last_message_at)}</span>
                            )}
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                  {!orderedChats.length && (
                    <div className="card" style={{ padding: "30px 20px", textAlign: "center", borderStyle: "dashed", background: "transparent" }}>
                      <div className="muted" style={{ fontSize: 13.5 }}>No conversations yet.</div>
                    </div>
                  )}
                </div>
              </div>

              {/* knowledge panel — an accordion, so the rail stays scannable as the
                  brief and memory grow. Long values clamp; full text lives in the
                  brief document. Rail scrolls within the viewport, never past it. */}
              <aside style={{ position: "sticky", top: 24, maxHeight: "calc(100vh - 110px)", overflowY: "auto" }}>
                <Card style={{ padding: 0, overflow: "hidden" }}>
                  <RailSection
                    title="Your brief"
                    hint={`${[brief.problem, brief.who, brief.value, brief.features?.[0]].filter(Boolean).length}/4 filled`}
                    action={<Link href={href({ tab: "artifacts", doc: "brief" })} className="link-btn">Open →</Link>}
                  >
                    {(
                      [
                        ["problem", "Problem"],
                        ["who", "Audience"],
                        ["value", "Core value"],
                        ["features", "First feature"],
                      ] as const
                    ).map(([field, label], i) => {
                      const val = field === "features" ? brief.features?.[0] : (brief as Record<string, string | undefined>)[field];
                      const chat = val ? undefined : briefChat(field);
                      return (
                        <div key={field} style={{ padding: "9px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
                          <div style={{ fontSize: 9.5, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, marginBottom: 3 }}>{label}</div>
                          {val ? (
                            <div className="clamp3" style={{ fontSize: 12.5, lineHeight: 1.45 }}>{val}</div>
                          ) : (
                            <>
                              <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Not captured yet</div>
                              {chat && (
                                <Link href={href({ tab: "chats", chat: chat.id })} className="link-btn" style={{ fontSize: 11.5, display: "inline-block", marginTop: 2 }}>
                                  → {chat.data.title}
                                </Link>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </RailSection>
                  <div style={{ height: 1, background: "var(--border)" }} />
                  <RailSection
                    title={<><Icons.brain size={15} /> Memory</>}
                    hint={`${memories.entries.length} captured`}
                    action={<Link href={href({ tab: "memory" })} className="link-btn">{memories.entries.length}</Link>}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {memories.entries.slice(-3).reverse().map((m) => (
                        <div key={m.id} style={{ display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.45 }}>
                          <span className="dot" style={{ width: 6, height: 6, background: "var(--accent)", marginTop: 5, flex: "none" }} />
                          <span className="clamp2" style={{ color: "var(--text-secondary)" }}>{m.data.content}</span>
                        </div>
                      ))}
                      {memories.entries.length > 3 && (
                        <Link href={href({ tab: "memory" })} className="link-btn" style={{ fontSize: 11.5 }}>
                          View all {memories.entries.length} →
                        </Link>
                      )}
                      {!memories.entries.length && <span className="faint" style={{ fontSize: 12.5 }}>Captured as you chat.</span>}
                    </div>
                  </RailSection>
                  <div style={{ height: 1, background: "var(--border)" }} />
                  <RailSection
                    title={<><Icons.doc size={15} /> Artifacts</>}
                    hint={`${generatedArtifacts.length + 1}`}
                    action={<Link href={href({ tab: "artifacts" })} className="link-btn">{generatedArtifacts.length + 1}</Link>}
                    defaultOpen={generatedArtifacts.length > 0}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {/* The brief is live state — it always leads. Then the real generated docs. */}
                      <Link href={href({ tab: "artifacts", doc: "brief" })} className="file-row">
                        <span className="file-glyph glyph-page"><Icons.doc size={14} /></span>
                        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>Product brief</div>
                        </div>
                        <span className="badge b-idea" style={{ fontSize: 9, flex: "none" }}>Live</span>
                      </Link>
                      {generatedArtifacts.map((a) => (
                        <Link key={a.id} href={href({ tab: "artifacts", doc: a.id })} className="file-row">
                          <span className="file-glyph glyph-page"><Icons.doc size={14} /></span>
                          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                            <div style={{ fontWeight: 500, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.data.title}</div>
                          </div>
                          {a.data.on_public_page && (
                            <span className="badge b-launch" style={{ fontSize: 9, flex: "none" }}>
                              <Icons.globe size={9} /> Public
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </RailSection>
                  <div style={{ height: 1, background: "var(--border)" }} />
                  <div style={{ padding: "16px 18px" }}>
                    <SignalPanel hasSignal={Object.values(counts).some((n) => n > 0)}>
                      <SignalMap counts={counts} />
                    </SignalPanel>
                  </div>
                </Card>
              </aside>
            </div>
          </div>
        )}

        {/* ---- Memory & activity (idea-tabs.jsx MemoryView) ---- */}
        {tab === "memory" && (
          <div className="scrollarea" style={{ height: "100%" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "34px 28px 90px" }}>
              <h1 style={{ fontSize: 26, margin: "0 0 8px", letterSpacing: "-0.01em" }}>Memory &amp; activity</h1>
              <p className="muted" style={{ fontSize: 14.5, margin: "0 0 22px", maxWidth: 560, lineHeight: 1.55 }}>
                What the idea knows, and how it got here. Memory is the pieces of your brief; activity
                is the trail — including where you changed your mind.
              </p>
              <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 22 }}>
                {(
                  [
                    ["mem", "Memory", memories.entries.length],
                    ["act", "Activity", activity.entries.length],
                  ] as const
                ).map(([key, label, n]) => {
                  const active = (sp.sub ?? "mem") === key;
                  return (
                    <Link
                      key={key}
                      href={href({ tab: "memory", sub: key === "mem" ? undefined : key })}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "8px 12px",
                        fontSize: 13.5,
                        fontWeight: active ? 600 : 500,
                        color: active ? "var(--text-primary)" : "var(--text-secondary)",
                        borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                        marginBottom: -1,
                      }}
                    >
                      {label} <span className="faint mono" style={{ fontSize: 11 }}>{n}</span>
                    </Link>
                  );
                })}
              </div>

              {(sp.sub ?? "mem") === "mem" ? (
                memories.entries.length === 0 ? (
                  <Empty
                    icon={Icons.brain}
                    title="No memory yet"
                    body="Start a chat — Hatchly captures the meaningful pieces as you talk, and they build your brief."
                    action={
                      <Link href={href({})} className="btn btn-primary btn-sm">Start a chat</Link>
                    }
                  />
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                    {[...memories.entries].reverse().map((m) => (
                      <Card key={m.id} style={{ padding: 16, display: "flex", flexDirection: "column", gap: 9 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span className="dot" style={{ width: 7, height: 7, background: "var(--accent)", marginTop: 6 }} />
                          <span style={{ fontSize: 13.5, lineHeight: 1.5, flex: 1, fontWeight: 500 }}>{m.data.content}</span>
                          <Icons.chevR size={14} style={{ color: "var(--text-muted)", flex: "none", marginTop: 3 }} />
                        </div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {m.data.kind && (
                            <Pill style={{ fontSize: 10, background: m.data.kind === "evidence" ? "var(--success-soft)" : m.data.kind === "decision" ? "var(--accent-soft)" : undefined, color: m.data.kind === "evidence" ? "var(--success-text)" : m.data.kind === "decision" ? "var(--accent-text)" : undefined }}>
                              {m.data.kind}
                            </Pill>
                          )}
                          {m.data.topic && <Pill accent style={{ fontSize: 10 }}>{m.data.topic}</Pill>}
                          {m.data.intent_key && (
                            <Pill style={{ fontSize: 10 }}>answers · {m.data.intent_key.replace(/_/g, " ")}</Pill>
                          )}
                          {m.data.feeds && (
                            <Pill style={{ fontSize: 10 }}>
                              <Icons.doc size={11} /> feeds · {FEEDS_LABEL[m.data.feeds] ?? m.data.feeds}
                            </Pill>
                          )}
                          {(m.data.entities ?? []).slice(0, 4).map((e) => (
                            <Pill key={e} style={{ fontSize: 10, fontStyle: "italic" }}>{e}</Pill>
                          ))}
                        </div>
                        {m.data.verbatim && (
                          <p className="faint" style={{ fontSize: 11.5, fontStyle: "italic", margin: 0, lineHeight: 1.45 }}>
                            “{m.data.verbatim}”
                          </p>
                        )}
                        <div style={{ height: 1, background: "var(--border)" }} />
                        <span className="faint" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 6 }}>
                          {m.data.source_type === "voice" ? <Icons.voice size={13} /> : <Icons.chat size={13} />}
                          {m.data.chat?.label ? `${m.data.chat.label} · ` : ""}
                          {m.data.source_label}
                        </span>
                      </Card>
                    ))}
                  </div>
                )
              ) : activity.entries.length === 0 ? (
                <Empty
                  icon={Icons.sparkle}
                  title="No activity yet"
                  body="As you chat, publish, and change your mind, the trail shows up here."
                />
              ) : (
                <div style={{ maxWidth: 760 }}>
                  {activity.entries.map((a, i) => (
                    <div key={a.id} style={{ display: "flex", gap: 13, alignItems: "flex-start", padding: "13px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
                      <span style={{ width: 32, height: 32, borderRadius: 999, background: "var(--surface)", border: "1px solid var(--border)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", color: "var(--text-secondary)" }}>
                        {a.data.type === "chat" ? <Icons.chat size={14} /> :
                         a.data.type === "memory" ? <Icons.brain size={14} /> :
                         a.data.type === "change" ? <Icons.edit size={14} /> :
                         a.data.type === "artifact" ? <Icons.doc size={14} /> :
                         a.data.type === "publish" ? <Icons.globe size={14} /> : <Icons.sparkle size={14} />}
                      </span>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 500 }}>{a.data.text}</span>
                        {a.data.old_value && (
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <Pill style={{ fontSize: 11, textDecoration: "line-through", color: "var(--text-muted)" }}>{a.data.old_value}</Pill>
                            <span className="faint">→</span>
                            <Pill accent style={{ fontSize: 11 }}>{a.data.new_value ?? "—"}</Pill>
                          </div>
                        )}
                      </div>
                      <span className="faint nowrap" style={{ fontSize: 12 }}>{ago(a.data.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- Artifacts: the brief (idea-tabs.jsx PageDoc, read view) ---- */}
        {/* ---- Artifacts: the library, and one document (idea-tabs.jsx FilesList / PageDoc) ---- */}
        {tab === "artifacts" && !openDoc && (
          <div className="scrollarea" style={{ height: "100%" }}>
            <div style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 28px 80px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22, gap: 16, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: 24, margin: "0 0 6px", letterSpacing: "-0.01em" }}>Artifacts</h2>
                  <p className="muted" style={{ fontSize: 14.5, margin: 0, maxWidth: 560 }}>
                    Documents that help you understand your idea — the brief, scope, positioning and
                    more. The agent drafts them from what you&apos;ve actually said.
                  </p>
                </div>
                <ArtifactPicker ideaId={id} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
                {/* The brief is live state, not a generated doc — it always leads. */}
                <Link href={href({ tab: "artifacts", doc: "brief" })}>
                  <Card hover style={{ padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <span className="file-glyph glyph-page"><Icons.doc size={18} /></span>
                      <span className="badge b-idea" style={{ fontSize: 9.5 }}>Live</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>Product brief</div>
                    <div className="faint" style={{ fontSize: 12.5 }}>
                      Written in chat ·{" "}
                      <span title={GATE_HELP} style={{ borderBottom: "1px dotted var(--text-muted)", cursor: "help" }}>
                        {gate.open
                          ? "build-ready"
                          : `${[gate.problem, gate.who, gate.value, gate.feature].filter(Boolean).length}/4 to open the gate`}
                      </span>
                    </div>
                  </Card>
                </Link>

                {artifacts.entries
                  .filter((a) => !a.data.is_brief && a.data.type !== "brief")
                  .map((a) => (
                    <Link key={a.id} href={href({ tab: "artifacts", doc: a.id })}>
                      <Card hover style={{ padding: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                          <span className="file-glyph glyph-page"><Icons.doc size={18} /></span>
                          {a.data.on_public_page ? (
                            <span className="badge b-launch" style={{ fontSize: 9.5 }}>
                              <Icons.globe size={10} /> Public
                            </span>
                          ) : (
                            <span className="pill" style={{ fontSize: 10.5 }}>Artifact</span>
                          )}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{a.data.title}</div>
                        <div className="faint clamp2" style={{ fontSize: 12.5, lineHeight: 1.45 }}>
                          {a.data.subtitle}
                        </div>
                      </Card>
                    </Link>
                  ))}

                <ArtifactPicker ideaId={id} trigger="card" />
              </div>
            </div>
          </div>
        )}

        {/* the brief, read as a document */}
        {tab === "artifacts" && openDoc === "brief" && (
          <div className="scrollarea" style={{ height: "100%" }}>
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "34px 28px 90px" }}>
              <Link href={href({ tab: "artifacts" })} className="link-btn" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, marginBottom: 18 }}>
                <Icons.back size={14} /> All artifacts
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span className="file-glyph glyph-page"><Icons.doc size={15} /></span>
                <h1 style={{ fontSize: 26, margin: 0, letterSpacing: "-0.01em" }}>Product brief</h1>
              </div>
              <p className="muted" style={{ fontSize: 13.5, margin: "6px 0 22px" }}>
                Written by the agent · the live state of the idea
              </p>
              <Card style={{ padding: "26px 28px", display: "flex", flexDirection: "column", gap: 22 }}>
                {(
                  [
                    ["Problem", brief.problem],
                    ["Who it's for", brief.who],
                    ["Core value", brief.value],
                  ] as const
                ).map(([label, v]) => (
                  <div key={label}>
                    <SectionLabel style={{ marginBottom: 8 }}>{label}</SectionLabel>
                    {v ? (
                      <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{v}</p>
                    ) : (
                      <p className="faint" style={{ fontSize: 14, margin: 0, fontStyle: "italic" }}>
                        Not captured yet — keep chatting.
                      </p>
                    )}
                  </div>
                ))}
                {(
                  [
                    ["Features", brief.features, "check", "var(--accent-text)"],
                    ["Open questions", brief.open_questions, "search", "var(--info-text)"],
                  ] as const
                ).map(([label, items, icon, color]) => (
                  <div key={label}>
                    <SectionLabel style={{ marginBottom: 8 }}>{label}</SectionLabel>
                    {items?.length ? (
                      <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                        {items.map((x, i) => (
                          <li key={i} style={{ display: "flex", gap: 10, fontSize: 14.5, lineHeight: 1.5 }}>
                            <span style={{ color, flex: "none", marginTop: 1 }}>
                              {icon === "check" ? <Icons.check size={15} /> : <Icons.search size={15} />}
                            </span>
                            {x}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="faint" style={{ fontSize: 14, margin: 0, fontStyle: "italic" }}>
                        Nothing here yet.
                      </p>
                    )}
                  </div>
                ))}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
                  <GateChecklist gate={gate} compact />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* a generated artifact, read as a document */}
        {tab === "artifacts" && openDoc && openDoc !== "brief" && (
          <div className="scrollarea" style={{ height: "100%" }}>
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "34px 28px 90px" }}>
              <Link href={href({ tab: "artifacts" })} className="link-btn" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, marginBottom: 18 }}>
                <Icons.back size={14} /> All artifacts
              </Link>
              {!doc ? (
                <Empty
                  icon={Icons.doc}
                  title="That artifact is gone"
                  body="It may have been deleted from another tab."
                />
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 4 }}>
                    <span className="file-glyph glyph-page" style={{ marginTop: 6 }}><Icons.doc size={15} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h1 className="serif" style={{ fontSize: 34, margin: 0, fontStyle: "italic", lineHeight: 1.1, fontWeight: 400 }}>
                        {doc.data.title}
                      </h1>
                      <p className="muted" style={{ fontSize: 13.5, margin: "8px 0 0" }}>
                        {doc.data.subtitle}
                      </p>
                    </div>
                  </div>
                  <div style={{ margin: "18px 0 22px" }}>
                    <ArtifactActions
                      id={doc.id}
                      ideaId={id}
                      title={doc.data.title}
                      onPublicPage={!!doc.data.on_public_page}
                    />
                  </div>
                  <Card style={{ padding: "26px 28px", display: "flex", flexDirection: "column", gap: 24 }}>
                    {(doc.data.body ?? []).length === 0 && (
                      <p className="faint" style={{ fontSize: 14, margin: 0, fontStyle: "italic" }}>
                        This document is empty.
                      </p>
                    )}
                    {(doc.data.body ?? []).map((s, i) => (
                      <div key={i} className="artifact-section">
                        <SectionLabel style={{ marginBottom: 8 }}>{s.heading}</SectionLabel>
                        {s.paragraph ? (
                          <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>
                            {s.paragraph}
                          </p>
                        ) : null}
                        {s.list_items?.length ? (
                          <>
                            {s.list_heading && (
                              <div className="faint" style={{ fontSize: 12.5, margin: s.paragraph ? "12px 0 6px" : "0 0 6px" }}>
                                {s.list_heading}
                              </div>
                            )}
                            <ul style={{ margin: s.paragraph && !s.list_heading ? "12px 0 0" : 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                              {s.list_items.map((x, j) => (
                                <li key={j} style={{ display: "flex", gap: 10, fontSize: 14.5, lineHeight: 1.5 }}>
                                  <span style={{ color: "var(--accent-text)", flex: "none", marginTop: 1 }}>
                                    <Icons.check size={15} />
                                  </span>
                                  {x}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                        {!s.paragraph && !s.list_items?.length && (
                          <p className="faint" style={{ fontSize: 14, margin: 0, fontStyle: "italic" }}>
                            Nothing captured for this yet — talk it through in chat and regenerate.
                          </p>
                        )}
                      </div>
                    ))}
                  </Card>
                </>
              )}
            </div>
          </div>
        )}

        {/* ---- Community (idea-tabs.jsx CommunityView) ---- */}
        {tab === "community" && (
          <CommunityTab listing={listing} isLive={isLive} sub={sp.sub} hrefBase={href} />
        )}

        {/* ---- Public page (idea-tabs.jsx PublicManage) ---- */}
        {tab === "public" && (
          <div className="scrollarea" style={{ height: "100%" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "34px 28px 90px" }}>
              <h1 style={{ fontSize: 26, margin: "0 0 8px", letterSpacing: "-0.01em" }}>Public page</h1>
              <p className="muted" style={{ fontSize: 14.5, margin: "0 0 22px", maxWidth: 600, lineHeight: 1.55 }}>
                Build the listing people see on the stream. Set a cover, link a live app if it&apos;s
                already built, and choose what to pull from your files.
              </p>
              <div className="hub-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 30, alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <CoverEditor
                    ideaId={id}
                    preset={idea.data.cover_preset ?? "linen"}
                    imageUrl={idea.data.cover_image?.url ?? null}
                  />
                  <Card style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                    <SectionLabel>Visibility</SectionLabel>
                    <VisibilityMenu ideaId={id} visibility={idea.data.visibility} />
                    <p className="faint" style={{ fontSize: 12.5, margin: 0 }}>
                      Public puts {idea.data.name} on the stream — discoverable and backable with bucks.
                    </p>
                  </Card>
                </div>

                <aside style={{ display: "flex", flexDirection: "column", gap: 10, position: "sticky", top: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <SectionLabel>Listing preview</SectionLabel>
                    {listing && isLive && (
                      <Link href={`/i/${listing.id}`} className="link-btn mono" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 4 }}>
                        <Icons.link size={12} /> open listing
                      </Link>
                    )}
                  </div>
                  <Card style={{ padding: 0, overflow: "hidden", opacity: isLive ? 1 : 0.6 }}>
                    <div style={{ height: 92, background: COVER_CSS[idea.data.cover_preset ?? "linen"] }} />
                    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 7 }}>
                      <strong style={{ fontSize: 16 }}>{idea.data.name}</strong>
                      <p className="muted" style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>{idea.data.one_liner}</p>
                      {brief.problem && (
                        <>
                          <SectionLabel style={{ marginTop: 6 }}>Problem</SectionLabel>
                          <p className="muted" style={{ fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>{brief.problem}</p>
                        </>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                        <Bucks amount={listing?.data.bucks_total ?? 0} size={16} style={{ color: "var(--accent-text)" }} />
                        <span className="faint" style={{ fontSize: 12 }}>{listing?.data.distinct_backers ?? 0} backers</span>
                      </div>
                    </div>
                  </Card>
                  {!isLive && (
                    <Card style={{ padding: 16, textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
                      <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                        Not public yet. Publish to make it discoverable and backable.
                      </p>
                      <VisibilityMenu ideaId={id} visibility={idea.data.visibility} />
                    </Card>
                  )}
                </aside>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

/* ---- Community tab (server sub-component; idea-tabs.jsx CommunityView) ---- */
async function CommunityTab({
  listing,
  isLive,
  sub,
  hrefBase,
}: {
  listing: ListingRow | null;
  isLive: boolean;
  sub?: string;
  hrefBase: (q: Record<string, string | undefined>) => string;
}) {
  const feedback = listing
    ? await callTool<{ entries: FeedbackRow[] }>("query_entries", {
        collection: "feedback",
        where: [
          { field: "listing", op: "eq", value: listing.id },
          { field: "status", op: "eq", value: "live" },
        ],
        select: ["text", "author", "created_at"],
        orderBy: { field: "created_at", dir: "desc" },
        limit: 50,
      })
    : { entries: [] as FeedbackRow[] };

  const active = sub === "contacts" ? "contacts" : "feedback";

  return (
    <div className="scrollarea" style={{ height: "100%" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "34px 28px 90px" }}>
        <h1 style={{ fontSize: 26, margin: "0 0 8px", letterSpacing: "-0.01em" }}>Community</h1>
        <p className="muted" style={{ fontSize: 14.5, margin: "0 0 22px", maxWidth: 560, lineHeight: 1.55 }}>
          Everything the public gives back — feedback on your idea, and the people waiting to hear
          when it launches.
        </p>
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
          {(
            [
              ["feedback", "Feedback", feedback.entries.length],
              ["contacts", "Contact list", 0],
            ] as const
          ).map(([key, label, n]) => (
            <Link
              key={key}
              href={hrefBase({ tab: "community", sub: key === "feedback" ? undefined : key })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 12px",
                fontSize: 13.5,
                fontWeight: active === key ? 600 : 500,
                color: active === key ? "var(--text-primary)" : "var(--text-secondary)",
                borderBottom: active === key ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {label} <span className="faint mono" style={{ fontSize: 11 }}>{n}</span>
            </Link>
          ))}
        </div>

        {!isLive ? (
          <Empty
            icon={active === "feedback" ? Icons.chat : Icons.users}
            title={active === "feedback" ? "Publish to collect feedback" : "Publish to grow a list"}
            body={
              active === "feedback"
                ? "Feedback comes from your public page. Make this idea public and notes will land here."
                : "People who ask to be notified show up here once your idea is on the stream."
            }
          />
        ) : active === "feedback" ? (
          feedback.entries.length === 0 ? (
            <Empty icon={Icons.chat} title="No feedback yet" body="Notes from your public page will land here." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {feedback.entries.map((f) => (
                <Card key={f.id} style={{ padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>{f.data.text}</p>
                  <span className="faint" style={{ fontSize: 12 }}>
                    {f.data.author?.label ?? "Someone"} · {ago(f.data.created_at)}
                  </span>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Empty
            icon={Icons.users}
            title="Contact list"
            body="Coming with the notify flow — people who ask to hear when it launches."
          />
        )}
      </div>
    </div>
  );
}
