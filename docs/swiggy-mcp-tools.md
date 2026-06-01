# Swiggy MCP — Tool Reference

Tools exposed by the three Swiggy MCP servers, captured from the live authenticated session.

| Server | URL |
|--------|-----|
| Food | `https://mcp.swiggy.com/food` |
| Instamart | `https://mcp.swiggy.com/im` |
| Dineout | `https://mcp.swiggy.com/dineout` |

> **Legend:** ✅ = used by SwiggyLens (read-only insights/chat) · ⚪ = available, not used (write/transactional or out of scope)

---

## Food (`/food`)

### Discover
| Tool | Use | What it does |
|------|-----|--------------|
| `get_addresses` | ⚪ | All saved delivery addresses, sorted by last order date (shared Food/Instamart). |
| `search_restaurants` | ⚪ | Search restaurants to order from. |
| `search_menu` | ⚪ | Search dishes / menu items to order. |
| `get_restaurant_menu` | ⚪ | Full restaurant menu, paginated by category. |

### Cart
| Tool | Use | What it does |
|------|-----|--------------|
| `get_food_cart` | ⚪ | View current food cart. |
| `update_food_cart` | ⚪ | Add / update items in cart. |
| `flush_food_cart` | ⚪ | Empty the cart. |
| `fetch_food_coupons` | ⚪ | Available coupons / offers. |
| `apply_food_coupon` | ⚪ | Apply a coupon to the order. |

### Order
| Tool | Use | What it does |
|------|-----|--------------|
| `place_food_order` | ⚪ | Place / confirm a delivery order. |

### Track
| Tool | Use | What it does |
|------|-----|--------------|
| `get_food_orders` | ✅ | **Active** food delivery orders + status. Primary food-vertical data source. |
| `get_food_order_details` | ⚪ | Detail for one order by id. |
| `track_food_order` | ⚪ | Live delivery progress. |

### Support
| Tool | Use | What it does |
|------|-----|--------------|
| `report_error` | ⚪ | File an error report to the Swiggy MCP team. |

---

## Instamart (`/im`)

### Discover
| Tool | Use | What it does |
|------|-----|--------------|
| `get_addresses` | ⚪ | Saved addresses (shared Food/Instamart). |
| `create_address` | ⚪ | Add a delivery address. |
| `delete_address` | ⚪ | Remove a saved address. |
| `search_products` | ⚪ | Search products (with pack-size variants) at the selected address. |
| `your_go_to_items` | ⚪ | Frequently / recently ordered items. |

### Cart
| Tool | Use | What it does |
|------|-----|--------------|
| `get_cart` | ⚪ | Current grocery cart + bill breakdown. |
| `update_cart` | ⚪ | Replace cart with provided items. |
| `clear_cart` | ⚪ | Empty the grocery cart. |

### Order
| Tool | Use | What it does |
|------|-----|--------------|
| `checkout` | ⚪ | Place + confirm grocery order (order + payment in one). |

### Track
| Tool | Use | What it does |
|------|-----|--------------|
| `get_orders` | ✅ | **Order history** — past Instamart orders. Primary instamart-vertical data source. |
| `get_order_details` | ⚪ | Detail for one order by id. |
| `track_order` | ⚪ | Real-time order tracking. |

### Support
| Tool | Use | What it does |
|------|-----|--------------|
| `report_error` | ⚪ | File an error report. |

---

## Dineout (`/dineout`)

### Discover
| Tool | Use | What it does |
|------|-----|--------------|
| `search_restaurants_dineout` | ⚪ | Search restaurants for table booking (not delivery). |
| `get_restaurant_details` | ⚪ | Ratings, deals, timings, address for one restaurant. |
| `get_saved_locations` | ⚪ | Saved address ids for dineout search. |

### Reserve
| Tool | Use | What it does |
|------|-----|--------------|
| `get_available_slots` | ⚪ | Open table slots, up to 7 days out. |
| `create_cart` | ⚪ | Cart for booking or bill payment. |
| `book_table` | ⚪ | Book a table (free reservations only). |

### Manage
| Tool | Use | What it does |
|------|-----|--------------|
| `get_booking_status` | ⚠️ | Status/details for **one** booking. Returns restaurant, date, time, guests, deal, status. |

### Support
| Tool | Use | What it does |
|------|-----|--------------|
| `report_error` | ⚪ | File an error report. |

---

## Constraints that shape SwiggyLens

1. **No dineout history endpoint.** `get_booking_status` returns a single booking and (per its description) is keyed to one order — there is no list-all tool. So dineout occasions **cannot be enumerated** over MCP. SwiggyLens marks Dineout unavailable and does not call it. Consequence: the SOCIAL food-mode signal can't be driven from dineout history yet.

2. **Food = active orders only.** `get_food_orders` returns active/recent orders, not a deep historical archive. Spend and mode trends are bounded by whatever this returns.

3. **Field schemas not yet verified.** Tool descriptions are known; exact response field keys are not. `extractSpend` in `claude-agent.ts` guesses keys (`order_total` / `total_price` / `bill_total`). Confirm against a real response and tighten before relying on spend numbers.

## What SwiggyLens calls

| Vertical | Tool | Status |
|----------|------|--------|
| Food | `get_food_orders` | ✅ wired |
| Instamart | `get_orders` | ✅ wired |
| Dineout | — | ⚠️ no list endpoint; marked unavailable |
