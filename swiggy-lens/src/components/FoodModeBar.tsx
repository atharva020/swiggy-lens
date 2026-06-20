import type { Confidence, FoodMode } from "@/lib/types";

const MODE_CONFIG: Record<
  FoodMode,
  { word: string; accent: string }
> = {
  cooking: { word: "Cooking", accent: "var(--tan)" },
  ordering: { word: "Ordering", accent: "var(--saffron)" },
  social: { word: "Social", accent: "var(--paarl)" },
  mixed: { word: "Mixed", accent: "var(--carrot)" },
};

const CONFIDENCE_PERCENT: Record<Confidence, number> = {
  high: 88,
  medium: 56,
  low: 28,
};

interface FoodModeBarProps {
  mode: FoodMode;
  confidence: Confidence;
  modeLabel: string;
  modeSummary: string;
}

export function FoodModeBar({
  mode,
  confidence,
  modeSummary,
}: FoodModeBarProps) {
  const config = MODE_CONFIG[mode];
  const percent = CONFIDENCE_PERCENT[confidence];

  return (
    <section className="rise card overflow-hidden p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker">Food mode</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-cream sm:text-4xl">
            {config.word}
          </h2>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: config.accent }}
        >
          {percent}% match
        </span>
      </div>

      <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-cream-dim">
        {modeSummary}
      </p>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>Confidence</span>
          <span className="nums font-semibold text-cream">{percent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-ink-2">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${percent}%`,
              backgroundColor: config.accent,
            }}
          />
        </div>
      </div>
    </section>
  );
}
