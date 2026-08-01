import { NextResponse } from "next/server";
import { auditOp, getStaff } from "@/lib/admin";
import { callTool } from "@/lib/mcp";

/* Prompt Studio backend (BL-43/BL-44/BL-46) — edit chat_templates from /admin
   without a deploy, with Pluggie's entry versioning as free history.
   Staff only. The legacy `questions` field is deliberately not editable
   here (retired, BL-42). The question arc arrives STRUCTURED (patch.arc),
   never as hand-escaped JSON — the server validates and serializes it. */

/** Editable fields and their schema caps. `system_prompt` is richtext (no cap);
 *  the rest mirror the collection's text limits. */
const EDITABLE = {
  name: 80,
  subtitle: 160,
  system_prompt: Infinity,
  initiation_prompt: 1000,
  opening: 1000,
} as const;
type EditableKey = keyof typeof EDITABLE;

/** Required by the schema — an empty value would be rejected anyway; refuse it
 *  with a message instead of a raw validation error. */
const REQUIRED: EditableKey[] = ["name", "system_prompt", "opening"];

/** Validate a structured arc (BL-44) and return it in storage shape, or an
 *  error string. Intent keys are stable identifiers — the UI keeps existing
 *  keys read-only; here we can only enforce format and uniqueness. */
function parseArc(raw: unknown): { arc?: { key: string; intent: string; required: boolean; mode: string }[]; error?: string } {
  if (!Array.isArray(raw)) return { error: "arc must be a list" };
  if (raw.length > 20) return { error: "arc is over 20 intents" };
  const seen = new Set<string>();
  const arc = [];
  for (const item of raw) {
    const { key, intent, required, mode } = (item ?? {}) as Record<string, unknown>;
    if (typeof key !== "string" || !/^[a-z][a-z0-9_]{0,39}$/.test(key))
      return { error: `intent key "${String(key)}" must be snake_case (a-z, 0-9, _)` };
    if (seen.has(key)) return { error: `duplicate intent key "${key}"` };
    seen.add(key);
    if (typeof intent !== "string" || !intent.trim()) return { error: `intent "${key}" needs its question text` };
    if (intent.trim().length > 300) return { error: `intent "${key}" text is over 300 characters` };
    if (mode !== "singular" && mode !== "accumulative") return { error: `intent "${key}" needs a mode` };
    arc.push({ key, intent: intent.trim(), required: required === true, mode });
  }
  const serialized = JSON.stringify(arc);
  if (serialized.length > 10000) return { error: "arc is over the 10000-character storage cap" };
  return { arc };
}

interface VersionRow {
  versionId: string;
  createdAt: string;
  actor?: { type?: string; label?: string };
  changedFields?: string[];
}

/** GET /api/admin/prompts?id=<templateId> — the template's stored pre-image
 *  versions, newest first (Pluggie keeps the last 20). */
export async function GET(req: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const res = await callTool<{ versions: VersionRow[] }>("list_entry_versions", {
      collection: "chat_templates",
      id,
      limit: 10,
    });
    return NextResponse.json({
      versions: (res.versions ?? []).map((v) => ({
        versionId: v.versionId,
        createdAt: v.createdAt,
        actor: v.actor?.label ?? v.actor?.type ?? "—",
        changedFields: v.changedFields ?? [],
      })),
    });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}

/** POST /api/admin/prompts — either { id, patch } to save edited fields, or
 *  { id, restore: versionId } to roll back to a stored version. Audited. */
export async function POST(req: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { id?: string; patch?: Record<string, unknown>; restore?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Label for the audit trail — also confirms the id is a real template.
  const current = await callTool<{ data: { name?: string } }>("get_entry", {
    collection: "chat_templates",
    id: body.id,
  }).catch(() => null);
  if (!current) return NextResponse.json({ error: "no such template" }, { status: 404 });
  const label = current.data.name;

  if (body.restore) {
    if (typeof body.restore !== "string") return NextResponse.json({ error: "bad version" }, { status: 400 });
    try {
      await callTool("restore_entry_version", {
        collection: "chat_templates",
        id: body.id,
        versionId: body.restore,
      });
      // Not atomic with the restore (restore isn't a transact op) — audit
      // best-effort after the fact.
      await callTool("transact", {
        ops: [auditOp(staff, { action: "restore_prompt", targetKind: "chat_template", targetId: body.id, targetLabel: label, reason: `version ${body.restore.slice(0, 8)}` })],
      }).catch(() => null);
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ error: "restore failed" }, { status: 502 });
    }
  }

  if (!body.patch || typeof body.patch !== "object") {
    return NextResponse.json({ error: "patch or restore required" }, { status: 400 });
  }
  const data: Record<string, string | null> = {};
  for (const [key, cap] of Object.entries(EDITABLE) as [EditableKey, number][]) {
    const v = body.patch[key];
    if (v === undefined) continue;
    if (typeof v !== "string") return NextResponse.json({ error: `bad ${key}` }, { status: 400 });
    const trimmed = v.trim();
    if (!trimmed && REQUIRED.includes(key)) {
      return NextResponse.json({ error: `${key.replace(/_/g, " ")} can't be empty` }, { status: 400 });
    }
    if (trimmed.length > cap) {
      return NextResponse.json({ error: `${key.replace(/_/g, " ")} is over ${cap} characters` }, { status: 400 });
    }
    // Optional fields empty out to unset, so the chat code's "no initiation
    // prompt" fallback behaves as documented.
    data[key] = trimmed || null;
  }
  if (body.patch.arc !== undefined) {
    const parsed = parseArc(body.patch.arc);
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
    data.question_arc = JSON.stringify(parsed.arc);
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  try {
    await callTool("transact", {
      ops: [
        { op: "update", collection: "chat_templates", id: body.id, data },
        auditOp(staff, {
          action: "edit_prompt",
          targetKind: "chat_template",
          targetId: body.id,
          targetLabel: label,
          reason: Object.keys(data).join(", "),
        }),
      ],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "save failed" }, { status: 502 });
  }
}
