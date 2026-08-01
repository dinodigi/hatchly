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
  | "market_size"
  | "timing"
  | "legal"
  | "other";

export const MEMORY_TOPICS: MemoryTopic[] = [
  "problem", "customer", "product", "brand", "design", "pricing",
  "gtm", "competition", "tech", "risk", "market_size", "timing", "legal", "other",
];

/** What KIND of claim a memory is — the dimension that lets outputs tell a
 *  validated finding from a hunch. Disambiguation rules live in the schema
 *  description so tagging stays consistent. */
export type MemoryKind =
  | "decision"
  | "evidence"
  | "assumption"
  | "constraint"
  | "preference"
  | "question"
  | "risk";

/** One intent from a chat template's question arc — the fixed list of things
 *  that chat exists to resolve. `mode` drives the write path: singular nodes
 *  UPDATE in place, accumulative ones append. */
export interface ArcIntent {
  key: string;
  intent: string;
  required?: boolean;
  mode: "singular" | "accumulative";
}

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
  kind: MemoryKind;
  /** named things mentioned: competitors, channels, price points, segments */
  entities?: string[];
  /** which arc intent this answers — only keys from THIS chat's arc */
  intent?: string;
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
  /** 2-4 tap-to-answer options for the question just asked; empty when free
   *  text is the only sensible reply. */
  suggested_replies: string[];
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
        "Meaningful facts the founder just stated about their idea. ONE memory per distinct fact: a qualifier or reason inside the same statement ('…and that's them locking themselves in') enriches that fact's content — it is NEVER a second memory, and two memories must never share the same verbatim span. Don't re-state anything in MEMORIES ALREADY CAPTURED: when the founder refines a captured fact, emit the refined version tagged with the SAME intent key so the node updates in place instead of gaining a sibling. A message asking YOU to propose, draft, or take a first pass is a REQUEST — your resulting analysis is NOT founder fact, and such turns usually produce ZERO memories; capture the founder's reaction when it comes ('yes', 'the second one', a correction), with their words as verbatim. A bare confirmation of something you proposed ('yes, that's it') is the founder adopting it: emit the adopted fact tagged with the arc intent it answers when one fits, or let the brief update carry it — NEVER as its own untagged row restating what the brief already says. Empty if this turn added nothing substantive. NEVER invent facts the founder did not say.",
      items: {
        type: "object",
        properties: {
          content: { type: "string", description: "The distilled claim, third person, <=140 chars" },
          verbatim: { type: "string", description: "The founder's exact words this came from" },
          topic: {
            type: "string",
            enum: ["problem", "customer", "product", "brand", "design", "pricing", "gtm", "competition", "tech", "risk", "market_size", "timing", "legal", "other"],
            description:
              "What the fact is ABOUT. problem=the pain being solved · customer=who it's for, their behavior · product=features, functionality, scope · brand=name, voice, positioning, identity · design=visual style, colors, UX feel · pricing=money, monetization, willingness to pay · gtm=distribution, launch, marketing, growth · competition=rivals, alternatives, differentiation · tech=stack, architecture, integrations, privacy · risk=what could kill it, concerns · market_size=how many customers exist, TAM talk · timing=why now, what changed · legal=regulatory, liability, compliance · other=none of these",
          },
          kind: {
            type: "string",
            enum: ["decision", "evidence", "assumption", "constraint", "preference", "question", "risk"],
            description:
              "What KIND of claim it is. decision=a choice the founder has COMMITTED to ('we're going subscription') · evidence=something actually observed or verified ('12 of 15 bakers said yes') · assumption=believed but unvalidated ('bakers will pay 10%') · constraint=a hard limit they can't change ('solo founder, no budget') · preference=taste, not commitment ('should feel premium') · question=raised and unresolved · risk=something that could kill the idea. Disambiguation: 'I think X' or 'probably X' = assumption, NOT decision. 'Let's go with X' or 'X, final answer' = decision. A decision about taste ('we chose the green logo') = decision, not preference. If it was measured, seen, or reported from the real world = evidence; if it lives in the founder's head = assumption. The rare three are real — recognize them when stated, never force them: question=the FOUNDER wonders aloud or admits not knowing ('no idea what I'd charge', 'app or website?') even when phrased as a statement · constraint=a hard limit dropped inside another sentence ('solo founder', 'weekends only', 'has to work offline') · risk=the founder names what could kill it ('people might just keep using texts').",
          },
          entities: {
            type: "array",
            items: { type: "string" },
            description:
              "Every named thing in this fact, pulled from the verbatim, not just your summary. Competitors and tools ('Splitwise', 'Google Sheets', 'a shared spreadsheet'), channels ('r/CampingandHiking', 'Facebook groups'), price points ('$29/mo', '$1-5'), named features or mechanisms ('gear checklist', 'email confirmation'), customer segments, place names. The mundane counts: a founder coping via 'texts (multiple of them) and phone calls' names two alternatives — 'text threads' and 'phone calls'. Short strings, no sentences. Empty array ONLY when the fact genuinely names nothing.",
          },
          intent: {
            type: "string",
            description:
              "OPTIONAL: the arc-intent key this fact ANSWERS, from the ARC INTENTS list in context (exact key). Omit when the fact answers none of them, or when no arc is provided.",
          },
        },
        required: ["content", "verbatim", "topic", "kind", "entities"],
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
    suggested_replies: {
      type: "array",
      items: { type: "string" },
      description:
        "DEFAULT TO PROVIDING 2-4 of these on every reply that ends in a question. Each is a SHORT tap-to-answer option (<=8 words, first person where natural — 'The clinic eats the miss', 'Charge double', 'Not sure — help me decide'). HARD RULE: if your reply enumerates named options (name candidates, pricing models, channels, anything numbered), suggested_replies MUST repeat those options as tap choices (short form) plus one escape like 'None of these — show more'. For open-ended questions, offer the 2-3 most likely directions plus a 'Help me decide' option. Leave empty ONLY when any suggestion would be meaningless (e.g. asking for a number only the founder knows).",
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
  required: ["reply", "memories", "brief_updates", "suggested_replies", "idea"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You are Hatchly — the agent ("H") that helps a founder shape a raw idea into a build-ready product brief through conversation.

Voice: warm but direct. Never hype-y ("Let's crush it!"), never coachy ("You got this!"), never generic-AI ("I'm here to help!"). You notice, you don't flatter. Three sentences max, then at most ONE focused question (a formatted list of options doesn't count toward the limit). Almost every question you ask should ship with 2-4 short tap-to-answer options in suggested_replies — answering should be one tap, not a blank box; include a "help me decide" option when the founder might be unsure. Skip options only when no suggestion could be meaningful.

FORMATTING — your reply renders in a narrow chat bubble; write for scanning, not as one dense paragraph:
- Paragraphs: 1-3 sentences, separated by a blank line.
- ANY list of options goes on its own lines, one per line, as "1. Campfire Tab — the shared tab that keeps trips fair" — NEVER run options inline inside a sentence.
- No markdown syntax (no **, ##, backticks) — plain text with line breaks only. Uncertainty from the founder is signal, not a problem — park it in open questions and say so.

Your job each turn:
1. Reply conversationally, moving the idea forward. When the brief has gaps, ask about the SINGLE most important gap next (priority: problem > who > value > features). When the brief is complete, say so and point them at the build gate.
2. Extract memories: meaningful facts the founder stated THIS turn. Capture the claim, their verbatim words, and the TOPIC (what the fact is about — design taste is "design", money talk is "pricing", launch/marketing talk is "gtm", competitor mentions are "competition", and so on). Fill "entities" with every named thing in the fact — competitors, tools, channels, price points, named features; when the founder says they cope with "texts and phone calls", those ARE entities, not just prose. One distinct fact = one memory — never capture a fragment of a fact you just captured. Memory and brief are separate acts: taste, preferences, and context stay in memory without feeding the brief; anything that fills a brief section goes through brief_updates. Never invent, embellish, or infer beyond what was said. Your own proposals and first-pass analysis are never memories — only what the founder states or confirms. Small talk and requests-to-you produce no memories.
3. Update the brief when this turn justified it. Refine existing text freely as understanding sharpens; keep each section tight (one or two sentences; features/questions are short single lines). Keep the brief PRODUCT-level: implementation details (auth providers, stacks, integrations) are memories with topic "tech" or "product", not brief features — unless they ARE the product.
4. Tend the open questions. When a turn answers an existing open question, resolve it (resolve_item) and record the answer as a memory — never leave answered questions in the brief, and never add an answer as a question.
5. Name the idea. While it is called "Untitled idea", propose a short working name and one-liner from what you've learned (set idea.name + idea.one_liner) and mention the proposal in your reply so the founder can push back. Update the one-liner when the pitch materially sharpens.

CO-FOUNDER MOVES — what separates a partner from a form:
- Quote them back. When you confirm, challenge, or build on something, reuse the founder's OWN phrasing — from this conversation or a memory's "their words" ("you said the money-chasing sours the whole trip — does that still hold?"). Their words carry their thinking; your paraphrase loses it. One quote at a time, short, natural — never air-quotes around your own summary.
- Connect across chats. Memories name the conversation they came from — when one bears on the current question, say so conversationally ("in Name & brand you said warm and communal — that argues against a per-seat enterprise price"). Never re-ask what another chat already answered; build on it.
- Surface contradictions. When a new statement conflicts with a captured memory ("$1-5 per person" then "$50 flat"), say so plainly and ask which holds — quote both, never silently overwrite, never paper over it. Once they resolve it, capture the answer tagged with the matching intent so the node updates and the old value lands in the activity trail.

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
  /** verbatim rides along so replies can quote the founder's own words (BL-53);
   *  chatLabel names the conversation it came from so replies can connect
   *  across chats (BL-54). */
  memories: { content: string; topic?: string; verbatim?: string; chatLabel?: string }[];
  history: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
  /** This chat's focus from its template — steers the agent to one job
   *  (the problem, the customer, competition…) instead of the whole idea. */
  chatFocus?: string;
  /** This chat's question arc — the fixed intents it exists to resolve. The
   *  agent works through unresolved ones and tags memories with intent keys. */
  chatArc?: ArcIntent[];
  /** Arc intent keys already answered (across ANY chat) — don't re-ask these. */
  resolvedIntents?: string[];
}): Promise<AgentTurnResult> {
  const { apiKey, ideaName, oneLiner, brief, memories, history, userMessage, chatFocus, chatArc, resolvedIntents } = params;
  const client = new Anthropic({ apiKey });

  const gate = briefGate(brief);
  const counts = topicCounts(memories);
  const signal = SIGNAL_TOPICS.map((t) => `${t}: ${counts[t] ?? 0}`).join(" · ");

  const resolved = new Set(resolvedIntents ?? []);
  const context = [
    ...(chatFocus
      ? [`THIS CHAT'S FOCUS — stay on it; the founder opened this specific chat:`, chatFocus, ``]
      : []),
    ...(chatArc?.length
      ? [
          `ARC INTENTS — the fixed things this chat exists to resolve. Ask about the FIRST unresolved one next (one at a time, rephrased for THIS idea, with 2-4 concrete answer options when natural). When a founder's turn answers one — in any words — tag that memory with the intent key:`,
          ...chatArc.map(
            (a) =>
              `- [${a.key}] ${a.intent}${a.required ? "" : " (optional)"}${resolved.has(a.key) ? " — RESOLVED, don't re-ask" : ""}`,
          ),
          ``,
        ]
      : []),
    `IDEA: ${ideaName}${oneLiner ? ` — ${oneLiner}` : ""}`,
    ``,
    `CURRENT BRIEF:`,
    briefState(brief),
    ``,
    `BUILD GATE: ${gate.open ? "OPEN" : `not yet — missing: ${[!gate.problem && "problem", !gate.who && "who", !gate.value && "value", !gate.feature && "a feature"].filter(Boolean).join(", ")}`}`,
    `SIGNAL MAP (memories per topic — steer toward relevant zeros once the gate is open):`,
    signal,
    ``,
    `MEMORIES ALREADY CAPTURED (do not re-capture; when the founder refines one, tag the matching intent key so its node updates in place):`,
    memories.length
      ? memories
          .map(
            (m) =>
              `- ${m.topic || m.chatLabel ? `[${[m.topic, m.chatLabel].filter(Boolean).join(" · ")}] ` : ""}${m.content}${m.verbatim?.trim() ? ` — their words: "${m.verbatim.trim().slice(0, 120)}"` : ""}`,
          )
          .join("\n")
      : "(none yet)",
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
    return { reply: "I can't help with that one — want to get back to the idea?", memories: [], brief_updates: [], idea: null, suggested_replies: [] };
  }

  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  try {
    const parsed = JSON.parse(text) as AgentTurnResult;
    return {
      reply: parsed.reply ?? "",
      memories: Array.isArray(parsed.memories) ? parsed.memories : [],
      brief_updates: Array.isArray(parsed.brief_updates) ? parsed.brief_updates : [],
      idea: parsed.idea && typeof parsed.idea === "object" ? parsed.idea : null,
      suggested_replies: Array.isArray(parsed.suggested_replies)
        ? parsed.suggested_replies.filter((s): s is string => typeof s === "string").slice(0, 4)
        : [],
    };
  } catch {
    // Schema-constrained output should always parse; degrade gracefully if not.
    return { reply: text || "…", memories: [], brief_updates: [], idea: null, suggested_replies: [] };
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
