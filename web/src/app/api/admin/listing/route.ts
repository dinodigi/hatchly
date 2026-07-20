import { NextResponse } from "next/server";
import { getStaff, setListingHidden } from "@/lib/admin";

/** POST /api/admin/listing — hide or restore a stream listing. Staff only. */
export async function POST(req: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json()) as { listingId?: string; hidden?: boolean; reason?: string };
  if (!body.listingId || typeof body.hidden !== "boolean") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  try {
    await setListingHidden(staff, body.listingId, body.hidden, body.reason ?? "");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 500 });
  }
}
