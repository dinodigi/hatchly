import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callTool } from "@/lib/mcp";
import { getUserByClerkId } from "@/lib/economy";
import { getAgentX } from "@/lib/server";

/* Quick idea comment thread. The board only ever showed `comment_count`, so the
   counter and the rows it counts have to move together — same transact shape as
   the vote route. */

/** GET /api/quick/comment?quickId= — the live thread, oldest first. */
export async function GET(req: Request) {
  const quickId = new URL(req.url).searchParams.get("quickId");
  if (!quickId) return NextResponse.json({ error: "quickId required" }, { status: 400 });

  // Read through the delivery API, not MCP. MCP is a trusted channel and does
  // not apply publicFilter, so an MCP read would have to re-state `status=live`
  // by hand and would silently start leaking hidden/removed comments the moment
  // that clause was edited away. Here the platform enforces it.
  const ax = getAgentX();
  if (!ax) return NextResponse.json({ comments: [] });

  const rows = await ax.quick_comments.list({
    filter: { quick_idea: quickId },
    sort: { field: "created_at", dir: "asc" },
    limit: 200,
  });

  return NextResponse.json({
    comments: rows.map((c) => ({
      id: c.id,
      text: c.text,
      author: c.author?.label ?? "Someone",
      created_at: c.created_at,
    })),
  });
}

/** POST /api/quick/comment { quickId, text } — add to the thread. */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { quickId?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.quickId) return NextResponse.json({ error: "quickId required" }, { status: 400 });

  const text = body.text?.trim();
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });
  if (text.length > 1000) return NextResponse.json({ error: "comment too long" }, { status: 422 });

  const user = await getUserByClerkId(userId);
  if (!user) return NextResponse.json({ error: "no profile" }, { status: 409 });

  await callTool("transact", {
    ops: [
      {
        op: "create",
        collection: "quick_comments",
        data: {
          quick_idea: body.quickId,
          author: user.id,
          author_id: userId,
          text,
          status: "live",
        },
      },
      { op: "update_if", collection: "quick_ideas", id: body.quickId, increment: { field: "comment_count", by: 1 } },
    ],
  });

  return NextResponse.json({ ok: true });
}
