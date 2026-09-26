'use client';

// components/admin/dashboard/follow-up/FollowUpView.tsx
//
// Live learner follow-up queue. Fetches GET /api/follow-up (or the
// per-quiz variant when quizId is set) and renders all 6 operational
// categories, per docs/analytics-contract.md §15.

import { useEffect, useState } from 'react';
import { getFollowUpQueue, getFollowUpQueueForQuiz } from '@/lib/api/admin/follow-up';
import { ApiError } from '@/lib/api/client';
import type { FollowUpSummary } from '@/types/follow-up/follow-up';
import LoadingPanel from '@/components/shared/LoadingPanel';
import EmptyPanel from '@/components/shared/EmptyPanel';
import FollowUpCategoryCard from './FollowUpCategoryCard';

export default function FollowUpView({ quizId }: { quizId?: string }) {
  const [summary, setSummary] = useState<FollowUpSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      setLoading(true);
      setError(null);
      try {
        const data = quizId ? await getFollowUpQueueForQuiz(quizId) : await getFollowUpQueue();
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Could not reach the follow-up service. Please try again.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  if (loading) {
    return <LoadingPanel message="Loading follow-up queue…" />;
  }

  if (error || !summary) {
    return (
      <EmptyPanel
        title="Couldn't load the follow-up queue"
        description={error ?? 'Something went wrong loading follow-ups.'}
      />
    );
  }

  if (summary.totalFollowUps === 0) {
    return (
      <EmptyPanel
        title="Nothing needs follow-up right now"
        description="Every assigned learner is on track — grading is complete, no one is overdue, and no windows are closing soon."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-small text-foreground-secondary">
        {summary.totalFollowUps} learner{summary.totalFollowUps === 1 ? '' : 's'} across{' '}
        {summary.categories.filter((c) => c.count > 0).length} categor
        {summary.categories.filter((c) => c.count > 0).length === 1 ? 'y' : 'ies'} need attention.
      </p>
      {summary.categories.map((group) => (
        <FollowUpCategoryCard key={group.category} group={group} />
      ))}
    </div>
  );
}
