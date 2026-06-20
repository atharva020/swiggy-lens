import Link from "next/link";

import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { InsightsPanel } from "@/components/InsightsPanel";
import { GITHUB_URL } from "@/lib/site";
import {
  getSession,
  isAccessTokenValid,
  isSessionConfigured,
} from "@/lib/session";

const isDev = process.env.NODE_ENV === "development";
const hasDevToken = Boolean(process.env.SWIGGY_ACCESS_TOKEN?.trim());

const FOOD_MODES = [
  {
    icon: "🍳",
    mode: "Cooking",
    signal: "Instamart ↑ · Delivery ↓",
    body: "You're stocking groceries and cooking more at home.",
    color: "var(--tan)",
  },
  {
    icon: "📦",
    mode: "Ordering",
    signal: "Delivery ↑ · Instamart ↓",
    body: "Busy stretch — relying on restaurant delivery.",
    color: "var(--saffron)",
  },
  {
    icon: "🍽️",
    mode: "Social",
    signal: "Dineout occasions appearing",
    body: "Going out more — restaurants over delivery.",
    color: "var(--paarl)",
  },
] as const;

const FEATURES = [
  {
    icon: "🛵",
    title: "Food Delivery",
    body: "Order history, spend patterns, and weeknight habits in one view.",
    color: "var(--saffron)",
  },
  {
    icon: "🛒",
    title: "Instamart",
    body: "Grocery runs and basket patterns — cooking signals included.",
    color: "var(--tan)",
  },
  {
    icon: "🍽️",
    title: "Dineout",
    body: "Where you dine out, how often, and what you spend socially.",
    color: "var(--paarl)",
  },
  {
    icon: "💬",
    title: "Ask anything",
    body: "Chat with your data. \"When was I last in cooking mode?\" Just ask.",
    color: "var(--saffron)",
  },
] as const;

const STATS = [
  { value: "3", unit: "verticals", label: "Food · Instamart · Dineout" },
  { value: "AI", unit: "agent", label: "Cross-vertical reasoning via MCP" },
  { value: "0", unit: "stored", label: "Session only — nothing saved" },
] as const;

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
    <div className="flex min-h-screen flex-col bg-ink">
      <AppHeader isLoggedIn={isLoggedIn} canConnectSwiggy={canConnectSwiggy} />

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        {params.connected === "1" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-cream-dim">
            <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
            {isDevMode ? "Dev mode — personal token loaded." : "Connected to Swiggy."}
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 rounded-lg border border-berry/30 bg-berry/10 px-4 py-3 text-sm text-cream-dim">
            {errorMessage}
          </div>
        )}
      </div>

      {isLoggedIn ? (
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <div className="mb-8">
            <p className="kicker mb-2">Your dashboard</p>
            <h1 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">
              Food life, across all three verticals
            </h1>
            <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-cream-dim">
              SwiggyLens reads your Food, Instamart, and Dineout activity together —
              then surfaces your current food mode and spending patterns.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <InsightsPanel />

            <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-md bg-saffron px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-saffron-soft"
              >
                Ask SwiggyLens
              </Link>
              <Link
                href="/api/auth/test-mcp"
                className="rounded-md border border-line px-4 py-2 text-xs font-medium text-cream-dim transition hover:border-muted hover:text-cream"
              >
                Test MCP
              </Link>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1">
          {/* Hero */}
          <section className="border-b border-line bg-surface">
            <div className="mx-auto flex max-w-5xl flex-col items-start gap-10 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-20">
              <div className="max-w-xl">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full border border-line bg-ink px-3 py-1 text-xs font-semibold text-cream-dim">
                    Open Source
                  </span>
                  <span className="inline-flex items-center rounded-full border border-saffron/30 bg-saffron/8 px-3 py-1 text-xs font-semibold text-saffron">
                    Swiggy MCP
                  </span>
                  <span className="inline-flex items-center rounded-full border border-line bg-ink px-3 py-1 text-xs font-semibold text-muted">
                    WIP
                  </span>
                </div>

                <h1 className="text-3xl font-bold leading-tight tracking-tight text-cream sm:text-4xl lg:text-5xl">
                  Understand your{" "}
                  <span className="text-saffron">food life</span>
                  <br className="hidden sm:block" /> across all of Swiggy
                </h1>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-cream-dim">
                  SwiggyLens is an AI agent that connects Food, Instamart, and
                  Dineout — and tells you things about your food behavior that no
                  single vertical ever could.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {canConnectSwiggy && (
                    <Link
                      href="/api/auth/login"
                      className="inline-flex items-center justify-center rounded-md bg-saffron px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-saffron-soft"
                    >
                      Connect with Swiggy
                    </Link>
                  )}
                  <Link
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md border border-line px-5 py-3 text-sm font-semibold text-cream-dim transition hover:border-saffron hover:text-saffron"
                  >
                    View on GitHub
                  </Link>
                  {isDev && hasDevToken && (
                    <Link
                      href="/api/auth/dev-login"
                      className="inline-flex items-center justify-center rounded-md border border-saffron px-5 py-3 text-sm font-semibold text-saffron transition hover:bg-saffron/5"
                    >
                      Dev login
                    </Link>
                  )}
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted">
                  Unofficial open-source project — not affiliated with Swiggy.
                  Uses phone + OTP. Data lives only in your session.
                </p>
                {!canConnectSwiggy && isDev && !hasDevToken && (
                  <p className="mt-2 text-sm text-muted">
                    Set{" "}
                    <code className="rounded bg-ink-2 px-1 py-0.5 text-xs text-cream-dim">
                      SESSION_SECRET
                    </code>{" "}
                    in{" "}
                    <code className="rounded bg-ink-2 px-1 py-0.5 text-xs text-cream-dim">
                      .env.local
                    </code>{" "}
                    to enable Swiggy OAuth.
                  </p>
                )}
              </div>

              <div className="w-full shrink-0 sm:w-72">
                <div className="card overflow-hidden p-5">
                  <p className="kicker mb-3">Preview · example data</p>
                  <p className="text-2xl font-bold text-cream">Ordering</p>
                  <p className="mt-1 text-sm text-cream-dim">
                    You ordered 4× this week — mostly weeknight dinners.
                  </p>
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-ink-2">
                    <div className="h-full w-[72%] rounded-full bg-saffron" />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center text-xs">
                    <div>
                      <p className="nums font-semibold text-cream">₹2.3k</p>
                      <p className="text-muted">Food</p>
                    </div>
                    <div>
                      <p className="nums font-semibold text-cream">₹840</p>
                      <p className="text-muted">Instamart</p>
                    </div>
                    <div>
                      <p className="nums font-semibold text-cream">₹1.1k</p>
                      <p className="text-muted">Dineout</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-b border-line bg-ink-2/40">
            <div className="mx-auto flex max-w-5xl divide-x divide-line px-4 sm:px-6">
              {STATS.map((s) => (
                <div
                  key={s.unit}
                  className="flex flex-1 flex-col items-center py-6 text-center"
                >
                  <p className="text-2xl font-bold text-cream">
                    {s.value}
                    <span className="ml-1 text-sm font-semibold text-saffron">
                      {s.unit}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Why */}
          <section className="border-b border-line bg-surface">
            <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
              <p className="kicker mb-2">Why SwiggyLens</p>
              <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-cream sm:text-3xl">
                Swiggy sees all three sides of your food life. Nothing connects them.
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <p className="text-sm leading-relaxed text-cream-dim">
                  Most of us use Food delivery, Instamart, and Dineout without noticing
                  the pattern. There are weeks you barely order in — groceries are up.
                  Then delivery spikes and Instamart goes quiet. You cycle through modes
                  without realizing it.
                </p>
                <p className="text-sm leading-relaxed text-cream-dim">
                  Swiggy is the only platform that sees both sides — what you order
                  and what you buy to cook, plus where you dine out. SwiggyLens uses
                  Swiggy MCP to reason across all three at once and surface insights
                  your order history page never will.
                </p>
              </div>
            </div>
          </section>

          {/* Food modes */}
          <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="mb-10 text-center">
              <p className="kicker mb-2">Food mode detection</p>
              <h2 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">
                Your current mode — detected automatically
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-cream-dim">
                Open the app and SwiggyLens infers whether you&apos;re cooking,
                ordering, or in a social phase — no prompting required.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {FOOD_MODES.map((m) => (
                <div key={m.mode} className="card p-5">
                  <span className="text-2xl">{m.icon}</span>
                  <h3 className="mt-3 text-base font-semibold text-cream">
                    {m.mode} mode
                  </h3>
                  <p className="mt-1 text-xs font-medium text-saffron">{m.signal}</p>
                  <p className="mt-2 text-sm leading-relaxed text-cream-dim">
                    {m.body}
                  </p>
                  <div
                    className="mt-4 h-0.5 w-full rounded-full"
                    style={{ backgroundColor: m.color, opacity: 0.35 }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="border-t border-line bg-ink-2/30">
            <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
              <div className="mb-10 text-center">
                <p className="kicker mb-2">What it does</p>
                <h2 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">
                  Not a receipt archive. Actual insight.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream-dim">
                  Proactive insight cards, spend breakdowns, and natural language
                  chat — all grounded in your real Swiggy data.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {FEATURES.map((f) => (
                  <div key={f.title} className="card p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-2xl">{f.icon}</span>
                      <div
                        className="h-0.5 flex-1 rounded-full"
                        style={{ backgroundColor: f.color, opacity: 0.3 }}
                      />
                    </div>
                    <h3 className="text-base font-semibold text-cream">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-cream-dim">
                      {f.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="border-t border-line bg-surface">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-cream sm:text-2xl">
                  Try it with your own Swiggy account
                </h2>
                <p className="mt-2 text-sm text-cream-dim">
                  Work in progress — connect locally or explore the source on GitHub.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {canConnectSwiggy && (
                  <Link
                    href="/api/auth/login"
                    className="inline-flex items-center justify-center rounded-md bg-saffron px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-saffron-soft"
                  >
                    Connect with Swiggy
                  </Link>
                )}
                <Link
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md border border-line px-6 py-3 text-sm font-semibold text-cream-dim transition hover:border-saffron hover:text-saffron"
                >
                  Star on GitHub
                </Link>
              </div>
            </div>
          </section>
        </main>
      )}

      <AppFooter />
    </div>
  );
}
