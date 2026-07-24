import { NextResponse } from "next/server";
import { getStaff } from "@/lib/admin";
import { callTool } from "@/lib/mcp";

const STATUSES = ["new", "in_progress", "reviewed", "actioned", "wontfix"];

/** POST /api/admin/feedback { id, status?, response? } — triage a shareholder
 *  feedback item: move it through the workflow and/or record a retrospect on what
 *  was changed. Staff only. */
export async function POST(req: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { id?: string; status?: string; response?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (body.status !== undefined && !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "bad status" }, { status: 400 });
  }
  if (body.response !== undefined && typeof body.response !== "string") {
    return NextResponse.json({ error: "bad response" }, { status: 400 });
  }
  if (body.status === undefined && body.response === undefined) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const data: Record<string, string> = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.response !== undefined) data.response = body.response.slice(0, 2000);

  try {
    await callTool("update_entry", {
      collection: "shareholder_feedback",
      id: body.id,
      data,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}
