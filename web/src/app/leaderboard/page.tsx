import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Icons } from "@/components/icons";
import { Avatar, Bucks, Card, SectionLabel, Spark } from "@/components/ui";
import { clerkEnabled } from "@/lib/clerk";
import { getUserByClerkId, suspendedUserIds } from "@/lib/economy";
import { getAgentX } from "@/lib/server";

/* Leaderboard — v4's "Hall of backers" (stream.jsx): podium 2-1-3, the full
   list with your row highlighted, most-backed ideas grid. Ranked by bucks
   invested (public stakes aggregate); ideas ranked by cumulative rank_score. */

export const metadata = {
  title: "Leaderboard — Hatchly",
  description: "The backers with a track record, and the most-backed ideas.",
};

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const fmt = (n: number) => n.toLocaleString("en-US");

export default async function LeaderboardPage() {
  const ax = getAgentX();
  const { userId } = clerkEnabled ? await auth() : { userId: null };
  const [listings, stakes, me, suspended] = await Promise.all([
    ax ? ax.listings.list({ sort: { field: "rank_score", dir: "desc" }, limit: 50 }) : [],
    ax ? ax.stakes.list({ limit: 500 }) : [],
    userId ? getUserByClerkId(userId).catch(() => null) : null,
    suspendedUserIds().catch(() => new Set<string>()),
  ]);

  // Aggregate public stakes by backer: total invested + distinct ideas backed.
  // Suspended accounts (e.g. a de-duplicated old profile) are kept off the board.
  const agg = new Map<string, { id: string; name: string; invested: number; ideas: Set<string> }>();
  for (const s of stakes) {
    if (suspended.has(s.backer.id)) continue;
    const cur = agg.get(s.backer.id) ?? { id: s.backer.id, name: s.backer.label, invested: 0, ideas: new Set<string>() };
    cur.invested += s.amount;
    cur.ideas.add(s.listing.id);
    agg.set(s.backer.id, cur);
  }
  const board = [...agg.values()]
    .sort((a, b) => b.invested - a.invested)
    .map((p, i) => ({ ...p, rank: i + 1, backed: p.ideas.size }));

  const podium = board.length >= 3 ? [board[1], board[0], board[2]] : board.length === 2 ? [board[1], board[0]] : board.slice(0, 1);
  const rest = board.slice(3, 15);
  const meRow = me ? board.find((p) => p.id === me.id) : undefined;
  const topIdeas = listings.slice(0, 5);

  return (
    <div className="scrollarea">
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 28px 100px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div className="eyebrow" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent-text)", marginBottom: 10 }}>
            Hall of backers
          </div>
          <h1 style={{ fontSize: 42, letterSpacing: "-0.02em", margin: "0 0 10px" }}>
            The ones with a <span className="serif" style={{ fontStyle: "italic" }}>track record</span>
          </h1>
          <p className="muted" style={{ fontSize: 16, margin: 0 }}>
            Ranked by bucks invested backing ideas before they trended.
          </p>
        </div>

        {board.length === 0 ? (
          <Card style={{ padding: "40px 24px", textAlign: "center", marginBottom: 30 }}>
            <Icons.trophy size={26} style={{ color: "var(--accent-text)" }} />
            <div style={{ fontWeight: 600, fontSize: 15, margin: "10px 0 4px" }}>Nobody on the podium yet</div>
            <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>Back an idea on the stream and this page is yours.</p>
          </Card>
        ) : (
          <>
            {/* podium */}
            <div className="podium" style={{ display: "grid", gridTemplateColumns: podium.length === 3 ? "1fr 1.15fr 1fr" : `repeat(${podium.length}, 1fr)`, gap: 16, alignItems: "end", marginBottom: 30 }}>
              {podium.map((p) => {
                const first = p.rank === 1;
                return (
                  <Card
                    key={p.id}
                    style={{
                      textAlign: "center",
                      padding: "24px 18px",
                      height: first ? 200 : 168,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      border: first ? "1px solid color-mix(in srgb, var(--accent) 38%, var(--border))" : "1px solid var(--border)",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <Avatar label={initials(p.name)} kind="user" size={first ? 60 : 50} />
                      <span
                        className="mono"
                        style={{ position: "absolute", bottom: -6, right: -6, width: 24, height: 24, borderRadius: 999, background: first ? "var(--accent)" : "var(--surface-raised)", color: first ? "#fff" : "var(--text-secondary)", border: "2px solid var(--background)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}
                      >
                        {p.rank}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginTop: 6 }}>{p.name}</div>
                    <Bucks amount={p.invested} size={18} fontSize={16} style={{ color: "var(--accent-text)" }} />
                    <div className="faint" style={{ fontSize: 11.5 }}>{p.backed} backed</div>
                  </Card>
                );
              })}
            </div>

            {/* full list */}
            {(rest.length > 0 || meRow) && (
              <Card style={{ padding: 0, overflow: "hidden", marginBottom: 26 }}>
                {rest.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 22px", borderBottom: "1px solid var(--border)" }}>
                    <span className="mono" style={{ fontSize: 15, fontWeight: 600, color: "var(--text-muted)", width: 24 }}>{p.rank}</span>
                    <Avatar label={initials(p.name)} kind="user" size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14.5 }}>{p.name}</div>
                      <div className="faint" style={{ fontSize: 12 }}>{p.backed} ideas backed</div>
                    </div>
                    <Bucks amount={p.invested} size={18} fontSize={15} style={{ minWidth: 64, justifyContent: "flex-end" }} />
                  </div>
                ))}
                {meRow && (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 22px", background: "var(--accent-soft)" }}>
                    <span className="mono" style={{ fontSize: 15, fontWeight: 600, color: "var(--accent-text)", width: 24 }}>{meRow.rank}</span>
                    <Avatar label={initials(meRow.name)} kind="user" size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14.5 }}>
                        {meRow.name} <span className="faint" style={{ fontWeight: 400 }}>· you</span>
                      </div>
                      <div className="faint" style={{ fontSize: 12 }}>{meRow.backed} ideas backed</div>
                    </div>
                    <Bucks amount={meRow.invested} size={18} fontSize={15} style={{ minWidth: 64, justifyContent: "flex-end", color: "var(--accent-text)" }} />
                  </div>
                )}
              </Card>
            )}
          </>
        )}

        <div>
          <SectionLabel style={{ marginBottom: 12 }}>Most-backed ideas</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
            {topIdeas.map((idea, i) => (
              <Link key={idea.id} href={`/i/${idea.id}`}>
                <Card hover style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-text)" }}>#{i + 1}</span>
                    <Spark data={(idea.spark as number[] | undefined) ?? []} w={48} h={20} color="var(--accent)" id={`lb${i}`} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{idea.name}</div>
                  <Bucks amount={idea.rank_score} size={16} fontSize={14} style={{ color: "var(--accent-text)" }} />
                </Card>
              </Link>
            ))}
            {topIdeas.length === 0 && (
              <span className="faint" style={{ fontSize: 13, fontStyle: "italic" }}>Nothing on the stream yet.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
