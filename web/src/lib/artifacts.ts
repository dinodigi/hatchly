import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { AGENT_MODEL, type Brief } from "./agent";

/**
 * Artifacts — the documents that help a founder think an idea through.
 *
 * Ten types. The BRIEF is special: it is live state, written continuously by
 * the chat agent, and is never "generated" here. The other nine are drafted
 * on demand from everything the idea already knows (brief + memories), then
 * become editable documents the founder owns.
 *
 * Catalog ported verbatim from Design/app/data.jsx (v4) — the titles,
 * descriptions and section names ARE the spec.
 */

export interface ArtifactType {
  key: string;
  title: string;
  desc: string;
  /** Drafted by the chat agent, not generated here. */
  auto?: boolean;
  sections: string[];
}

export const ARTIFACT_TYPES: ArtifactType[] = [
  {
    key: "brief",
    title: "Product brief",
    desc: "Problem, who it's for, value, features, open questions.",
    auto: true,
    sections: ["Problem", "Who it's for", "Core value", "Features", "Open questions"],
  },
  {
    key: "problem",
    title: "Problem statement",
    desc: "The one-paragraph 'why this matters, now.'",
    sections: ["The problem", "Who feels it", "Why now", "Cost of doing nothing"],
  },
  {
    key: "icp",
    title: "ICP & personas",
    desc: "Who exactly it's for, in detail.",
    sections: ["Primary persona", "Their day", "Triggers to try", "Who it's NOT for"],
  },
  {
    key: "positioning",
    title: "Positioning",
    desc: "For X who Y, we're the Z that…",
    sections: ["Positioning statement", "Category", "Key differentiator", "Alternatives"],
  },
  {
    key: "mvp",
    title: "MVP scope",
    desc: "The smallest thing worth shipping.",
    sections: ["The core loop", "Wow moment", "In scope for v1", "Explicitly out"],
  },
  {
    key: "pricing",
    title: "Pricing model",
    desc: "How it makes money.",
    sections: ["Model", "Tiers", "Willingness to pay", "Open risk"],
  },
  {
    key: "landing",
    title: "Landing page copy",
    desc: "Hero, subhead, and the three reasons.",
    sections: ["Headline", "Subhead", "Three reasons", "Call to action"],
  },
  {
    key: "competitive",
    title: "Competitive landscape",
    desc: "Who else is here and the gap.",
    sections: ["Direct alternatives", "Indirect alternatives", "The gap you fill"],
  },
  {
    key: "gtm",
    title: "Go-to-market",
    desc: "First 100 users, honestly.",
    sections: ["First channel", "The wedge", "First 100 users", "What we won't do yet"],
  },
  {
    key: "brand",
    title: "Name & brand",
    desc: "Name, tagline, and the feeling.",
    sections: ["Name", "Tagline", "Tone", "Look & feel"],
  },
];

export const GENERATABLE = ARTIFACT_TYPES.filter((t) => !t.auto);
export const byKey = (k: string) => ARTIFACT_TYPES.find((t) => t.key === k) ?? null;

/** One section of an artifact body — matches the `artifacts.body` schema. */
export interface Section {
  heading: string;
  paragraph?: string;
  list_heading?: string;
  list_items?: string[];
}

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    subtitle: {
      type: "string",
      description: "One short line under the title. Specific to THIS idea, not the document type.",
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          paragraph: {
            type: "string",
            description:
              "Prose for this section. Plain sentences, no markdown. Empty string if a list says it better.",
          },
          list_heading: { type: "string" },
          list_items: { type: "array", items: { type: "string" } },
        },
        required: ["heading"],
        additionalProperties: false,
      },
    },
    thin: {
      type: "boolean",
      description:
        "True if the conversation genuinely lacks the substance for this document — you had to invent most of it.",
    },
    thin_reason: {
      type: "string",
      description: "If thin, the single most useful thing the founder should talk about to fix it.",
    },
  },
  required: ["subtitle", "sections", "thin"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You draft working documents for founders on Hatchly, from what they have actually said about their idea.

The single rule that matters: WRITE ONLY FROM WHAT YOU WERE TOLD.

You are given a brief and a set of memories captured verbatim from the founder's own conversation. Those are your source material. You may connect and articulate what is there — that is the value you add — but you must not invent facts the founder never gave you. No fabricated metrics, no invented customer names, no imagined competitors, no made-up prices. A confident document full of details the founder never said is worse than useless: they will believe it, act on it, and be wrong.

When a section has no support in the material:
- Say so plainly in that section, in one short sentence, and name what would answer it.
- Do NOT pad it with generic startup advice that would read the same for any idea.

If MOST of the document would be invention, set "thin": true and give one concrete thing the founder should talk through. A short honest document beats a long imagined one.

Voice: plain, direct, specific. Short sentences. No marketing gloss, no "revolutionize", no "seamless". Write the way a sharp colleague writes a memo — the founder should recognise their own idea in it, sharpened.

Use the section headings you are given, in order. For each section choose prose OR a list, whichever actually fits; do not force both. Lists are for genuinely enumerable things.`;

export interface GenerateResult {
  subtitle: string;
  sections: Section[];
  thin: boolean;
  thinReason?: string;
}

function briefBlock(brief: Brief | undefined): string {
  if (!brief) return "(empty)";
  const lines = [
    brief.problem && `Problem: ${brief.problem}`,
    brief.who && `Who it's for: ${brief.who}`,
    brief.value && `Core value: ${brief.value}`,
    brief.features?.length && `Features:\n${brief.features.map((f) => `  - ${f}`).join("\n")}`,
    brief.open_questions?.length &&
      `Open questions:\n${brief.open_questions.map((q) => `  - ${q}`).join("\n")}`,
  ].filter(Boolean);
  return lines.length ? lines.join("\n") : "(empty)";
}

export async function generateArtifact(params: {
  apiKey: string;
  type: ArtifactType;
  ideaName: string;
  oneLiner?: string;
  brief?: Brief;
  memories: { content: string; topic?: string; verbatim?: string }[];
}): Promise<GenerateResult> {
  const { apiKey, type, ideaName, oneLiner, brief, memories } = params;
  const client = new Anthropic({ apiKey });

  const context = [
    `IDEA: ${ideaName}${oneLiner ? ` — ${oneLiner}` : ""}`,
    ``,
    `BRIEF (written by the agent from the founder's own words):`,
    briefBlock(brief),
    ``,
    `MEMORIES — everything the founder has said that mattered.`,
    `These are your source material. Quotes in "" are their exact words.`,
    memories.length
      ? memories
          .map((m) => `- ${m.topic ? `[${m.topic}] ` : ""}${m.content}${m.verbatim ? ` — "${m.verbatim}"` : ""}`)
          .join("\n")
      : "(none captured yet)",
    ``,
    `DOCUMENT TO DRAFT: ${type.title} — ${type.desc}`,
    `SECTIONS, in this order: ${type.sections.join(" · ")}`,
  ].join("\n");

  const response = await client.messages.create({
    model: AGENT_MODEL,
    max_tokens: 8000,
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      { type: "text", text: context },
    ],
    output_config: {
      format: { type: "json_schema", schema: OUTPUT_SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [
      {
        role: "user",
        content: `Draft the ${type.title} for this idea. Only what they actually told you.`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The model declined to draft this one.");
  }

  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  const parsed = JSON.parse(text) as {
    subtitle?: string;
    sections?: Section[];
    thin?: boolean;
    thin_reason?: string;
  };

  // Keep the declared section order even if the model reorders or drops one:
  // the founder is promised these headings.
  const got = new Map((parsed.sections ?? []).map((s) => [s.heading?.toLowerCase().trim(), s]));
  const sections: Section[] = type.sections.map((heading) => {
    const match = got.get(heading.toLowerCase().trim());
    return {
      heading,
      paragraph: match?.paragraph?.trim() || "",
      list_heading: match?.list_heading?.trim() || undefined,
      list_items: (match?.list_items ?? []).map((i) => String(i).trim()).filter(Boolean),
    };
  });

  return {
    subtitle: parsed.subtitle?.trim() || type.desc,
    sections,
    thin: !!parsed.thin,
    thinReason: parsed.thin_reason?.trim(),
  };
}
