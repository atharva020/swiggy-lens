# Session Handoff — SwiggyLens

> Load this file at the start of every new agent/model session alongside `BUILD_PLAN.md`.
> It records what was attempted, what failed, and what is now correct — so you don't repeat the same mistakes.

---

## What This Project Is

SwiggyLens — AI food intelligence agent for Swiggy Builders Club.
Cross-vertical insights (food delivery + Instamart + dineout) in one Claude reasoning loop.
Built with: Next.js 14 App Router, Tailwind, Anthropic SDK, `@modelcontextprotocol/sdk`, `iron-session`.
App lives in `swiggy-lens/`.

Goal: demo to Swiggy → get hired / get production MCP access.

---

## Mistakes Made (and what is correct now)

### 1. Waited for a Builders Club `client_id` email — WRONG

**What we thought:**
> Swiggy would email a static `SWIGGY_CLIENT_ID` and `SWIGGY_CLIENT_SECRET` that we had to hardcode into `.env.local` before OAuth would work. We blocked on this.

**What is actually correct:**
Swiggy MCP supports **Dynamic Client Registration (RFC 7591)** at `POST https://mcp.swiggy.com/auth/register`.
No `client_id` to wait for — your app registers itself on the fly.
`SWIGGY_CLIENT_ID` in env is optional and only for enterprise/production static clients.

**Code fix (committed):**
- `lib/auth.ts` — `registerDynamicClient()` + `resolveOAuthClient()`
- `/api/auth/login` — calls `resolveOAuthClient()` first, then redirects to `/auth/authorize`
- `/api/auth/callback` — token exchange with `client_id` from session (DCR result), not hardcoded env

DCR returns `client_id: "swiggy-mcp"` for localhost. Works immediately.

---

### 2. Tried to paste random tokens into `SWIGGY_ACCESS_TOKEN` — WRONG

**What we tried:**
> Copied something (unclear what — possibly a refresh token, a wrong JWT, or a non-Swiggy token) into `SWIGGY_ACCESS_TOKEN` in `.env.local` and ran `npm run verify:mcp`.

**Error received:**
```
Streamable HTTP error: Error POSTing to endpoint:
{"error": "invalid_token", "error_description": "Incorrect alg in MCP JWT"}
```

**Why it failed:**
Swiggy MCP only accepts the `access_token` (a signed JWT from `POST /auth/token`) in the `Authorization: Bearer` header. Any other string — API keys, refresh tokens, client secrets, random strings, other services' JWTs — are rejected with `Incorrect alg in MCP JWT`.

**What is correct:**
- `SWIGGY_ACCESS_TOKEN` in `.env.local` is **only for the CLI dev-login shortcut**.
- The value must be the literal `access_token` field from the JSON response of `POST https://mcp.swiggy.com/auth/token`.
- For normal use: **don't put anything in `SWIGGY_ACCESS_TOKEN`**. Use **Connect with Swiggy** (OAuth flow) instead. The token gets stored in the encrypted iron-session cookie automatically.
- Cursor MCP uses its own OAuth token internally. That token is **not** exportable into your app's `.env.local`.

---

### 3. Assumed `SWIGGY_CLIENT_ID` was required for "Connect with Swiggy" button to show — WRONG

**What happened:**
The dashboard home page (`page.tsx`) previously only showed the Connect button if `SWIGGY_CLIENT_ID` was set in env. Without it, users saw "Add SWIGGY_CLIENT_ID to .env.local" and got stuck.

**What is correct now:**
Connect with Swiggy shows whenever `isSessionConfigured()` is true (i.e., `SESSION_SECRET` is set or you're in dev mode). DCR handles the client identity transparently.

---

### 4. `SESSION_SECRET` was treated as mandatory even for localhost dev — over-strict

**Old behaviour:**
If `SESSION_SECRET` was missing or short, `/api/auth/login` redirected to `/?error=session_not_configured`. Blocked localhost testing.

**Current behaviour:**
`isSessionConfigured()` returns `true` in `NODE_ENV === "development"` even without a secret (uses built-in default). Production still requires a 32+ char secret.

---

## How OAuth Works Now (correct flow)

```
1. User clicks "Connect with Swiggy" on /
2. GET /api/auth/login
   ├── resolveOAuthClient(redirectUri)
   │     ├── If SWIGGY_CLIENT_ID in env → use it
   │     └── Else POST https://mcp.swiggy.com/auth/register → get client_id
   ├── Generate PKCE (codeVerifier + codeChallenge)
   ├── Generate random state
   ├── Save codeVerifier + oauthState + oauthClientId to iron-session cookie
   └── Redirect → https://mcp.swiggy.com/auth/authorize?...PKCE params...

3. Swiggy shows phone + OTP in browser

4. Swiggy redirects to http://localhost:3000/api/auth/callback?code=...&state=...
   GET /api/auth/callback
   ├── Validate state matches session
   ├── POST https://mcp.swiggy.com/auth/token
   │     body: { grant_type, code, code_verifier, redirect_uri }
   │     (client_id added only if it was set in session)
   ├── Receive { access_token, expires_in }  ← THIS is the valid MCP JWT
   ├── Store access_token + expiresAt in iron-session
   └── Redirect → /?connected=1

5. page.tsx: isAccessTokenValid(session) = true
   → Server fetches insights via runInsightsAgent(clients)
   → FoodModeBar + InsightCards render
```

Token lifetime: **5 days**. No refresh token in v1.0. When expired: re-run Connect.

---

## Current `.env.local` — what is needed and why

File location: `swiggy-lens/.env.local` (not repo root)

```bash
# REQUIRED for insight cards
ANTHROPIC_API_KEY=sk-ant-...

# REQUIRED in production; optional in local dev (default fallback used)
SESSION_SECRET=any-random-string-at-least-32-chars

# App base URL — must match redirect URI host
NEXTAUTH_URL=http://localhost:3000
SWIGGY_REDIRECT_URI=http://localhost:3000/api/auth/callback

# OPTIONAL — only for enterprise/static Swiggy client
# Leave blank; DCR handles it automatically
SWIGGY_CLIENT_ID=
SWIGGY_CLIENT_SECRET=

# OPTIONAL dev shortcut — only set if you have a REAL OAuth access_token JWT
# Not a Cursor token, not an API key, not a refresh token
# If in doubt: leave blank and use "Connect with Swiggy" instead
SWIGGY_ACCESS_TOKEN=
```

---

## What Has Been Built (Days 1–4)

| Day | What | Key files |
|-----|------|-----------|
| 1 | Scaffold + MCP clients | `lib/swiggy-mcp.ts`, `lib/verify-mcp.ts`, `package.json` |
| 2 | OAuth PKCE + DCR | `lib/auth.ts`, `lib/session.ts`, `api/auth/login`, `api/auth/callback`, `api/auth/logout`, `api/auth/dev-login` |
| 3 | Agent core | `lib/types.ts`, `lib/food-mode-engine.ts`, `lib/claude-agent.ts`, `api/insights` |
| 4 | Dashboard UI | `components/FoodModeBar.tsx`, `components/InsightCard.tsx`, `app/page.tsx` |

Build passes: `npm run build` — zero TypeScript errors.

---

## What Is Not Built Yet (Days 5–6)

- **Day 5**: `/api/agent` streaming route + `ChatInterface.tsx` + `app/chat/page.tsx`
- **Day 6**: `SpendChart.tsx`, polish, Loom demo video, reply to Swiggy email with repo + video

---

## How to Test Locally Right Now

```bash
cd swiggy-lens
# 1. Set ANTHROPIC_API_KEY + SESSION_SECRET in .env.local
npm run dev
# 2. Open http://localhost:3000
# 3. Click "Connect with Swiggy" → phone + OTP
# 4. Dashboard loads with Food Mode + insight cards
```

If you see "Connect with Swiggy" grayed out or missing: check that `npm run dev` is running (not production).
If you see an error banner after Connect: check the error string — usually redirect_uri mismatch or network issue on DCR/token exchange.

---

## Swiggy Docs References

- Auth overview: https://mcp.swiggy.com/builders/docs/start/authenticate/
- DCR endpoint: `POST https://mcp.swiggy.com/auth/register`
- Token exchange: `POST https://mcp.swiggy.com/auth/token` — body is JSON `{grant_type, code, code_verifier, redirect_uri}`
- OAuth metadata: `GET https://mcp.swiggy.com/.well-known/oauth-authorization-server`
- Apply for production: `/access` on the Builders Club site + demo video to builders@swiggy.in

---

## Last Updated

2026-05-28 — DCR OAuth fix, dashboard UI complete (Day 4 done).
