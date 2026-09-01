'use client';

import { useState, useEffect } from 'react';
import { getAnalyticsSummary } from '@/lib/api/admin/analytics';
import type { DashboardSummary } from '@/lib/api/admin/analytics';
import { formatCompactNumber, STAT_UNAVAILABLE } from '@/lib/format';

const STATS_CONFIG = [
  { key: 'totalQuizzes' as const, label: 'Total Quizzes', icon: '📚', bgColor: 'bg-accent-500/12' },
  { key: 'totalStudents' as const, label: 'Registered Students', icon: '👥', bgColor: 'bg-primary-500/12' },
  { key: 'totalAttempts' as const, label: 'Total Attempts', icon: '📝', bgColor: 'bg-support-500/12' },
  { key: 'averageScore' as const, label: 'Avg. Score', icon: '⭐', bgColor: 'bg-warning/12' },
];

/** averageScore needs percent formatting; everything else uses compact numbers. */
function formatAnalyticValue(
  key: keyof DashboardSummary,
  value: number | null | undefined,
  totalAttempts?: number | null,
): string {
  if (key === 'averageScore') {
    if (
      value === null || value === undefined || Number.isNaN(value) ||
      !totalAttempts || totalAttempts <= 0
    ) {
      return STAT_UNAVAILABLE;
    }
    return `${Math.round(value)}%`;
  }
  return formatCompactNumber(value);
}

export default function AnalyticsDashboardView() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkDown, setNetworkDown] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      setNetworkDown(false);
      try {
        const data = await getAnalyticsSummary();
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof TypeError && err.message === 'Failed to fetch') {
            setNetworkDown(true);
          } else {
            setError(err instanceof Error ? err.message : 'Failed to load analytics.');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [retry]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-sm text-foreground-secondary">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {(error || networkDown) && (
        <div className="flex items-center justify-between rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning">
          <span>
            {networkDown
              ? 'Backend unreachable — displaying fallback values.'
              : `${error} — displaying fallback values.`}
          </span>
          <button
            onClick={() => setRetry((c) => c + 1)}
            className="font-medium underline hover:text-warning/80"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_CONFIG.map((stat) => {
          const val = summary ? summary[stat.key] : null;
          const displayVal = formatAnalyticValue(stat.key, val, summary?.totalAttempts);

          return (
            <div
              key={stat.key}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 transition-all duration-150 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-base ${stat.bgColor}`}>
                <span role="img" aria-hidden>
                  {stat.icon}
                </span>
              </div>
              <div>
                <p className="text-sm text-foreground-secondary">{stat.label}</p>
                <p className="mt-0.5 text-2xl font-bold text-foreground">
                  {displayVal}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
