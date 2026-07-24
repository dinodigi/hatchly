import { redirect } from "next/navigation";
import Link from "next/link";
import ReportActions from "@/components/admin/ReportActions";
import ListingActions from "@/components/admin/ListingActions";
import FeedbackActions from "@/components/admin/FeedbackActions";
import { Icons } from "@/components/icons";
import { Bucks, Card, SectionLabel } from "@/components/ui";
import { clerkEnabled } from "@/lib/clerk";
import { collusionScan, economyStats, getStaff } from "@/lib/admin";
import { callTool } from "@/lib/mcp";

/* Admin & moderation console (M6b) — the operator's view of the economy, now
   tabbed. Deliberately NOT generic CRUD: Pluggie's own admin does raw data.
   This is only what's specific to Hatchly. */

export const metadata = { title: "Admin — Hatchly" };
export const dynamic = "force-dynamic";

interface Entry<T> { id: string; data: T }

const pct = (n: number) => `${Math.round(n * 100)}%`;

const TABS = [
  { key: "economy", label: "Economy" },
  { key: "moderation", label: "Moderation" },
  { key: "signals", label: "Signals" },
  { key: "feedback", label: "Feedback" },
] as const;

function Stat({ label, children, hint, tone }: { label: string; children: React.ReactNode; hint?: string; tone?: string }) {
  return (
    <Card style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: tone, fontVariantNumeric: "tabular-nums" }}>{children}</div>
      {hint && <div className="faint" style={{ fontSize: 11.5, lineHeight: 1.4 }}>{hint}</div>}
    </Card>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  if (!clerkEnabled) redirect("/");
  const staff = await getStaff();
  if (!staff) redirect("/");

  const sp = await searchParams;
  const tab = TABS.some((t) => t.key === sp.tab) ? sp.tab! : "economy";

  const [econ, collusion, reports, listings, audit, feedback] = await Promise.all([
    economyStats(),
    collusionScan(),
    callTool<{ entries: Entry<{ target_kind: string; target_id: string; reason: string; detail?: string; status: string; created_at?: string }>[] }>("query_entries", {
      collection: "reports",
      where: [{ anyOf: [{ field: "status", op: "eq", value: "open" }, { field: "status", op: "eq", value: "reviewing" }] }],
      orderBy: { field: "created_at", dir: "desc" },
      limit: 25,
    }),
    callTool<{ entries: Entry<{ name: string; status: string; bucks_total: number; author?: { label: string } }>[] }>("query_entries", {
      collection: "listings",
      orderBy: { field: "bucks_total", dir: "desc" },
      select: ["name", "status", "bucks_total", "author"],
      limit: 20,
    }),
    callTool<{ entries: Entry<{ action: string; target_kind: string; target_label?: string; reason?: string; created_at?: string; actor?: { label: string } }>[] }>("query_entries", {
      collection: "admin_actions",
      orderBy: { field: "created_at", dir: "desc" },
      limit: 20,
    }),
    callTool<{ entries: Entry<{ message: string; name?: string; screen?: string; status: string; created_at?: string }>[] }>("query_entries", {
      collection: "shareholder_feedback",
      orderBy: { field: "created_at", dir: "desc" },
      limit: 100,
    }),
  ]);

  const when = (iso?: string) =>
    iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";

  const newFeedback = feedback.entries.filter((f) => f.data.status === "new").length;
  const counts: Record<string, number> = { moderation: reports.entries.length, feedback: newFeedback };

  return (
    <div className="scrollarea">
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 28px 100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, letterSpacing: "-0.02em", margin: 0 }}>Operations</h1>
          <span className="badge b-idea" style={{ fontSize: 9.5 }}>{staff.role}</span>
        </div>
        <p className="muted" style={{ fontSize: 14.5, margin: "0 0 22px" }}>
          Money supply, funnelling signals, moderation, and the feedback board. Every action here is logged.
        </p>

        {/* ---- tabs ---- */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 26 }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            const n = counts[t.key];
            return (
              <Link
                key={t.key}
                href={t.key === "economy" ? "/admin" : `/admin?tab=${t.key}`}
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", fontSize: 13.5, fontWeight: 500,
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent", marginBottom: -1,
                }}
              >
                {t.label}
                {n ? <span className="badge" style={{ fontSize: 9, background: "var(--accent-soft)", color: "var(--accent-text)" }}>{n}</span> : null}
              </Link>
            );
          })}
        </div>

        {/* ---- Economy ---- */}
        {tab === "economy" && (
          <>
            <SectionLabel style={{ marginBottom: 12 }}>Money supply</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 14 }}>
              <Stat label="In circulation" hint={`${econ.wallets} wallets`}>
                <Bucks amount={econ.supply} size={22} fontSize={22} style={{ color: "var(--accent-text)" }} />
              </Stat>
              <Stat label="Minted" hint="grants + daily claims" tone="var(--success-text)">+{econ.minted.toLocaleString()}</Stat>
              <Stat label="Burned" hint="taxes + spotlight + unlocks" tone="var(--danger-text)">−{econ.burned.toLocaleString()}</Stat>
              <Stat
                label="Mint : burn"
                hint={econ.inflation === null ? "no sink throughput yet" : econ.inflation > 1 ? "sinks are not keeping up — supply is inflating" : "sinks are absorbing supply"}
                tone={econ.inflation !== null && econ.inflation > 1 ? "var(--danger-text)" : "var(--success-text)"}
              >
                {econ.inflation === null ? "—" : `${econ.inflation.toFixed(2)}×`}
              </Stat>
              <Stat
                label="Ledger drift"
                hint={econ.drift === 0 ? "sum(ledger) == sum(wallets) — the invariant holds" : "wallet balances disagree with the ledger — investigate"}
                tone={econ.drift === 0 ? "var(--success-text)" : "var(--danger-text)"}
              >
                {econ.drift === 0 ? "0" : econ.drift > 0 ? `+${econ.drift.toLocaleString()}` : econ.drift.toLocaleString()}
              </Stat>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 13.5 }}>Ledger by type</div>
                {econ.byType.map((r) => {
                  const informational = r.type === "invest_tax" || r.type === "self_invest_tax";
                  return (
                    <div key={r.type} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 18px", borderBottom: "1px solid var(--border)" }}>
                      <span className="mono" style={{ fontSize: 12.5, flex: 1 }}>
                        {r.type}
                        {informational && <span className="faint" style={{ fontSize: 10.5, marginLeft: 6 }}>burn counted in out/in gap</span>}
                      </span>
                      <span className="faint" style={{ fontSize: 11.5 }}>{r.count}×</span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 600, width: 90, textAlign: "right", color: informational ? "var(--text-muted)" : r.sum >= 0 ? "var(--success-text)" : "var(--text-primary)" }}>
                        {r.sum >= 0 ? "+" : ""}{r.sum.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 18px", background: "var(--surface)" }}>
                  <span className="mono" style={{ fontSize: 12.5, flex: 1, color: "var(--accent-text)" }}>tax burned (derived)</span>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 600, width: 90, textAlign: "right", color: "var(--danger-text)" }}>−{econ.taxBurn.toLocaleString()}</span>
                </div>
              </Card>

              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 13.5 }}>Whale watch</div>
                {econ.topHolders.map((h, i) => (
                  <div key={`${i}-${h.name}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 18px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 13, flex: 1 }}>{h.name}</span>
                    <div style={{ width: 70, height: 5, borderRadius: 999, background: "var(--surface)", overflow: "hidden" }}>
                      <div style={{ width: pct(Math.min(h.share, 1)), height: "100%", background: h.share > 0.3 ? "var(--danger)" : "var(--accent)" }} />
                    </div>
                    <span className="mono faint" style={{ fontSize: 11.5, width: 38, textAlign: "right" }}>{pct(h.share)}</span>
                    <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, width: 62, textAlign: "right" }}>{h.balance.toLocaleString()}</span>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}

        {/* ---- Moderation ---- */}
        {tab === "moderation" && (
          <>
            <SectionLabel style={{ marginBottom: 12 }}>Report queue · {reports.entries.length} open</SectionLabel>
            <Card style={{ padding: 0, overflow: "hidden", marginBottom: 30 }}>
              {reports.entries.length === 0 && (
                <p className="faint" style={{ padding: "16px 18px", margin: 0, fontSize: 12.5, fontStyle: "italic" }}>Nothing reported. The queue is empty.</p>
              )}
              {reports.entries.map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
                  <span className="badge" style={{ fontSize: 9, background: "var(--danger-soft)", color: "var(--danger-text)" }}>{r.data.reason}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{r.data.target_kind} · <span className="mono faint" style={{ fontSize: 11.5 }}>{r.data.target_id.slice(0, 8)}</span></div>
                    {r.data.detail && <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{r.data.detail}</div>}
                  </div>
                  <span className="faint" style={{ fontSize: 11.5 }}>{when(r.data.created_at)}</span>
                  <ReportActions reportId={r.id} />
                </div>
              ))}
            </Card>

            <SectionLabel style={{ marginBottom: 12 }}>Listings</SectionLabel>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {listings.entries.map((l) => (
                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 18px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Link href={`/i/${l.id}`} style={{ fontSize: 13.5, fontWeight: 600 }}>{l.data.name}</Link>
                      {l.data.status === "hidden" && <span className="badge" style={{ fontSize: 9, background: "var(--danger-soft)", color: "var(--danger-text)" }}>hidden</span>}
                    </div>
                    <div className="faint" style={{ fontSize: 11.5 }}>{l.data.author?.label ?? "—"}</div>
                  </div>
                  <span className="mono faint" style={{ fontSize: 12 }}>{l.data.bucks_total.toLocaleString()}</span>
                  <ListingActions listingId={l.id} name={l.data.name} hidden={l.data.status === "hidden"} />
                </div>
              ))}
            </Card>
          </>
        )}

        {/* ---- Signals ---- */}
        {tab === "signals" && (
          <>
            <SectionLabel style={{ marginBottom: 12 }}>Funnelling signals · {collusion.scanned} stakes scanned</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 30 }}>
              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Icons.users size={15} style={{ color: "var(--danger-text)" }} />
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>Reciprocal pairs</span>
                  <span className="spacer" style={{ flex: 1 }} />
                  <span className="faint" style={{ fontSize: 11.5 }}>{collusion.pairs.length}</span>
                </div>
                {collusion.pairs.length === 0 && (
                  <p className="faint" style={{ padding: "16px 18px", margin: 0, fontSize: 12.5, fontStyle: "italic" }}>No two accounts are backing each other. Clean.</p>
                )}
                {collusion.pairs.slice(0, 8).map((p, i) => (
                  <div key={`${i}-${p.a}-${p.b}`} style={{ padding: "11px 18px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{p.a}</span>
                      <Icons.arrowR size={13} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{p.b}</span>
                      <span className="spacer" style={{ flex: 1 }} />
                      {p.symmetry >= 0.8 && <span className="badge" style={{ fontSize: 9, background: "var(--danger-soft)", color: "var(--danger-text)" }}>wash</span>}
                    </div>
                    <div className="faint mono" style={{ fontSize: 11.5 }}>
                      {p.aToB.toLocaleString()} out / {p.bToA.toLocaleString()} back · {pct(p.symmetry)} symmetric · {p.total.toLocaleString()} total
                    </div>
                  </div>
                ))}
              </Card>

              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Icons.target size={15} style={{ color: "var(--accent-text)" }} />
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>Concentrated inflow</span>
                  <span className="spacer" style={{ flex: 1 }} />
                  <span className="faint" style={{ fontSize: 11.5 }}>{collusion.concentrated.length}</span>
                </div>
                {collusion.concentrated.length === 0 && (
                  <p className="faint" style={{ padding: "16px 18px", margin: 0, fontSize: 12.5, fontStyle: "italic" }}>No founder is bankrolled by a single source.</p>
                )}
                {collusion.concentrated.slice(0, 8).map((c, i) => (
                  <div key={`${i}-${c.founder}`} style={{ padding: "11px 18px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{c.founder}</div>
                    <div className="faint" style={{ fontSize: 11.5 }}>{pct(c.share)} of {c.totalIn.toLocaleString()} from <b style={{ color: "var(--text-primary)" }}>{c.topBacker}</b></div>
                  </div>
                ))}
              </Card>
            </div>

            <SectionLabel style={{ marginBottom: 12 }}>Audit trail</SectionLabel>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {audit.entries.length === 0 && (
                <p className="faint" style={{ padding: "16px 18px", margin: 0, fontSize: 12.5, fontStyle: "italic" }}>No staff actions yet.</p>
              )}
              {audit.entries.map((a) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: "1px solid var(--border)" }}>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--accent-text)", width: 128 }}>{a.data.action}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13 }}>{a.data.target_label ?? a.data.target_kind}</span>
                    {a.data.reason && <span className="faint" style={{ fontSize: 12 }}> — {a.data.reason}</span>}
                  </div>
                  <span className="faint" style={{ fontSize: 11.5 }}>{a.data.actor?.label ?? "—"}</span>
                  <span className="faint" style={{ fontSize: 11.5 }}>{when(a.data.created_at)}</span>
                </div>
              ))}
            </Card>
          </>
        )}

        {/* ---- Feedback (task list) ---- */}
        {tab === "feedback" && (
          <>
            <SectionLabel style={{ marginBottom: 12 }}>Shareholder feedback · {newFeedback} new</SectionLabel>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {feedback.entries.length === 0 && (
                <p className="faint" style={{ padding: "16px 18px", margin: 0, fontSize: 12.5, fontStyle: "italic" }}>No feedback yet.</p>
              )}
              {feedback.entries.map((f) => {
                const tone =
                  f.data.status === "actioned"
                    ? { bg: "var(--success-soft)", fg: "var(--success-text)" }
                    : f.data.status === "reviewed"
                      ? { bg: "var(--surface)", fg: "var(--text-secondary)" }
                      : { bg: "var(--accent-soft)", fg: "var(--accent-text)" };
                return (
                  <div key={f.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "13px 18px", borderBottom: "1px solid var(--border)", opacity: f.data.status === "actioned" ? 0.6 : 1 }}>
                    <span className="badge" style={{ fontSize: 9, background: tone.bg, color: tone.fg, marginTop: 2, flex: "none" }}>{f.data.status}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{f.data.message}</div>
                      <div className="faint" style={{ fontSize: 11.5, marginTop: 4 }}>
                        {f.data.name || "Anonymous"} · <span className="mono">{f.data.screen || "—"}</span> · {when(f.data.created_at)}
                      </div>
                    </div>
                    <FeedbackActions id={f.id} status={f.data.status} />
                  </div>
                );
              })}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
