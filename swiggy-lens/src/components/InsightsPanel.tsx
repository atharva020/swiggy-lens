"use client";

import { useCallback, useEffect, useState } from "react";

import { FoodModeBar } from "@/components/FoodModeBar";
import { InsightCard } from "@/components/InsightCard";
import { SpendChart } from "@/components/SpendChart";
import type { InsightsResponse } from "@/lib/types";

function Skeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-56 animate-pulse rounded-[1.75rem] bg-surface/60" />
      <div>
        <p className="kicker mb-3">Reading your week…</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-36 animate-pulse rounded-2xl bg-surface/60"
            />
          ))}
        </div>
      </div>
      <div className="h-44 animate-pulse rounded-2xl bg-surface/60" />
    </div>
  );
}

export function InsightsPanel() {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/insights");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }
      const data = (await res.json()) as InsightsResponse;
      setInsights(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load insights right now."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (error) {
    return (
      <div className="rounded-2xl border border-berry/30 bg-berry/10 px-6 py-5">
        <p className="text-sm text-cream-dim">{error}</p>
        <button
          onClick={fetchInsights}
          className="mt-3 rounded-full border border-berry/40 px-4 py-1.5 text-xs text-cream-dim transition hover:border-berry hover:text-cream"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!insights || loading) {
    return <Skeleton />;
  }

  return (
    <div className="flex flex-col gap-7">
      <FoodModeBar
        mode={insights.mode}
        confidence={insights.confidence}
        modeLabel={insights.modeLabel}
        modeSummary={insights.modeSummary}
      />

      {insights.insights.length > 0 && (
        <div className="rise" style={{ animationDelay: "0.08s" }}>
          <div className="mb-4 flex items-center gap-3">
            <p className="kicker">What we noticed</p>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {insights.insights.map((card, i) => (
              <InsightCard
                key={i}
                index={i + 1}
                title={card.title}
                body={card.body}
                tag={card.tag}
              />
            ))}
          </div>
        </div>
      )}

      {insights.spend && (
        <div className="rise" style={{ animationDelay: "0.16s" }}>
          <SpendChart spend={insights.spend} />
        </div>
      )}

      {/* Refresh + timestamp */}
      <div className="flex items-center justify-between pt-2">
        {lastUpdated && (
          <p className="text-xs text-muted">
            Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-saffron/40 hover:text-cream-dim disabled:opacity-40"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
    </div>
  );
}
