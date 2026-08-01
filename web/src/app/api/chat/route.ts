import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { briefGate, runAgentTurn, type ArcIntent, type Brief } from "@/lib/agent";
import { applyBriefUpdates, isDegenerate, memoryRowData, planIdeaPatch, planMemoryWrites } from "@/lib/turn-apply";
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
  let chatArc: ArcIntent[] = [];
  if (chatId) {
    const chat = await callTool<Entry<{ owner_id: string; template_key?: string }>>("get_entry", {
      collection: "chats",
      id: chatId,
    });
    if (chat.data.owner_id !== userId)
      return NextResponse.json({ error: "not your chat" }, { status: 403 });
    // A pre-made chat carries a template — its system prompt focuses the agent,
    // and its question arc is the fixed list of intents the chat must resolve.
    if (chat.data.template_key) {
      const tpl = await callTool<{ entries: Entry<{ name: string; system_prompt: string; question_arc?: string }>[] }>("query_entries", {
        collection: "chat_templates",
        where: [{ field: "key", op: "eq", value: chat.data.template_key }],
        select: ["name", "system_prompt", "question_arc"],
        limit: 1,
      }).catch(() => null);
      const t = tpl?.entries[0]?.data;
      if (t) {
        chatFocus = `${t.name} — ${t.system_prompt}`;
        try {
          chatArc = (JSON.parse(t.question_arc || "[]") as ArcIntent[]).filter((a) => a?.key && a?.intent);
        } catch {
          chatArc = [];
        }
      }
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
    callTool<{ entries: Entry<{ content: string; topic?: string; intent_key?: string; verbatim?: string; chat?: { id: string; label: string } }>[] }>("query_entries", {
      collection: "memories",
      where: [
        { field: "idea", op: "eq", value: body.ideaId },
        { field: "superseded", op: "ne", value: true },
      ],
      select: ["content", "topic", "intent_key", "verbatim", "chat"],
      limit: 100,
    }),
  ]);
  const history = historyRes.entries.map((e) => ({ role: e.data.role, content: e.data.content }));
  const nextTurn = (historyRes.entries.at(-1)?.data.turn ?? 0) + 1;
  const brief: Brief = idea.data.brief ?? {};
  // Intents already answered anywhere — the agent skips them; singular ones
  // UPDATE their existing node instead of stacking a new row.
  const intentNodes = new Map<string, { id: string; content: string }>();
  for (const e of memoriesRes.entries) {
    if (e.data.intent_key && !intentNodes.has(e.data.intent_key))
      intentNodes.set(e.data.intent_key, { id: e.id, content: e.data.content });
  }
  const arcMode = new Map(chatArc.map((a) => [a.key, a.mode]));

  // The agent turn (BYOK — errors from Anthropic surface as chat-level messages).
  const turnParams = {
    apiKey,
    ideaName: idea.data.name,
    oneLiner: idea.data.one_liner,
    brief,
    memories: memoriesRes.entries.map((e) => ({ content: e.data.content, topic: e.data.topic, verbatim: e.data.verbatim, chatLabel: e.data.chat?.label })),
    history,
    userMessage: message,
    chatFocus,
    chatArc,
    resolvedIntents: [...intentNodes.keys()],
  };
  let result;
  try {
    result = await runAgentTurn(turnParams);
    // Retry a degenerate reply ONCE, silently — hard cap so a bad streak can't
    // burn tokens (BL-01).
    if (isDegenerate(result)) result = await runAgentTurn(turnParams);
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError)
      return NextResponse.json({ error: "your API key was rejected — reconnect it in settings", code: "E_KEY_INVALID" }, { status: 422 });
    if (e instanceof Anthropic.RateLimitError)
      return NextResponse.json({ error: "your Anthropic account is rate-limited — try again shortly" }, { status: 429 });
    if (e instanceof Anthropic.APIError)
      return NextResponse.json({ error: `model error: ${e.message}` }, { status: 502 });
    throw e;
  }
  // Still a dud after the retry: answer gracefully and persist NOTHING — the
  // founder re-asks into a clean thread instead of reading junk (BL-01).
  if (isDegenerate(result)) {
    return NextResponse.json({
      chatId,
      reply: "I lost my train of thought — ask me that again?",
      suggestions: [],
      traces: [],
      memories: [],
      brief,
      gate: briefGate(brief),
    });
  }

  // Apply brief updates.
  const applied = applyBriefUpdates(brief, result);
  const newBrief = applied.brief;
  const traces = applied.traces;
  // Split memories into singular-node UPDATES (an arc intent already answered —
  // the node mutates, history goes to activity) and plain CREATES.
  const memWrites = planMemoryWrites(result.memories, arcMode, intentNodes);
  for (const w of memWrites)
    traces.push(w.updateOf ? `updated memory · ${w.m.topic}` : `captured memory · ${w.m.topic}`);

  // Idea naming — the agent proposes; sanity-cap lengths.
  const ideaPatch = planIdeaPatch(result, idea.data);
  if (ideaPatch.name) traces.push(`named the idea · ${ideaPatch.name}`);

  // Persist everything atomically. The model call is guarded above, but this
  // save used to be the one uncaught await — an MCP rejection escaped as a
  // bodyless 500 (BL-02). The transact is atomic, so a failure leaves zero
  // half-written state; tell the client honestly instead of crashing.
  const now = new Date().toISOString();
  const saved = await callTool("transact", {
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
          // Persisted so a reload can re-offer the last question's tap-to-answer
          // chips instead of silently dropping them.
          ...(result.suggested_replies.length
            ? { suggestions: result.suggested_replies.slice(0, 4).map((s) => s.slice(0, 120)) }
            : {}),
        },
      },
      ...memWrites.map(({ m, intentKey, updateOf }) => {
        const data = memoryRowData(m, intentKey, nextTurn);
        return updateOf
          ? { op: "update", collection: "memories", id: updateOf.id, data: { ...data, chat: chatId } }
          : {
              op: "create",
              collection: "memories",
              data: { ...data, owner_id: userId, idea: body.ideaId, chat: chatId, source_type: "chat", superseded: false },
            };
      }),
      // Singular-node updates keep their history in activity — the "changed
      // your mind" trail — since memory only holds current state.
      ...memWrites
        .filter((w) => w.updateOf && w.updateOf.content !== w.m.content)
        .map((w) => ({
          op: "create",
          collection: "activity",
          data: {
            owner_id: userId,
            idea: body.ideaId,
            type: "change",
            text: `Revised — ${w.intentKey!.replace(/_/g, " ")}`,
            old_value: w.updateOf!.content.slice(0, 200),
            new_value: w.m.content.slice(0, 200),
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
      ...memWrites
        .filter((w) => !w.updateOf)
        .map(({ m }) => ({
          op: "create",
          collection: "activity",
          data: { owner_id: userId, idea: body.ideaId, type: "memory", text: `Captured — ${m.content.slice(0, 200)}` },
        })),
    ],
  }).then(
    () => true,
    (e: unknown) => {
      console.error(`[chat] persist failed: ${e instanceof Error ? e.message : String(e)}`);
      return false;
    },
  );
  if (!saved)
    return NextResponse.json({ error: "that reply couldn't be saved — try again?" }, { status: 502 });
  void bumpUsage(userId);

  return NextResponse.json({
    chatId,
    reply: result.reply,
    suggestions: result.suggested_replies,
    traces,
    memories: result.memories.map((m) => ({ content: m.content, topic: m.topic })),
    brief: newBrief,
    gate: briefGate(newBrief),
  });
}
