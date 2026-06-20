import Link from "next/link";

import { SwiggyLensMark } from "@/components/SwiggyLensMark";

interface AppHeaderProps {
  isLoggedIn: boolean;
  canConnectSwiggy: boolean;
  backHref?: string;
  backLabel?: string;
  title?: string;
}

export function AppHeader({
  isLoggedIn,
  canConnectSwiggy,
  backHref,
  backLabel,
  title,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface shadow-[var(--shadow-nav)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          {backHref && backLabel ? (
            <>
              <Link
                href={backHref}
                className="shrink-0 text-xs font-medium text-muted transition hover:text-saffron"
              >
                {backLabel}
              </Link>
              <span className="text-line">|</span>
            </>
          ) : null}
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <SwiggyLensMark />
            <span className="truncate text-lg font-bold tracking-tight text-cream">
              {title ? (
                title
              ) : (
                <>
                  Swiggy<span className="text-saffron">Lens</span>
                </>
              )}
            </span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {isLoggedIn && (
            <Link
              href="/chat"
              className="hidden rounded-md border border-line px-3 py-1.5 text-xs font-medium text-cream-dim transition hover:border-saffron hover:text-saffron sm:inline-flex"
            >
              Ask SwiggyLens
            </Link>
          )}
          {!isLoggedIn && canConnectSwiggy && (
            <Link
              href="/api/auth/login"
              className="rounded-md bg-saffron px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-saffron-soft"
            >
              Connect Swiggy
            </Link>
          )}
          {isLoggedIn && (
            <Link
              href="/api/auth/logout"
              className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-cream-dim transition hover:border-muted hover:text-cream"
            >
              Log out
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
