import type { Confidence, FoodMode } from "@/lib/types";

const MODE_CONFIG: Record<
  FoodMode,
  { word: string; glyph: string; accent: string; glow: string }
> = {
  cooking: {
    word: "Cooking",
    glyph: "🍳",
    accent: "var(--tan)",
    glow: "rgba(252, 166, 94, 0.20)",
  },
  ordering: {
    word: "Ordering",
    glyph: "🛵",
    accent: "var(--saffron)",
    glow: "rgba(252, 128, 25, 0.22)",
  },
  social: {
    word: "Social",
    glyph: "🍽️",
    accent: "var(--paarl)",
    glow: "rgba(173, 71, 40, 0.26)",
  },
  mixed: {
    word: "Mixed",
    glyph: "🔀",
    accent: "var(--carrot)",
    glow: "rgba(253, 145, 57, 0.20)",
  },
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
    <section
      className="rise relative overflow-hidden rounded-[1.75rem] border border-line bg-surface px-7 py-8 sm:px-9 sm:py-10"
      style={{
        backgroundImage: `radial-gradient(36rem 18rem at 88% -30%, ${config.glow}, transparent 70%)`,
      }}
    >
      {/* glyph watermark, oversized + cropped, top-right */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-10 select-none text-[12rem] leading-none opacity-[0.07] sm:text-[15rem]"
      >
        {config.glyph}
      </span>

      <p className="kicker">Current Food Mode</p>

      <div className="mt-3 flex items-end gap-4">
        <h2 className="font-display text-6xl font-semibold leading-[0.9] tracking-tight text-cream sm:text-7xl">
          {config.word}
        </h2>
        <span
          className="mb-2 inline-block h-3 w-3 rounded-full"
          style={{ backgroundColor: config.accent }}
        />
      </div>

      <p className="mt-5 max-w-xl font-display text-lg italic leading-snug text-cream-dim sm:text-xl">
        {modeSummary}
      </p>

      {/* confidence readout */}
      <div className="mt-7 flex items-center gap-4">
        <div className="flex-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${percent}%`,
                background: `linear-gradient(90deg, ${config.accent}, var(--saffron-soft))`,
              }}
            />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="nums font-display text-xl font-semibold text-cream">
            {percent}
          </span>
          <span className="text-xs text-muted">% confidence</span>
        </div>
      </div>
    </section>
  );
}
