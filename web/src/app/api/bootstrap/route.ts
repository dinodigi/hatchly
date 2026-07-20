import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureProvisioned, getWallet } from "@/lib/economy";

/** POST /api/bootstrap — idempotent first-sign-in provisioning:
 *  users row + wallet + the 100-buck signup grant. Safe to call every session. */
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  await ensureProvisioned({
    clerkUserId: userId,
    name: user.fullName || user.username || "Founder",
    email: user.primaryEmailAddress?.emailAddress ?? `${userId}@unknown.hatchly`,
    imageUrl: user.imageUrl,
  });

  const wallet = await getWallet(userId);
  return NextResponse.json({
    ok: true,
    balance: wallet?.data.balance ?? 0,
    streak: wallet?.data.streak ?? 0,
  });
}
