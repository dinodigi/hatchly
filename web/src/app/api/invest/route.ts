import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { E_CONTENTION, invest } from "@/lib/economy";
import { McpError } from "@/lib/mcp";

/** POST /api/invest { listingId, amount, requestKey }
 *  Moves bucks backer→founder through the ledger service (taxed, CAS-guarded,
 *  idempotent on requestKey — a retried submit cannot double-invest). */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { listingId?: string; amount?: number; requestKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const { listingId, amount, requestKey } = body;
  if (!listingId || typeof listingId !== "string")
    return NextResponse.json({ error: "listingId required" }, { status: 400 });
  if (!Number.isInteger(amount) || (amount as number) < 1 || (amount as number) > 10000)
    return NextResponse.json({ error: "amount must be 1..10000" }, { status: 400 });
  if (!requestKey || !/^[A-Za-z0-9-]{8,64}$/.test(requestKey))
    return NextResponse.json({ error: "requestKey required" }, { status: 400 });

  try {
    const result = await invest({
      backerOwnerId: userId,
      listingId,
      amount: amount as number,
      requestKey: `${userId}_${requestKey}`,
    });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof McpError && e.code === "E_INSUFFICIENT")
      return NextResponse.json({ error: "insufficient balance" }, { status: 422 });
    // Contention is transient, not a server fault — 409 tells the client to retry.
    if (e instanceof McpError && e.code === E_CONTENTION)
      return NextResponse.json({ error: e.message, retryable: true }, { status: 409 });
    if (e instanceof McpError)
      return NextResponse.json({ error: e.message }, { status: 502 });
    throw e;
  }
}
