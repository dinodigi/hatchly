import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { runAgentTurn, type ArcIntent } from "@/lib/agent";
import { getStaff } from "@/lib/admin";
import { bumpUsage, resolveKey } from "@/lib/keyvault";
import { callTool } from "@/lib/mcp";

/* Prompt Studio preview (BL-45) — run a chat's LIVE prompt + arc against a
   throwaway sample idea and show the reply, chips, and would-be captures.
   Persists NOTHING: no messages, no memories, no idea writes. Burns one model
   call on the STAFF USER'S own connected key (BYOK, same as their chats). */

/** A fixture founder context, deliberately not the audit fixture so previews
 *  read fresh. Structurally mid-conversation: brief partly filled, a few
 *  memories, so every chat type has something to work with. */
const PREVIEW_IDEA = {
  name: "Sunday Supper Club",
  one_liner: "Neighbors host rotating weekend dinners; the app handles invites, dishes, and costs.",
  brief: {
    problem:
      "Recurring neighborhood dinners die in group texts — who hosts next, who brings what, and who still owes for groceries all live in one scrolling thread.",
    who: "The one neighbor who always ends up organizing the dinners.",
    features: ["Rotating host schedule"],
    open_questions: [],
  },
  memories: [
    { content: "Founder wants it to feel like a standing tradition, not an event app.", topic: "brand", chatLabel: "Name & brand" },
    { content: "Groups currently coordinate via one group chat and a shared note.", topic: "problem", chatLabel: "The problem" },
    { content: "Founder suspects the organizer would pay before the guests would.", topic: "pricing", chatLabel: "How it makes money" },
  ],
};

export async function POST(req: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const tpl = await callTool<{
    data: { name?: string; system_prompt?: string; initiation_prompt?: string; opening?: string; question_arc?: string };
  }>("get_entry", { collection: "chat_templates", id: body.id }).catch(() => null);
  if (!tpl) return NextResponse.json({ error: "no such template" }, { status: 404 });

  const apiKey = await resolveKey(staff.clerkUserId);
  if (!apiKey)
    return NextResponse.json(
      { error: "no API key connected — previews run on your own key (Settings → connect key)", code: "E_NO_KEY" },
      { status: 422 },
    );

  let chatArc: ArcIntent[] = [];
  try {
    chatArc = (JSON.parse(tpl.data.question_arc || "[]") as ArcIntent[]).filter((a) => a?.key && a?.intent);
  } catch {
    chatArc = [];
  }

  // The initiation is what a founder's first open actually sends; chats
  // without one (refine) get a generic opener so the preview still runs.
  const userMessage =
    tpl.data.initiation_prompt?.trim() ||
    "Take a first pass based on what you already know about my idea, then ask me your most important question.";

  try {
    const result = await runAgentTurn({
      apiKey,
      ideaName: PREVIEW_IDEA.name,
      oneLiner: PREVIEW_IDEA.one_liner,
      brief: PREVIEW_IDEA.brief,
      memories: PREVIEW_IDEA.memories,
      history: [],
      userMessage,
      chatFocus: `${tpl.data.name ?? ""} — ${tpl.data.system_prompt ?? ""}`,
      chatArc,
      resolvedIntents: [],
    });
    void bumpUsage(staff.clerkUserId);
    // Nothing is persisted — the whole point. The would-be captures are
    // returned for display only.
    return NextResponse.json({
      idea: PREVIEW_IDEA.name,
      reply: result.reply,
      suggestions: result.suggested_replies,
      memories: result.memories.map((m) => ({ content: m.content, topic: m.topic, kind: m.kind, intent: m.intent, entities: m.entities ?? [] })),
      brief_updates: result.brief_updates,
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError)
      return NextResponse.json({ error: "your API key was rejected — reconnect it in settings", code: "E_KEY_INVALID" }, { status: 422 });
    if (e instanceof Anthropic.APIError)
      return NextResponse.json({ error: `model error: ${e.message}` }, { status: 502 });
    return NextResponse.json({ error: "preview failed" }, { status: 502 });
  }
}
