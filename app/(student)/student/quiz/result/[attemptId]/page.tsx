'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Award, CheckCircle, Clock, Percent, XCircle } from 'lucide-react';
import { getAttemptResult } from '@/lib/api/student';
import type { AttemptWithAnswersDto } from '@/types/attempt/attempt';
import Breadcrumb from '@/components/shared/Breadcrumb';
import Container from '@/components/shared/Container';
import LoadingPanel from '@/components/shared/LoadingPanel';
import EmptyPanel from '@/components/shared/EmptyPanel';
import ResultStatCard from '@/components/student/ResultStatCard';
import StatusBanner from '@/components/shared/StatusBanner';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { toIdOrNull } from '@/lib/ids';
import {
  ANSWER_STATUS_LABELS,
  ANSWER_STATUS_STYLES,
  getAnswerDisplayStatus,
  hasTextAnswers,
} from '@/lib/answer-status';

type LoadState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'forbidden' }
  | { status: 'still_in_progress' }
  | { status: 'network'; message: string }
  | { status: 'ready'; attempt: AttemptWithAnswersDto };

function ResultEmptyState({
  title,
  description,
  href,
  linkLabel,
}: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <Container size="quiz">
      <div className="py-8">
        <EmptyPanel
          title={title}
          description={description}
          action={
            <Button
              asChild
              className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
            >
              <Link href={href}>{linkLabel}</Link>
            </Button>
          }
        />
      </div>
    </Container>
  );
}

export default function ResultPage() {
  const params = useParams();
  const attemptId = toIdOrNull(params.attemptId as string);
  const [state, setState] = useState<LoadState>(
    () => (attemptId ? { status: 'loading' } : { status: 'not_found' }),
  );

  useEffect(() => {
    if (!attemptId) return;

    let cancelled = false;

    async function load() {
      try {
        const attempt = await getAttemptResult(attemptId!);
        if (!cancelled) {
          setState({ status: 'ready', attempt });
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('404')) {
          setState({ status: 'not_found' });
        } else if (msg.includes('403')) {
          setState({ status: 'forbidden' });
        } else if (msg.includes('409')) {
          setState({ status: 'still_in_progress' });
        } else {
          setState({
            status: 'network',
            message: msg || 'Failed to load result.',
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  if (state.status === 'loading') {
    return (
      <Container size="quiz">
        <div className="py-8">
          <LoadingPanel message="Loading result…" />
        </div>
      </Container>
    );
  }

  if (state.status === 'not_found') {
    return (
      <ResultEmptyState
        title="Result not found"
        description="We couldn't find this attempt. It may have been removed."
        href="/student/quiz-list"
        linkLabel="Back to quiz list"
      />
    );
  }

  if (state.status === 'forbidden') {
    return (
      <ResultEmptyState
        title="Access denied"
        description="You don't have access to this result."
        href="/student"
        linkLabel="Back to dashboard"
      />
    );
  }

  if (state.status === 'still_in_progress') {
    return (
      <ResultEmptyState
        title="Attempt still in progress"
        description="You haven't submitted this attempt yet. Continue solving to see your result."
        href="/student/quiz-list"
        linkLabel="Back to quiz list"
      />
    );
  }

  if (state.status === 'network') {
    return (
      <Container size="quiz">
        <div className="py-8">
          <EmptyPanel
            title="Connection error"
            description={state.message}
            action={
              <Button
                onClick={() => window.location.reload()}
                className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
              >
                Try again
              </Button>
            }
          />
        </div>
      </Container>
    );
  }

  const attempt = state.attempt;
  const isTimedOut = attempt.status === 'TIMED_OUT';
  const isSubmitted = attempt.status === 'SUBMITTED';
  const passed = attempt.result?.passed === true;
  const score = attempt.score ?? 0;
  const maxScore = attempt.maxScore ?? attempt.answers.length;

  const answerStatuses = attempt.answers.map(getAnswerDisplayStatus);
  const correctCount = answerStatuses.filter((s) => s === 'correct').length;
  const incorrectCount = answerStatuses.filter((s) => s === 'incorrect').length;
  const pendingCount = answerStatuses.filter((s) => s === 'pending').length;
  const hasPendingText = hasTextAnswers(attempt.answers);

  let bannerVariant: 'success' | 'error' | 'warning' = 'warning';
  let bannerLabel = 'Result';

  if (isTimedOut) {
    bannerLabel = 'Timed out';
    bannerVariant = 'error';
  } else if (isSubmitted) {
    if (attempt.result) {
      bannerLabel = passed ? 'Passed' : 'Did not pass';
      bannerVariant = passed ? 'success' : 'error';
    } else {
      bannerLabel = 'Submitted';
    }
  }

  return (
    <Container size="quiz">
      <div className="flex flex-col gap-8 py-8">
        <Breadcrumb
          items={[
            { label: 'PitIQ', href: '/student' },
            { label: 'Quiz List', href: '/student/quiz-list' },
            { label: 'Result' },
          ]}
        />

        <Card className="flex flex-col gap-6 p-8">
          <header className="flex flex-col gap-3">
            <StatusBanner variant={bannerVariant}>{bannerLabel}</StatusBanner>
            <h1 className="text-h1 text-foreground">
              {isTimedOut
                ? 'Time ran out'
                : isSubmitted
                  ? passed
                    ? 'Great job!'
                    : 'Quiz complete'
                  : 'Attempt finalised'}
            </h1>
            <p className="text-body text-foreground-secondary">
              {isTimedOut
                ? 'This attempt was finalised automatically when the timer expired.'
                : hasPendingText
                  ? 'Your attempt has been submitted. Some answers are awaiting grading.'
                  : 'Your attempt has been submitted and scored.'}
            </p>
          </header>

          {hasPendingText && (
            <StatusBanner variant="warning">
              Short text and essay answers are saved but not auto-graded yet. Your
              overall score reflects multiple-choice and true/false questions only.
            </StatusBanner>
          )}

          <section aria-label="Score summary" className="grid grid-cols-2 gap-3">
            <ResultStatCard
              icon={<Award className="h-4 w-4" />}
              label="Score"
              value={`${score} / ${maxScore}`}
            />
            <ResultStatCard
              icon={<CheckCircle className="h-4 w-4" />}
              label="Correct"
              value={correctCount}
            />
            <ResultStatCard
              icon={<XCircle className="h-4 w-4" />}
              label="Incorrect"
              value={incorrectCount}
            />
            {hasPendingText && (
              <ResultStatCard
                icon={<Clock className="h-4 w-4" />}
                label="Pending"
                value={pendingCount}
              />
            )}
            <ResultStatCard
              icon={<Percent className="h-4 w-4" />}
              label="Percentage"
              value={
                attempt.result ? `${attempt.result.percentage.toFixed(0)}%` : '—'
              }
            />
          </section>

          {attempt.submittedAt && (
            <p className="text-caption text-muted-foreground">
              Submitted {new Date(attempt.submittedAt).toLocaleString()}
            </p>
          )}

          {attempt.answers.length > 0 && (
            <section className="flex flex-col gap-3 border-t border-divider pt-6">
              <h2 className="text-h3 text-foreground">Answer breakdown</h2>
              <ul className="flex flex-col gap-2">
                {attempt.answers.map((answer, idx) => {
                  const status = getAnswerDisplayStatus(answer);
                  const styles = ANSWER_STATUS_STYLES[status];
                 const multi = answer.selectedOptionIds;
                  const displayAnswer =
                    answer.textAnswer ??
                    answer.selectedOptionId ??
                    (Array.isArray(multi) && multi.length > 0 ? multi.join(', ') : 'Skipped');
                  const truncatedAnswer =
                    displayAnswer.length > 120
                      ? `${displayAnswer.slice(0, 120)}…`
                      : displayAnswer;

                  return (
                    <li key={answer.id}>
                      <Card
                        className={`flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between ${styles.row}`}
                      >
                        <span className="text-small font-medium text-foreground">
                          Question {idx + 1}
                        </span>
                        <span
                          className="max-w-md text-small text-foreground-secondary sm:text-right"
                          title={displayAnswer}
                        >
                          {truncatedAnswer}
                        </span>
                        <span
                          className={`inline-flex w-fit rounded-full px-2.5 py-1 text-caption font-semibold ${styles.label}`}
                        >
                          {ANSWER_STATUS_LABELS[status]}
                        </span>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-divider pt-6">
            <Button
              asChild
              className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
            >
              <Link href="/student/quiz-list">Back to quiz list</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
            >
              <Link href="/student">Dashboard</Link>
            </Button>
          </div>
        </Card>
      </div>
    </Container>
  );
}
