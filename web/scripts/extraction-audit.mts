/**
 * BL-56 — the extraction audit harness.
 *
 * Replays a fixed founder transcript through the REAL agent pipeline —
 * runAgentTurn plus the route's shared turn-apply logic — against in-memory
 * state, then reports the sprint's five extraction metrics against the
 * audited baseline. Writes NOTHING to Pluggie; the only network calls are
 * one chat_templates read and the model calls themselves.
 *
 * The transcript (fixture) is frozen; system prompts and question arcs are
 * fetched live from chat_templates, so a CMS prompt edit is exactly what a
 * re-run measures. Same conversation in, so metric movement is attributable.
 *
 *   npm run audit:extraction                 live replay (~21 model calls)
 *   npm run audit:extraction -- --baseline   no API calls; recompute metrics
 *                                            over the fixture's stored rows
 *                                            (validates the metric code)
 *
 * Live runs need ANTHROPIC_API_KEY (the harness's own key — founder BYOK
 * vault keys are never touched) and AGENTX_MCP_TOKEN, both read from
 * web/.env.local. Run from web/ (npm run does this for you).
 *
 * Invoked via `node --conditions=react-server --import tsx` so the
 * "server-only" guard in agent.ts/mcp.ts resolves to its empty react-server
 * build instead of throwing outside Next.
 */

import fs from "node:fs";
import path from "node:path";
import { runAgentTurn, type ArcIntent, type Brief } from "../src/lib/agent";
import {
  applyBriefUpdates,
  isDegenerate,
  memoryRowData,
  planIdeaPatch,
  planMemoryWrites,
} from "../src/lib/turn-apply";

// ---------- fixture shapes ----------

interface ExpectedEntity {
  name: string;
  class: string;
  source?: string;
  aliases: string[];
}

interface FixtureRow {
  template: string;
  turn: number;
  kind: string;
  topic: string;
  intent_key?: string;
  feeds?: string;
  entities: string[];
  content: string;
  verbatim: string;
}

interface Fixture {
  name: string;
  start: { idea_name: string; one_liner: string; brief: Brief };
  sessions: { template_key: string; founder_messages: string[] }[];
  expected_entities: ExpectedEntity[];
  agent_emergent_watchlist: ExpectedEntity[];
  baseline: {
    agent_mentioned: string[];
    final_brief: { problem?: string; who?: string; value?: string };
    degenerate_replies: number;
    rows: FixtureRow[];
  };
}

/** One replayed (or baseline) memory row — the stored shape plus bookkeeping. */
interface Row extends FixtureRow {
  id: string;
}

// ---------- env ----------

function loadEnvFiles() {
  for (const f of [".env.local", ".env"]) {
    const p = path.join(process.cwd(), f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line.trim());
      if (!m) continue;
      if (process.env[m[1]] !== undefined) continue;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

// ---------- text machinery for the metrics ----------

const STOPWORDS = new Set(
  "the a an to of and or in on for as is are was were it its their they this that with from so be not no by at into your you we our".split(" "),
);

function normText(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9$\-]+/gi, " ").replace(/\s+/g, " ").trim();
}

function tokens(s: string): Set<string> {
  return new Set(normText(s).split(" ").filter((t) => t && !STOPWORDS.has(t)));
}

/** |A ∩ B| / min(|A|,|B|) — how much the smaller set is contained in the larger. */
function containment(a: Set<string>, b: Set<string>): number {
  const min = Math.min(a.size, b.size);
  if (min === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / min;
}

function entityMatches(entity: string, aliases: string[]): boolean {
  const ne = normText(entity);
  if (!ne) return false;
  return aliases.some((a) => {
    const na = normText(a);
    return na.length > 0 && (ne.includes(na) || na.includes(ne));
  });
}

// ---------- the five metrics (+ degenerate replies) ----------

const CONTENT_DUP_THRESHOLD = 0.6;
const VERBATIM_DUP_THRESHOLD = 0.8;
const MIN_TOKENS_FOR_CONTENT_DUP = 4;

interface DupPair {
  a: string;
  b: string;
  reason: string;
  score: number;
}

interface Metrics {
  total: number;
  entitiesPopulated: number;
  competitorsExpected: { name: string; captured: boolean; source: string }[];
  otherExpected: { name: string; captured: boolean }[];
  dupPairs: DupPair[];
  noIntent: { content: string }[];
  kinds: string[];
  /** Raw model-level degenerate samples (comparable to the pre-BL-01 baseline). */
  degenerateReplies: number;
  /** Duds surviving the BL-01 retry mirror — what a founder would actually see. */
  degenerateFinal?: number;
}

function computeMetrics(
  rows: Row[],
  fixture: Fixture,
  finalBrief: { problem?: string; who?: string; value?: string },
  agentMentioned: string[],
  degenerateReplies: number,
): Metrics {
  // 1. entities populated
  const entitiesPopulated = rows.filter((r) => (r.entities ?? []).length > 0).length;

  // 2. named competitors/tools captured. Founder-named items are always
  //    expected; agent-emergent items (Splitwise-class) only count when this
  //    run's replies actually mentioned them — regenerated replies vary.
  const allEntities = rows.flatMap((r) => r.entities ?? []);
  const mentioned = new Set(agentMentioned.map((n) => normText(n)));
  const emergentActive = fixture.agent_emergent_watchlist.filter((e) => mentioned.has(normText(e.name)));
  const expectedAll: (ExpectedEntity & { source: string })[] = [
    ...fixture.expected_entities.map((e) => ({ ...e, source: e.source ?? "founder" })),
    ...emergentActive.map((e) => ({ ...e, source: "agent" })),
  ];
  const scored = expectedAll.map((e) => ({
    name: e.name,
    class: e.class,
    source: e.source,
    captured: allEntities.some((x) => entityMatches(x, e.aliases)),
  }));
  const competitorsExpected = scored.filter((e) => e.class === "competitor_tool" || e.class === "alternative");
  const otherExpected = scored.filter((e) => e.class !== "competitor_tool" && e.class !== "alternative");

  // 3. duplicate / fragment pairs — content-token containment, verbatim
  //    overlap (two rows extracted from the same founder words), and rows
  //    restating a brief field.
  const dupPairs: DupPair[] = [];
  const label = (r: Row) => `[${r.template} t${r.turn}] ${r.content.slice(0, 60)}${r.content.length > 60 ? "…" : ""}`;
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i], b = rows[j];
      const ta = tokens(a.content), tb = tokens(b.content);
      const contentScore =
        Math.min(ta.size, tb.size) >= MIN_TOKENS_FOR_CONTENT_DUP ? containment(ta, tb) : 0;
      const va = normText(a.verbatim), vb = normText(b.verbatim);
      const shorter = va.length <= vb.length ? va : vb;
      const verbatimSubstring = shorter.length >= 15 && (va.includes(vb) || vb.includes(va));
      const verbatimScore = containment(tokens(a.verbatim), tokens(b.verbatim));
      if (contentScore >= CONTENT_DUP_THRESHOLD) {
        dupPairs.push({ a: label(a), b: label(b), reason: "content overlap", score: contentScore });
      } else if (verbatimSubstring || verbatimScore >= VERBATIM_DUP_THRESHOLD) {
        dupPairs.push({
          a: label(a),
          b: label(b),
          reason: "same founder words",
          score: verbatimSubstring ? 1 : verbatimScore,
        });
      }
    }
  }
  for (const r of rows) {
    for (const field of ["problem", "who", "value"] as const) {
      const briefText = finalBrief[field];
      if (!briefText) continue;
      const tr = tokens(r.content), tf = tokens(briefText);
      if (Math.min(tr.size, tf.size) >= MIN_TOKENS_FOR_CONTENT_DUP && containment(tr, tf) >= CONTENT_DUP_THRESHOLD) {
        dupPairs.push({ a: label(r), b: `brief.${field}`, reason: "restates brief field", score: containment(tr, tf) });
      }
    }
  }

  // 4. memories with no intent_key
  const noIntent = rows.filter((r) => !r.intent_key).map((r) => ({ content: label(r) }));

  // 5. kind values in use
  const kinds = [...new Set(rows.map((r) => r.kind))].sort();

  return { total: rows.length, entitiesPopulated, competitorsExpected, otherExpected, dupPairs, noIntent, kinds, degenerateReplies };
}

// ---------- live replay ----------

interface TemplateBundle {
  focus: string;
  arc: ArcIntent[];
  system_prompt: string;
  name: string;
}

async function fetchTemplates(keys: string[]): Promise<Map<string, TemplateBundle>> {
  // Import lazily so --baseline runs need no MCP token.
  const { callTool } = await import("../src/lib/mcp");
  const res = await callTool<{
    entries: { data: { key: string; name: string; system_prompt: string; question_arc?: string } }[];
  }>("query_entries", {
    collection: "chat_templates",
    where: [{ field: "key", op: "in", value: keys }],
    select: ["key", "name", "system_prompt", "question_arc"],
    limit: 20,
  });
  const map = new Map<string, TemplateBundle>();
  for (const e of res.entries) {
    let arc: ArcIntent[] = [];
    try {
      arc = (JSON.parse(e.data.question_arc || "[]") as ArcIntent[]).filter((a) => a?.key && a?.intent);
    } catch {
      arc = [];
    }
    map.set(e.data.key, {
      focus: `${e.data.name} — ${e.data.system_prompt}`,
      arc,
      system_prompt: e.data.system_prompt,
      name: e.data.name,
    });
  }
  return map;
}

const isTransientModelError = (e: unknown): boolean => {
  const status = (e as { status?: number })?.status;
  return status === 429 || (typeof status === "number" && status >= 500) || (e as Error)?.name === "APIConnectionError";
};

async function replay(fixture: Fixture, apiKey: string) {
  const templates = await fetchTemplates(fixture.sessions.map((s) => s.template_key));
  for (const s of fixture.sessions) {
    if (!templates.has(s.template_key)) throw new Error(`chat_templates has no entry with key "${s.template_key}"`);
  }

  const rows: Row[] = [];
  let brief: Brief = structuredClone(fixture.start.brief);
  let ideaName = fixture.start.idea_name;
  let oneLiner: string | undefined = fixture.start.one_liner;
  const replies: { template: string; turn: number; text: string }[] = [];
  let nextId = 1;
  let degenerateRaw = 0;
  let degenerateFinal = 0;

  const totalTurns = fixture.sessions.reduce((n, s) => n + s.founder_messages.length, 0);
  console.log(`Replaying ${totalTurns} founder turns across ${fixture.sessions.length} chats (model: see agent.ts AGENT_MODEL)…\n`);

  let done = 0;
  for (const session of fixture.sessions) {
    const tpl = templates.get(session.template_key)!;
    const arcMode = new Map(tpl.arc.map((a) => [a.key, a.mode]));
    const history: { role: "user" | "assistant"; content: string }[] = [];
    let lastTurn = 0;

    for (const message of session.founder_messages) {
      const nextTurn = lastTurn + 1;
      // Mirror route.ts state assembly: first row per intent_key wins; the
      // singular-update invariant keeps one row per key anyway.
      const intentNodes = new Map<string, { id: string; content: string }>();
      for (const r of rows) {
        if (r.intent_key && !intentNodes.has(r.intent_key)) intentNodes.set(r.intent_key, { id: r.id, content: r.content });
      }

      const turnCall = async () => {
        for (let attempt = 0; ; attempt++) {
          try {
            return await runAgentTurn({
              apiKey,
              ideaName,
              oneLiner,
              brief,
              memories: rows.map((r) => ({ content: r.content, topic: r.topic })),
              history,
              userMessage: message,
              chatFocus: tpl.focus,
              chatArc: tpl.arc,
              resolvedIntents: [...intentNodes.keys()],
            });
          } catch (e) {
            if (attempt === 0 && isTransientModelError(e)) {
              const wait = (e as { status?: number })?.status === 429 ? 20000 : 4000;
              console.log(`  transient model error (${(e as Error).message}) — retrying in ${wait / 1000}s`);
              await new Promise((r) => setTimeout(r, wait));
              continue;
            }
            throw e;
          }
        }
      };
      let result = await turnCall();
      // Mirror the route's BL-01 guard: one silent retry on a degenerate
      // sample, so the replay measures what production founders experience.
      // Raw count still reported — it's the model-level degeneracy rate.
      if (isDegenerate(result)) {
        degenerateRaw++;
        console.log(`  [${session.template_key} t${nextTurn}] degenerate sample — retrying once (BL-01 mirror)`);
        const second = await turnCall();
        if (isDegenerate(second)) degenerateFinal++;
        else result = second;
      }

      const applied = applyBriefUpdates(brief, result);
      brief = applied.brief;
      const writes = planMemoryWrites(result.memories, arcMode, intentNodes);
      for (const w of writes) {
        const data = memoryRowData(w.m, w.intentKey, nextTurn);
        if (w.updateOf) {
          const existing = rows.find((r) => r.id === w.updateOf!.id)!;
          // update_entry merges provided fields; unset optional fields survive.
          Object.assign(existing, data, { template: session.template_key });
        } else {
          rows.push({ id: String(nextId++), template: session.template_key, ...data } as Row);
        }
      }
      const patch = planIdeaPatch(result, { name: ideaName, one_liner: oneLiner });
      if (patch.name) ideaName = patch.name;
      if (patch.one_liner) oneLiner = patch.one_liner;

      history.push({ role: "user", content: message }, { role: "assistant", content: result.reply });
      replies.push({ template: session.template_key, turn: nextTurn + 1, text: result.reply });
      lastTurn = nextTurn + 1;
      done++;
      const updates = writes.filter((w) => w.updateOf).length;
      console.log(
        `  [${session.template_key} t${nextTurn}] (${done}/${totalTurns}) reply ${result.reply.trim().length} chars · +${writes.length - updates} mem${updates ? ` · ${updates} node update` : ""} · ${applied.traces.filter((t) => t.startsWith("updated brief") || t === "resolved question").length} brief change(s)`,
      );
    }
  }

  // Which watchlist names did THIS run's replies mention? Those join the
  // captured-entities denominator (the Splitwise-class test).
  const replyText = normText(replies.map((r) => r.text).join(" \n "));
  const agentMentioned = fixture.agent_emergent_watchlist
    .filter((e) => e.aliases.some((a) => replyText.includes(normText(a))))
    .map((e) => e.name);

  return { rows, brief, ideaName, oneLiner, replies, degenerateRaw, degenerateFinal, agentMentioned, templates };
}

// ---------- report ----------

function pct(n: number, d: number): string {
  return d ? `${Math.round((100 * n) / d)}%` : "—";
}

function printReport(m: Metrics, baseline: Metrics, targetNote = true) {
  const compCaptured = (x: Metrics) => x.competitorsExpected.filter((e) => e.captured).length;
  const line = (metric: string, base: string, run: string, target: string) =>
    console.log(`  ${metric.padEnd(34)} ${base.padEnd(14)} ${run.padEnd(14)} ${target}`);

  console.log(`\n=== Extraction audit ===\n`);
  line("Metric", "Baseline", "This run", "Target");
  line("------", "--------", "--------", "------");
  line(
    "Memories with entities",
    `${baseline.entitiesPopulated}/${baseline.total} (${pct(baseline.entitiesPopulated, baseline.total)})`,
    `${m.entitiesPopulated}/${m.total} (${pct(m.entitiesPopulated, m.total)})`,
    "> 70%",
  );
  line(
    "Competitors/tools captured",
    `${compCaptured(baseline)}/${baseline.competitorsExpected.length}`,
    `${compCaptured(m)}/${m.competitorsExpected.length}`,
    "all",
  );
  line("Duplicate/fragment pairs", String(baseline.dupPairs.length), String(m.dupPairs.length), "<= 1");
  line("No intent_key", `${baseline.noIntent.length}/${baseline.total}`, `${m.noIntent.length}/${m.total}`, "< 3");
  line("kind values in use", `${baseline.kinds.length}/7`, `${m.kinds.length}/7`, "6/7 or cut");
  line(
    "Degenerate samples (raw)",
    String(baseline.degenerateReplies),
    m.degenerateFinal !== undefined ? `${m.degenerateReplies} (${m.degenerateFinal} past retry)` : String(m.degenerateReplies),
    "0",
  );

  console.log(`\n  kinds this run: ${m.kinds.join(", ") || "(none)"}`);
  console.log(`\n  Competitors/tools:`);
  for (const e of m.competitorsExpected) console.log(`    ${e.captured ? "✓" : "✗"} ${e.name} (${e.source}-named)`);
  console.log(`  Other named things:`);
  for (const e of m.otherExpected) console.log(`    ${e.captured ? "✓" : "✗"} ${e.name}`);
  if (m.dupPairs.length) {
    console.log(`\n  Duplicate/fragment candidates (eyeball these):`);
    for (const p of m.dupPairs) console.log(`    · ${p.reason} ${(p.score * 100) | 0}%\n      ${p.a}\n      ${p.b}`);
  }
  if (m.noIntent.length) {
    console.log(`\n  Unanchored memories (no intent_key):`);
    for (const r of m.noIntent) console.log(`    · ${r.content}`);
  }
  if (targetNote)
    console.log(
      `\nHeuristic counts, same thresholds every run — compare runs, don't worship absolutes.\nRe-run after every prompt change; if a metric hasn't moved after three runs, stop tuning and re-plan.`,
    );
}

// ---------- main ----------

async function main() {
  loadEnvFiles();
  const args = process.argv.slice(2);
  const baselineOnly = args.includes("--baseline");
  const fixtureArg = args.find((a) => a.startsWith("--fixture="))?.slice("--fixture=".length);
  const fixturePath = path.resolve(process.cwd(), fixtureArg ?? "scripts/fixtures/basecamp-ledger.json");
  if (!fs.existsSync(fixturePath)) {
    console.error(`Fixture not found: ${fixturePath}\nRun from web/ (npm run audit:extraction).`);
    process.exit(1);
  }
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8")) as Fixture;

  const baselineRows: Row[] = fixture.baseline.rows.map((r, i) => ({ ...r, id: `b${i + 1}` }));
  const baselineMetrics = computeMetrics(
    baselineRows,
    fixture,
    fixture.baseline.final_brief,
    fixture.baseline.agent_mentioned,
    fixture.baseline.degenerate_replies,
  );

  if (baselineOnly) {
    console.log(`Baseline mode — no model calls; recomputing metrics over the fixture's ${baselineRows.length} stored rows.`);
    printReport(baselineMetrics, baselineMetrics, false);
    console.log(
      `\nExpected from the 2026-07-30 audit: entities 5/15 · competitors 0/3 · dup pairs 3 · no intent_key 7/15 (SPRINT.md says 6 — recount of stored rows is 7) · kinds 4/7 · degenerate 2.`,
    );
    return;
  }

  if (args.includes("--dry-run")) {
    // Preflight: exercise the template fetch + arc parsing, no model calls.
    if (!process.env.AGENTX_MCP_TOKEN) {
      console.error(`AGENTX_MCP_TOKEN is not set — needed to fetch live chat_templates (read-only).`);
      process.exit(1);
    }
    const templates = await fetchTemplates(fixture.sessions.map((s) => s.template_key));
    console.log(`Dry run — live templates fetched, no model calls:\n`);
    for (const s of fixture.sessions) {
      const t = templates.get(s.template_key);
      if (!t) {
        console.error(`  ✗ ${s.template_key}: NO TEMPLATE with this key in chat_templates`);
        process.exitCode = 1;
        continue;
      }
      console.log(`  ✓ ${s.template_key}: ${s.founder_messages.length} founder turn(s) · arc ${t.arc.length} intent(s)`);
      console.log(`      focus: ${t.focus.slice(0, 110)}${t.focus.length > 110 ? "…" : ""}`);
    }
    console.log(`\nReady: ${fixture.sessions.reduce((n, s) => n + s.founder_messages.length, 0)} model calls per live run.`);
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error(
      `ANTHROPIC_API_KEY is not set (checked env + web/.env.local).\n` +
        `The audit burns ~${fixture.sessions.reduce((n, s) => n + s.founder_messages.length, 0)} model calls on this key per run. ` +
        `Founder BYOK vault keys are deliberately not used.`,
    );
    process.exit(1);
  }
  if (!process.env.AGENTX_MCP_TOKEN) {
    console.error(`AGENTX_MCP_TOKEN is not set — needed to fetch live chat_templates (read-only).`);
    process.exit(1);
  }

  const t0 = Date.now();
  const run = await replay(fixture, apiKey);
  const metrics = computeMetrics(
    run.rows,
    fixture,
    { problem: run.brief.problem, who: run.brief.who, value: run.brief.value },
    run.agentMentioned,
    run.degenerateRaw,
  );
  metrics.degenerateFinal = run.degenerateFinal;
  printReport(metrics, baselineMetrics);

  // Persist the run for diffing — gitignored; commit a copy if it's evidence.
  const outDir = path.join(path.dirname(fixturePath), "..", "audit-runs");
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outPath = path.join(outDir, `run-${stamp}.json`);
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        ran_at: new Date().toISOString(),
        fixture: fixture.name,
        duration_s: Math.round((Date.now() - t0) / 1000),
        prompts_under_test: Object.fromEntries(
          [...run.templates.entries()].map(([k, v]) => [k, { name: v.name, system_prompt: v.system_prompt, arc_intents: v.arc.length }]),
        ),
        metrics: {
          entities_populated: `${metrics.entitiesPopulated}/${metrics.total}`,
          competitors_captured: `${metrics.competitorsExpected.filter((e) => e.captured).length}/${metrics.competitorsExpected.length}`,
          duplicate_pairs: metrics.dupPairs.length,
          no_intent_key: `${metrics.noIntent.length}/${metrics.total}`,
          kinds_in_use: metrics.kinds,
          degenerate_raw: metrics.degenerateReplies,
          degenerate_past_retry: metrics.degenerateFinal ?? 0,
        },
        entity_detail: { competitors: metrics.competitorsExpected, other: metrics.otherExpected },
        dup_pairs: metrics.dupPairs,
        final_state: { idea_name: run.ideaName, one_liner: run.oneLiner, brief: run.brief },
        rows: run.rows,
        replies: run.replies,
      },
      null,
      2,
    ),
  );
  console.log(`\nRun saved: ${path.relative(process.cwd(), outPath)} (${Math.round((Date.now() - t0) / 1000)}s)`);
}

main().catch((e) => {
  console.error(`\nAudit run failed: ${(e as Error).message}`);
  process.exit(1);
});
