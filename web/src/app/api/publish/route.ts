import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callTool } from "@/lib/mcp";
import { getUserByClerkId } from "@/lib/economy";
import type { Brief } from "@/lib/agent";

/**
 * POST /api/publish { ideaId, visibility, coverPreset? }
 * Sets visibility; publishing to "public" creates/revives the stream listing
 * (v4: publish also sets stage to "public"; demoting reverts to "ideation").
 */

interface Entry<T> {
  id: string;
  data: T;
}
interface IdeaData {
  owner_id: string;
  name: string;
  one_liner?: string;
  description?: string;
  brief?: Brief;
  tags?: string[];
  cover_preset?: string;
  cover_image?: { id: string; url: string };
  live_url?: string;
  stage: string;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { ideaId?: string; visibility?: string; coverPreset?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.ideaId || !["private", "link", "public"].includes(body.visibility ?? ""))
    return NextResponse.json({ error: "ideaId and visibility required" }, { status: 400 });

  const idea = await callTool<Entry<IdeaData>>("get_entry", { collection: "ideas", id: body.ideaId });
  if (idea.data.owner_id !== userId)
    return NextResponse.json({ error: "not your idea" }, { status: 403 });

  const visibility = body.visibility as "private" | "link" | "public";
  const coverPreset = ["meadow", "linen", "dusk", "gold", "slate"].includes(body.coverPreset ?? "")
    ? body.coverPreset
    : idea.data.cover_preset;

  // Find an existing listing for this idea.
  const existing = await callTool<{ entries: Entry<{ status: string }>[] }>("query_entries", {
    collection: "listings",
    where: [{ field: "idea", op: "eq", value: body.ideaId }],
    limit: 1,
  });
  const listing = existing.entries[0] ?? null;

  const ops: unknown[] = [
    {
      op: "update",
      collection: "ideas",
      id: body.ideaId,
      data: {
        visibility,
        stage: visibility === "public" ? "public" : idea.data.stage === "public" ? "ideation" : idea.data.stage,
        ...(coverPreset ? { cover_preset: coverPreset } : {}),
        last_activity_at: new Date().toISOString(),
      },
    },
  ];

  if (visibility === "public") {
    const user = await getUserByClerkId(userId);
    if (!user) return NextResponse.json({ error: "no profile" }, { status: 409 });
    const brief = idea.data.brief ?? {};
    const snapshot = {
      problem: brief.problem ?? "",
      who: brief.who ?? "",
      value: brief.value ?? "",
      features: brief.features ?? [],
      open_questions: brief.open_questions ?? [],
    };
    if (listing) {
      ops.push({
        op: "update",
        collection: "listings",
        id: listing.id,
        data: {
          status: "live",
          name: idea.data.name,
          one_liner: idea.data.one_liner,
          description: idea.data.description,
          brief_snapshot: snapshot,
          tags: idea.data.tags ?? [],
          ...(coverPreset ? { cover_preset: coverPreset } : {}),
          // Carry the uploaded cover through, or the stream and the link
          // preview keep showing the old gradient after an upload.
          cover_image: idea.data.cover_image?.id ?? null,
          ...(idea.data.live_url ? { live_url: idea.data.live_url } : {}),
        },
      });
    } else {
      ops.push({
        op: "create",
        collection: "listings",
        data: {
          idea: body.ideaId,
          owner_id: userId,
          author: user.id,
          name: idea.data.name,
          one_liner: idea.data.one_liner,
          description: idea.data.description,
          category: "Founder tools",
          tags: idea.data.tags ?? [],
          cover_preset: coverPreset ?? "linen",
          ...(idea.data.cover_image?.id ? { cover_image: idea.data.cover_image.id } : {}),
          brief_snapshot: snapshot,
          bucks_total: 0,
          bucks_window: 0,
          bucks_today: 0,
          backers_count: 0,
          distinct_backers: 0,
          rank_score: 0,
          spark: [0, 0, 0, 0, 0, 0, 0],
          status: "live",
          published_at: new Date().toISOString(),
        },
      });
    }
    ops.push({
      op: "create",
      collection: "activity",
      data: { owner_id: userId, idea: body.ideaId, type: "publish", text: "Published to the stream" },
    });
  } else if (listing) {
    // Demoting from public hides the listing (recoverable).
    ops.push({ op: "update", collection: "listings", id: listing.id, data: { status: "hidden" } });
  }

  await callTool("transact", { ops });
  return NextResponse.json({ ok: true, visibility });
}
