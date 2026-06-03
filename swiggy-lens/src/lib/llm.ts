import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type LLMProvider = "anthropic" | "openai";

export function getProvider(): LLMProvider {
  const explicit = process.env.LLM_PROVIDER?.toLowerCase();
  if (explicit === "openai" || explicit === "anthropic") return explicit;
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  throw new Error(
    "No LLM configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env.local"
  );
}

interface CompletionParams {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
}

export async function complete(params: CompletionParams): Promise<string> {
  const { system, messages, maxTokens = 1024 } = params;
  const provider = getProvider();

  if (provider === "anthropic") {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages,
    });
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new Error("Anthropic returned no text response");
    }
    return block.text;
  }

  const client = new OpenAI();
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    max_tokens: maxTokens,
    messages: [{ role: "system", content: system }, ...messages],
  });

  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned no text response");
  return text;
}

export async function streamCompletion(
  params: CompletionParams
): Promise<ReadableStream<Uint8Array>> {
  const { system, messages, maxTokens = 1024 } = params;
  const provider = getProvider();
  const encoder = new TextEncoder();

  if (provider === "anthropic") {
    const client = new Anthropic();
    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const stream = client.messages.stream({
            model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
            max_tokens: maxTokens,
            system,
            messages,
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
        } catch (err) {
          const msg = err instanceof Error ? err.message : "LLM streaming failed";
          controller.enqueue(encoder.encode(`\n[error] ${msg}`));
          controller.close();
        }
      },
    });
  }

  const client = new OpenAI();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = await client.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o",
          max_tokens: maxTokens,
          stream: true,
          messages: [{ role: "system", content: system }, ...messages],
        });

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            controller.enqueue(encoder.encode(delta));
          }
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "LLM streaming failed";
        controller.enqueue(encoder.encode(`\n[error] ${msg}`));
        controller.close();
      }
    },
  });
}
