import "server-only";
import { createClient } from "./agentx";

/**
 * Server-side AgentX client. The delivery token must NEVER reach the browser —
 * only import this from Server Components and route handlers ("server-only"
 * enforces it at build time).
 *
 * Returns null when AGENTX_DELIVERY_TOKEN is unset so pages can render a
 * setup notice instead of crashing.
 */
export function getAgentX() {
  const token = process.env.AGENTX_DELIVERY_TOKEN;
  if (!token) return null;
  return createClient({ token });
}
