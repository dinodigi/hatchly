import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { E_CONTENTION, bidSpotlight, getSpotlight } from "@/lib/economy";
import { McpError } from "@/lib/mcp";

/** GET /api/spotlight — live auction state (drives the countdown). Public.
 *  Reading also settles an expired auction, since there is no scheduler. */
export async function GET() {
  try {
    const s = await getSpotlight();
    return NextResponse.json({
      auctionEndsAt: s.auctionEndsAt,
      auctionOpen: s.auctionOpen,
      highBid: s.highBid,
      highBidder: s.highBidder?.label ?? null,
      highListing: s.highListing?.label ?? null,
      minNextBid: s.minNextBid,
      featured: s.featured,
      holder: s.holder?.label ?? null,
      listingId: s.listing?.id ?? null,
      featureEndsAt: s.featureEndsAt,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 502 });
  }
}

/** POST /api/spotlight { listingId, amount, requestKey }
 *  Places a bid in the open auction. Escrows the bid and refunds the previous
 *  leader atomically; only the winner's bid burns, at settlement. */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { listingId?: string; amount?: number; requestKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.listingId || !Number.isInteger(body.amount) || !body.requestKey)
    return NextResponse.json({ error: "listingId, amount, requestKey required" }, { status: 400 });

  try {
    const result = await bidSpotlight({
      ownerId: userId,
      listingId: body.listingId,
      amount: body.amount as number,
      requestKey: `${userId}_${body.requestKey}`,
    });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof McpError) {
      // Contention is transient — tell the client to retry, not that we broke.
      if (e.code === E_CONTENTION)
        return NextResponse.json({ error: e.message, code: e.code, retryable: true }, { status: 409 });
      const expected = [
        "E_AUCTION_CLOSED",
        "E_OUTBID",
        "E_ALREADY_LEADING",
        "E_INSUFFICIENT",
        "E_MIN_BID",
        "E_NOT_OWNER",
      ];
      const status = expected.includes(e.code ?? "") ? 422 : 502;
      return NextResponse.json({ error: e.message, code: e.code }, { status });
    }
    throw e;
  }
}
