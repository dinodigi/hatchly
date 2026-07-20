import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getAgentX } from "@/lib/server";

/* The preview card a Hatchly link unfurls into — in Slack, X, iMessage.
   This is the product's front door far more often than the site itself, so
   it uses the real brand tokens rather than a generic card.

   Satori (which powers ImageResponse) supports flexbox only — no grid — and
   every element needs an explicit `display`. Keep the layout simple. */

export const alt = "An idea on Hatchly";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Brand tokens, light theme (tokens.css). Inlined because Satori resolves no
   CSS variables. */
const BG = "#FAFAF8";
const SURFACE = "#F5F2EC";
const TEXT = "#1A1814";
const MUTED = "#6B6560";
const FAINT = "#A09890";
const ACCENT = "#DCA032";
const ACCENT_TEXT = "#B8820A";

/* Same cover presets as the stream, flattened to two stops — Satori's
   gradient support is narrower than the browser's. */
const COVERS: Record<string, string> = {
  meadow: "linear-gradient(140deg, #E7EDE0, #B8D0BE)",
  linen: "linear-gradient(140deg, #F3ECDF, #DCC9AC)",
  dusk: "linear-gradient(140deg, #E3E0EC, #BFC2DC)",
  gold: "linear-gradient(140deg, #F6E6C4, #DCA032)",
  slate: "linear-gradient(140deg, #E4E6E7, #B4BBBD)",
};

const fmt = (n: number) => n.toLocaleString("en-US");

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Both faces are vendored under web/assets so the card never depends on a
  // network fetch at render time. Satori uses the FIRST font as the fallback
  // for any text that doesn't name a family — so the sans must come first,
  // or the serif italic leaks into the body copy and stat row.
  const [sans, serif] = await Promise.all([
    readFile(join(process.cwd(), "assets", "Sans-SemiBold.ttf")).catch(() => null),
    readFile(join(process.cwd(), "assets", "InstrumentSerif-Italic.ttf")).catch(() => null),
  ]);

  let listing: {
    name: string;
    one_liner?: string;
    author: { label: string };
    bucks_total: number;
    distinct_backers: number;
    cover_preset?: string;
    cover_image?: { url: string };
    tags?: unknown[];
  } | null = null;
  try {
    const ax = getAgentX();
    listing = ax ? await ax.listings.get(id) : null;
  } catch {
    listing = null;
  }

  // An unresolvable id still has to produce a valid image — a broken unfurl
  // looks worse than a plain one.
  const name = listing?.name ?? "Hatchly";
  const oneLiner = listing?.one_liner ?? "Where ideas get backed before they get built.";
  const author = listing?.author?.label ?? "";
  const bucks = listing?.bucks_total ?? 0;
  const backers = listing?.distinct_backers ?? 0;
  const tags = ((listing?.tags as string[] | undefined) ?? []).slice(0, 3);
  const coverUrl = listing?.cover_image?.url ?? null;
  const cover = COVERS[listing?.cover_preset ?? "linen"] ?? COVERS.linen;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BG,
          color: TEXT,
        }}
      >
        {/* left: the idea */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 56px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* wordmark */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background: ACCENT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: 13, height: 17, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#fff", display: "flex" }} />
              </div>
              <div style={{ fontSize: 25, fontWeight: 600, letterSpacing: -0.4, display: "flex" }}>Hatchly</div>
              <div style={{ fontSize: 19, color: FAINT, display: "flex" }}>· on the stream</div>
            </div>

            <div
              style={{
                fontFamily: serif ? "Instrument Serif" : undefined,
                fontSize: 76,
                lineHeight: 1.04,
                letterSpacing: -1.5,
                display: "flex",
                marginBottom: 20,
              }}
            >
              {name.length > 42 ? name.slice(0, 42) + "…" : name}
            </div>

            <div style={{ fontSize: 29, lineHeight: 1.35, color: MUTED, display: "flex", maxWidth: 620 }}>
              {oneLiner.length > 128 ? oneLiner.slice(0, 128) + "…" : oneLiner}
            </div>

            {tags.length > 0 && (
              <div style={{ display: "flex", gap: 9, marginTop: 26 }}>
                {tags.map((t) => (
                  <div
                    key={t}
                    style={{
                      display: "flex",
                      padding: "7px 16px",
                      borderRadius: 999,
                      background: SURFACE,
                      color: MUTED,
                      fontSize: 19,
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* bottom stat row */}
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background: ACCENT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: 13, height: 17, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#fff", display: "flex" }} />
              </div>
              <div style={{ fontSize: 34, fontWeight: 700, color: ACCENT_TEXT, display: "flex" }}>{fmt(bucks)}</div>
            </div>
            <div style={{ fontSize: 23, color: FAINT, display: "flex" }}>
              {backers} {backers === 1 ? "backer" : "backers"}
            </div>
            {author && (
              <div style={{ fontSize: 23, color: FAINT, display: "flex" }}>· by {author}</div>
            )}
          </div>
        </div>

        {/* right: cover panel — the founder's upload if they have one, else the wash */}
        <div style={{ width: 380, display: "flex", position: "relative", background: cover }}>
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" width={380} height={630} style={{ objectFit: "cover" }} />
          )}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 1,
              background: "rgba(0,0,0,0.08)",
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(sans ? [{ name: "Inter", data: sans, style: "normal" as const, weight: 600 as const }] : []),
        ...(serif
          ? [{ name: "Instrument Serif", data: serif, style: "italic" as const, weight: 400 as const }]
          : []),
      ],
    },
  );
}
