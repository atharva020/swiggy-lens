import { buildDataContext, gatherVerticalData } from "./claude-agent";
import { CHAT_SYSTEM_PROMPT } from "./food-mode-engine";
import { streamCompletion } from "./llm";
import type { SwiggyMCPClients } from "./swiggy-mcp";
import type { ChatMessage } from "./types";

/**
 * Gathers MCP data once, then streams a grounded chat reply as plain UTF-8 text.
 * All MCP work completes before the stream is returned, so the caller can close
 * the MCP clients immediately — LLM streaming needs no further MCP access.
 */
export async function streamChatResponse(
  clients: SwiggyMCPClients,
  messages: ChatMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const { foodData, instamartData, dineoutData, unavailableVerticals } =
    await gatherVerticalData(clients);

  const dataContext = buildDataContext(
    foodData,
    instamartData,
    dineoutData,
    unavailableVerticals
  );

  const system = `${CHAT_SYSTEM_PROMPT}\n\n# User's Swiggy Data\n\n${dataContext}`;

  return streamCompletion({
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
}
