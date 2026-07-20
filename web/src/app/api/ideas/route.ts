import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getKeyRow } from "@/lib/keyvault";
import { callTool } from "@/lib/mcp";
import { getUserByClerkId } from "@/lib/economy";

/** POST /api/ideas — create a fresh idea and drop straight into chat (v4: no form).
 *  Gated on a connected API key, exactly like the prototype. */
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const keyRow = await getKeyRow(userId);
  if (!keyRow?.data.active)
    return NextResponse.json(
      { error: "Add your API key to start creating ideas — the chat that shapes them runs on it.", code: "E_NO_KEY" },
      { status: 422 },
    );

  const user = await getUserByClerkId(userId);
  if (!user) return NextResponse.json({ error: "no profile — sign in again" }, { status: 409 });

  const created = await callTool<{ id: string }>("create_entry", {
    collection: "ideas",
    data: {
      owner_id: userId,
      author: user.id,
      name: "Untitled idea",
      one_liner: "A new idea, still taking shape.",
      stage: "ideation",
      visibility: "private",
      brief: { features: [], open_questions: [] },
      archived: false,
      last_activity_at: new Date().toISOString(),
    },
  });

  return NextResponse.json({ id: created.id });
}
