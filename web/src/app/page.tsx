import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ComposeBar from "@/components/ComposeBar";
import InvestControl from "@/components/InvestControl";
import SpotlightControl, { SpotlightTimer } from "@/components/SpotlightControl";
import { Icons } from "@/components/icons";
import { Avatar, Bucks, Card, Coin, Pill, Spark } from "@/components/ui";
import { clerkEnabled } from "@/lib/clerk";
import { SPOTLIGHT_MIN_BID, getSpotlight, getUserByClerkId, suspendedUserIds } from "@/lib/economy";
import { getAgentX } from "@/lib/server";
import type { Listings } from "@/lib/agentx";

/* The stream — v4's homepage, ported from Design/app/stream.jsx. Public,
   server-rendered; Back buttons open the InvestModal in place. */

const COVERS: Record<string, string> = {
  meadow: "linear-gradient(120deg, #E7EDE0, #CFE0CB 55%, #B8D0BE)",
  linen: "linear-gradient(120deg, #F3ECDF, #E7D9C3 60%, #DCC9AC)",
  dusk: "linear-gradient(120deg, #E3E0EC, #D2CCE0 55%, #BFC2DC)",
  gold: "linear-gradient(120deg, #F6E6C4, #EDCF8E 55%, #DCA032)",
  slate: "linear-gradient(120deg, #E4E6E7, #CDD2D4 55%, #B4BBBD)",
};

/** An uploaded cover wins over the gradient wash. */
const cover = (l: Pick<Listings, "cover_preset" | "cover_image">) =>
  l.cover_image?.url
    ? { background: `url(${l.cover_image.url}) center/cover` }
    : { background: COVERS[(l.cover_preset as string) ?? "linen"] ?? COVERS.linen };

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function AuthorChip({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-secondary)" }}>
      <Avatar label={initials(name)} kind="user" size={size} /> {name}
    </span>
  );
}

function TagPills({ tags, max = 3 }: { tags?: string[]; max?: number }) {
  if (!tags?.length) return null;
  return (
    <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
      {tags.slice(0, max).map((t) => <span key={t} className="tag-pill">{t}</span>)}
    </span>
  );
}

function SetupNotice() {
  return (
    <main style={{ maxWidth: 560, margin: "80px auto", padding: 24 }}>
      <Card style={{ padding: 28 }}>
        <div className="serif" style={{ fontSize: 28, marginBottom: 10 }}>One key to go.</div>
        <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
          The stream reads live data from Pluggie, and this deployment has no{" "}
          <span className="kbd">AGENTX_DELIVERY_TOKEN</span> yet. Mint a <strong>delivery-scoped</strong>{" "}
          token in the Pluggie admin (Settings → Tokens), put it in <span className="kbd">web/.env.local</span>,
          and restart the dev server.
        </p>
      </Card>
    </main>
  );
}

/* big featured idea — the auctioned spotlight slot (v4 Spotlight).
   The header carries the two facts that make the mechanic legible: who holds
   the feature right now, and how long is left to bid for the next one. */
function SpotlightCard({
  idea,
  holderName,
  amount,
  featured,
  auction,
}: {
  idea: Listings;
  holderName: string;
  amount: number;
  featured: boolean;
  auction: {
    auctionEndsAt: string | null;
    auctionOpen: boolean;
    highBid: number;
    highBidder: string | null;
    highListing: string | null;
    minNextBid: number;
  };
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 26, border: "1px solid color-mix(in srgb, var(--accent) 34%, var(--border))" }}>
      <div style={{ position: "relative", height: 128, ...cover(idea) }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.06), transparent 60%)" }} />
        <div style={{ position: "absolute", top: 13, left: 16, display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, background: "color-mix(in srgb, var(--background) 82%, transparent)", backdropFilter: "blur(6px)", border: "1px solid var(--border)" }}>
          <Icons.flame size={14} style={{ color: "var(--accent-text)" }} />
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-text)" }}>
            {featured ? "Featured spotlight" : "Top today"}
          </span>
        </div>
        <div style={{ position: "absolute", top: 13, right: 16, display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "color-mix(in srgb, var(--background) 82%, transparent)", backdropFilter: "blur(6px)", border: "1px solid var(--border)" }}>
          {featured ? (
            <>
              <span className="faint" style={{ fontSize: 11.5 }}>Held by {holderName}</span>
              <span style={{ width: 1, height: 12, background: "var(--border-strong)" }} />
              <Bucks amount={amount} size={15} fontSize={13} style={{ color: "var(--accent-text)" }} />
            </>
          ) : (
            <span className="faint" style={{ fontSize: 11.5 }}>Nobody holds the spotlight yet</span>
          )}
        </div>
        {/* the auction clock — the thing that was missing */}
        {auction.auctionOpen && (
          <div style={{ position: "absolute", bottom: 13, right: 16, display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "color-mix(in srgb, var(--background) 88%, transparent)", backdropFilter: "blur(6px)", border: "1px solid color-mix(in srgb, var(--accent) 40%, var(--border))" }}>
            <Icons.clock size={13} style={{ color: "var(--accent-text)" }} />
            <span className="faint" style={{ fontSize: 11.5 }}>Bidding closes in</span>
            <SpotlightTimer endsAt={auction.auctionEndsAt} />
          </div>
        )}
      </div>
      <div className="spot-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr" }}>
        <Link href={`/i/${idea.id}`} style={{ padding: "22px 28px", cursor: "pointer", display: "block" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <h2 className="serif" style={{ fontSize: 32, margin: 0, fontStyle: "italic", fontWeight: 400 }}>{idea.name}</h2>
            {(idea.tags as string[] | undefined)?.[0] && (
              <Pill><span className="dot" style={{ width: 7, height: 7, background: "var(--accent)" }} /> {(idea.tags as string[])[0]}</Pill>
            )}
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.5, margin: "0 0 12px", color: "var(--text-primary)", maxWidth: 440 }}>{idea.one_liner}</p>
          <TagPills tags={idea.tags as string[] | undefined} />
          <div style={{ marginTop: 16 }}><AuthorChip name={idea.author.label} size={22} /></div>
        </Link>
        <div style={{ padding: "22px 26px", borderLeft: "1px solid var(--border)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
          <div>
            <Bucks amount={idea.bucks_total} size={26} fontSize={28} />
            <div className="faint" style={{ fontSize: 12, marginTop: 3 }}>{idea.distinct_backers} backers · +{idea.bucks_today} today</div>
          </div>
          <InvestControl listingId={idea.id} listingName={idea.name} variant="lg" />
          {auction.highBid > 0 && (
            <div className="faint" style={{ fontSize: 11.5, textAlign: "center", marginTop: -6 }}>
              Next spotlight: <b style={{ color: "var(--accent-text)" }}>{auction.highBid}</b> leads
              {auction.highBidder ? ` · ${auction.highBidder}` : ""}
            </div>
          )}
          <SpotlightControl initial={auction} />
        </div>
      </div>
    </div>
  );
}

function FeedCard({ idea, rank, yours }: { idea: Listings; rank: number; yours: boolean }) {
  return (
    <div className="card card-hover feed-card" style={{ display: "flex", alignItems: "stretch", gap: 0, padding: 0, overflow: "hidden" }}>
      <div style={{ position: "relative", width: 74, flex: "none", ...cover(idea) }}>
        <span className="mono" style={{ position: "absolute", top: 8, left: 8, fontSize: 11, fontWeight: 700, color: "#fff", background: "rgba(0,0,0,0.42)", borderRadius: 6, padding: "1px 7px" }}>{rank}</span>
      </div>
      <Link href={`/i/${idea.id}`} style={{ flex: 1, padding: "15px 18px", cursor: "pointer", minWidth: 0, display: "block" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{idea.name}</span>
          <TagPills tags={idea.tags as string[] | undefined} max={2} />
          {yours && <span className="badge b-idea" style={{ fontSize: 9.5 }}>Yours</span>}
        </div>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.45, margin: "0 0 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{idea.one_liner}</p>
        <AuthorChip name={idea.author.label} />
      </Link>
      <div className="feed-stats" style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 20px", flex: "none" }}>
        <div style={{ textAlign: "right" }}>
          <Bucks amount={idea.bucks_total} size={17} fontSize={15} style={{ justifyContent: "flex-end" }} />
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--success-text)", marginTop: 3, display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
            <Icons.trend size={12} /> +{idea.bucks_today}
          </div>
        </div>
        <Spark data={(idea.spark as number[] | undefined) ?? []} w={56} h={26} color="var(--accent)" id={`s${rank}`} />
        <InvestControl listingId={idea.id} listingName={idea.name} variant="soft" />
      </div>
    </div>
  );
}

/* right rail: movers + top backers teaser (v4 StreamRail) */
function StreamRail({
  movers,
  backers,
}: {
  movers: Listings[];
  backers: { id: string; label: string; total: number }[];
}) {
  return (
    <div style={{ position: "sticky", top: 86, display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
          <Icons.flame size={16} style={{ color: "var(--accent-text)" }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Biggest movers</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {movers.map((m) => (
            <Link key={m.id} href={`/i/${m.id}`} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.name}</div>
                <div className="faint" style={{ fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {(m.tags as string[] | undefined)?.[0] ?? m.author.label}
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--success-text)", display: "flex", alignItems: "center", gap: 3 }}>
                <Icons.trend size={12} /> +{m.bucks_today}
              </span>
            </Link>
          ))}
        </div>
      </Card>
      <Card style={{ padding: 18, background: "var(--surface)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
          <Icons.trophy size={16} style={{ color: "var(--accent-text)" }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Top backers</span>
        </div>
        <p className="muted" style={{ fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>
          Back winners early and climb. Prestige — never real money.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {backers.length === 0 && <span className="faint" style={{ fontSize: 12.5, fontStyle: "italic" }}>No backers yet — be the first.</span>}
          {backers.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-text)", width: 14 }}>{i + 1}</span>
              <Avatar label={initials(p.label)} kind="user" size={24} />
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{p.label}</span>
              <span className="mono faint" style={{ fontSize: 12 }}>{p.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <Link href="/leaderboard" style={{ color: "var(--accent-text)", fontSize: 13, fontWeight: 600, marginTop: 12, padding: 0, display: "flex", alignItems: "center", gap: 5 }}>
          Full leaderboard <Icons.arrowR size={14} />
        </Link>
      </Card>
    </div>
  );
}

export default async function StreamPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const sp = await searchParams;
  const sort = sp.sort === "trending" ? "trending" : sp.sort === "new" ? "new" : "top";

  const ax = getAgentX();
  if (!ax) return <SetupNotice />;

  const { userId } = clerkEnabled ? await auth() : { userId: null };
  // getSpotlight() also settles an expired auction — the stream is the busiest
  // read in the app, so it's the natural place for lazy settlement to happen.
  const [listings, spotlight, stakes, me, user, suspended] = await Promise.all([
    ax.listings.list({ sort: { field: "bucks_today", dir: "desc" }, limit: 50 }),
    getSpotlight().catch(() => null),
    ax.stakes.list({ sort: { field: "amount", dir: "desc" }, limit: 200 }),
    userId ? getUserByClerkId(userId).catch(() => null) : null,
    userId ? currentUser() : null,
    suspendedUserIds().catch(() => new Set<string>()),
  ]);

  const loggedIn = !!userId;
  const myInitials = user
    ? initials([user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "You")
    : "Y";

  const auction = {
    auctionEndsAt: spotlight?.auctionEndsAt ?? null,
    auctionOpen: spotlight?.auctionOpen ?? false,
    highBid: spotlight?.highBid ?? 0,
    highBidder: spotlight?.highBidder?.label ?? null,
    highListing: spotlight?.highListing?.label ?? null,
    minNextBid: spotlight?.minNextBid ?? SPOTLIGHT_MIN_BID,
  };
  const spotlightFeatured = spotlight?.featured ?? false;
  // The card always shows: the featured holder if there is one, else today's top idea.
  const spotIdea: Listings | undefined =
    (spotlightFeatured && spotlight?.listing && listings.find((l) => l.id === spotlight.listing!.id)) ||
    [...listings].sort((a, b) => b.bucks_today - a.bucks_today)[0];

  let feed = listings.filter((l) => l.id !== spotIdea?.id);
  if (sort === "trending") feed = [...feed].sort((a, b) => b.bucks_today / (b.bucks_total || 1) - a.bucks_today / (a.bucks_total || 1));
  if (sort === "new") feed = [...feed].sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));

  const movers = [...listings].sort((a, b) => b.bucks_today / (b.bucks_total || 1) - a.bucks_today / (a.bucks_total || 1)).slice(0, 4);

  // Top backers — aggregate public stakes by backer, minus suspended accounts.
  const byBacker = new Map<string, { id: string; label: string; total: number }>();
  for (const s of stakes) {
    if (suspended.has(s.backer.id)) continue;
    const cur = byBacker.get(s.backer.id) ?? { id: s.backer.id, label: s.backer.label, total: 0 };
    cur.total += s.amount;
    byBacker.set(s.backer.id, cur);
  }
  const backers = [...byBacker.values()].sort((a, b) => b.total - a.total).slice(0, 3);

  const SORT_TABS = [
    ["top", "Top today", Icons.flame, "/"],
    ["trending", "Trending", Icons.trend, "/?sort=trending"],
    ["new", "New", Icons.sparkle, "/?sort=new"],
  ] as const;

  return (
    <div className="scrollarea">
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "30px 28px 100px" }}>
        <div className="stream-grid" style={{ display: "grid", gridTemplateColumns: "1fr 308px", gap: 34, alignItems: "start" }}>
          <div style={{ minWidth: 0 }}>
            {!loggedIn ? (
              <div style={{ marginBottom: 24 }}>
                <div className="eyebrow" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent-text)", marginBottom: 10 }}>
                  The idea stream
                </div>
                <h1 style={{ fontSize: 38, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 12px", maxWidth: 560 }}>
                  Where ideas get <span className="serif" style={{ fontStyle: "italic" }}>backed</span> before they get built.
                </h1>
                <p className="muted" style={{ fontSize: 16, margin: 0, maxWidth: 520 }}>
                  Browse what founders are shaping right now. Back the ones you believe in with Hatchly Bucks — no account needed to look.
                </p>
              </div>
            ) : (
              <h1 style={{ fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 18px" }}>The stream</h1>
            )}

            <ComposeBar initials={myInitials} />

            {spotIdea && (
              <SpotlightCard
                idea={spotIdea}
                holderName={spotlight?.holder?.label ?? "—"}
                amount={spotlight?.amount ?? 0}
                featured={spotlightFeatured}
                auction={auction}
              />
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {SORT_TABS.map(([k, label, I, href]) => (
                  <Link
                    key={k}
                    href={href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 500,
                      border: "1px solid " + (sort === k ? "transparent" : "var(--border)"),
                      background: sort === k ? "var(--text-primary)" : "var(--surface-raised)",
                      color: sort === k ? "var(--background)" : "var(--text-secondary)",
                    }}
                  >
                    <I size={15} /> {label}
                  </Link>
                ))}
              </div>
              <span className="faint" style={{ fontSize: 12.5 }}>{listings.length} ideas live</span>
            </div>

            {feed.length === 0 && (
              <Card style={{ padding: "26px 24px", textAlign: "center" }}>
                <Coin size={26} style={{ margin: "0 auto 10px" }} />
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>The stream is warming up</div>
                <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>Publish an idea and it lands here for backers to find.</p>
              </Card>
            )}
            <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {feed.map((l, i) => (
                <FeedCard key={l.id} idea={l} rank={i + 2} yours={!!me && l.author.id === me.id} />
              ))}
            </div>
          </div>

          <StreamRail movers={movers} backers={backers} />
        </div>
      </div>
    </div>
  );
}
