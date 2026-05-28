import type { Confidence, FoodMode } from "@/lib/types";

const MODE_CONFIG: Record<
  FoodMode,
  { icon: string; label: string; color: string }
> = {
  cooking: {
    icon: "🍳",
    label: "Cooking Mode",
    color: "text-emerald-400",
  },
  ordering: {
    icon: "📦",
    label: "Ordering Mode",
    color: "text-orange-400",
  },
  social: {
    icon: "🍽️",
    label: "Social Mode",
    color: "text-blue-400",
  },
  mixed: {
    icon: "🔀",
    label: "Mixed Mode",
    color: "text-purple-400",
  },
};

const CONFIDENCE_PERCENT: Record<Confidence, number> = {
  high: 85,
  medium: 55,
  low: 30,
};

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
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
  const filledBars = Math.round((percent / 100) * 12);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl">{config.icon}</span>
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Current Mode
          </p>
          <h2 className={`text-2xl font-semibold ${config.color}`}>
            {config.label}
          </h2>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div className="flex gap-0.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-5 rounded-sm ${
                i < filledBars ? "bg-orange-500" : "bg-zinc-700"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-zinc-400">
          {CONFIDENCE_LABEL[confidence]}
        </span>
      </div>

      <p className="text-sm text-zinc-400">{modeSummary}</p>
    </div>
  );
}
