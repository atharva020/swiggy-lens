import type { VerticalSpend } from "@/lib/types";

interface Bar {
  label: string;
  icon: string;
  value: number;
  colorFill: string;
  colorText: string;
}

function formatRupees(n: number): string {
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
}

interface SpendChartProps {
  spend: VerticalSpend;
}

export function SpendChart({ spend }: SpendChartProps) {
  const bars: Bar[] = [
    {
      label: "Food Delivery",
      icon: "📦",
      value: spend.food,
      colorFill: "bg-orange-500",
      colorText: "text-orange-400",
    },
    {
      label: "Instamart",
      icon: "🛒",
      value: spend.instamart,
      colorFill: "bg-emerald-500",
      colorText: "text-emerald-400",
    },
    {
      label: "Dineout",
      icon: "🍽️",
      value: spend.dineout,
      colorFill: "bg-blue-500",
      colorText: "text-blue-400",
    },
  ].filter((b) => b.value > 0);

  const total = bars.reduce((s, b) => s + b.value, 0);

  if (total === 0) return null;

  const max = Math.max(...bars.map((b) => b.value));

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          Spend breakdown
        </p>
        <span className="text-sm font-medium text-zinc-200">
          {formatRupees(total)} total
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {bars.map((bar) => {
          const widthPct = max > 0 ? Math.round((bar.value / max) * 100) : 0;
          const sharePct = total > 0 ? Math.round((bar.value / total) * 100) : 0;

          return (
            <div key={bar.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span>{bar.icon}</span>
                  {bar.label}
                </span>
                <span className={`font-medium ${bar.colorText}`}>
                  {formatRupees(bar.value)}{" "}
                  <span className="text-zinc-600">({sharePct}%)</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full ${bar.colorFill} transition-all`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Stacked proportion strip */}
      <div className="mt-4 flex h-1.5 w-full overflow-hidden rounded-full">
        {bars.map((bar) => {
          const pct = total > 0 ? (bar.value / total) * 100 : 0;
          return (
            <div
              key={bar.label}
              className={`${bar.colorFill}`}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
