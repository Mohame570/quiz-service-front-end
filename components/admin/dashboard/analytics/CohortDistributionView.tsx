'use client';

// components/admin/dashboard/analytics/CohortDistributionView.tsx

import { useEffect, useState } from 'react';
import { getCohortDistribution, downloadCohortStandingsCsv } from '@/lib/api/admin/cohort-distribution';
import { ApiError } from '@/lib/api/client';
import type { AnalyticsFilterParams, CohortDistribution } from '@/types/analytics/quality-and-distribution';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import LoadingPanel from '@/components/shared/LoadingPanel';
import EmptyPanel from '@/components/shared/EmptyPanel';
import AnalyticsFilterBar from './AnalyticsFilterBar';
import ScoreDistributionChart from './ScoreDistributionChart';
import CohortStandingsTable from './CohortStandingsTable';

export default function CohortDistributionView() {
  const [filters, setFilters] = useState<AnalyticsFilterParams>({});
  const [distribution, setDistribution] = useState<CohortDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDistribution() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCohortDistribution(filters);
        if (!cancelled) setDistribution(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load cohort distribution.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDistribution();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      await downloadCohortStandingsCsv(filters);
    } catch (err) {
      setExportError(err instanceof ApiError ? err.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsFilterBar
        onApply={setFilters}
        extraAction={
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || loading || !distribution || distribution.totalCompletedAttempts === 0}
            className="rounded-lg border border-primary-600 px-4 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        }
      />
      {exportError && <p className="text-xs text-red-600">{exportError}</p>}

      {loading && <LoadingPanel message="Loading cohort distribution…" />}

      {!loading && (error || !distribution) && (
        <EmptyPanel title="Couldn't load distribution" description={error ?? 'Something went wrong.'} />
      )}

      {!loading && distribution && distribution.totalCompletedAttempts === 0 && (
        <EmptyPanel
          title="No completed attempts for these filters"
          description="Adjust or clear the filters, or check back once students in this scope have completed the quiz."
        />
      )}

      {!loading && distribution && distribution.totalCompletedAttempts > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatsCard icon={<CountIcon />} label="Completed attempts" value={distribution.totalCompletedAttempts} />
            <StatsCard
              icon={<AvgIcon />}
              label="Average"
              value={distribution.averagePercentage !== null ? `${Math.round(distribution.averagePercentage)}%` : '—'}
            />
            <StatsCard
              icon={<MedianIcon />}
              label="Median"
              value={distribution.medianPercentage !== null ? `${Math.round(distribution.medianPercentage)}%` : '—'}
            />
            <StatsCard
              icon={<SpreadIcon />}
              label="Std. deviation"
              value={
                distribution.standardDeviationPercentage !== null
                  ? `±${distribution.standardDeviationPercentage}`
                  : '—'
              }
            />
          </div>

          <ScoreDistributionChart buckets={distribution.scoreDistribution} />

          <div>
            <h3 className="mb-3 text-h3 text-foreground">Relative standing</h3>
            <CohortStandingsTable standings={distribution.standings} />
          </div>
        </>
      )}
    </div>
  );
}

function CountIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="4" width="14" height="12" rx="1.5" />
      <path d="M3 8h14" />
    </svg>
  );
}
function AvgIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 15.5V9.5M9 15.5V4.5M14 15.5v-7" />
    </svg>
  );
}
function MedianIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M10 3v14M4 10h12" />
    </svg>
  );
}
function SpreadIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 10h12M4 10l3-3M4 10l3 3M16 10l-3-3M16 10l-3 3" />
    </svg>
  );
}
