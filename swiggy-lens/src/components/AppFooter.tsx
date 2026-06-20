import Link from "next/link";

import { SwiggyLensMark } from "@/components/SwiggyLensMark";
import { GITHUB_URL, SITE } from "@/lib/site";

export function AppFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5">
              <SwiggyLensMark className="h-9 w-9" />
              <span className="text-base font-bold text-cream">{SITE.name}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-cream-dim">
              {SITE.tagline}. An open-source experiment using Swiggy MCP to reason
              across Food, Instamart, and Dineout in one place.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {SITE.disclaimer}
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <p className="kicker">Project</p>
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-cream-dim transition hover:text-saffron"
            >
              View on GitHub
            </Link>
            <p className="text-xs text-muted">{SITE.buildersClub}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-6">
          <span className="rounded-full border border-line bg-ink px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">
            Open Source
          </span>
          <span className="rounded-full border border-saffron/25 bg-saffron/8 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-saffron">
            WIP
          </span>
          <span className="rounded-full border border-line bg-ink px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">
            Session-only data
          </span>
        </div>
      </div>
    </footer>
  );
}
