import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callTool } from "@/lib/mcp";
import { getUserByClerkId } from "@/lib/economy";

/** POST /api/feedback { listingId, text } — a note straight to the founder. */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { listingId?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const text = body.text?.trim();
  if (!body.listingId || !text) return NextResponse.json({ error: "listingId and text required" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "too long" }, { status: 422 });

  const listing = await callTool<{ id: string; data: { owner_id: string; status: string } }>("get_entry", {
    collection: "listings",
    id: body.listingId,
  });
  if (listing.data.status !== "live")
    return NextResponse.json({ error: "listing is not live" }, { status: 422 });

  const user = await getUserByClerkId(userId);
  await callTool("create_entry", {
    collection: "feedback",
    data: {
      owner_id: listing.data.owner_id, // the FOUNDER owns their inbox
      listing: body.listingId,
      ...(user ? { author: user.id } : {}),
      author_id: userId,
      text,
      status: "live",
    },
  });
  return NextResponse.json({ ok: true });
}
