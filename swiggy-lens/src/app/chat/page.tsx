import { redirect } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { ChatInterface } from "@/components/ChatInterface";
import { getSession, isAccessTokenValid, isSessionConfigured } from "@/lib/session";

export const metadata = {
  title: "Ask SwiggyLens",
  description:
    "Chat with your Swiggy data across Food, Instamart, and Dineout.",
};

export default async function ChatPage() {
  const session = await getSession();

  if (!isAccessTokenValid(session)) {
    redirect("/?error=Please+connect+with+Swiggy+to+use+chat");
  }

  const canConnectSwiggy = isSessionConfigured();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink">
      <AppHeader
        isLoggedIn
        canConnectSwiggy={canConnectSwiggy}
        backHref="/"
        backLabel="← Dashboard"
        title="Ask SwiggyLens"
      />

      <main className="mx-auto flex w-full max-w-2xl min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5">
        <div className="mb-3 shrink-0">
          <p className="kicker mb-1">Natural language</p>
          <p className="text-sm text-cream-dim">
            Ask about spending, food modes, cuisines, or patterns across all three
            Swiggy verticals.
          </p>
        </div>

        <div className="card flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-5">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}
