import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { AGENT_MODEL } from "./agent";
import { callTool } from "./mcp";

/* Idea onboarding — reads the admin-editable chat_templates / onboarding_questions
   collections and turns a founder's intake into a titled idea with pre-made
   placeholder chats. Templates are read server-side over MCP (config, not public
   content), so no publicFilter / client regeneration is involved. */

export interface ChatTemplate {
  key: string;
  name: string;
  icon?: string;
  role: "foundation" | "sharpen" | "free";
  order: number;
  signal_topic?: string;
  feeds_brief?: string;
  produces?: string;
  create_when?: string;
  system_prompt: string;
  opening: string;
  questions?: string;
  completion?: string;
  active?: boolean;
}

export interface OnboardingQuestion {
  key: string;
  order: number;
  text: string;
  sub?: string;
  type: "text" | "pick" | "multi";
  options?: string[];
  show_when?: string;
  maps_to?: string;
  active?: boolean;
}

interface Entry<T> {
  id: string;
  data: T;
}

/** Active chat templates, in deck order. */
export async function loadChatTemplates(): Promise<ChatTemplate[]> {
  const res = await callTool<{ entries: Entry<ChatTemplate>[] }>("query_entries", {
    collection: "chat_templates",
    where: [{ field: "active", op: "eq", value: true }],
    orderBy: { field: "order", dir: "asc" },
    limit: 50,
  });
  return res.entries.map((e) => e.data);
}

/** Active onboarding questions, in ask order. */
export async function loadOnboardingQuestions(): Promise<OnboardingQuestion[]> {
  const res = await callTool<{ entries: Entry<OnboardingQuestion>[] }>("query_entries", {
    collection: "onboarding_questions",
    where: [{ field: "active", op: "eq", value: true }],
    orderBy: { field: "order", dir: "asc" },
    limit: 50,
  });
  return res.entries.map((e) => e.data);
}

/** Which templates to create for this idea, per each template's create_when.
 *  Condition shape: {"field":"kind","equals":"Digital app"} — evaluated against
 *  the onboarding answers. No condition ⇒ always created. Malformed ⇒ fail open
 *  (created, and visible for the admin to fix). */
export function templatesForAnswers(
  templates: ChatTemplate[],
  answers: Record<string, unknown>,
): ChatTemplate[] {
  return templates.filter((t) => {
    if (!t.create_when?.trim()) return true;
    try {
      const cond = JSON.parse(t.create_when) as { field: string; equals?: unknown; in?: unknown[] };
      const v = answers[cond.field];
      if (Array.isArray(cond.in)) return cond.in.includes(v);
      if ("equals" in cond) return v === cond.equals;
      return true;
    } catch {
      return true;
    }
  });
}

/** Turn the founder's rough sentence into a clean, memorable idea title.
 *  Falls back to a trimmed prompt if the model round-trip fails — a new idea must
 *  never be blocked on title polish. */
export async function generateIdeaTitle(apiKey: string, raw: string): Promise<string> {
  const fallback = raw.replace(/^\s*(i\s+want\s+to\s+build\s+|build\s+|a\s+|an\s+)/i, "").trim().slice(0, 60) || "Untitled idea";
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: AGENT_MODEL,
      max_tokens: 40,
      system:
        "Turn a founder's rough sentence into a clean idea title: 2–5 words, sentence case, no surrounding quotes, no 'I want to build'. Reply with ONLY the title.",
      messages: [{ role: "user", content: raw.slice(0, 500) }],
    });
    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    const title = text.trim().replace(/^["']+|["']+$/g, "").slice(0, 80);
    return title || fallback;
  } catch {
    return fallback;
  }
}
