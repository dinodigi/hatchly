import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ArchiveIdeaButton from "@/components/ArchiveIdeaButton";
import GateChecklist from "@/components/GateChecklist";
import NewIdeaButton from "@/components/NewIdeaButton";
import { Icons } from "@/components/icons";
import { Bucks, Card, Pill, SectionLabel, StageBadge } from "@/components/ui";
import { briefGate, type Brief } from "@/lib/agent";
import { clerkEnabled } from "@/lib/clerk";
import { getWallet } from "@/lib/economy";
import { callTool } from "@/lib/mcp";

export const metadata = { title: "My ideas — Hatchly" };

/* Dashboard — v4's Dashboard (Design/app/workspace.jsx): summary card,
   Your ideas / Your backing tabs, idea cards. */

const VIS_LABEL: Record<string, string> = { private: "Private", link: "Link-only", public: "Public" };

interface IdeaRow {
  id: string;
  data: {
    name: string;
    one_liner?: string;
    stage: string;
    visibility: string;
    brief?: Brief;
    last_activity_at?: string;
  };
}
interface StakeRow {
  id: string;
  data: { listing: { id: string; label: string }; amount: number; created_at?: string };
}
interface ListingRow {
  id: string;
  data: { idea: { id: string }; bucks_total: number; bucks_today: number; status: string };
}

function ago(iso?: string) {
  if (!iso) return "";
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
}

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; archived?: string }>;
}) {
  if (!clerkEnabled) redirect("/");
  const { userId } = await auth();
  if (!userId) redirect("/");
  const sp = await searchParams;
  const tab = sp.tab === "backing" ? "backing" : "ideas";
  // The archived shelf — same card grid, restore instead of archive.
  const showArchived = sp.archived === "1";

  const [ideas, wallet, stakes, myListings] = await Promise.all([
    callTool<{ entries: IdeaRow[] }>("query_entries", {
      collection: "ideas",
      where: [
        { field: "owner_id", op: "eq", value: userId },
        showArchived
          ? { field: "archived", op: "eq", value: true }
          : { field: "archived", op: "ne", value: true },
      ],
      select: ["name", "one_liner", "stage", "visibility", "brief", "last_activity_at"],
      limit: 100,
    }),
    getWallet(userId).catch(() => null),
    callTool<{ entries: StakeRow[] }>("query_entries", {
      collection: "stakes",
      where: [{ field: "backer_id", op: "eq", value: userId }],
      select: ["listing", "amount", "created_at"],
      orderBy: { field: "created_at", dir: "desc" },
      limit: 50,
    }),
    callTool<{ entries: ListingRow[] }>("query_entries", {
      collection: "listings",
      where: [{ field: "owner_id", op: "eq", value: userId }],
      select: ["idea", "bucks_total", "bucks_today", "status"],
      limit: 50,
    }),
  ]);

  const listingByIdea = new Map(myListings.entries.map((l) => [l.data.idea.id, l]));
  const w = wallet?.data;

  return (
    <div className="scrollarea">
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 24px 90px" }}>
        {/* summary card */}
        <Card style={{ display: "flex", alignItems: "stretch", gap: 0, padding: 0, overflow: "hidden", marginBottom: 26 }}>
          {(
            [
              ["Your balance", w ? <Bucks key="b" amount={w.balance} size={22} style={{ color: "var(--accent-text)" }} /> : "—", w && w.streak > 1 ? `${w.streak}🔥 day streak` : null],
              ["Invested", w ? <Bucks key="i" amount={w.lifetime_invested} size={18} /> : "—", "lifetime, into ideas"],
              ["Received", w ? <Bucks key="r" amount={w.lifetime_received} size={18} /> : "—", "lifetime, from backers"],
            ] as const
          ).map(([label, value, sub], i) => (
            <div key={label} style={{ flex: 1, padding: "18px 22px", borderLeft: i ? "1px solid var(--border)" : "none" }}>
              <SectionLabel style={{ marginBottom: 6 }}>{label}</SectionLabel>
              <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
              {sub && <div className="faint" style={{ fontSize: 12, marginTop: 3 }}>{sub}</div>}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", padding: "0 22px", borderLeft: "1px solid var(--border)" }}>
            <Link href="/wallet" className="btn btn-secondary btn-sm">Open wallet</Link>
          </div>
        </Card>

        {/* tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 22 }}>
          {(
            [
              ["ideas", "Your ideas", "/ideas"],
              ["backing", "Your backing", "/ideas?tab=backing"],
            ] as const
          ).map(([k, l, h]) => (
            <Link
              key={k}
              href={h}
              style={{
                padding: "9px 14px",
                fontSize: 13.5,
                fontWeight: tab === k ? 600 : 500,
                color: tab === k ? "var(--text-primary)" : "var(--text-secondary)",
                borderBottom: tab === k ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {l}
            </Link>
          ))}
          <span className="spacer" />
          {tab === "ideas" && (
            <Link
              href={showArchived ? "/ideas" : "/ideas?archived=1"}
              className="link-btn"
              style={{ paddingBottom: 10, marginRight: 12 }}
            >
              {showArchived ? "← Active ideas" : "Archived"}
            </Link>
          )}
          <div style={{ paddingBottom: 8 }}>
            <NewIdeaButton />
          </div>
        </div>

        {tab === "ideas" ? (
          ideas.entries.length === 0 ? (
            showArchived ? (
              <Card style={{ padding: 48, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", textAlign: "center" }}>
                <div className="serif" style={{ fontSize: 26 }}>Nothing archived</div>
                <p className="muted" style={{ margin: 0 }}>Ideas you archive land here — nothing is ever deleted.</p>
                <Link href="/ideas" className="btn btn-secondary btn-sm">Back to active ideas</Link>
              </Card>
            ) : (
              <Card style={{ padding: 48, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", textAlign: "center" }}>
                <div className="serif" style={{ fontSize: 28 }}>What will you hatch first?</div>
                <p className="muted" style={{ margin: 0 }}>A sentence is enough. We&apos;ll shape it together from there.</p>
                <NewIdeaButton label="Start your first idea" />
              </Card>
            )
          ) : (
            <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {ideas.entries.map((i) => {
                const gate = briefGate(i.data.brief ?? {});
                const openQs = i.data.brief?.open_questions?.length ?? 0;
                const listing = listingByIdea.get(i.id);
                const live = listing?.data.status === "live";
                return (
                  <Link key={i.id} href={`/ideas/${i.id}`}>
                    <Card hover style={{ padding: 18, height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <StageBadge stage={i.data.stage} />
                        <Pill style={{ fontSize: 10.5 }}>{VIS_LABEL[i.data.visibility] ?? i.data.visibility}</Pill>
                      </div>
                      <strong style={{ fontSize: 16 }}>{i.data.name}</strong>
                      <p className="muted clamp2" style={{ fontSize: 13.5, margin: 0, flex: 1, lineHeight: 1.5 }}>{i.data.one_liner}</p>
                      {live && listing ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Bucks amount={listing.data.bucks_total} size={16} style={{ color: "var(--accent-text)" }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--success-text)" }}>+{listing.data.bucks_today}</span>
                        </div>
                      ) : (
                        <GateChecklist gate={gate} compact />
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="faint" style={{ fontSize: 11.5 }}>Active {ago(i.data.last_activity_at)}</span>
                        {openQs > 0 && (
                          <span className="faint" style={{ fontSize: 11.5 }}>
                            · {openQs} open {openQs === 1 ? "question" : "questions"}
                          </span>
                        )}
                        <span className="spacer" />
                        <ArchiveIdeaButton ideaId={i.id} archived={showArchived} />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )
        ) : stakes.entries.length === 0 ? (
          <Card style={{ padding: 48, display: "flex", flexDirection: "column", gap: 10, alignItems: "center", textAlign: "center" }}>
            <Icons.flame size={22} style={{ color: "var(--text-muted)" }} />
            <strong>Nothing backed yet</strong>
            <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
              Browse the stream and back the ideas you believe in.
            </p>
            <Link href="/" className="btn btn-primary btn-sm">Open the stream</Link>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
            {stakes.entries.map((s) => (
              <Link key={s.id} href={`/i/${s.data.listing.id}`}>
                <Card hover style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
                  <span style={{ fontWeight: 600, fontSize: 14.5, flex: 1 }}>{s.data.listing.label}</span>
                  <Bucks amount={s.data.amount} size={15} />
                  <Icons.chevR size={15} style={{ color: "var(--text-muted)" }} />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
