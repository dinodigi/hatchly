import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callTool, McpError } from "@/lib/mcp";
import { getUserByClerkId } from "@/lib/economy";

/** POST /api/quick { title, description?, tag? } — post a quick idea.
 *  v4 rule: one post per day. */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { title?: string; description?: string; tag?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const title = body.title?.trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  if (title.length > 200) return NextResponse.json({ error: "title too long" }, { status: 422 });

  // One per day (UTC).
  const dayStart = new Date().toISOString().slice(0, 10) + "T00:00:00Z";
  const today = await callTool<{ entries: { id: string }[] }>("query_entries", {
    collection: "quick_ideas",
    where: [
      { field: "author_id", op: "eq", value: userId },
      { field: "created_at", op: "gt", value: dayStart },
    ],
    limit: 1,
  });
  if (today.entries.length)
    return NextResponse.json({ error: "That's your idea for today — come back tomorrow.", code: "E_DAILY" }, { status: 429 });

  const user = await getUserByClerkId(userId);
  if (!user) return NextResponse.json({ error: "no profile" }, { status: 409 });

  const created = await callTool<{ id: string }>("create_entry", {
    collection: "quick_ideas",
    data: {
      author: user.id,
      author_id: userId,
      title,
      description: body.description?.trim().slice(0, 1000) ?? "",
      tag: body.tag?.trim().slice(0, 40) ?? "",
      upvotes: 0,
      comment_count: 0,
      cloned_count: 0,
      status: "live",
    },
  });
  return NextResponse.json({ id: created.id });
}
