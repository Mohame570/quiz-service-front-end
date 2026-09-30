'use client';

// components/admin/dashboard/analytics/AnalyticsDashboardView.tsx
//
// Live admin analytics dashboard. Fetches GET /api/analytics/dashboard
// and renders honest empty states (per docs/analytics-contract.md §14)
// rather than synthetic 0%/NaN values — see the `hasData` check below.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardMetrics } from '@/lib/api/admin/analytics';
import { ApiError } from '@/lib/api/client';
import type { DashboardMetrics } from '@/types/analytics/analytics';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import LoadingPanel from '@/components/shared/LoadingPanel';
import EmptyPanel from '@/components/shared/EmptyPanel';
import ScoreDistributionChart from './ScoreDistributionChart';
import QuizMetricsTable from './QuizMetricsTable';

function UsersIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M13.5 17a4.5 4.5 0 0 0-9 0" />
      <circle cx="9" cy="7" r="3" />
      <path d="M14.5 8.5a2.5 2.5 0 1 0 0-5" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="10" cy="10" r="8" />
      <path d="m6 10 3 3 5-5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M10 2 1 17h18L10 2Z" />
      <path d="M10 8v4" />
      <circle cx="10" cy="14.5" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="4" y="3" width="12" height="15" rx="1.5" />
      <path d="M7 3V2h6v1" />
      <path d="M7 9h6M7 12h6M7 15h3" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M6 3h8v4a4 4 0 0 1-8 0V3Z" />
      <path d="M6 4H3.5A1.5 1.5 0 0 0 2 5.5C2 7 3 8 5 8" />
      <path d="M14 4h2.5A1.5 1.5 0 0 1 18 5.5C18 7 17 8 15 8" />
      <path d="M10 11v4M7 18h6M8.5 15h3" />
    </svg>
  );
}

export default function AnalyticsDashboardView() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMetrics() {
      setLoading(true);
      setError(null);
      try {
        const data = await getDashboardMetrics();
        if (!cancelled) setMetrics(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Could not reach the analytics service. Please try again.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMetrics();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LoadingPanel message="Loading live analytics…" />;
  }

  if (error || !metrics) {
    return (
      <EmptyPanel
        title="Couldn't load analytics"
        description={error ?? 'Something went wrong loading the dashboard.'}
      />
    );
  }

  // Honest empty state: zero quizzes means there is nothing to
  // aggregate yet — show that explicitly instead of a dashboard full
  // of 0% cards that look like a real (if bad) participation rate.
  if (metrics.totalQuizzes === 0) {
    return (
      <EmptyPanel
        title="No quizzes yet"
        description="Once quizzes are published and students are assigned, live participation, completion, and score metrics will appear here."
      />
    );
  }

  const hasCompletions = metrics.completionCount > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatsCard icon={<UsersIcon />} label="Students" value={metrics.distinctStudentCount} />
        <StatsCard
          icon={<CheckCircleIcon />}
          label="Participation"
          value={`${metrics.participationCount}/${metrics.assignedCount}`}
          trend={`${Math.round(metrics.participationRate * 100)}%`}
        />
        <StatsCard
          icon={<TrophyIcon />}
          label="Completion"
          value={`${metrics.completionCount}/${metrics.assignedCount}`}
          trend={`${Math.round(metrics.completionRate * 100)}%`}
        />
        <StatsCard
          icon={<AlertIcon />}
          label="Absent"
          value={metrics.absenceCount}
        />
        <Link
          href="/admin/dashboard/follow-up"
          aria-label={`View follow-up queue: ${metrics.followUpCount} need follow-up`}
          className="block rounded-2xl transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <StatsCard
            icon={<ClipboardIcon />}
            label="Needs follow-up"
            value={metrics.followUpCount}
          />
        </Link>
      </div>

      {hasCompletions ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScoreDistributionChart buckets={metrics.scoreDistribution} />
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-surface p-6">
            <p className="text-small text-foreground-secondary">Average score</p>
            <p className="text-h1 text-primary-800">
              {metrics.averageScore !== null ? `${Math.round(metrics.averageScore)}%` : '—'}
            </p>
            <p className="mt-1 text-xs text-foreground-secondary">
              Across {metrics.completionCount} completed attempt{metrics.completionCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      ) : (
        <EmptyPanel
          title="No completed attempts yet"
          description="Score distribution and averages will appear once at least one student completes a quiz."
        />
      )}

      <div>
        <h3 className="mb-3 text-h3 text-foreground">Per-quiz breakdown</h3>
        <QuizMetricsTable quizzes={metrics.quizzes} />
      </div>
    </div>
  );
}
