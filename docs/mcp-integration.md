# MCP Integration

> How SwiggyLens uses Swiggy's MCP server across all three verticals.

---

## Overview

SwiggyLens integrates with Swiggy's MCP server to access real user data across food delivery, dine-in, and Instamart. Claude Sonnet acts as the agent orchestrator — it receives all three vertical tool sets simultaneously and decides which tools to call based on what insight it's generating.

The key architectural choice: **all three MCP verticals are available to Claude in a single reasoning loop.** Claude doesn't call one vertical, get results, then call the next. It has access to all tools at once and reasons cross-vertically in one pass.

---

## Tools Used

### swiggy-food

| Tool | Used For |
|---|---|
| `get_food_orders` | Primary behavior analysis — order frequency, timing, value, cuisine |
| `get_food_order_details` | Deep per-order analysis — items, restaurants, repeat patterns |
| `get_addresses` | Location patterns — home vs office ordering, delivery context |
| `fetch_food_coupons` | Coupon usage behavior — price sensitivity signal |

Tools available but not used for analysis: `search_restaurants`, `search_menu`, `get_restaurant_menu`, `get_food_cart`, `update_food_cart`, `flush_food_cart`, `place_food_order`, `apply_food_coupon`, `track_food_order`

---

### swiggy-dineout

Tools used for:
- Dine-in occasion frequency and timing
- Average spend per dine-in occasion
- Social mode signal detection (weekend vs weekday patterns)
- Cuisine preferences in social settings vs delivery

---

### swiggy-instamart

Tools used for:
- Grocery order frequency and basket value
- Ingredient patterns (raw ingredients vs ready-to-eat)
- Cooking mode signal detection (fresh produce, staples)
- Consumption rhythm and replenishment frequency

---

## Agent Prompt Design

The Claude agent receives a system prompt that instructs it to:

1. Call `get_food_orders` with a 90-day lookback window
2. Call Instamart history tools for the same period
3. Call Dineout history tools for the same period
4. Analyze the combined dataset for food mode signals
5. Return structured JSON with mode, confidence, and insight card text

```
System: You are SwiggyLens, a cross-vertical food intelligence agent. 
You have access to the user's complete Swiggy history across food delivery, 
dine-in, and Instamart. Your job is to detect behavioral patterns that are 
only visible when all three verticals are analyzed together.

When detecting food mode:
- Look at the ratio of Instamart to delivery activity over the last 14 days
- Check for dine-in occasions in the last 30 days
- Identify behavioral shifts compared to the prior 30-day period
- Always ground your insights in specific data points from the user's actual orders

Return structured output: { mode, confidence, insights[], data_points[] }
```

---

## Why This Integration Is Unique

Most MCP integrations treat the server as a simple data API — fetch data, display it. SwiggyLens treats the MCP server as a **reasoning substrate**.

Claude doesn't just retrieve data from Swiggy's tools. It uses the combined output of all three tool sets to perform behavioral analysis that produces insights no single vertical could generate alone.

This is the difference between:
- "You ordered 47 times last month" (single-vertical retrieval)
- "You've shifted from Cooking Mode to Ordering Mode over the last 10 days — your Instamart activity dropped 70% while delivery frequency doubled. This usually happens during work crunches." (cross-vertical intelligence)

The MCP server makes the first possible. SwiggyLens is built to make the second real.
