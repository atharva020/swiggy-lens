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

export function InsightCard({ title, body, tag }: InsightCardProps) {
  const tagConfig = TAG_CONFIG[tag] ?? FALLBACK_TAG_CONFIG;

  return (
    <article className="card p-5 transition-shadow hover:shadow-[0_4px_12px_rgba(40,44,63,0.1)]">
      <span className="kicker inline-flex items-center gap-2">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: tagConfig.dot }}
        />
        {tagConfig.label}
      </span>

      <h3 className="mt-3 text-base font-semibold leading-snug text-cream">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-cream-dim">{body}</p>
    </article>
  );
}
