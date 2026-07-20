import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getKeyRow, maskKey, removeKey, saveKey } from "@/lib/keyvault";

/** GET — key status (masked only; the plaintext is never returned). */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const row = await getKeyRow(userId);
  return NextResponse.json(
    row
      ? { connected: row.data.active, masked: row.data.masked_hint, usage: row.data.messages_this_month }
      : { connected: false },
  );
}

/** POST { key } — validate against Anthropic, encrypt, store. */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let body: { key?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const key = body.key?.trim();
  if (!key || !key.startsWith("sk-ant-") || key.length < 40 || key.length > 300)
    return NextResponse.json({ error: "that doesn't look like an Anthropic API key" }, { status: 422 });

  // Validate the key with a zero-cost call before storing it.
  const check = await fetch("https://api.anthropic.com/v1/models?limit=1", {
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
  });
  if (check.status === 401)
    return NextResponse.json({ error: "Anthropic rejected this key" }, { status: 422 });
  if (!check.ok)
    return NextResponse.json({ error: "could not verify the key right now" }, { status: 502 });

  await saveKey(userId, key);
  return NextResponse.json({ connected: true, masked: maskKey(key) });
}

/** DELETE — remove the stored key. */
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  await removeKey(userId);
  return NextResponse.json({ connected: false });
}
