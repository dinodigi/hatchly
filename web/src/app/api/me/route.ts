import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getWallet } from "@/lib/economy";

/** GET /api/me — the caller's wallet summary (for modals that need balance). */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const wallet = await getWallet(userId).catch(() => null);
  return NextResponse.json({
    balance: wallet?.data.balance ?? 0,
    streak: wallet?.data.streak ?? 0,
  });
}
