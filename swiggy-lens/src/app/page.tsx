import Link from "next/link";

import { InsightsPanel } from "@/components/InsightsPanel";
import {
  getSession,
  isAccessTokenValid,
  isSessionConfigured,
} from "@/lib/session";

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

  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-3xl px-6 py-14 sm:py-20">
        {/* Masthead */}
        <header className="mb-12 flex items-start justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-saffron text-sm font-bold text-ink">
                S
              </span>
              <span className="kicker !tracking-[0.28em] text-saffron">
                SwiggyLens
              </span>
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-cream sm:text-5xl">
              Your food life,
              <br />
              <span className="italic text-saffron-soft">read as one story.</span>
            </h1>
          </div>
          {isLoggedIn && (
            <Link
              href="/api/auth/logout"
              className="mt-1 shrink-0 rounded-full border border-line px-4 py-1.5 text-xs text-cream-dim transition hover:border-muted hover:text-cream"
            >
              Log out
            </Link>
          )}
        </header>

        {/* Connect banner */}
        {params.connected === "1" && (
          <div className="mb-7 rounded-xl border border-tan/40 bg-tan/10 px-4 py-3 text-sm text-cream-dim">
            {isDevMode
              ? "Dev mode — personal token loaded."
              : "Connected to Swiggy."}
          </div>
        )}

        {/* Error banner */}
        {errorMessage && (
          <div className="mb-7 rounded-xl border border-berry/30 bg-berry/10 px-4 py-3 text-sm text-cream-dim">
            {errorMessage}
          </div>
        )}

        {isLoggedIn ? (
          <div className="flex flex-col gap-8">
            <InsightsPanel />

            {/* Action bar */}
            <div className="flex flex-wrap items-center gap-3 border-t border-line pt-7">
              <Link
                href="/chat"
                className="group inline-flex items-center gap-2 rounded-full bg-saffron px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-saffron-soft"
              >
                Ask SwiggyLens
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link
                href="/api/auth/test-mcp"
                className="rounded-full border border-line px-4 py-2 text-xs text-muted transition hover:border-muted hover:text-cream-dim"
              >
                Test MCP
              </Link>
            </div>
          </div>
        ) : (
          /* ── LANDING ── */
          <div className="flex flex-col gap-8">
            <p className="max-w-xl text-lg leading-relaxed text-cream-dim">
              One agent reads across food delivery, Instamart groceries, and
              dine-outs — then tells you what kind of food week you&apos;re
              actually having.
            </p>

            {/* vertical legend — what gets read */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🛵", label: "Delivery", c: "var(--saffron)" },
                { icon: "🛒", label: "Instamart", c: "var(--tan)" },
                { icon: "🍽️", label: "Dineout", c: "var(--paarl)" },
              ].map((v) => (
                <div
                  key={v.label}
                  className="rounded-2xl border border-line bg-surface/60 px-4 py-5 text-center"
                >
                  <div className="text-2xl">{v.icon}</div>
                  <div
                    className="kicker mt-2"
                    style={{ color: v.c }}
                  >
                    {v.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-line bg-surface/70 p-7">
              <p className="kicker mb-5">Connect to begin</p>
              <div className="flex flex-wrap gap-3">
                {canConnectSwiggy && (
                  <Link
                    href="/api/auth/login"
                    className="rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-ink transition hover:bg-saffron-soft"
                  >
                    Connect with Swiggy
                  </Link>
                )}
                {isDev && hasDevToken && (
                  <Link
                    href="/api/auth/dev-login"
                    className="rounded-full border border-saffron/50 px-6 py-3 text-sm font-semibold text-saffron-soft transition hover:border-saffron hover:text-saffron"
                  >
                    Dev login (personal token)
                  </Link>
                )}
                {!canConnectSwiggy && isDev && !hasDevToken && (
                  <p className="text-sm text-muted">
                    Set <code className="text-cream-dim">SESSION_SECRET</code> in{" "}
                    <code className="text-cream-dim">.env.local</code> to enable
                    Connect with Swiggy (OAuth via Dynamic Client Registration).
                  </p>
                )}
              </div>
            </div>

            {canConnectSwiggy && (
              <p className="text-sm leading-relaxed text-muted">
                Swiggy OAuth 2.1 + PKCE with automatic client registration —
                phone &amp; OTP on Swiggy, no manual client_id needed for
                localhost.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
