import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import WalletClaimButton from "@/components/WalletClaimButton";
import { Icons } from "@/components/icons";
import { Bucks, Card, Coin, SectionLabel } from "@/components/ui";
import { clerkEnabled } from "@/lib/clerk";
import { DAILY_CLAIM, getUserByClerkId, getWallet } from "@/lib/economy";
import { callTool } from "@/lib/mcp";
import { getAgentX } from "@/lib/server";

/* Wallet — v4's Wallet screen (stream.jsx): accent balance card, summary
   grid, icon-tile transaction ledger. One economy delta vs the mock: no
   escrow (spotlight bids burn), so the middle card shows lifetime received. */

export const metadata = { title: "Wallet — Hatchly" };

// Balance and ledger must always reflect the latest invest/claim — never a
// client-router-cached snapshot from an earlier visit.
export const dynamic = "force-dynamic";

type IconFn = (p: { size?: number }) => React.ReactNode;
const TXN_META: Record<string, { I: IconFn; color: string; glyph: string }> = {
  signup_grant: { I: Icons.sparkle, color: "var(--success-text)", glyph: "var(--success-soft)" },
  daily_claim: { I: Icons.sparkle, color: "var(--success-text)", glyph: "var(--success-soft)" },
  earn: { I: Icons.trend, color: "var(--success-text)", glyph: "var(--success-soft)" },
  invest_in: { I: Icons.trend, color: "var(--success-text)", glyph: "var(--success-soft)" },
  invest_out: { I: Icons.trend, color: "var(--text-primary)", glyph: "var(--surface)" },
  invest_tax: { I: Icons.flame, color: "var(--text-muted)", glyph: "var(--surface)" },
  self_invest_tax: { I: Icons.flame, color: "var(--danger-text)", glyph: "var(--surface)" },
  spotlight_escrow: { I: Icons.flame, color: "var(--accent-text)", glyph: "var(--accent-soft)" },
  spotlight_burn: { I: Icons.flame, color: "var(--accent-text)", glyph: "var(--accent-soft)" },
  spotlight_refund: { I: Icons.back, color: "var(--success-text)", glyph: "var(--success-soft)" },
  contacts_unlock: { I: Icons.lock, color: "var(--text-secondary)", glyph: "var(--surface)" },
  admin_adjust: { I: Icons.settings, color: "var(--text-muted)", glyph: "var(--surface)" },
};

interface TxnData {
  type: string;
  amount: number;
  balance_after: number;
  label: string;
  created_at?: string;
}

const when = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "";

export default async function WalletPage() {
  if (!clerkEnabled) redirect("/");
  const { userId } = await auth();
  if (!userId) redirect("/");

  const ax = getAgentX();
  const [wallet, me, txns, stakes] = await Promise.all([
    getWallet(userId),
    getUserByClerkId(userId).catch(() => null),
    callTool<{ entries: { id: string; data: TxnData }[] }>("query_entries", {
      collection: "transactions",
      where: [{ field: "owner_id", op: "eq", value: userId }],
      orderBy: { field: "created_at", dir: "desc" },
      select: ["type", "amount", "balance_after", "label", "created_at"],
      limit: 50,
    }),
    ax ? ax.stakes.list({ limit: 200 }) : [],
  ]);
  if (!wallet) redirect("/");
  const w = wallet.data;

  const today = new Date().toISOString().slice(0, 10);
  const claimedToday = w.last_claim_at?.slice(0, 10) === today;

  // Leaderboard rank among backers, from public stakes.
  const byBacker = new Map<string, number>();
  for (const s of stakes) byBacker.set(s.backer.id, (byBacker.get(s.backer.id) ?? 0) + s.amount);
  const ranked = [...byBacker.entries()].sort((a, b) => b[1] - a[1]);
  const myRank = me ? ranked.findIndex(([id]) => id === me.id) + 1 : 0;

  return (
    <div className="scrollarea">
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "34px 28px 90px" }}>
        <h1 style={{ fontSize: 28, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Wallet</h1>
        <p className="muted" style={{ fontSize: 14.5, margin: "0 0 26px" }}>
          Hatchly Bucks are play-money — prestige, never real currency.
        </p>

        {/* balance row */}
        <div className="wallet-summary" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
          <Card style={{ padding: "22px 24px", background: "var(--accent-soft)", display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="faint" style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Available balance</div>
            <Bucks amount={w.balance} size={34} fontSize={32} style={{ color: "var(--accent-text)" }} />
            {!claimedToday ? (
              <WalletClaimButton amount={DAILY_CLAIM} />
            ) : (
              <span className="faint" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                <Icons.check size={13} /> {w.streak}🔥 day streak
              </span>
            )}
          </Card>
          <Card style={{ padding: "22px 24px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
            <div className="faint" style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Received</div>
            <Bucks amount={w.lifetime_received} size={22} fontSize={20} />
            <div className="faint" style={{ fontSize: 11.5, lineHeight: 1.4 }}>lifetime, from backers</div>
          </Card>
          <Card style={{ padding: "22px 24px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
            <div className="faint" style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Lifetime invested</div>
            <Bucks amount={w.lifetime_invested} size={22} fontSize={20} />
            <div className="faint" style={{ fontSize: 11.5 }}>
              {myRank > 0 ? `#${myRank} on the leaderboard` : "back an idea to get ranked"}
            </div>
          </Card>
        </div>

        <SectionLabel style={{ marginBottom: 12 }}>Transactions</SectionLabel>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {txns.entries.length === 0 && (
            <p className="faint" style={{ padding: 20, margin: 0, fontStyle: "italic" }}>
              Nothing yet — claim your daily bucks and back an idea.
            </p>
          )}
          {txns.entries.map((t, i) => {
            const meta = TXN_META[t.data.type] ?? TXN_META.invest_out;
            const I = meta.I;
            const pos = t.data.amount > 0;
            return (
              <div
                key={t.id}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < txns.entries.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <span style={{ width: 34, height: 34, borderRadius: 9, background: meta.glyph, color: meta.color, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <I size={16} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{t.data.label}</div>
                  <div className="faint" style={{ fontSize: 12 }}>{when(t.data.created_at)}</div>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 600, fontSize: 14.5, fontVariantNumeric: "tabular-nums", color: pos ? "var(--success-text)" : "var(--text-primary)" }}>
                  {pos ? "+" : "−"}
                  <Coin size={15} />
                  {Math.abs(t.data.amount).toLocaleString()}
                </span>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
