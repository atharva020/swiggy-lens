import type { InsightTag } from "@/lib/types";

const TAG_CONFIG: Record<InsightTag, { label: string; dot: string }> = {
  mode: { label: "Mode", dot: "var(--saffron)" },
  spend: { label: "Spend", dot: "var(--tan)" },
  cuisine: { label: "Cuisine", dot: "var(--carrot)" },
  pattern: { label: "Pattern", dot: "var(--paarl)" },
};

const FALLBACK_TAG_CONFIG = { label: "Insight", dot: "var(--muted)" };

interface InsightCardProps {
  index: number;
  title: string;
  body: string;
  tag: InsightTag;
}

export function InsightCard({ index, title, body, tag }: InsightCardProps) {
  const tagConfig = TAG_CONFIG[tag] ?? FALLBACK_TAG_CONFIG;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-line bg-surface/70 p-6 transition-colors duration-300 hover:border-saffron/40 hover:bg-surface-2/70">
      {/* index + tag row */}
      <div className="mb-4 flex items-center justify-between">
        <span className="nums font-display text-sm font-semibold text-muted">
          {String(index).padStart(2, "0")}
        </span>
        <span className="kicker flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: tagConfig.dot }}
          />
          {tagConfig.label}
        </span>
      </div>

      <h3 className="font-display text-xl font-semibold leading-tight text-cream">
        {title}
      </h3>
      <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-cream-dim">
        {body}
      </p>
    </article>
  );
}
