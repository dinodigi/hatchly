import "server-only";
import crypto from "node:crypto";
import { callTool, McpError } from "./mcp";

/**
 * BYOK key vault. The promise in the product copy is:
 * "Encrypted at rest. Never in logs or chat. Never shown again."
 *
 * Implementation: AES-256-GCM with a key derived from HATCHLY_KEY_SECRET (env).
 * Pluggie stores only {provider, masked_hint, ciphertext} — the plaintext key
 * exists solely in memory for the duration of a chat request. Never log it.
 */

function vaultKey(): Buffer {
  const secret = process.env.HATCHLY_KEY_SECRET;
  if (!secret) throw new Error("HATCHLY_KEY_SECRET is not configured");
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptKey(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", vaultKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptKey(ciphertext: string): string {
  const raw = Buffer.from(ciphertext, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", vaultKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

export function maskKey(key: string): string {
  return key.length > 14 ? `${key.slice(0, 10)}…${key.slice(-4)}` : "••••";
}

interface KeyRow {
  id: string;
  data: {
    owner_id: string;
    provider: string;
    masked_hint: string;
    ciphertext: string;
    active: boolean;
    messages_this_month: number;
  };
}

export async function getKeyRow(ownerId: string): Promise<KeyRow | null> {
  const r = await callTool<{ entries: KeyRow[] }>("query_entries", {
    collection: "model_keys",
    where: [{ field: "owner_id", op: "eq", value: ownerId }],
    limit: 1,
  });
  return r.entries[0] ?? null;
}

/** Resolve the user's plaintext API key for one request. Never log the result. */
export async function resolveKey(ownerId: string): Promise<string | null> {
  const row = await getKeyRow(ownerId);
  if (!row || !row.data.active) return null;
  try {
    return decryptKey(row.data.ciphertext);
  } catch {
    return null; // vault secret rotated — key must be re-entered
  }
}

export async function saveKey(ownerId: string, plaintextKey: string): Promise<{ masked: string }> {
  const masked = maskKey(plaintextKey);
  const ciphertext = encryptKey(plaintextKey);
  const existing = await getKeyRow(ownerId);
  if (existing) {
    await callTool("update_entry", {
      collection: "model_keys",
      id: existing.id,
      data: { masked_hint: masked, ciphertext, active: true, provider: "anthropic" },
    });
  } else {
    await callTool("create_entry", {
      collection: "model_keys",
      data: {
        owner_id: ownerId,
        provider: "anthropic",
        masked_hint: masked,
        ciphertext,
        active: true,
        messages_this_month: 0,
      },
      idempotencyKey: `key_${ownerId}`,
    });
  }
  return { masked };
}

export async function removeKey(ownerId: string): Promise<void> {
  const existing = await getKeyRow(ownerId);
  if (!existing) return;
  await callTool("delete_entry", { collection: "model_keys", id: existing.id });
}

export async function bumpUsage(ownerId: string): Promise<void> {
  const existing = await getKeyRow(ownerId);
  if (!existing) return;
  try {
    await callTool("update_entry_if", {
      collection: "model_keys",
      id: existing.id,
      increment: { field: "messages_this_month", by: 1 },
    });
  } catch (e) {
    if (!(e instanceof McpError)) throw e; // usage counter is best-effort
  }
}
