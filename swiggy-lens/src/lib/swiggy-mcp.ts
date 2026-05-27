import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { CallToolResult, ContentBlock } from "@modelcontextprotocol/sdk/types.js";

export const SWIGGY_MCP_SERVERS = {
  food: "https://mcp.swiggy.com/food",
  instamart: "https://mcp.swiggy.com/im",
  dineout: "https://mcp.swiggy.com/dineout",
} as const;

export type SwiggyMCPClient = Client;

export interface SwiggyMCPClients {
  food: SwiggyMCPClient;
  instamart: SwiggyMCPClient | null;
  dineout: SwiggyMCPClient | null;
}

async function connectMCPClient(
  serverUrl: string,
  accessToken: string
): Promise<Client> {
  const transport = new StreamableHTTPClientTransport(new URL(serverUrl), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const client = new Client({
    name: "swiggy-lens",
    version: "0.1.0",
  });

  await client.connect(transport);
  return client;
}

async function tryConnectMCPClient(
  serverUrl: string,
  accessToken: string
): Promise<Client | null> {
  try {
    return await connectMCPClient(serverUrl, accessToken);
  } catch {
    return null;
  }
}

export async function createMCPClients(
  accessToken: string
): Promise<SwiggyMCPClients> {
  const [food, instamart, dineout] = await Promise.all([
    connectMCPClient(SWIGGY_MCP_SERVERS.food, accessToken),
    tryConnectMCPClient(SWIGGY_MCP_SERVERS.instamart, accessToken),
    tryConnectMCPClient(SWIGGY_MCP_SERVERS.dineout, accessToken),
  ]);

  return { food, instamart, dineout };
}

export async function closeMCPClients(clients: SwiggyMCPClients): Promise<void> {
  await Promise.allSettled([
    clients.food.close(),
    clients.instamart?.close(),
    clients.dineout?.close(),
  ]);
}

function contentToText(content: ContentBlock[]): string {
  return content
    .map((item) => ("text" in item ? item.text : JSON.stringify(item)))
    .join("\n")
    .trim();
}

function extractToolResult(result: CallToolResult) {
  if (result.isError) {
    const message = result.content?.length
      ? contentToText(result.content)
      : "Unknown MCP tool error";
    throw new Error(message);
  }

  if (result.structuredContent) {
    return result.structuredContent;
  }

  const text = result.content?.length ? contentToText(result.content) : "";

  if (!text) {
    return result.content;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function callMCPTool<T = unknown>(
  client: Client,
  name: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  const result = (await client.callTool({ name, arguments: args })) as CallToolResult;
  return extractToolResult(result) as T;
}
