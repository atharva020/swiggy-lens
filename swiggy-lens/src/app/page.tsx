import Link from "next/link";

import { getSession, isAccessTokenValid } from "@/lib/session";

const ERROR_MESSAGES: Record<string, string> = {
  oauth_not_configured:
    "Swiggy OAuth is not configured yet. Add SWIGGY_CLIENT_ID to .env.local once Builders Club approves your app.",
  session_not_configured:
    "SESSION_SECRET is missing or too short. Set a random 32+ character string in .env.local.",
  invalid_state: "OAuth state mismatch. Please try connecting again.",
  missing_verifier: "OAuth session expired. Please try connecting again.",
  missing_code: "Swiggy did not return an authorization code.",
};

function getErrorMessage(error?: string) {
  if (!error) {
    return null;
  }

  return ERROR_MESSAGES[error] ?? decodeURIComponent(error);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; connected?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const isLoggedIn = isAccessTokenValid(session);
  const errorMessage = getErrorMessage(params.error);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-16">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-orange-400">
            SwiggyLens
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            See your food life clearly
          </h1>
          <p className="text-lg text-zinc-400">
            Cross-vertical food intelligence powered by Swiggy MCP — food
            delivery, Instamart, and dine-in in one reasoning loop.
          </p>
        </div>

        {params.connected === "1" && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Connected to Swiggy. Your access token is stored securely in the
            server session.
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="mb-4 text-sm text-zinc-400">Authentication status</p>
          <p className="mb-6 text-xl font-medium">
            {isLoggedIn ? "Connected to Swiggy" : "Not connected"}
          </p>

          <div className="flex flex-wrap gap-3">
            {!isLoggedIn ? (
              <Link
                href="/api/auth/login"
                className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-orange-400"
              >
                Connect with Swiggy
              </Link>
            ) : (
              <>
                <Link
                  href="/api/auth/test-mcp"
                  className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white"
                >
                  Test MCP connection
                </Link>
                <Link
                  href="/api/auth/logout"
                  className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500"
                >
                  Log out
                </Link>
              </>
            )}
          </div>
        </div>

        {!isLoggedIn && (
          <p className="text-sm text-zinc-500">
            OAuth requires a Builders Club <code className="text-zinc-300">client_id</code>.
            The flow is wired — once Swiggy sends credentials, Connect will open
            phone + OTP login.
          </p>
        )}
      </main>
    </div>
  );
}
