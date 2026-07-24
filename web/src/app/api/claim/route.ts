import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dailyClaim, E_CONTENTION } from "@/lib/economy";
import { McpError } from "@/lib/mcp";

/** POST /api/claim — the daily reward. Idempotent per UTC day. */
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  try {
    const result = await dailyClaim(userId);
    return NextResponse.json(result);
  } catch (e) {
    // Contention is transient — tell the client to retry, not that we failed.
    if (e instanceof McpError && e.code === E_CONTENTION)
      return NextResponse.json({ error: e.message, retryable: true }, { status: 409 });
    // No wallet yet (bootstrap hasn't run) — a conflict, not a server fault.
    if (e instanceof McpError && /wallet/i.test(e.message))
      return NextResponse.json({ error: "no wallet — sign in again", code: "E_NO_WALLET" }, { status: 409 });
    if (e instanceof McpError) return NextResponse.json({ error: e.message }, { status: 502 });
    throw e;
  }
}
