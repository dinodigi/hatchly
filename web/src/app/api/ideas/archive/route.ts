import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callTool } from "@/lib/mcp";

/** POST /api/ideas/archive { id, archived } — archive or restore an idea.
 *  Owner only. Archiving is reversible: nothing is deleted, the idea just drops
 *  out of the default dashboard list. */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { id?: string; archived?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.id || typeof body.archived !== "boolean") {
    return NextResponse.json({ error: "id and archived required" }, { status: 400 });
  }

  // MCP reads bypass delivery ACLs — enforce ownership here.
  const idea = await callTool<{ id: string; data: { owner_id: string } }>("get_entry", {
    collection: "ideas",
    id: body.id,
  }).catch(() => null);
  if (!idea) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (idea.data.owner_id !== userId) return NextResponse.json({ error: "not your idea" }, { status: 403 });

  try {
    await callTool("update_entry", {
      collection: "ideas",
      id: body.id,
      data: { archived: body.archived },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}
