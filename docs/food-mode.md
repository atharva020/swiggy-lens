# The Food Mode System

> The core concept behind SwiggyLens — and why it's only possible on Swiggy.

---

![Food Mode Detection](images/food-mode.png)

---

## The Problem With Single-Vertical Analysis

Every food analytics tool today works on one vertical at a time:

- Restaurant apps show your order frequency and cuisine preferences
- Grocery apps show your basket patterns and spending
- Neither can tell you anything meaningful about your *actual food behavior*

Because food behavior is not one-dimensional. A person who orders a lot of biryani on weekdays might be a skilled home cook on weekends. A person with a healthy Instamart basket might binge on late-night delivery when stressed. These patterns are invisible when you look at one vertical.

**Swiggy sees both sides.** SwiggyLens is the first application to use that.

---

## The Three Food Modes

### 🍳 Cooking Mode

**Signal:** Instamart activity is up. Food delivery orders are down or absent.

**What it means:** The user is in a cooking phase — buying raw ingredients and cooking at home. This is associated with deliberate meal planning, cost consciousness, or a personal health decision.

**Example insight card:**
> *"You've been in Cooking Mode for 2 weeks — Instamart up 3x, delivery down 60%. Your most-bought ingredients: onion, tomatoes, paneer."*

---

### 📦 Ordering Mode

**Signal:** Food delivery frequency is high. Instamart is flat or declining.

**What it means:** The user is in a busy phase — relying on delivery because they don't have time or energy to cook. Often correlates with work crunches, travel, or seasonal stress.

**Example insight card:**
> *"You've been in Ordering Mode for 10 days. Avg 1.8 orders/day — your highest streak this year. Most ordered: quick meals under 30 min."*

---

### 🍽️ Social Mode

**Signal:** Dine-in occasions appearing, often on weekends or around specific dates.

**What it means:** The user is going out socially — dining with friends, family, or on occasions. Usually associated with a higher average spend per meal and preference for specific cuisine types.

**Example insight card:**
> *"Social Mode detected — 4 dine-in occasions this month, all on weekends. Your go-to social cuisine: North Indian."*

---

## Detection Logic

Mode detection looks at the last 14 days, weighted so that recent days count more than older ones. Three signals get measured:

- Instamart order count and basket value
- Food delivery order count and how often
- Dineout occasions and spend

Whichever signal is clearly dominant determines the mode. If nothing is clearly dominant — say, both delivery and Instamart are active — it surfaces a transition state instead of forcing a label.

**Mixed mode example:**
> *"You're between modes right now — Instamart and delivery are both active. Could be a transition week."*

---

## Why This Matters for Swiggy

The food mode system demonstrates something important: when you combine Swiggy's three verticals into a single behavioral view, you get a picture of the user that no individual product team inside Swiggy currently has.

The food delivery team sees ordering spikes. The Instamart team sees basket changes. Neither team sees the relationship between the two — which is where the actual user insight lives.

SwiggyLens makes that relationship visible.
