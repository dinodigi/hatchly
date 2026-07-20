import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dailyClaim } from "@/lib/economy";

/** POST /api/claim — the daily reward. Idempotent per UTC day. */
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const result = await dailyClaim(userId);
  return NextResponse.json(result);
}
