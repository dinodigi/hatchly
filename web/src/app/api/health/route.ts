import { NextResponse } from "next/server";

/**
 * Liveness probe for the platform health check.
 *
 * Deliberately does NO external work. Pointing a health check at `/` would
 * render the stream on every probe — several Pluggie calls each, against a
 * budget of 300 tool calls/min shared across the whole project — so the
 * probe would eat the rate limit that real users need.
 *
 * This answers "is the process up and serving?" and nothing more. It does not
 * assert that Pluggie, Clerk, or Anthropic are reachable: a dependency outage
 * should not cause the platform to kill and restart a healthy container.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { ok: true, service: "hatchly-web", ts: new Date().toISOString() },
    { headers: { "cache-control": "no-store" } },
  );
}
