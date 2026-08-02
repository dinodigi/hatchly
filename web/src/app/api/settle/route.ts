import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callTool } from "@/lib/mcp";

/**
 * POST /api/settle { ideaId, chatId, intentKey, answer }
 *
 * The decision-prompt write path (BL-67 tier 1): the hub asks the one thing
 * still unsettled, the founder answers in their own words, and the answer lands
 * in memory tagged with the arc intent it resolves — the same anchoring the
 * chat pipeline does, so coverage moves and the chat won't re-ask.
 *
 * No model call: the question comes from the chat's own arc, the answer is the
 * founder's text. Nothing is invented.
 */

interface Entry<T> {
  id: string;
  data: T;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { ideaId?: string; chatId?: string; intentKey?: string; answer?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const answer = body.answer?.trim();
  if (!body.ideaId || !body.chatId || !body.intentKey || !answer)
    return NextResponse.json({ error: "ideaId, chatId, intentKey and answer required" }, { status: 400 });
  if (answer.length > 500) return NextResponse.json({ error: "keep it under 500 characters" }, { status: 422 });

  // Ownership — MCP reads bypass delivery ACLs, so check both rows.
  const [idea, chat] = await Promise.all([
    callTool<Entry<{ owner_id: string }>>("get_entry", { collection: "ideas", id: body.ideaId }).catch(() => null),
    callTool<Entry<{ owner_id: string; idea?: { id: string }; template_key?: string; title?: string }>>("get_entry", {
      collection: "chats",
      id: body.chatId,
    }).catch(() => null),
  ]);
  if (!idea || idea.data.owner_id !== userId) return NextResponse.json({ error: "not your idea" }, { status: 403 });
  if (!chat || chat.data.owner_id !== userId) return NextResponse.json({ error: "not your chat" }, { status: 403 });

  // The intent must really belong to this chat's arc — no writing arbitrary keys.
  const tpl = await callTool<{ entries: Entry<{ signal_topic?: string; question_arc?: string }>[] }>("query_entries", {
    collection: "chat_templates",
    where: [{ field: "key", op: "eq", value: chat.data.template_key ?? "" }],
    select: ["signal_topic", "question_arc"],
    limit: 1,
  }).catch(() => null);
  const t = tpl?.entries[0]?.data;
  let arc: { key: string; intent: string }[] = [];
  try {
    arc = JSON.parse(t?.question_arc || "[]");
  } catch {
    arc = [];
  }
  const intent = arc.find((a) => a?.key === body.intentKey);
  if (!intent) return NextResponse.json({ error: "unknown intent for this chat" }, { status: 400 });

  try {
    await callTool("transact", {
      ops: [
        {
          op: "create",
          collection: "memories",
          data: {
            owner_id: userId,
            idea: body.ideaId,
            chat: body.chatId,
            content: answer.slice(0, 500),
            verbatim: answer.slice(0, 2000),
            topic: t?.signal_topic ?? "other",
            kind: "decision",
            intent_key: body.intentKey,
            entities: [],
            source_type: "chat",
            source_label: "settled from the hub",
            superseded: false,
          },
        },
        {
          op: "create",
          collection: "activity",
          data: {
            owner_id: userId,
            idea: body.ideaId,
            type: "memory",
            text: `Settled — ${intent.intent}`.slice(0, 200),
          },
        },
        { op: "update", collection: "ideas", id: body.ideaId, data: { last_activity_at: new Date().toISOString() } },
      ],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "couldn't save that — try again?" }, { status: 502 });
  }
}
