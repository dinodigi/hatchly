import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callTool } from "@/lib/mcp";

/** GET /api/me/listings — the signed-in user's live stream listings (for the
 *  spotlight modal's "which idea?" picker). */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const r = await callTool<{ entries: { id: string; data: { name: string; status: string } }[] }>(
    "query_entries",
    {
      collection: "listings",
      where: [
        { field: "owner_id", op: "eq", value: userId },
        { field: "status", op: "eq", value: "live" },
      ],
      select: ["name", "status"],
      limit: 50,
    },
  );
  return NextResponse.json({
    listings: r.entries.map((e) => ({ id: e.id, name: e.data.name })),
  });
}
