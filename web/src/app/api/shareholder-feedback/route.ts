import { NextResponse } from "next/server";
import { callTool } from "@/lib/mcp";

/** POST /api/shareholder-feedback { message, name?, screen? }
 *  No auth by design — anyone reviewing the build can leave a note, which lands
 *  in the shareholder_feedback board in the Pluggie admin. Server-side write, so
 *  the token never reaches the client. */
export async function POST(req: Request) {
  let body: { message?: string; name?: string; screen?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });
  if (message.length > 2000) return NextResponse.json({ error: "too long" }, { status: 422 });

  try {
    await callTool("create_entry", {
      collection: "shareholder_feedback",
      data: {
        message,
        name: body.name?.trim().slice(0, 120) || undefined,
        screen: body.screen?.slice(0, 200) || undefined,
        status: "new",
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "couldn't save feedback" }, { status: 502 });
  }
}
