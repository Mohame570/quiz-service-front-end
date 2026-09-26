// components/admin/dashboard/analytics/ScoreDistributionChart.tsx
//
// Renders the 5 fixed score buckets from DashboardMetrics.scoreDistribution.
// Always shows all 5 bars — at count 0 they render as flat empty bars, not
// omitted, so a cohort with no completions yet reads as "no data" rather
// than a chart missing information.

import type { ScoreDistributionBucket } from '@/types/analytics/analytics';

export default function ScoreDistributionChart({ buckets }: { buckets: ScoreDistributionBucket[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const total = buckets.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-h3 text-foreground">Score distribution</h3>
        <span className="text-small text-foreground-secondary">
          {total > 0 ? `${total} graded attempt${total === 1 ? '' : 's'}` : 'No graded attempts yet'}
        </span>
      </div>
      <div className="flex items-end justify-between gap-3 h-40">
        {buckets.map((bucket) => {
          const heightPct = total > 0 ? Math.max(4, (bucket.count / max) * 100) : 4;
          return (
            <div key={bucket.range} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{bucket.count}</span>
              <div className="flex h-28 w-full items-end">
                <div
                  className={`w-full rounded-t-md ${total > 0 ? 'bg-primary-500' : 'bg-muted'}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-xs text-foreground-secondary">{bucket.range}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
