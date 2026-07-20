import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callTool } from "@/lib/mcp";
import { getKeyRow } from "@/lib/keyvault";
import { getUserByClerkId } from "@/lib/economy";

/** POST /api/quick/clone { quickId } — "I'll build this": clones the quick idea
 *  into the caller's private workspace, seeded with an opening chat (v4). */
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

  const keyRow = await getKeyRow(userId);
  if (!keyRow?.data.active)
    return NextResponse.json(
      { error: "Add your API key to start creating ideas — the chat that shapes them runs on it.", code: "E_NO_KEY" },
      { status: 422 },
    );

  const user = await getUserByClerkId(userId);
  if (!user) return NextResponse.json({ error: "no profile" }, { status: 409 });

  const quick = await callTool<{ id: string; data: { title: string; description?: string; tag?: string; status: string } }>(
    "get_entry",
    { collection: "quick_ideas", id: body.quickId },
  );
  if (quick.data.status !== "live") return NextResponse.json({ error: "not available" }, { status: 422 });

  const name = quick.data.title.length > 40 ? quick.data.title.slice(0, 37) + "…" : quick.data.title;
  const idea = await callTool<{ id: string }>("create_entry", {
    collection: "ideas",
    data: {
      owner_id: userId,
      author: user.id,
      name,
      one_liner: quick.data.title,
      description: quick.data.description || undefined,
      stage: "ideation",
      visibility: "private",
      brief: { features: [], open_questions: [] },
      tags: quick.data.tag ? [quick.data.tag] : [],
      archived: false,
      from_quick_idea: body.quickId,
      last_activity_at: new Date().toISOString(),
    },
  });

  await callTool("transact", {
    ops: [
      { op: "update_if", collection: "quick_ideas", id: body.quickId, increment: { field: "cloned_count", by: 1 } },
      {
        op: "create",
        collection: "chats",
        ref: "chat",
        data: {
          owner_id: userId,
          idea: idea.id,
          title: "From a quick idea",
          last_message_at: new Date().toISOString(),
        },
      },
      {
        op: "create",
        collection: "messages",
        data: {
          owner_id: userId,
          chat: "$ref:chat",
          role: "assistant",
          content: `You cloned "${quick.data.title}". Nice pick. Let's turn it into something real — who feels this problem the most sharply?`,
          turn: 1,
        },
      },
      {
        op: "create",
        collection: "activity",
        data: { owner_id: userId, idea: idea.id, type: "clone", text: "Cloned from Quick Ideas" },
      },
    ],
  });

  return NextResponse.json({ id: idea.id });
}
