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
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-50">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-zinc-500 transition hover:text-zinc-300"
          >
            ← Dashboard
          </Link>
          <span className="text-zinc-700">|</span>
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-orange-400">
              SwiggyLens
            </span>
            <span className="ml-2 text-sm font-medium text-zinc-200">
              Chat
            </span>
          </div>
        </div>
        <Link
          href="/api/auth/logout"
          className="rounded-full border border-zinc-700 px-4 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
        >
          Log out
        </Link>
      </header>

      {/* Chat fills remaining height */}
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-hidden px-6 py-6 flex flex-col">
        <ChatInterface />
      </div>
    </div>
  );
}
