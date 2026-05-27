import { NextResponse } from "next/server";

import { runInsightsAgent } from "@/lib/claude-agent";
import { getSession, isAccessTokenValid } from "@/lib/session";
import { closeMCPClients, createMCPClients } from "@/lib/swiggy-mcp";

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
    const insights = await runInsightsAgent(clients);
    return NextResponse.json(insights);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Insights generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    if (clients) {
      await closeMCPClients(clients);
    }
  }
}
