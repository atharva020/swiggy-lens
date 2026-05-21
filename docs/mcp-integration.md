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
- How often grocery orders are placed and what the basket value looks like
- What kind of items are being bought — raw ingredients vs packaged/ready food
- Whether fresh produce and staples are showing up (cooking mode signal)
- How regularly someone restocks the same items

---

## Agent Prompt Design

The Claude agent receives a system prompt that instructs it to:

1. Fetch the last 90 days of data from all three verticals — this gives enough history to spot patterns and shifts
2. Use the most recent 14 days as the active window for food mode detection — recent behavior matters more than what happened 2 months ago
3. Compare the active window against the prior 30-day period to detect changes
4. Return structured JSON with mode, confidence, and insight card text

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

## Why This Integration Is Different

Most apps that use Swiggy's MCP will fetch data and display it — order history, spend totals, that kind of thing. SwiggyLens does something different: Claude gets all three tool sets at once and figures out what the combination means.

The difference in practice:
- Single vertical: *"You ordered 47 times last month"*
- Cross-vertical: *"You've shifted from Cooking Mode to Ordering Mode over the last 10 days — Instamart activity dropped 70% while delivery doubled"*

The first is just retrieval. The second requires seeing both sides at the same time, which is only possible because Swiggy has both.
