# Why I'm Building SwiggyLens

I've been a Swiggy user for years — food delivery, Instamart, the occasional dine-out. Like most people, I use all three without thinking much about the pattern.

A few weeks ago I was looking back at my Instamart orders and noticed something: there were stretches of 2-3 weeks where I barely ordered food delivery at all. During those periods, I was buying a lot of vegetables and groceries. Then something would shift — work got heavier, or I just got lazy — and delivery would spike back up while Instamart went quiet.

I was cycling through "modes" without realizing it. And Swiggy had all the data to see it. I didn't.

That's the gap SwiggyLens fills.

---

## What I want to build

A personal AI agent that connects to your Swiggy account across all three verticals and tells you what's actually going on with your food behavior. Not a dashboard with charts. Not a chatbot that answers questions. Something that opens and immediately tells you something true about yourself.

Most "order history" features just show you a list — sorted by date, maybe filterable by restaurant. That's a receipt archive, not insight.

The first version is simple: detect which mode you're in right now (cooking, ordering, or social), surface 3-4 things worth knowing, and let you ask follow-up questions in plain language.

When I showed the food mode concept to a few friends, the reaction wasn't "that's a cool feature." It was "wait, yeah, I do that." That's the feeling I'm building toward.

The insight that makes this interesting: Swiggy is the only platform that can see both sides of this. Zomato sees your restaurant orders. Blinkit sees your groceries. Neither can connect the two because they don't have both. Swiggy does — and no Swiggy product today actually uses that connection.

---

## Why I'm applying for Builders Club access

I've already authenticated with the swiggy-food MCP in Cursor and pulled my own order history. The cross-vertical reasoning I'm describing works — I've tested the food mode detection concept against my own data and it surfaces patterns that feel genuinely useful.

To build this properly (for more than one user, with dine-out and Instamart data included), I need production OAuth access and the full MCP tool set across all three verticals.

---

## The stack

Next.js on the frontend, Claude Sonnet as the agent, Swiggy MCP for data. Nothing exotic. The interesting part is the agent prompt design — how you get Claude to reason across three tool sets in a single pass and return insights that are actually grounded in real order data rather than generic patterns.

I'm happy to share the agent architecture, the food mode detection logic, or anything else that would help evaluate this. Reach me at atharva.chirde@gmail.com.
