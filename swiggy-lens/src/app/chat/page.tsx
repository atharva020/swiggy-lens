import Link from "next/link";
import { redirect } from "next/navigation";

import { ChatInterface } from "@/components/ChatInterface";
import { getSession, isAccessTokenValid } from "@/lib/session";

export const metadata = {
  title: "Ask SwiggyLens",
  description: "Chat with your Swiggy data across food, Instamart, and dineout.",
};

export default async function ChatPage() {
  const session = await getSession();

  if (!isAccessTokenValid(session)) {
    redirect("/?error=Please+connect+with+Swiggy+to+use+chat");
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-muted transition hover:text-cream"
          >
            ← Dashboard
          </Link>
          <span className="text-line">/</span>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-saffron text-xs font-bold text-ink">
              S
            </span>
            <span className="font-display text-base font-semibold text-cream">
              Ask SwiggyLens
            </span>
          </div>
        </div>
        <Link
          href="/api/auth/logout"
          className="rounded-full border border-line px-4 py-1.5 text-xs text-cream-dim transition hover:border-muted hover:text-cream"
        >
          Log out
        </Link>
      </header>

      {/* Chat fills remaining height */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden px-6 py-6">
        <ChatInterface />
      </div>
    </div>
  );
}
