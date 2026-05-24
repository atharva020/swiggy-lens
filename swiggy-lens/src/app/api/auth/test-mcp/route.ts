import { NextResponse } from "next/server";

import { callMCPTool, closeMCPClients, createMCPClients } from "@/lib/swiggy-mcp";
import { getSession, isAccessTokenValid } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!isAccessTokenValid(session) || !session.accessToken) {
    return NextResponse.json(
      { error: "Not authenticated. Connect with Swiggy first." },
      { status: 401 }
    );
  }

  let clients;

  try {
    clients = await createMCPClients(session.accessToken);
    const addresses = await callMCPTool(clients.food, "get_addresses");

    return NextResponse.json({
      ok: true,
      tool: "get_addresses",
      data: addresses,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "MCP verification failed";

    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  } finally {
    if (clients) {
      await closeMCPClients(clients);
    }
  }
}
