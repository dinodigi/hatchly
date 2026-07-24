import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { briefGate, runAgentTurn, type Brief } from "@/lib/agent";
import { bumpUsage, resolveKey } from "@/lib/keyvault";
import { callTool } from "@/lib/mcp";

/**
 * POST /api/chat { ideaId, chatId?, message }
 * One agent turn: reply + memory extraction + brief updates, all persisted.
 */

interface Entry<T> {
  id: string;
  data: T;
}
interface IdeaData {
  owner_id: string;
  name: string;
  one_liner?: string;
  brief?: Brief;
}
interface MessageData {
  role: "user" | "assistant";
  content: string;
  turn: number;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { ideaId?: string; chatId?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const message = body.message?.trim();
  if (!body.ideaId || !message)
    return NextResponse.json({ error: "ideaId and message required" }, { status: 400 });
  if (message.length > 4000)
    return NextResponse.json({ error: "message too long" }, { status: 422 });

  const apiKey = await resolveKey(userId);
  if (!apiKey)
    return NextResponse.json(
      { error: "no API key connected", code: "E_NO_KEY" },
      { status: 422 },
    );

  // Load the idea (and enforce ownership — MCP reads bypass delivery ACLs).
  const idea = await callTool<Entry<IdeaData>>("get_entry", {
    collection: "ideas",
    id: body.ideaId,
  });
  if (idea.data.owner_id !== userId)
    return NextResponse.json({ error: "not your idea" }, { status: 403 });

  // Resolve or create the chat.
  let chatId = body.chatId ?? null;
  let chatFocus: string | undefined;
  if (chatId) {
    const chat = await callTool<Entry<{ owner_id: string; template_key?: string }>>("get_entry", {
      collection: "chats",
      id: chatId,
    });
    if (chat.data.owner_id !== userId)
      return NextResponse.json({ error: "not your chat" }, { status: 403 });
    // A pre-made chat carries a template — its system prompt focuses the agent.
    if (chat.data.template_key) {
      const tpl = await callTool<{ entries: Entry<{ name: string; system_prompt: string }>[] }>("query_entries", {
        collection: "chat_templates",
        where: [{ field: "key", op: "eq", value: chat.data.template_key }],
        select: ["name", "system_prompt"],
        limit: 1,
      }).catch(() => null);
      const t = tpl?.entries[0]?.data;
      if (t) chatFocus = `${t.name} — ${t.system_prompt}`;
    }
  } else {
    const created = await callTool<{ id: string }>("create_entry", {
      collection: "chats",
      data: {
        owner_id: userId,
        idea: body.ideaId,
        title: message.length > 48 ? message.slice(0, 45) + "…" : message,
        last_message_at: new Date().toISOString(),
      },
    });
    chatId = created.id;
  }

  // History + existing memories.
  const [historyRes, memoriesRes] = await Promise.all([
    callTool<{ entries: Entry<MessageData>[] }>("query_entries", {
      collection: "messages",
      where: [{ field: "chat", op: "eq", value: chatId }],
      orderBy: { field: "turn", dir: "asc" },
      select: ["role", "content", "turn"],
      limit: 40,
    }),
    callTool<{ entries: Entry<{ content: string; topic?: string }>[] }>("query_entries", {
      collection: "memories",
      where: [
        { field: "idea", op: "eq", value: body.ideaId },
        { field: "superseded", op: "ne", value: true },
      ],
      select: ["content", "topic"],
      limit: 100,
    }),
  ]);
  const history = historyRes.entries.map((e) => ({ role: e.data.role, content: e.data.content }));
  const nextTurn = (historyRes.entries.at(-1)?.data.turn ?? 0) + 1;
  const brief: Brief = idea.data.brief ?? {};

  // The agent turn (BYOK — errors from Anthropic surface as chat-level messages).
  let result;
  try {
    result = await runAgentTurn({
      apiKey,
      ideaName: idea.data.name,
      oneLiner: idea.data.one_liner,
      brief,
      memories: memoriesRes.entries.map((e) => ({ content: e.data.content, topic: e.data.topic })),
      history,
      userMessage: message,
      chatFocus,
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError)
      return NextResponse.json({ error: "your API key was rejected — reconnect it in settings", code: "E_KEY_INVALID" }, { status: 422 });
    if (e instanceof Anthropic.RateLimitError)
      return NextResponse.json({ error: "your Anthropic account is rate-limited — try again shortly" }, { status: 429 });
    if (e instanceof Anthropic.APIError)
      return NextResponse.json({ error: `model error: ${e.message}` }, { status: 502 });
    throw e;
  }

  // Apply brief updates.
  const newBrief: Brief = {
    ...brief,
    features: [...(brief.features ?? [])],
    open_questions: [...(brief.open_questions ?? [])],
  };
  const traces: string[] = [];
  for (const u of result.brief_updates) {
    if ((u.section === "problem" || u.section === "who" || u.section === "value") && u.value?.trim()) {
      newBrief[u.section] = u.value.trim();
      traces.push(`updated brief · ${u.section === "who" ? "who it's for" : u.section === "value" ? "core value" : "problem"}`);
    } else if (u.section === "open_questions" && u.resolve_item?.trim()) {
      const needle = u.resolve_item.trim().toLowerCase();
      const list = newBrief.open_questions!;
      const idx = list.findIndex(
        (x) => x.toLowerCase() === needle || x.toLowerCase().includes(needle) || needle.includes(x.toLowerCase()),
      );
      if (idx >= 0) {
        list.splice(idx, 1);
        traces.push(`resolved question`);
      }
    } else if ((u.section === "features" || u.section === "open_questions") && u.add_item?.trim()) {
      const list = newBrief[u.section]!;
      if (!list.some((x) => x.toLowerCase() === u.add_item!.trim().toLowerCase())) {
        list.push(u.add_item.trim());
        traces.push(`updated brief · ${u.section === "features" ? "features" : "open questions"}`);
      }
    }
  }
  for (const m of result.memories) traces.push(`captured memory · ${m.topic}`);

  // Idea naming — the agent proposes; sanity-cap lengths.
  const ideaPatch: Record<string, string> = {};
  if (result.idea?.name?.trim() && result.idea.name.trim() !== idea.data.name) {
    ideaPatch.name = result.idea.name.trim().slice(0, 40);
    traces.push(`named the idea · ${ideaPatch.name}`);
  }
  if (result.idea?.one_liner?.trim() && result.idea.one_liner.trim() !== idea.data.one_liner) {
    ideaPatch.one_liner = result.idea.one_liner.trim().slice(0, 100);
  }

  // Persist everything atomically.
  const now = new Date().toISOString();
  await callTool("transact", {
    ops: [
      {
        op: "create",
        collection: "messages",
        data: { owner_id: userId, chat: chatId, role: "user", content: message, turn: nextTurn },
      },
      {
        op: "create",
        collection: "messages",
        data: {
          owner_id: userId,
          chat: chatId,
          role: "assistant",
          content: result.reply,
          turn: nextTurn + 1,
          ...(traces.length ? { tool_trace: traces.slice(0, 10) } : {}),
        },
      },
      ...result.memories.map((m) => ({
        op: "create",
        collection: "memories",
        data: {
          owner_id: userId,
          idea: body.ideaId,
          chat: chatId,
          content: m.content.slice(0, 500),
          verbatim: m.verbatim.slice(0, 2000),
          source_type: "chat",
          source_label: `turn ${nextTurn}`,
          turn: nextTurn,
          topic: m.topic,
          ...(m.feeds ? { feeds: m.feeds } : {}),
          superseded: false,
        },
      })),
      {
        op: "update",
        collection: "ideas",
        id: body.ideaId,
        data: { brief: newBrief, last_activity_at: now, ...ideaPatch },
      },
      ...(ideaPatch.name
        ? [
            {
              op: "create",
              collection: "activity",
              data: {
                owner_id: userId,
                idea: body.ideaId,
                type: "change",
                text: "Named the idea",
                old_value: idea.data.name,
                new_value: ideaPatch.name,
              },
            },
          ]
        : []),
      { op: "update", collection: "chats", id: chatId, data: { last_message_at: now } },
      ...result.memories.map((m) => ({
        op: "create",
        collection: "activity",
        data: { owner_id: userId, idea: body.ideaId, type: "memory", text: `Captured — ${m.content.slice(0, 200)}` },
      })),
    ],
  });
  void bumpUsage(userId);

  return NextResponse.json({
    chatId,
    reply: result.reply,
    traces,
    memories: result.memories.map((m) => ({ content: m.content, topic: m.topic, feeds: m.feeds })),
    brief: newBrief,
    gate: briefGate(newBrief),
  });
}
