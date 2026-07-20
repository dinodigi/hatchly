import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import ArtifactActions from "@/components/ArtifactActions";
import ArtifactPicker from "@/components/ArtifactPicker";
import BriefReadiness from "@/components/BriefReadiness";
import ChatPanel from "@/components/ChatPanel";
import Composer from "@/components/Composer";
import CoverEditor from "@/components/CoverEditor";
import GateChecklist from "@/components/GateChecklist";
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
  data: { title: string; last_message_at?: string };
}
interface MessageRow {
  id: string;
  data: { role: "user" | "assistant"; content: string; turn: number; tool_trace?: string[] };
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
      select: ["title", "last_message_at"],
      limit: 30,
    }),
    callTool<{ entries: MemoryRow[] }>("query_entries", {
      collection: "memories",
      where: [
        { field: "idea", op: "eq", value: id },
        { field: "superseded", op: "ne", value: true },
      ],
      select: ["content", "verbatim", "feeds", "topic", "source_type", "source_label", "chat"],
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
        select: ["role", "content", "turn", "tool_trace"],
        limit: 200,
      })
    : { entries: [] as MessageRow[] };

  const href = (q: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(q)) if (v) p.set(k, v);
    const s = p.toString();
    return `/ideas/${id}${s ? `?${s}` : ""}`;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ---- HubHeader (hub.jsx) ---- */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "14px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 13 }}>
          <Link href="/ideas" style={{ color: "var(--text-secondary)", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
            <Icons.back size={16} /> Ideas
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <h1 style={{ fontSize: 21, margin: 0, letterSpacing: "-0.01em" }}>{idea.data.name}</h1>
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
        <div style={{ display: "flex", gap: 4 }}>
          {HUB_TABS.map((t) => {
            const active = tab === t.key && !activeChat;
            const I = t.icon;
            return (
              <Link
                key={t.key}
                href={href({ tab: t.key === "overview" ? undefined : t.key })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 14px",
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                <I size={15} /> {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {/* ---- ChatView (hub.jsx) ---- */}
        {tab === "overview" && activeChat && (
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ padding: "10px 28px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
              <Link href={href({})} className="iconbtn" title="All chats" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Icons.back size={17} />
              </Link>
              <span style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", fontWeight: 600, fontSize: 14.5 }}>
                <Icons.chat size={15} style={{ color: "var(--text-secondary)" }} /> {activeChat.data.title}
              </span>
              <div style={{ flex: 1 }} />
              <Link href={href({})} className="btn btn-secondary btn-sm">
                <Icons.plus size={14} /> New chat
              </Link>
            </div>
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", padding: "18px 22px" }}>
              <div style={{ flex: 1, minHeight: 0, width: "100%", maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column" }}>
                <ChatPanel
                  ideaId={id}
                  chatId={activeChat.id}
                  initialMessages={messages.entries.map((m) => ({
                    role: m.data.role,
                    content: m.data.content,
                    traces: m.data.tool_trace ?? [],
                  }))}
                />
              </div>
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
                <Composer ideaId={id} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "26px 0 12px" }}>
                  <SectionLabel>Chats · {chatList.length}</SectionLabel>
                  <span className="faint" style={{ fontSize: 12 }}>Each chat feeds your brief</span>
                </div>
                {chatList.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {chatList.map((c) => (
                      <Link key={c.id} href={href({ chat: c.id })}>
                        <Card hover style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
                          <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--surface)", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                            <Icons.chat size={17} />
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 2 }}>{c.data.title}</div>
                          </div>
                          <span className="faint" style={{ fontSize: 12, flex: "none" }}>{ago(c.data.last_message_at)}</span>
                          <Icons.chevR size={16} style={{ color: "var(--text-muted)", flex: "none" }} />
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="card" style={{ padding: "30px 20px", textAlign: "center", borderStyle: "dashed", background: "transparent" }}>
                    <div className="muted" style={{ fontSize: 13.5 }}>
                      No chats yet. Start one above to keep conversations organized and reuse what the idea knows.
                    </div>
                  </div>
                )}
              </div>

              {/* knowledge panel — B3: readiness leads, real artifacts, collapsible signal */}
              <aside style={{ position: "sticky", top: 24 }}>
                <Card style={{ padding: 0, overflow: "hidden" }}>
                  <BriefReadiness gate={gate} href={href({ tab: "artifacts", doc: "brief" })} />
                  <div style={{ height: 1, background: "var(--border)" }} />
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 7 }}>
                        <Icons.brain size={15} /> Memory
                      </span>
                      <Link href={href({ tab: "memory" })} className="link-btn">{memories.entries.length}</Link>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {memories.entries.slice(-3).reverse().map((m) => (
                        <div key={m.id} style={{ display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.45 }}>
                          <span className="dot" style={{ width: 6, height: 6, background: "var(--accent)", marginTop: 5 }} />
                          <span style={{ color: "var(--text-secondary)" }}>{m.data.content}</span>
                        </div>
                      ))}
                      {!memories.entries.length && <span className="faint" style={{ fontSize: 12.5 }}>Captured as you chat.</span>}
                    </div>
                  </div>
                  <div style={{ height: 1, background: "var(--border)" }} />
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 7 }}>
                        <Icons.doc size={15} /> Artifacts
                      </span>
                      <Link href={href({ tab: "artifacts" })} className="link-btn">{generatedArtifacts.length + 1}</Link>
                    </div>
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
                  </div>
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
                          {m.data.topic && <Pill accent style={{ fontSize: 10 }}>{m.data.topic}</Pill>}
                          {m.data.feeds && (
                            <Pill style={{ fontSize: 10 }}>
                              <Icons.doc size={11} /> feeds · {FEEDS_LABEL[m.data.feeds] ?? m.data.feeds}
                            </Pill>
                          )}
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
                      {gate.open
                        ? "build-ready"
                        : `${[gate.problem, gate.who, gate.value, gate.feature].filter(Boolean).length}/4 to open the gate`}
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
