import { NextResponse } from "next/server";
import { getStaff } from "@/lib/admin";
import { callTool } from "@/lib/mcp";

/** POST /api/admin/feedback { id, status } — triage a shareholder feedback item.
 *  Staff only. */
export async function POST(req: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.id || !["new", "reviewed", "actioned"].includes(body.status ?? "")) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  try {
    await callTool("update_entry", {
      collection: "shareholder_feedback",
      id: body.id,
      data: { status: body.status },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}
