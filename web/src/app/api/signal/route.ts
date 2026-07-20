import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callTool } from "@/lib/mcp";
import { getUserByClerkId } from "@/lib/economy";

/** POST /api/signal { listingId, wouldUse? | willingToPay? | notifyMe? }
 *  Upserts the caller's demand signal for a listing (one row per person). */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { listingId?: string; wouldUse?: string; willingToPay?: boolean; notifyMe?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });
  if (body.wouldUse && !["yes", "maybe", "no"].includes(body.wouldUse))
    return NextResponse.json({ error: "bad wouldUse" }, { status: 422 });

  const listing = await callTool<{ id: string; data: { owner_id: string; status: string } }>("get_entry", {
    collection: "listings",
    id: body.listingId,
  });
  if (listing.data.status !== "live")
    return NextResponse.json({ error: "listing is not live" }, { status: 422 });

  const patch: Record<string, unknown> = {};
  if (body.wouldUse) patch.would_use = body.wouldUse;
  if (typeof body.willingToPay === "boolean") patch.willing_to_pay = body.willingToPay;
  if (typeof body.notifyMe === "boolean") patch.notify_me = body.notifyMe;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "nothing to set" }, { status: 400 });

  const existing = await callTool<{ entries: { id: string }[] }>("query_entries", {
    collection: "demand_signals",
    where: [
      { field: "listing", op: "eq", value: body.listingId },
      { field: "respondent_id", op: "eq", value: userId },
    ],
    limit: 1,
  });

  if (existing.entries[0]) {
    await callTool("update_entry", { collection: "demand_signals", id: existing.entries[0].id, data: patch });
  } else {
    const user = await getUserByClerkId(userId);
    await callTool("create_entry", {
      collection: "demand_signals",
      data: {
        owner_id: listing.data.owner_id,
        listing: body.listingId,
        ...(user ? { respondent: user.id } : {}),
        respondent_id: userId,
        ...patch,
      },
    });
  }
  return NextResponse.json({ ok: true });
}
