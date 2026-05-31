import type { InsightTag } from "@/lib/types";

const TAG_CONFIG: Record<InsightTag, { label: string; classes: string }> = {
  mode: {
    label: "Mode",
    classes: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
  spend: {
    label: "Spend",
    classes: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  cuisine: {
    label: "Cuisine",
    classes: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  pattern: {
    label: "Pattern",
    classes: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
};

const FALLBACK_TAG_CONFIG = {
  label: "Insight",
  classes: "bg-zinc-700/40 text-zinc-400 border-zinc-700",
};

interface InsightCardProps {
  title: string;
  body: string;
  tag: InsightTag;
}

export function InsightCard({ title, body, tag }: InsightCardProps) {
  const tagConfig = TAG_CONFIG[tag] ?? FALLBACK_TAG_CONFIG;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug text-zinc-100">
          {title}
        </h3>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${tagConfig.classes}`}
        >
          {tagConfig.label}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-400">{body}</p>
    </div>
  );
}
