import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callTool } from "@/lib/mcp";

/**
 * Cover art for an idea.
 *
 *   PATCH  { ideaId, preset }  — pick one of the five gradient washes
 *   POST   multipart(ideaId, file) — upload your own image
 *
 * Uploads go through the MCP `upload_asset` tool (R2), then the returned asset
 * id is stored on the idea. Both paths verify ownership first: cover art is a
 * write to someone's idea, so the id in the body is never trusted.
 */

const PRESETS = ["meadow", "linen", "dusk", "gold", "slate"];
const TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

interface IdeaRow {
  id: string;
  data: { owner_id: string; name: string };
}

async function ownedIdea(ideaId: string, userId: string): Promise<IdeaRow | null> {
  try {
    const idea = await callTool<IdeaRow>("get_entry", { collection: "ideas", id: ideaId });
    return idea.data.owner_id === userId ? idea : null;
  } catch {
    return null;
  }
}

/** Keep the public listing in step, so a cover change shows on the stream. */
async function syncListing(ideaId: string, data: Record<string, unknown>) {
  const listings = await callTool<{ entries: { id: string }[] }>("query_entries", {
    collection: "listings",
    where: [{ field: "idea", op: "eq", value: ideaId }],
    limit: 1,
  });
  const listing = listings.entries[0];
  if (listing) await callTool("update_entry", { collection: "listings", id: listing.id, data });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { ideaId?: string; preset?: string };
  if (!body.ideaId || !PRESETS.includes(body.preset ?? ""))
    return NextResponse.json({ error: "ideaId and a valid preset required" }, { status: 400 });

  const idea = await ownedIdea(body.ideaId, userId);
  if (!idea) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Choosing a wash clears any uploaded image — otherwise the image would
  // silently win and the swatch would look broken.
  await callTool("update_entry", {
    collection: "ideas",
    id: idea.id,
    data: { cover_preset: body.preset, cover_image: null },
  });
  await syncListing(idea.id, { cover_preset: body.preset, cover_image: null });

  return NextResponse.json({ ok: true, preset: body.preset });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "expected multipart/form-data" }, { status: 400 });
  }

  const ideaId = String(form.get("ideaId") ?? "");
  const file = form.get("file");
  if (!ideaId || !(file instanceof File))
    return NextResponse.json({ error: "ideaId and file required" }, { status: 400 });
  if (!TYPES.includes(file.type))
    return NextResponse.json({ error: "use a PNG, JPEG, WEBP or GIF" }, { status: 415 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "image must be under 5MB" }, { status: 413 });

  const idea = await ownedIdea(ideaId, userId);
  if (!idea) return NextResponse.json({ error: "not found" }, { status: 404 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const asset = await callTool<{ id: string; url: string }>("upload_asset", {
    filename: file.name || "cover",
    contentType: file.type,
    dataBase64: bytes.toString("base64"),
  });

  await callTool("update_entry", {
    collection: "ideas",
    id: idea.id,
    data: { cover_image: asset.id },
  });
  await syncListing(idea.id, { cover_image: asset.id });

  return NextResponse.json({ ok: true, id: asset.id, url: asset.url });
}
