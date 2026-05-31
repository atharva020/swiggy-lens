import { streamChatResponse } from "@/lib/chat-agent";
import { getSession, isAccessTokenValid } from "@/lib/session";
import { closeMCPClients, createMCPClients } from "@/lib/swiggy-mcp";
import type { ChatMessage } from "@/lib/types";

function isValidMessages(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (m) =>
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
  );
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!isAccessTokenValid(session) || !session.accessToken) {
    return Response.json(
      { error: "Not authenticated. Connect with Swiggy first." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = (body as { messages?: unknown })?.messages;
  if (!isValidMessages(messages)) {
    return Response.json(
      { error: "Body must include a non-empty messages array" },
      { status: 400 }
    );
  }

  let clients;
  try {
    clients = await createMCPClients(session.accessToken);
    // streamChatResponse finishes all MCP reads before returning the stream,
    // so it is safe to close the clients before piping Claude's output.
    const stream = await streamChatResponse(clients, messages);
    await closeMCPClients(clients);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (clients) {
      await closeMCPClients(clients);
    }
    const message =
      error instanceof Error ? error.message : "Chat request failed";
    return Response.json({ error: message }, { status: 502 });
  }
}
