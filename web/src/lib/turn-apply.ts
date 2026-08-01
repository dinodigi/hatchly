import type { AgentMemory, AgentTurnResult, Brief } from "./agent";

/**
 * Pure turn-application logic, shared by the chat route (which persists the
 * result) and the extraction audit harness (which replays a fixed transcript
 * in memory — BL-56). Extracted from route.ts so the harness measures the
 * REAL pipeline; if this logic changes, both consumers change together.
 *
 * No imports with side effects here — this module must stay runnable outside
 * the Next server (the harness runs it under plain node).
 */

/** A dud sample from structured output: a few characters of reply and nothing
 *  else extracted. Real case: the literal string "content" (BL-01). Shared so
 *  the route's retry guard and the audit harness use the same definition. */
export function isDegenerate(r: Pick<AgentTurnResult, "reply" | "memories" | "brief_updates" | "suggested_replies">): boolean {
  return r.reply.trim().length < 20 && !r.memories.length && !r.brief_updates.length && !r.suggested_replies.length;
}

/** Apply a turn's brief updates + the feeds:"features" backfill. Returns the
 *  new brief and the human-readable trace lines, in the exact order the chat
 *  UI has always shown them. */
export function applyBriefUpdates(
  brief: Brief,
  result: Pick<AgentTurnResult, "brief_updates" | "memories">,
): { brief: Brief; traces: string[] } {
  const newBrief: Brief = {
    ...brief,
    features: [...(brief.features ?? [])],
    open_questions: [...(brief.open_questions ?? [])],
  };
  const traces: string[] = [];
  for (const u of result.brief_updates) {
    if ((u.section === "problem" || u.section === "who" || u.section === "value") && u.value?.trim()) {
      newBrief[u.section] = u.value.trim();
      traces.push(`updated brief · ${u.section === "who" ? "who it's for" : u.section === "value" ? "core value" : "problem"}`);
    } else if (u.section === "open_questions" && u.resolve_item?.trim()) {
      const needle = u.resolve_item.trim().toLowerCase();
      const list = newBrief.open_questions!;
      const idx = list.findIndex(
        (x) => x.toLowerCase() === needle || x.toLowerCase().includes(needle) || needle.includes(x.toLowerCase()),
      );
      if (idx >= 0) {
        list.splice(idx, 1);
        traces.push(`resolved question`);
      }
    } else if ((u.section === "features" || u.section === "open_questions") && u.add_item?.trim()) {
      const list = newBrief[u.section]!;
      if (!list.some((x) => x.toLowerCase() === u.add_item!.trim().toLowerCase())) {
        list.push(u.add_item.trim());
        traces.push(`updated brief · ${u.section === "features" ? "features" : "open questions"}`);
      }
    }
  }
  // Backfill: a memory that explicitly feeds "features" belongs in the brief even
  // when the model forgot to emit a matching brief_update — the gap that left
  // confirmed MVP features tagged in memory but absent from the brief/artifact
  // (feedback d6c37fec).
  for (const m of result.memories) {
    if (m.feeds === "features" && m.content.trim()) {
      const item = m.content.trim();
      if (!newBrief.features!.some((x) => x.toLowerCase() === item.toLowerCase())) {
        newBrief.features!.push(item);
        traces.push(`updated brief · features`);
      }
    }
  }
  return { brief: newBrief, traces };
}

/** One planned memory write: an in-place UPDATE of an existing singular-intent
 *  node, or a plain CREATE. */
export interface MemWrite {
  m: AgentMemory;
  intentKey?: string;
  updateOf?: { id: string; content: string };
}

/** Split a turn's memories into singular-node updates and creates. An intent
 *  tag is only honored when it belongs to THIS chat's arc; a singular intent
 *  with an existing node mutates that node instead of stacking a sibling. */
export function planMemoryWrites(
  memories: AgentMemory[],
  arcMode: Map<string, "singular" | "accumulative">,
  intentNodes: Map<string, { id: string; content: string }>,
): MemWrite[] {
  return memories.map((m) => {
    const intentKey = m.intent && arcMode.has(m.intent) ? m.intent : undefined;
    const existing = intentKey ? intentNodes.get(intentKey) : undefined;
    const singular = intentKey ? arcMode.get(intentKey) === "singular" : false;
    return { m, intentKey, updateOf: singular && existing ? existing : undefined };
  });
}

/** The stored shape of one memory row's turn-derived fields, with the same
 *  truncations the route has always applied. Storage concerns (owner, idea,
 *  chat, source_type, superseded) stay with the caller. */
export function memoryRowData(m: AgentMemory, intentKey: string | undefined, nextTurn: number) {
  return {
    content: m.content.slice(0, 500),
    verbatim: m.verbatim.slice(0, 2000),
    source_label: `turn ${nextTurn}`,
    turn: nextTurn,
    topic: m.topic,
    kind: m.kind,
    entities: (m.entities ?? []).slice(0, 12).map((x) => x.slice(0, 80)),
    ...(intentKey ? { intent_key: intentKey } : {}),
    ...(m.feeds ? { feeds: m.feeds } : {}),
  };
}

/** Idea naming — the agent proposes; sanity-cap lengths. */
export function planIdeaPatch(
  result: Pick<AgentTurnResult, "idea">,
  current: { name: string; one_liner?: string },
): { name?: string; one_liner?: string } {
  const patch: { name?: string; one_liner?: string } = {};
  if (result.idea?.name?.trim() && result.idea.name.trim() !== current.name) {
    patch.name = result.idea.name.trim().slice(0, 40);
  }
  if (result.idea?.one_liner?.trim() && result.idea.one_liner.trim() !== current.one_liner) {
    patch.one_liner = result.idea.one_liner.trim().slice(0, 100);
  }
  return patch;
}
