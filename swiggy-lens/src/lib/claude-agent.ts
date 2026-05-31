import Anthropic from "@anthropic-ai/sdk";

import { DATA_UNAVAILABLE_NOTE, FOOD_MODE_SYSTEM_PROMPT } from "./food-mode-engine";
import { callMCPTool, type SwiggyMCPClients } from "./swiggy-mcp";
import type { InsightsResponse, VerticalSpend } from "./types";

const anthropic = new Anthropic();

function extractSpend(
  foodData: unknown,
  instamartData: unknown,
  dineoutData: unknown
): VerticalSpend {
  const sum = (data: unknown, priceKey: string): number => {
    if (!Array.isArray(data)) return 0;
    return data.reduce((acc: number, order: unknown) => {
      if (order && typeof order === "object") {
        const val = (order as Record<string, unknown>)[priceKey];
        if (typeof val === "number") return acc + val;
        if (typeof val === "string") return acc + parseFloat(val || "0");
      }
      return acc;
    }, 0);
  };

  return {
    food: Math.round(sum(foodData, "order_total") || sum(foodData, "total_price") || sum(foodData, "bill_total")),
    instamart: Math.round(sum(instamartData, "order_total") || sum(instamartData, "bill_total") || sum(instamartData, "total_price")),
    dineout: Math.round(sum(dineoutData, "bill_total") || sum(dineoutData, "total_amount") || sum(dineoutData, "order_total")),
  };
}

export async function gatherVerticalData(clients: SwiggyMCPClients): Promise<{
  foodData: unknown;
  instamartData: unknown;
  dineoutData: unknown;
  unavailableVerticals: string[];
}> {
  const unavailableVerticals: string[] = [];

  const foodData = await callMCPTool(clients.food, "get_food_orders", {
    limit: 100,
  }).catch(() => {
    unavailableVerticals.push("food delivery");
    return null;
  });

  let instamartData: unknown = null;
  if (clients.instamart) {
    instamartData = await callMCPTool(clients.instamart, "get_orders", {
      limit: 100,
    }).catch(() => {
      unavailableVerticals.push("Instamart");
      return null;
    });
  } else {
    unavailableVerticals.push("Instamart");
  }

  let dineoutData: unknown = null;
  if (clients.dineout) {
    dineoutData = await callMCPTool(clients.dineout, "get_bookings", {
      limit: 100,
    }).catch(() => {
      unavailableVerticals.push("Dineout");
      return null;
    });
  } else {
    unavailableVerticals.push("Dineout");
  }

  return { foodData, instamartData, dineoutData, unavailableVerticals };
}

export function buildDataContext(
  foodData: unknown,
  instamartData: unknown,
  dineoutData: unknown,
  unavailableVerticals: string[]
): string {
  const sections: string[] = [];

  if (foodData) {
    sections.push(`## Food Delivery Orders\n${JSON.stringify(foodData, null, 2)}`);
  }

  if (instamartData) {
    sections.push(`## Instamart (Grocery) Orders\n${JSON.stringify(instamartData, null, 2)}`);
  }

  if (dineoutData) {
    sections.push(`## Dineout Bookings\n${JSON.stringify(dineoutData, null, 2)}`);
  }

  return sections.join("\n\n") + DATA_UNAVAILABLE_NOTE(unavailableVerticals);
}

function buildUserMessage(
  foodData: unknown,
  instamartData: unknown,
  dineoutData: unknown,
  unavailableVerticals: string[]
): string {
  return (
    buildDataContext(foodData, instamartData, dineoutData, unavailableVerticals) +
    "\n\nAnalyze this data and return the JSON response as specified."
  );
}

export async function runInsightsAgent(
  clients: SwiggyMCPClients
): Promise<InsightsResponse> {
  const { foodData, instamartData, dineoutData, unavailableVerticals } =
    await gatherVerticalData(clients);

  const userMessage = buildUserMessage(
    foodData,
    instamartData,
    dineoutData,
    unavailableVerticals
  );

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: FOOD_MODE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text response");
  }

  const parsed = JSON.parse(textBlock.text) as InsightsResponse;
  parsed.spend = extractSpend(foodData, instamartData, dineoutData);
  return parsed;
}
