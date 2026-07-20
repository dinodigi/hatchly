import { NextResponse } from "next/server";
import { getStaff, resolveReport } from "@/lib/admin";

/** POST /api/admin/report — resolve or dismiss a moderation report. Staff only. */
export async function POST(req: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json()) as { reportId?: string; outcome?: string; note?: string };
  if (!body.reportId || (body.outcome !== "actioned" && body.outcome !== "dismissed")) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  try {
    await resolveReport(staff, body.reportId, body.outcome, body.note ?? "");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 500 });
  }
}
