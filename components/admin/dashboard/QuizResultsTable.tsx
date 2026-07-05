'use client';

// components/admin/dashboard/QuizResultsTable.tsx
//
// Admin-only table of every student's graded result for a quiz.
// Consumed by: app/admin/dashboard/view/[id]/page.tsx

import { useEffect, useState } from 'react';
import { getQuizResults } from '@/lib/api/admin/results';
import type { Result } from '@/types/quiz/result';

function PassFailBadge({ passed }: { passed: boolean | null }) {
  if (passed === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground-secondary">
        —
      </span>
    );
  }

  return passed ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
      Passed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
      Failed
    </span>
  );
}

function GradingStatusBadge({
  gradingStatus,
  pendingEssayCount,
}: {
  gradingStatus: string;
  pendingEssayCount: number;
}) {
  if (gradingStatus === 'PENDING_MANUAL' || pendingEssayCount > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        Pending manual ({pendingEssayCount})
      </span>
    );
  }

  if (gradingStatus === 'COMPLETE') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Complete
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground-secondary">
      {gradingStatus}
    </span>
  );
}

export default function QuizResultsTable({ quizId }: { quizId: string }) {
  const [results, setResults] = useState<Result[]>([]);
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
        const data = await getQuizResults(quizId);
        if (!cancelled) setResults(data);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof TypeError && err.message === 'Failed to fetch') {
            setNetworkDown(true);
          } else {
            setError(err instanceof Error ? err.message : 'Failed to load results.');
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
  }, [quizId, retry]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-3 text-sm text-foreground-secondary">Loading results...</p>
      </div>
    );
  }

  if (networkDown) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-sm font-medium text-amber-700">Backend unreachable</p>
        <p className="mt-1 text-xs text-amber-600">
          Cannot connect to the API server. Check that Docker is running and the backend is up.
        </p>
        <button
          onClick={() => setRetry((c) => c + 1)}
          className="mt-3 text-sm font-medium text-amber-700 underline hover:text-amber-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">
          {error.includes('403') || error.includes('Forbidden')
            ? 'Access denied. You must be logged in as an admin to view this.'
            : error}
        </p>
        <button
          onClick={() => setRetry((c) => c + 1)}
          className="mt-3 text-sm font-medium text-red-700 underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-body text-foreground-secondary">No results yet for this quiz.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="px-4 py-3 font-medium text-foreground-secondary">Student</th>
            <th className="px-4 py-3 font-medium text-foreground-secondary">Score</th>
            <th className="px-4 py-3 font-medium text-foreground-secondary">Percentage</th>
            <th className="px-4 py-3 font-medium text-foreground-secondary">Result</th>
            <th className="px-4 py-3 font-medium text-foreground-secondary">Grading</th>
            <th className="px-4 py-3 font-medium text-foreground-secondary">Graded At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {results.map((r) => (
            <tr key={r.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">
                {r.studentId.slice(0, 8)}...
              </td>
              <td className="px-4 py-3 text-foreground-secondary">
                {r.score}/{r.maxScore}
              </td>
              <td className="px-4 py-3 text-foreground-secondary">{r.percentage}%</td>
              <td className="px-4 py-3">
                <PassFailBadge passed={r.passed} />
              </td>
              <td className="px-4 py-3">
                <GradingStatusBadge
                  gradingStatus={r.gradingStatus}
                  pendingEssayCount={r.pendingEssayCount}
                />
              </td>
              <td className="px-4 py-3 text-xs text-foreground-secondary">
                {new Date(r.gradedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
