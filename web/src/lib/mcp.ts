import "server-only";

/**
 * Minimal server-side transport to Pluggie's MCP endpoint.
 *
 * Why this exists: economy collections (wallets, transactions, stakes, spotlight)
 * are write:"none" on the delivery API BY DESIGN — no client token can ever move
 * money. The MCP plane is the sanctioned server write path ("your endpoint writes
 * results back through the delivery API or MCP"). Verified stateless: a bare
 * tools/call round-trips without a session handshake.
 *
 * NEVER import from client code ("server-only" enforces it).
 */

const MCP_URL = "https://pluggie.app/api/mcp";

export class McpError extends Error {
  constructor(message: string, readonly code?: string) {
    super(message);
    this.name = "McpError";
  }
}

let rpcId = 0;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Retriable? Rate limits and transient HTTP faults — never business errors
 *  (E_CONFLICT, E_VALIDATION etc. are real answers the caller must see).
 *
 *  Pluggie now returns a proper E_RATE_LIMITED code with a retry-after hint;
 *  older deployments returned the same condition as an uncoded message. Match
 *  both so this keeps working across versions. */
const isTransient = (e: unknown) =>
  e instanceof McpError &&
  (e.code === "E_RATE_LIMITED" ||
    ((!e.code || e.code === undefined) &&
      (/rate limit/i.test(e.message) || /^MCP HTTP (429|5\d\d)$/.test(e.message))));

/** Honour the server's "retry after Ns" when it gives one, so a burst backs
 *  off for as long as the limiter actually needs instead of guessing. */
function retryAfterMs(e: unknown, attempt: number): number {
  if (e instanceof McpError) {
    const m = /retry after (\d+)\s*s/i.exec(e.message);
    // Cap it: a long server hint would otherwise stall a request past any
    // sensible page-render budget.
    if (m) return Math.min(Number(m[1]) * 1000, 5000);
  }
  return 400 * attempt + Math.random() * 200;
}

/** One line per MCP call so we can see where server-render time actually goes
 *  (Pluggie round-trips vs. our code). On in dev, or set MCP_TIMING=1 in prod to
 *  measure a real page. `ms` is wall time INCLUDING retry backoff. */
function logTiming(name: string, args: Record<string, unknown>, ms: number, attempts: number, ok: boolean) {
  if (process.env.MCP_TIMING !== "1" && process.env.NODE_ENV !== "development") return;
  const coll = typeof args.collection === "string" ? `:${args.collection}` : "";
  const tries = attempts > 1 ? ` ${attempts}x` : "";
  console.log(`[mcp] ${ok ? "ok " : "ERR"} ${Math.round(ms)}ms  ${name}${coll}${tries}`);
}

export async function callTool<T = unknown>(
  name: string,
  args: Record<string, unknown>,
): Promise<T> {
  // Page renders fan out several reads at once; pluggie rate-limits bursts.
  // Retry transient faults with backoff so reads don't falsely come back
  // empty (e.g. settings showing "Not set" for a connected key).
  const started = Date.now();
  let lastErr: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await sleep(retryAfterMs(lastErr, attempt));
    try {
      const out = await callToolOnce<T>(name, args);
      logTiming(name, args, Date.now() - started, attempt + 1, true);
      return out;
    } catch (e) {
      if (!isTransient(e)) {
        logTiming(name, args, Date.now() - started, attempt + 1, false);
        throw e;
      }
      lastErr = e;
    }
  }
  logTiming(name, args, Date.now() - started, 4, false);
  throw lastErr;
}

async function callToolOnce<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const token = process.env.AGENTX_MCP_TOKEN;
  if (!token) throw new McpError("AGENTX_MCP_TOKEN is not configured");

  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: ++rpcId,
      method: "tools/call",
      params: { name, arguments: args },
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new McpError(`MCP HTTP ${res.status}`);

  const json = (await res.json()) as {
    error?: { message?: string };
    result?: { isError?: boolean; content?: { type: string; text?: string }[] };
  };
  if (json.error) throw new McpError(json.error.message ?? "MCP error");

  const text = json.result?.content?.find((c) => c.type === "text")?.text ?? "";
  if (json.result?.isError) {
    // Tool errors read like: "Error [E_CONFLICT]: message"
    const m = /\[(E_[A-Z_]+)\]/.exec(text);
    throw new McpError(text, m?.[1]);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}
