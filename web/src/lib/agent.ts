import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * The Hatchly agent — M2's risky core, headless.
 *
 * One call per turn, using structured outputs: the model returns its
 * conversational reply PLUS extracted memories and brief updates in a single
 * validated JSON object. No tool-use round-trips.
 *
 * Model: the v4 spec's settings screen names "Claude Sonnet" — honored here
 * with the current Sonnet model ID. BYOK: the key arrives per-request from
 * the vault and is never logged.
 */

export const AGENT_MODEL = "claude-sonnet-5";

export type BriefSection = "problem" | "who" | "value" | "features" | "open_questions";

export type MemoryTopic =
  | "problem"
  | "customer"
  | "product"
  | "brand"
  | "design"
  | "pricing"
  | "gtm"
  | "competition"
  | "tech"
  | "risk"
  | "decision"
  | "other";

export const MEMORY_TOPICS: MemoryTopic[] = [
  "problem", "customer", "product", "brand", "design", "pricing",
  "gtm", "competition", "tech", "risk", "decision", "other",
];

export interface Brief {
  problem?: string;
  who?: string;
  value?: string;
  features?: string[];
  open_questions?: string[];
}

export interface AgentMemory {
  content: string;
  verbatim: string;
  topic: MemoryTopic;
  /** only when the fact directly fills a brief section */
  feeds?: BriefSection;
}

export interface AgentBriefUpdate {
  section: BriefSection;
  /** for problem / who / value — the full replacement text */
  value?: string;
  /** for features / open_questions — one item to append */
  add_item?: string;
  /** for open_questions — an existing question this turn ANSWERED, verbatim as it appears in the brief */
  resolve_item?: string;
}

export interface AgentIdeaUpdate {
  name?: string;
  one_liner?: string;
}

export interface AgentTurnResult {
  reply: string;
  memories: AgentMemory[];
  brief_updates: AgentBriefUpdate[];
  idea: AgentIdeaUpdate | null;
}

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description:
        "Your conversational reply to the founder. Warm, direct, 1-3 sentences, ends with one focused question when the brief still has gaps.",
    },
    memories: {
      type: "array",
      description:
        "Meaningful facts the founder just stated about their idea. Empty if this turn added nothing substantive. NEVER invent facts the founder did not say.",
      items: {
        type: "object",
        properties: {
          content: { type: "string", description: "The distilled claim, third person, <=140 chars" },
          verbatim: { type: "string", description: "The founder's exact words this came from" },
          topic: {
            type: "string",
            enum: ["problem", "customer", "product", "brand", "design", "pricing", "gtm", "competition", "tech", "risk", "decision", "other"],
            description:
              "What the fact is ABOUT. problem=the pain being solved · customer=who it's for, their behavior · product=features, functionality, scope · brand=name, voice, positioning, identity · design=visual style, colors, UX feel · pricing=money, monetization, willingness to pay · gtm=distribution, launch, marketing, growth · competition=rivals, alternatives, differentiation · tech=stack, architecture, integrations, privacy · risk=what could kill it, concerns · decision=a choice the founder made or reversed · other=none of these",
          },
          feeds: {
            type: "string",
            enum: ["problem", "who", "value", "features", "open_questions"],
            description:
              "OPTIONAL: which brief section this fact directly fills. Omit when the fact is context (design taste, pricing thoughts, competitor mentions) that belongs in memory but not in the 5-section brief.",
          },
        },
        required: ["content", "verbatim", "topic"],
        additionalProperties: false,
      },
    },
    brief_updates: {
      type: "array",
      description:
        "Updates to the product brief justified by this turn. For problem/who/value set `value` (full replacement text). For features/open_questions set `add_item` (one new entry; never duplicate an existing one). When this turn ANSWERS an existing open question, set `resolve_item` to that question's exact current text to remove it — do NOT add the answer as a new question.",
      items: {
        type: "object",
        properties: {
          section: {
            type: "string",
            enum: ["problem", "who", "value", "features", "open_questions"],
          },
          value: { type: "string" },
          add_item: { type: "string" },
          resolve_item: { type: "string" },
        },
        required: ["section"],
        additionalProperties: false,
      },
    },
    idea: {
      type: ["object", "null"],
      description:
        "Set ONLY when proposing or updating the idea's working name and one-liner — typically once, on the first substantive turn while the idea is still called 'Untitled idea', or when the founder names it themselves. null on ordinary turns.",
      properties: {
        name: { type: "string", description: "Short working name, <=40 chars, e.g. 'Pantry'" },
        one_liner: { type: "string", description: "The pitch in one sentence, <=100 chars" },
      },
      additionalProperties: false,
    },
  },
  required: ["reply", "memories", "brief_updates", "idea"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You are Hatchly — the agent ("H") that helps a founder shape a raw idea into a build-ready product brief through conversation.

Voice: warm but direct. Never hype-y ("Let's crush it!"), never coachy ("You got this!"), never generic-AI ("I'm here to help!"). You notice, you don't flatter. Three sentences max, then at most ONE focused question. Uncertainty from the founder is signal, not a problem — park it in open questions and say so.

Your job each turn:
1. Reply conversationally, moving the idea forward. When the brief has gaps, ask about the SINGLE most important gap next (priority: problem > who > value > features). When the brief is complete, say so and point them at the build gate.
2. Extract memories: meaningful facts the founder stated THIS turn. Capture the claim, their verbatim words, and the TOPIC (what the fact is about — design taste is "design", money talk is "pricing", launch/marketing talk is "gtm", competitor mentions are "competition", and so on). Only set "feeds" when the fact directly fills one of the 5 brief sections; taste, preferences, and context stay in memory without feeding the brief. Never invent, embellish, or infer beyond what was said. Small talk produces no memories.
3. Update the brief when this turn justified it. Refine existing text freely as understanding sharpens; keep each section tight (one or two sentences; features/questions are short single lines). Keep the brief PRODUCT-level: implementation details (auth providers, stacks, integrations) are memories with topic "tech" or "product", not brief features — unless they ARE the product.
4. Tend the open questions. When a turn answers an existing open question, resolve it (resolve_item) and record the answer as a memory — never leave answered questions in the brief, and never add an answer as a question.
5. Name the idea. While it is called "Untitled idea", propose a short working name and one-liner from what you've learned (set idea.name + idea.one_liner) and mention the proposal in your reply so the founder can push back. Update the one-liner when the pitch materially sharpens.

THE BUILD GATE opens when problem, who, and value are filled and there is at least one feature. The gate opening does NOT mean the idea is complete — ideas are never complete, only built or abandoned. Once the gate is open, mention it once, then use the SIGNAL MAP to deepen the thinking: steer toward the weakest signals that matter for this idea (competition and pricing almost always matter; gtm before any launch talk; risk when stakes are real). One area, one question at a time. Never manufacture urgency about "finishing".`;

function briefState(brief: Brief): string {
  const line = (label: string, v?: string) => `${label}: ${v?.trim() ? v : "(not captured yet)"}`;
  const list = (label: string, v?: string[]) =>
    `${label}: ${v?.length ? v.map((x) => `\n  - ${x}`).join("") : "(none yet)"}`;
  return [
    line("Problem", brief.problem),
    line("Who it's for", brief.who),
    line("Core value", brief.value),
    list("Features", brief.features),
    list("Open questions", brief.open_questions),
  ].join("\n");
}

export async function runAgentTurn(params: {
  apiKey: string;
  ideaName: string;
  oneLiner: string | undefined;
  brief: Brief;
  memories: { content: string; topic?: string }[];
  history: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
}): Promise<AgentTurnResult> {
  const { apiKey, ideaName, oneLiner, brief, memories, history, userMessage } = params;
  const client = new Anthropic({ apiKey });

  const gate = briefGate(brief);
  const counts = topicCounts(memories);
  const signal = SIGNAL_TOPICS.map((t) => `${t}: ${counts[t] ?? 0}`).join(" · ");

  const context = [
    `IDEA: ${ideaName}${oneLiner ? ` — ${oneLiner}` : ""}`,
    ``,
    `CURRENT BRIEF:`,
    briefState(brief),
    ``,
    `BUILD GATE: ${gate.open ? "OPEN" : `not yet — missing: ${[!gate.problem && "problem", !gate.who && "who", !gate.value && "value", !gate.feature && "a feature"].filter(Boolean).join(", ")}`}`,
    `SIGNAL MAP (memories per topic — steer toward relevant zeros once the gate is open):`,
    signal,
    ``,
    `MEMORIES ALREADY CAPTURED (do not re-capture these):`,
    memories.length ? memories.map((m) => `- ${m.topic ? `[${m.topic}] ` : ""}${m.content}`).join("\n") : "(none yet)",
  ].join("\n");

  const response = await client.messages.create({
    model: AGENT_MODEL,
    max_tokens: 16000,
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      { type: "text", text: context },
    ],
    output_config: {
      format: { type: "json_schema", schema: OUTPUT_SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [
      ...history.slice(-20).map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: userMessage },
    ],
  });

  if (response.stop_reason === "refusal") {
    return { reply: "I can't help with that one — want to get back to the idea?", memories: [], brief_updates: [], idea: null };
  }

  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  try {
    const parsed = JSON.parse(text) as AgentTurnResult;
    return {
      reply: parsed.reply ?? "",
      memories: Array.isArray(parsed.memories) ? parsed.memories : [],
      brief_updates: Array.isArray(parsed.brief_updates) ? parsed.brief_updates : [],
      idea: parsed.idea && typeof parsed.idea === "object" ? parsed.idea : null,
    };
  } catch {
    // Schema-constrained output should always parse; degrade gracefully if not.
    return { reply: text || "…", memories: [], brief_updates: [], idea: null };
  }
}

/**
 * The build gate — a readiness CHECKLIST, not a completion percentage.
 * An idea in ideation has no denominator ("a work of art is never finished,
 * only abandoned"); the gate only asks: have you said enough to build a first
 * version? Open questions are deliberately NOT part of the gate — they are a
 * health signal that grows with good thinking, not a box to fill.
 */
export interface BriefGate {
  problem: boolean;
  who: boolean;
  value: boolean;
  feature: boolean;
  open: boolean;
}

export function briefGate(brief: Brief): BriefGate {
  const g = {
    problem: !!brief.problem?.trim(),
    who: !!brief.who?.trim(),
    value: !!brief.value?.trim(),
    feature: (brief.features?.length ?? 0) >= 1,
  };
  return { ...g, open: g.problem && g.who && g.value && g.feature };
}

/** v4's completeness rule: problem + who + value + >=1 feature. */
export function briefComplete(brief: Brief): boolean {
  return briefGate(brief).open;
}

/** The signal map's display order — the compass, never a score. */
export const SIGNAL_TOPICS: MemoryTopic[] = [
  "problem", "customer", "product", "design", "brand",
  "pricing", "gtm", "competition", "tech", "risk",
];

export function topicCounts(memories: { topic?: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const m of memories) {
    if (m.topic) counts[m.topic] = (counts[m.topic] ?? 0) + 1;
  }
  return counts;
}
