import { NextResponse } from "next/server";

import { getCached, setCache } from "@/lib/cache";
import { runInsightsAgent } from "@/lib/claude-agent";
import { getSession, isAccessTokenValid } from "@/lib/session";
import { closeMCPClients, createMCPClients } from "@/lib/swiggy-mcp";
import type { InsightsResponse } from "@/lib/types";

export async function GET() {
  const session = await getSession();

  if (!isAccessTokenValid(session) || !session.accessToken) {
    return NextResponse.json(
      { error: "Not authenticated. Connect with Swiggy first." },
      { status: 401 }
    );
  }

  const cacheKey = `insights:${session.accessToken.slice(-12)}`;
  const cached = getCached<InsightsResponse>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  let clients;

  try {
    clients = await createMCPClients(session.accessToken);
    const insights = await runInsightsAgent(clients);
    setCache(cacheKey, insights, 5 * 60 * 1000);
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
