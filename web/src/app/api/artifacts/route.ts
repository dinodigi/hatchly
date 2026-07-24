import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { type Brief } from "@/lib/agent";
import { GENERATABLE, byKey, generateArtifact } from "@/lib/artifacts";
import { bumpUsage, resolveKey } from "@/lib/keyvault";
import { callTool } from "@/lib/mcp";

/**
 * POST   /api/artifacts { ideaId, type }        — draft an artifact (BYOK)
 * PATCH  /api/artifacts { id, ... }             — edit or toggle public
 * DELETE /api/artifacts?id=…                    — remove one
 *
 * The brief is not generatable here: it is live state owned by the chat agent.
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

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { ideaId?: string; type?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const type = byKey(body.type ?? "");
  if (!body.ideaId || !type)
    return NextResponse.json({ error: "ideaId and a valid type required" }, { status: 400 });
  if (type.auto)
    return NextResponse.json(
      { error: "the brief is written by the chat agent, not generated" },
      { status: 422 },
    );

  // Cheapest, most specific checks first. Ownership and existence are both
  // free; asking for a key before them means a duplicate request reports
  // "connect your key" when the real answer is "you already have this one".
  const idea = await callTool<Entry<IdeaData>>("get_entry", {
    collection: "ideas",
    id: body.ideaId,
  }).catch(() => null);
  if (!idea || idea.data.owner_id !== userId)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  // One artifact per type per idea — the picker disables what exists, but a
  // double submit or a stale tab must not create a second copy.
  const existing = await callTool<{ entries: { id: string }[] }>("query_entries", {
    collection: "artifacts",
    where: [
      { field: "idea", op: "eq", value: body.ideaId },
      { field: "type", op: "eq", value: type.key },
    ],
    limit: 1,
  });
  if (existing.entries.length)
    return NextResponse.json(
      { error: "already generated", code: "E_EXISTS", id: existing.entries[0].id },
      { status: 409 },
    );

  const apiKey = await resolveKey(userId);
  if (!apiKey)
    return NextResponse.json(
      { error: "connect your Anthropic key first", code: "E_NO_KEY" },
      { status: 422 },
    );

  const memories = await callTool<{
    entries: Entry<{ content: string; topic?: string; verbatim?: string; superseded?: boolean }>[];
  }>("query_entries", {
    collection: "memories",
    where: [{ field: "idea", op: "eq", value: body.ideaId }],
    select: ["content", "topic", "verbatim", "superseded"],
    limit: 200,
  });

  try {
    const draft = await generateArtifact({
      apiKey,
      type,
      ideaName: idea.data.name,
      oneLiner: idea.data.one_liner,
      brief: idea.data.brief,
      memories: memories.entries.filter((m) => !m.data.superseded).map((m) => m.data),
    });

    const created = await callTool<{ id: string }>("create_entry", {
      collection: "artifacts",
      data: {
        // Without this, PATCH/DELETE ownership checks (owner_id === userId)
        // always 404, so edit/delete/publish-toggle are dead.
        owner_id: userId,
        idea: body.ideaId,
        type: type.key,
        title: type.title,
        subtitle: draft.subtitle,
        is_brief: false,
        on_public_page: false,
        generated_by_agent: true,
        body: draft.sections,
      },
      idempotencyKey: `artifact_${body.ideaId}_${type.key}`,
    });

    await callTool("create_entry", {
      collection: "activity",
      data: {
        owner_id: userId,
        idea: body.ideaId,
        type: "artifact",
        text: `Agent drafted "${type.title}"`,
      },
    }).catch(() => {});

    await bumpUsage(userId).catch(() => {});

    return NextResponse.json({
      ok: true,
      id: created.id,
      thin: draft.thin,
      thinReason: draft.thinReason,
    });
  } catch (e) {
    // A bad or exhausted BYOK key is the user's problem to fix, not a bug —
    // say which it is instead of a generic 500.
    if (e instanceof Anthropic.APIError) {
      const status = e.status === 401 || e.status === 403 ? 422 : 502;
      return NextResponse.json(
        {
          error:
            e.status === 401 || e.status === 403
              ? "your Anthropic key was rejected — check it in Settings"
              : e.status === 429
                ? "your Anthropic account is rate limited — try again shortly"
                : "the model call failed",
          code: e.status === 401 || e.status === 403 ? "E_BAD_KEY" : undefined,
        },
        { status },
      );
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "generation failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    title?: string;
    onPublicPage?: boolean;
    body?: unknown[];
  };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const row = await callTool<Entry<{ owner_id: string; is_brief?: boolean }>>("get_entry", {
    collection: "artifacts",
    id: body.id,
  }).catch(() => null);
  if (!row || row.data.owner_id !== userId)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim())
    patch.title = body.title.trim().slice(0, 160);
  if (typeof body.onPublicPage === "boolean") patch.on_public_page = body.onPublicPage;
  if (Array.isArray(body.body)) patch.body = body.body;
  if (!Object.keys(patch).length)
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });

  await callTool("update_entry", { collection: "artifacts", id: body.id, data: patch });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const row = await callTool<Entry<{ owner_id: string; is_brief?: boolean }>>("get_entry", {
    collection: "artifacts",
    id,
  }).catch(() => null);
  if (!row || row.data.owner_id !== userId)
    return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.data.is_brief)
    return NextResponse.json({ error: "the brief can't be deleted" }, { status: 422 });

  await callTool("delete_entry", { collection: "artifacts", id });
  return NextResponse.json({ ok: true });
}

/** Types still available to generate for an idea — drives the picker. */
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const ideaId = new URL(req.url).searchParams.get("ideaId");
  if (!ideaId) return NextResponse.json({ error: "ideaId required" }, { status: 400 });

  const existing = await callTool<{ entries: Entry<{ type: string }>[] }>("query_entries", {
    collection: "artifacts",
    where: [{ field: "idea", op: "eq", value: ideaId }],
    select: ["type"],
    limit: 40,
  });
  const have = new Set(existing.entries.map((e) => e.data.type));
  return NextResponse.json({
    types: GENERATABLE.map((t) => ({ key: t.key, title: t.title, desc: t.desc, have: have.has(t.key) })),
  });
}
