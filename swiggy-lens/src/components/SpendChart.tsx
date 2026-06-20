import type { VerticalSpend } from "@/lib/types";

interface Bar {
  label: string;
  value: number;
  color: string;
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
    { label: "Food Delivery", value: spend.food, color: "var(--saffron)" },
    { label: "Instamart", value: spend.instamart, color: "var(--tan)" },
    { label: "Dineout", value: spend.dineout, color: "var(--paarl)" },
  ].filter((b) => b.value > 0);

  const total = bars.reduce((s, b) => s + b.value, 0);
  if (total === 0) return null;

  const max = Math.max(...bars.map((b) => b.value));

  return (
    <section className="card p-6">
      <div className="mb-6 flex items-baseline justify-between">
        <p className="kicker">Spend by vertical</p>
        <p className="flex items-baseline gap-1.5">
          <span className="nums text-2xl font-bold text-cream">
            {formatRupees(total)}
          </span>
          <span className="text-xs text-muted">total</span>
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {bars.map((bar) => {
          const widthPct = max > 0 ? Math.round((bar.value / max) * 100) : 0;
          const sharePct = total > 0 ? Math.round((bar.value / total) * 100) : 0;

          return (
            <div key={bar.label}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="flex items-center gap-2 text-cream-dim">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: bar.color }}
                  />
                  {bar.label}
                </span>
                <span className="nums flex items-baseline gap-1.5">
                  <span
                    className="font-semibold"
                    style={{ color: bar.color }}
                  >
                    {formatRupees(bar.value)}
                  </span>
                  <span className="text-xs text-muted">{sharePct}%</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink-2">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: bar.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex h-1.5 w-full overflow-hidden rounded-full">
        {bars.map((bar) => (
          <div
            key={bar.label}
            style={{
              width: `${(bar.value / total) * 100}%`,
              backgroundColor: bar.color,
            }}
          />
        ))}
      </div>
    </section>
  );
}
