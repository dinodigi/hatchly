import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DemandSignals from "@/components/DemandSignals";
import FeedbackBox from "@/components/FeedbackBox";
import InvestControl from "@/components/InvestControl";
import ReportButton from "@/components/ReportButton";
import { Icons } from "@/components/icons";
import { Bucks, Card, Pill, SectionLabel, Spark } from "@/components/ui";
import { getAgentX } from "@/lib/server";
import { callTool } from "@/lib/mcp";
import { AgentXError } from "@/lib/agentx";

interface PublicArtifact {
  id: string;
  data: {
    title: string;
    subtitle?: string;
    type: string;
    body?: { heading: string; paragraph?: string; list_heading?: string; list_items?: string[] }[];
  };
}

/* Public idea page — v4's IdeaPage (Design/app/idea.jsx), server-rendered. */

const COVERS: Record<string, string> = {
  meadow: "linear-gradient(120deg, #E7EDE0, #CFE0CB 55%, #B8D0BE)",
  linen: "linear-gradient(120deg, #F3ECDF, #E7D9C3 60%, #DCC9AC)",
  dusk: "linear-gradient(120deg, #E3E0EC, #D2CCE0 55%, #BFC2DC)",
  gold: "linear-gradient(120deg, #F6E6C4, #EDCF8E 55%, #DCA032)",
  slate: "linear-gradient(120deg, #E4E6E7, #CDD2D4 55%, #B4BBBD)",
};

const PRD_SECTIONS = [
  { key: "problem", label: "Problem" },
  { key: "who", label: "Who it's for" },
  { key: "value", label: "Core value" },
  { key: "features", label: "Features", list: true },
  { key: "open_questions", label: "Open questions", list: true },
] as const;

async function loadListing(id: string) {
  const ax = getAgentX();
  if (!ax) return null;
  try {
    return await ax.listings.get(id);
  } catch (e) {
    if (e instanceof AgentXError && (e.status === 404 || e.status === 422)) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await loadListing(id);
  if (!listing) return { title: "Idea not found — Hatchly" };
  return {
    title: `${listing.name} — Hatchly`,
    description: listing.one_liner,
    openGraph: { title: listing.name, description: listing.one_liner, type: "article" },
  };
}

function daysAgo(iso?: string) {
  if (!iso) return null;
  const d = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
  return d === 0 ? "today" : `${d}d ago`;
}

export default async function IdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await loadListing(id);
  if (!listing) notFound();

  // Artifacts the founder opted to publish. `listing.idea` isn't public, so
  // resolve the idea from the listing row server-side, then read its opted-in
  // documents. A failure here must not take the page down — the listing is
  // the point, the artifacts are a bonus.
  // NB: `id` is not a queryable field in `where` — single lookups go through
  // get_entry.
  const publicDocs = await callTool<{ data?: { idea?: { id: string } } }>("get_entry", {
    collection: "listings",
    id,
  })
    .then(async (r) => {
      const ideaId = r?.data?.idea?.id;
      if (!ideaId) return [] as PublicArtifact[];
      const docs = await callTool<{ entries: PublicArtifact[] }>("query_entries", {
        collection: "artifacts",
        where: [
          { field: "idea", op: "eq", value: ideaId },
          { field: "on_public_page", op: "eq", value: true },
        ],
        select: ["title", "subtitle", "body", "type"],
        limit: 10,
      });
      return docs.entries;
    })
    .catch(() => [] as PublicArtifact[]);

  const brief = (listing.brief_snapshot ?? {}) as Record<string, unknown>;
  const posted = daysAgo(listing.published_at);
  const spark = (listing.spark as number[] | undefined) ?? [];
  const founderFirst = listing.author.label.split(" ")[0] || "the founder";

  return (
    <div className="scrollarea">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 28px 100px" }}>
        <Link href="/" style={{ color: "var(--text-secondary)", fontSize: 13.5, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
          <Icons.back size={16} /> The stream
        </Link>

        <div
          className="cover-band"
          style={{
            background: listing.cover_image?.url
              ? `url(${listing.cover_image.url}) center/cover`
              : COVERS[listing.cover_preset ?? "linen"],
            borderRadius: 14,
            marginBottom: 20,
            height: 150,
          }}
        />

        <div className="idea-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 34, alignItems: "start" }}>
          {/* left: the idea + PRD */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <h1 className="serif" style={{ fontSize: 44, margin: 0, fontStyle: "italic", lineHeight: 1, fontWeight: 400 }}>
                {listing.name}
              </h1>
              {listing.category && <Pill>{listing.category}</Pill>}
              <span className="badge b-launch">On the stream</span>
            </div>
            <p style={{ fontSize: 18, lineHeight: 1.5, margin: "0 0 14px", maxWidth: 560 }}>{listing.one_liner}</p>
            {((listing.tags as string[] | undefined) ?? []).length > 0 && (
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
                {(listing.tags as string[]).map((t) => (
                  <span key={t} className="tag-pill">{t}</span>
                ))}
              </div>
            )}
            {listing.description && listing.description !== listing.one_liner && (
              <p className="muted" style={{ fontSize: 15, lineHeight: 1.6, margin: "0 0 18px", maxWidth: 560 }}>
                {listing.description}
              </p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 22, marginBottom: 24, borderBottom: "1px solid var(--border)" }}>
              <span className="muted" style={{ fontSize: 13.5 }}>by {listing.author.label}</span>
              {posted && <span className="faint" style={{ fontSize: 12.5 }}>· posted {posted}</span>}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
              <Icons.doc size={17} style={{ color: "var(--accent-text)" }} />
              <h2 style={{ fontSize: 18, margin: 0, letterSpacing: "-0.01em" }}>Product brief</h2>
              <span className="faint" style={{ fontSize: 12.5 }}>· shaped in chat, kept live</span>
            </div>
            <Card style={{ padding: "26px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {PRD_SECTIONS.map((sec) => {
                  const val = brief[sec.key];
                  const empty = "list" in sec && sec.list ? !((val as unknown[]) ?? []).length : !val;
                  return (
                    <div key={sec.key}>
                      <SectionLabel style={{ marginBottom: 8 }}>{sec.label}</SectionLabel>
                      {empty ? (
                        <p className="faint" style={{ fontSize: 14, margin: 0, fontStyle: "italic" }}>Not captured yet.</p>
                      ) : "list" in sec && sec.list ? (
                        <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                          {(val as string[]).map((it, i) => (
                            <li key={i} style={{ display: "flex", gap: 10, fontSize: 14.5, lineHeight: 1.5 }}>
                              <span style={{ color: sec.key === "open_questions" ? "var(--info-text)" : "var(--accent-text)", flex: "none", marginTop: 1 }}>
                                {sec.key === "open_questions" ? <Icons.search size={15} /> : <Icons.check size={15} />}
                              </span>
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{String(val)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Artifacts the founder chose to show. Read via MCP rather than
                the delivery API: the artifacts collection is owner-scoped, and
                on_public_page is the founder's explicit opt-in per document. */}
            {publicDocs.map((a) => (
              <Card key={a.id} style={{ padding: "26px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span className="file-glyph glyph-page"><Icons.doc size={15} /></span>
                  <h2 style={{ fontSize: 18, margin: 0, letterSpacing: "-0.01em" }}>{a.data.title}</h2>
                </div>
                {a.data.subtitle && (
                  <p className="muted" style={{ fontSize: 13.5, margin: "6px 0 0" }}>{a.data.subtitle}</p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
                  {(a.data.body ?? []).map((s, i) => (
                    <div key={i}>
                      <SectionLabel style={{ marginBottom: 8 }}>{s.heading}</SectionLabel>
                      {s.paragraph && (
                        <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>
                          {s.paragraph}
                        </p>
                      )}
                      {s.list_items?.length ? (
                        <ul style={{ margin: s.paragraph ? "12px 0 0" : 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                          {s.list_items.map((x, j) => (
                            <li key={j} style={{ display: "flex", gap: 10, fontSize: 14.5, lineHeight: 1.5 }}>
                              <span style={{ color: "var(--accent-text)", flex: "none", marginTop: 1 }}>
                                <Icons.check size={15} />
                              </span>
                              {x}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            <FeedbackBox listingId={listing.id} founderFirstName={founderFirst} />
          </div>

          {/* right: invest + signals */}
          <div style={{ position: "sticky", top: 86, display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ padding: 22, position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 4 }}>
                <Bucks amount={listing.bucks_total} size={30} fontSize={30} style={{ color: "var(--accent-text)" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--success-text)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Icons.trend size={15} /> +{listing.bucks_today} today
                </span>
              </div>
              <div className="faint" style={{ fontSize: 12.5, marginBottom: 16 }}>
                bucks invested · {listing.distinct_backers} backers
              </div>
              {spark.length > 1 && <Spark data={spark} w={290} h={44} color="var(--accent)" id="idea" />}
              <InvestControl listingId={listing.id} listingName={listing.name} />
              {listing.live_url && (
                <a href={listing.live_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: "100%", marginTop: 8 }}>
                  <span className="live-dot" /> Visit live app <Icons.ext size={14} />
                </a>
              )}
              <p className="faint" style={{ fontSize: 11, textAlign: "center", margin: "14px 0 0", lineHeight: 1.5 }}>
                Hatchly Bucks are play-money. Prestige, not equity.
              </p>
            </Card>

            <Card style={{ padding: 22 }}>
              <SectionLabel style={{ marginBottom: 16 }}>Community signal</SectionLabel>
              <DemandSignals listingId={listing.id} />
            </Card>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <ReportButton targetKind="listing" targetId={listing.id} label="Report this idea" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
