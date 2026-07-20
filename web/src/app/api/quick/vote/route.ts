import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callTool, McpError } from "@/lib/mcp";

/** POST /api/quick/vote { quickId } — one upvote per person, DB-enforced. */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { quickId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.quickId) return NextResponse.json({ error: "quickId required" }, { status: 400 });

  try {
    // The unique vote_key makes double-voting impossible; the transact makes
    // vote-row + counter move together.
    await callTool("transact", {
      ops: [
        {
          op: "create",
          collection: "quick_votes",
          data: { voter_id: userId, quick_idea: body.quickId, vote_key: `${userId}_${body.quickId}` },
        },
        { op: "update_if", collection: "quick_ideas", id: body.quickId, increment: { field: "upvotes", by: 1 } },
      ],
    });
  } catch (e) {
    if (e instanceof McpError && /unique|conflict/i.test(e.message))
      return NextResponse.json({ error: "already voted", code: "E_VOTED" }, { status: 409 });
    throw e;
  }
  return NextResponse.json({ ok: true });
}
