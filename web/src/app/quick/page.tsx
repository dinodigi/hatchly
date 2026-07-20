import { auth } from "@clerk/nextjs/server";
import { BuildButton, CommentThread, QuickComposer, VoteButton } from "@/components/QuickControls";
import { Card, Pill } from "@/components/ui";
import { getAgentX } from "@/lib/server";
import { callTool } from "@/lib/mcp";

/* Quick Ideas — v4's Reddit-style "someone should build this" board
   (Design/app/quick.jsx), with voting, posting, and cloning wired. */

export const metadata = {
  title: "Quick Ideas — Hatchly",
  description: "Ideas you wish someone would build.",
};

function ago(iso?: string) {
  if (!iso) return "";
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

const QI_TAGS = ["AI", "SaaS", "Consumer", "Marketplace", "Productivity", "Fintech", "Creator", "Education"];

export default async function QuickIdeasPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; tag?: string }>;
}) {
  const sp = await searchParams;
  const sort = sp.sort === "new" ? "new" : "top";
  const activeTag = sp.tag && QI_TAGS.includes(sp.tag) ? sp.tag : undefined;
  const ax = getAgentX();
  const ideas = ax
    ? await ax.quick_ideas.list({
        sort: sort === "new" ? { field: "created_at", dir: "desc" } : { field: "upvotes", dir: "desc" },
        filter: activeTag ? { tag: activeTag } : undefined,
        limit: 50,
      })
    : [];

  // One post per day (UTC) — mirror /api/quick so the composer can show the
  // "that's your idea for today" state instead of letting the user hit a 429.
  const { userId } = await auth();
  let postedToday = false;
  if (userId) {
    const dayStart = new Date().toISOString().slice(0, 10) + "T00:00:00Z";
    const mine = await callTool<{ entries: { id: string }[] }>("query_entries", {
      collection: "quick_ideas",
      where: [
        { field: "author_id", op: "eq", value: userId },
        { field: "created_at", op: "gt", value: dayStart },
      ],
      limit: 1,
    });
    postedToday = mine.entries.length > 0;
  }

  // Preserve the active tag when switching sort, and vice-versa.
  const withParams = (next: { sort?: string; tag?: string }) => {
    const params = new URLSearchParams();
    const s = next.sort ?? sort;
    const t = "tag" in next ? next.tag : activeTag;
    if (s === "new") params.set("sort", "new");
    if (t) params.set("tag", t);
    const qs = params.toString();
    return qs ? `/quick?${qs}` : "/quick";
  };

  return (
    <div className="scrollarea">
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 90px" }}>
        <h1 className="serif" style={{ fontSize: 40, margin: "0 0 6px", fontWeight: 400, lineHeight: 1.15 }}>
          Ideas you wish <em className="italic">someone would build</em>
        </h1>
        <p className="muted" style={{ margin: "0 0 22px" }}>
          One line is enough. Someone here might just build it.
        </p>

        <QuickComposer postedToday={postedToday} />

        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "24px 0 14px" }}>
          {(
            [
              ["top", "Top"],
              ["new", "New"],
            ] as const
          ).map(([k, l]) => (
            <a key={k} href={withParams({ sort: k })}>
              <Pill accent={sort === k} style={{ cursor: "pointer" }}>{l}</Pill>
            </a>
          ))}
          <span className="spacer" />
          <span className="faint" style={{ fontSize: 12.5 }}>{ideas.length} ideas</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", margin: "0 0 18px" }}>
          <a href={withParams({ tag: undefined })}>
            <Pill accent={!activeTag} style={{ cursor: "pointer" }}>All</Pill>
          </a>
          {QI_TAGS.map((t) => (
            <a key={t} href={withParams({ tag: activeTag === t ? undefined : t })}>
              <Pill accent={activeTag === t} style={{ cursor: "pointer" }}>{t}</Pill>
            </a>
          ))}
        </div>

        {ideas.length === 0 && (
          <p className="faint" style={{ fontSize: 13.5, fontStyle: "italic", padding: "8px 2px" }}>
            {activeTag ? `No ${activeTag} ideas yet — be the first.` : "No ideas yet — post the first one."}
          </p>
        )}

        <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ideas.map((q) => (
            <Card key={q.id} style={{ display: "flex", gap: 16, padding: 16 }}>
              <VoteButton quickId={q.id} upvotes={q.upvotes} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {q.tag && <span className="tag-pill">{q.tag}</span>}
                  <strong style={{ fontSize: 15 }}>{q.title}</strong>
                </div>
                {q.description && (
                  <p className="muted" style={{ fontSize: 13.5, margin: "5px 0 0", lineHeight: 1.5 }}>{q.description}</p>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  <span className="faint" style={{ fontSize: 12 }}>{q.author.label}</span>
                  <span className="faint" style={{ fontSize: 12 }}>· {ago(q.created_at)}</span>
                  <CommentThread quickId={q.id} count={q.comment_count} />
                  {q.cloned_count > 0 && (
                    <span className="faint" style={{ fontSize: 12 }}>· {q.cloned_count} building</span>
                  )}
                  <span className="spacer" />
                  <BuildButton quickId={q.id} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
