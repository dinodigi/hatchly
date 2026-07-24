import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { resolveKey } from "@/lib/keyvault";
import { callTool } from "@/lib/mcp";
import { getUserByClerkId } from "@/lib/economy";
import { generateIdeaTitle, loadChatTemplates, templatesForAnswers } from "@/lib/onboarding";

/** POST /api/ideas — create an idea from onboarding.
 *
 *  Body { raw, answers } (from the onboarding step): generates a real title from
 *  the sentence, seeds the problem draft from the founder's own words, and
 *  spins up the pre-made placeholder chats from the admin-editable templates,
 *  pruned by the answers. An empty body still works (a blank "Untitled idea"),
 *  so any legacy caller keeps functioning. Gated on a connected key. */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { raw?: string; answers?: Record<string, unknown> } = {};
  try {
    body = await req.json();
  } catch {
    // Empty body is allowed — legacy "New idea" behaviour.
  }

  const apiKey = await resolveKey(userId);
  if (!apiKey)
    return NextResponse.json(
      { error: "Add your API key to start creating ideas — the chat that shapes them runs on it.", code: "E_NO_KEY" },
      { status: 422 },
    );

  const user = await getUserByClerkId(userId);
  if (!user) return NextResponse.json({ error: "no profile — sign in again" }, { status: 409 });

  const raw = body.raw?.trim();
  const answers = body.answers ?? {};
  const broken = typeof answers.broken === "string" ? (answers.broken as string).trim() : "";

  try {
    const name = raw ? await generateIdeaTitle(apiKey, raw) : "Untitled idea";

    const created = await callTool<{ id: string }>("create_entry", {
      collection: "ideas",
      data: {
        owner_id: userId,
        author: user.id,
        name,
        one_liner: raw ? raw.slice(0, 300) : "A new idea, still taking shape.",
        stage: "ideation",
        visibility: "private",
        // The founder's "what's broken" line is the first draft of the problem —
        // the problem chat refines it from here.
        brief: broken ? { problem: broken, features: [], open_questions: [] } : { features: [], open_questions: [] },
        archived: false,
        last_activity_at: new Date().toISOString(),
      },
    });

    // Pre-made placeholder chats — created empty; each renders its opening and
    // curated questions lazily when the founder opens it (no model call now).
    if (raw) {
      const templates = await loadChatTemplates();
      const picked = templatesForAnswers(templates, answers);
      if (picked.length) {
        const now = new Date().toISOString();
        await callTool("transact", {
          idempotencyKey: `onboard_chats_${created.id}`,
          ops: picked.map((t) => ({
            op: "create",
            collection: "chats",
            data: {
              owner_id: userId,
              idea: created.id,
              title: t.name,
              template_key: t.key,
              last_message_at: now,
            },
          })),
        });
      }
    }

    return NextResponse.json({ id: created.id });
  } catch (e) {
    // Never fall through to a bodyless 500 — the client parses this as JSON.
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "couldn't create the idea" },
      { status: 502 },
    );
  }
}
