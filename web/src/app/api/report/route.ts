import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callTool } from "@/lib/mcp";

const KINDS = ["listing", "quick_idea", "comment", "feedback", "user"];
const REASONS = ["spam", "abuse", "impersonation", "collusion", "other"];

/** POST /api/report — file a moderation report. Any signed-in user. */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await req.json()) as {
    targetKind?: string;
    targetId?: string;
    reason?: string;
    detail?: string;
  };
  if (!body.targetId || !KINDS.includes(body.targetKind ?? "") || !REASONS.includes(body.reason ?? "")) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  // One open report per user per target — re-reporting shouldn't flood the queue.
  const existing = await callTool<{ entries: { id: string }[] }>("query_entries", {
    collection: "reports",
    where: [
      { field: "reporter_id", op: "eq", value: userId },
      { field: "target_id", op: "eq", value: body.targetId },
      { anyOf: [{ field: "status", op: "eq", value: "open" }, { field: "status", op: "eq", value: "reviewing" }] },
    ],
    limit: 1,
  });
  if (existing.entries.length) return NextResponse.json({ ok: true, deduped: true });

  await callTool("create_entry", {
    collection: "reports",
    data: {
      reporter_id: userId,
      target_kind: body.targetKind,
      target_id: body.targetId,
      reason: body.reason,
      detail: body.detail?.slice(0, 1000) || undefined,
      status: "open",
    },
  });

  return NextResponse.json({ ok: true });
}
