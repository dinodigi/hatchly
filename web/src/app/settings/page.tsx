import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import KeyManager from "@/components/KeyManager";
import { Icons } from "@/components/icons";
import { clerkEnabled } from "@/lib/clerk";
import { AGENT_MODEL } from "@/lib/agent";
import { getKeyRow } from "@/lib/keyvault";

export const metadata = { title: "Settings — Hatchly" };

/* Settings — v4's Settings screen (nav.jsx): reason banner when routed here
   without a key, the key card, and the usage card. */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  if (!clerkEnabled) redirect("/");
  const { userId } = await auth();
  if (!userId) redirect("/");

  const [row, sp] = await Promise.all([getKeyRow(userId).catch(() => null), searchParams]);
  const connected = !!row?.data.active;
  const reason =
    sp.reason === "key" ? "Add your Anthropic API key first — it powers the chat that shapes every idea." : null;

  return (
    <div className="scrollarea">
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 28px 90px" }}>
        <h1 style={{ fontSize: 28, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Settings</h1>
        <p className="muted" style={{ fontSize: 14.5, margin: "0 0 28px" }}>
          Manage the API key that powers your idea chats. Hatchly is free — you bring the key.
        </p>

        {reason && !connected && (
          <div className="card" style={{ padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, border: "1px solid color-mix(in srgb, var(--accent) 34%, var(--border))", background: "var(--accent-soft)" }}>
            <Icons.lock size={18} style={{ color: "var(--accent-text)", flex: "none" }} />
            <div style={{ fontSize: 13.5, color: "var(--text-primary)" }}>{reason}</div>
          </div>
        )}

        <KeyManager
          initialConnected={connected}
          initialMasked={row?.data.masked_hint ?? null}
        />

        <div className="card" style={{ padding: 22, marginTop: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10 }}>Usage</div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <span className="muted" style={{ fontSize: 13.5 }}>This month</span>
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>
              {connected ? `${row!.data.messages_this_month.toLocaleString("en-US")} messages` : "—"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
            <span className="muted" style={{ fontSize: 13.5 }}>Model</span>
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>{AGENT_MODEL}</span>
          </div>
        </div>

        <p className="faint" style={{ fontSize: 12, lineHeight: 1.6, marginTop: 20 }}>
          Your key is encrypted at rest and stored server-side. Never shown again after saving,
          never written to logs, never placed in chat context.
        </p>
      </div>
    </div>
  );
}
