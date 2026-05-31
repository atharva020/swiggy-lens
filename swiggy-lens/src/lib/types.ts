export type FoodMode = "cooking" | "ordering" | "social" | "mixed";

export type Confidence = "high" | "medium" | "low";

export type InsightTag = "mode" | "spend" | "cuisine" | "pattern";

export interface InsightCard {
  title: string;
  body: string;
  tag: InsightTag;
}

export interface VerticalSpend {
  food: number;
  instamart: number;
  dineout: number;
}

export interface InsightsResponse {
  mode: FoodMode;
  confidence: Confidence;
  modeLabel: string;
  modeSummary: string;
  insights: InsightCard[];
  spend?: VerticalSpend;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}
