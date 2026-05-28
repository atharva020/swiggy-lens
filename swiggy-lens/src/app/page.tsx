import Link from "next/link";

import { FoodModeBar } from "@/components/FoodModeBar";
import { InsightCard } from "@/components/InsightCard";
import { runInsightsAgent } from "@/lib/claude-agent";
import {
  getSession,
  isAccessTokenValid,
  isSessionConfigured,
} from "@/lib/session";
import { closeMCPClients, createMCPClients } from "@/lib/swiggy-mcp";
import type { InsightsResponse } from "@/lib/types";

const isDev = process.env.NODE_ENV === "development";
const hasDevToken = Boolean(process.env.SWIGGY_ACCESS_TOKEN?.trim());

const ERROR_MESSAGES: Record<string, string> = {
  session_not_configured:
    "SESSION_SECRET is missing or too short (min 32 chars). Required in production; recommended in local dev.",
  invalid_state: "OAuth state mismatch. Please try connecting again.",
  missing_verifier: "OAuth session expired. Please try connecting again.",
  missing_code: "Swiggy did not return an authorization code.",
};

function getErrorMessage(error?: string) {
  if (!error) return null;
  return ERROR_MESSAGES[error] ?? decodeURIComponent(error);
}

async function fetchInsights(
  accessToken: string
): Promise<InsightsResponse | null> {
  let clients;
  try {
    clients = await createMCPClients(accessToken);
    return await runInsightsAgent(clients);
  } catch {
    return null;
  } finally {
    if (clients) {
      await closeMCPClients(clients);
    }
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; connected?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const isLoggedIn = isAccessTokenValid(session);
  const canConnectSwiggy = isSessionConfigured();
  const errorMessage = getErrorMessage(params.error);
  const isDevMode = params.mode === "dev";

  let insights: InsightsResponse | null = null;
  let insightsError: string | null = null;

  if (isLoggedIn && session.accessToken) {
    insights = await fetchInsights(session.accessToken);
    if (!insights) {
      insightsError =
        "Could not load insights right now. MCP or Claude may be unavailable.";
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-orange-400">
              SwiggyLens
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Your food life, clearly
            </h1>
          </div>
          {isLoggedIn && (
            <Link
              href="/api/auth/logout"
              className="rounded-full border border-zinc-700 px-4 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
            >
              Log out
            </Link>
          )}
        </div>

        {/* Connect banner when logged in fresh */}
        {params.connected === "1" && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {isDevMode
              ? "Dev mode: personal token loaded."
              : "Connected to Swiggy."}
          </div>
        )}

        {/* OAuth error banner */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        {/* ── LOGGED IN ── */}
        {isLoggedIn ? (
          <div className="flex flex-col gap-6">
            {/* Food Mode Bar */}
            {insights ? (
              <FoodModeBar
                mode={insights.mode}
                confidence={insights.confidence}
                modeLabel={insights.modeLabel}
                modeSummary={insights.modeSummary}
              />
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-5">
                {insightsError ? (
                  <p className="text-sm text-red-300">{insightsError}</p>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Loading food mode...
                  </p>
                )}
              </div>
            )}

            {/* Insight Cards */}
            {insights && insights.insights.length > 0 && (
              <div>
                <p className="mb-3 text-xs uppercase tracking-widest text-zinc-500">
                  Insights
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {insights.insights.map((card, i) => (
                    <InsightCard
                      key={i}
                      title={card.title}
                      body={card.body}
                      tag={card.tag}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action bar */}
            <div className="flex gap-3">
              <Link
                href="/api/auth/test-mcp"
                className="rounded-full border border-zinc-700 px-4 py-2 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
              >
                Test MCP
              </Link>
            </div>
          </div>
        ) : (
          /* ── NOT LOGGED IN ── */
          <div className="flex flex-col gap-6">
            <p className="text-lg text-zinc-400">
              Cross-vertical food intelligence — food delivery, Instamart, and
              dine-in in one reasoning loop. Connect your Swiggy account to see
              your food mode and behavioral insights.
            </p>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <p className="mb-5 text-sm text-zinc-400">
                Connect to get started
              </p>
              <div className="flex flex-wrap gap-3">
                {canConnectSwiggy && (
                  <Link
                    href="/api/auth/login"
                    className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-orange-400"
                  >
                    Connect with Swiggy
                  </Link>
                )}
                {isDev && hasDevToken && (
                  <Link
                    href="/api/auth/dev-login"
                    className="rounded-full border border-orange-500/50 px-5 py-2.5 text-sm font-medium text-orange-300 transition hover:border-orange-400 hover:text-orange-200"
                  >
                    Dev login (personal token)
                  </Link>
                )}
                {!canConnectSwiggy && isDev && !hasDevToken && (
                  <p className="text-sm text-zinc-500">
                    Set <code className="text-zinc-300">SESSION_SECRET</code> in{" "}
                    <code className="text-zinc-300">.env.local</code> to enable
                    Connect with Swiggy (OAuth via Dynamic Client Registration).
                  </p>
                )}
              </div>
            </div>

            {canConnectSwiggy && (
              <p className="text-sm text-zinc-600">
                Connect uses Swiggy OAuth 2.1 + PKCE with automatic client
                registration — phone + OTP on Swiggy, no manual client_id
                required for localhost.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
