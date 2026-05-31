import Anthropic from "@anthropic-ai/sdk";

import { buildDataContext, gatherVerticalData } from "./claude-agent";
import { CHAT_SYSTEM_PROMPT } from "./food-mode-engine";
import type { SwiggyMCPClients } from "./swiggy-mcp";
import type { ChatMessage } from "./types";

const anthropic = new Anthropic();

const encoder = new TextEncoder();

/**
 * Gathers MCP data once, then streams a grounded chat reply as plain UTF-8 text.
 * All MCP work completes before the stream is returned, so the caller can close
 * the MCP clients immediately — Claude streaming needs no further MCP access.
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

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        controller.close();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Chat generation failed";
        controller.enqueue(encoder.encode(`\n[error] ${message}`));
        controller.close();
      }
    },
  });
}
