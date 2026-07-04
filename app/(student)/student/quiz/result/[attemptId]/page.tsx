'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getAttemptResult } from '@/lib/api/student';
import type { AttemptWithAnswersDto } from '@/types/attempt/attempt';
import Breadcrumb from '@/components/shared/Breadcrumb';
import Container from '@/components/shared/Container';
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

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
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
        <div className="py-16 text-center text-foreground-secondary">
          Loading result...
        </div>
      </Container>
    );
  }

  if (state.status === 'not_found') {
    return (
      <Container size="quiz">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-h1 text-foreground">Result not found</h1>
          <p className="max-w-md text-body text-foreground-secondary">
            We couldn&apos;t find this attempt. It may have been removed.
          </p>
          <Link
            href="/student/quiz-list"
            className="mt-2 rounded-full bg-accent-500 px-6 py-2.5 text-body font-semibold text-inverse hover:bg-accent-600"
          >
            Back to quiz list
          </Link>
        </div>
      </Container>
    );
  }

  if (state.status === 'forbidden') {
    return (
      <Container size="quiz">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-h1 text-foreground">Access denied</h1>
          <p className="max-w-md text-body text-foreground-secondary">
            You don&apos;t have access to this result.
          </p>
          <Link
            href="/student"
            className="mt-2 rounded-full bg-accent-500 px-6 py-2.5 text-body font-semibold text-inverse hover:bg-accent-600"
          >
            Back to dashboard
          </Link>
        </div>
      </Container>
    );
  }

  if (state.status === 'still_in_progress') {
    return (
      <Container size="quiz">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-h1 text-foreground">Attempt still in progress</h1>
          <p className="max-w-md text-body text-foreground-secondary">
            You haven&apos;t submitted this attempt yet. Continue solving to see your
            result.
          </p>
          <button
            onClick={() => router.push('/student/quiz-list')}
            className="mt-2 rounded-full bg-accent-500 px-6 py-2.5 text-body font-semibold text-inverse hover:bg-accent-600"
          >
            Back to quiz list
          </button>
        </div>
      </Container>
    );
  }

  if (state.status === 'network') {
    return (
      <Container size="quiz">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-h1 text-foreground">Connection error</h1>
          <p className="max-w-md text-body text-foreground-secondary">
            {state.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-full bg-accent-500 px-6 py-2.5 text-body font-semibold text-inverse hover:bg-accent-600"
          >
            Try again
          </button>
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

  let bannerLabel = 'Result';
  let bannerClass = 'bg-accent-50 text-accent-700';

  if (isTimedOut) {
    bannerLabel = 'Timed out';
    bannerClass = 'bg-error/10 text-error';
  } else if (isSubmitted) {
    if (attempt.result) {
      bannerLabel = passed ? 'Passed' : 'Did not pass';
      bannerClass = passed
        ? 'bg-success/10 text-success'
        : 'bg-error/10 text-error';
    } else {
      bannerLabel = 'Submitted';
    }
  }

  return (
    <Container size="quiz">
      <div className="flex flex-col gap-6 py-8">
        <Breadcrumb
          items={[
            { label: 'PitIQ', href: '/student' },
            { label: 'Quiz List', href: '/student/quiz-list' },
            { label: 'Result' },
          ]}
        />

        <article className="flex flex-col gap-6 rounded-[20px] border border-border bg-card p-8">
          <header className="flex flex-col gap-3">
            <span
              className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-caption font-semibold ${bannerClass}`}
            >
              {bannerLabel}
            </span>
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
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-small text-amber-800">
              Short text and essay answers are saved but not auto-graded yet.
              Your overall score reflects multiple-choice and true/false
              questions only.
            </div>
          )}

          <dl
            className={`grid grid-cols-2 gap-3 ${hasPendingText ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-4'}`}
          >
            <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
              <dt className="text-caption uppercase tracking-wide text-muted">
                Score
              </dt>
              <dd className="text-h2 text-foreground">
                {score}
                <span className="text-body text-muted"> / {maxScore}</span>
              </dd>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
              <dt className="text-caption uppercase tracking-wide text-muted">
                Correct
              </dt>
              <dd className="text-h2 text-foreground">{correctCount}</dd>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
              <dt className="text-caption uppercase tracking-wide text-muted">
                Incorrect
              </dt>
              <dd className="text-h2 text-foreground">{incorrectCount}</dd>
            </div>
            {hasPendingText && (
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
                <dt className="text-caption uppercase tracking-wide text-muted">
                  Pending
                </dt>
                <dd className="text-h2 text-foreground">{pendingCount}</dd>
              </div>
            )}
            <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
              <dt className="text-caption uppercase tracking-wide text-muted">
                Percentage
              </dt>
              <dd className="text-h2 text-foreground">
                {attempt.result
                  ? `${attempt.result.percentage.toFixed(0)}%`
                  : '—'}
              </dd>
            </div>
          </dl>

          {attempt.submittedAt && (
            <p className="text-caption text-muted">
              Submitted{' '}
              {new Date(attempt.submittedAt).toLocaleString()}
            </p>
          )}

          {attempt.answers.length > 0 && (
            <section className="flex flex-col gap-3 border-t border-divider pt-6">
              <h2 className="text-h3 text-foreground">Answer breakdown</h2>
              <ul className="flex flex-col gap-2">
                {attempt.answers.map((answer, idx) => {
                  const status = getAnswerDisplayStatus(answer);
                  const styles = ANSWER_STATUS_STYLES[status];
                  const displayAnswer =
                    answer.textAnswer ??
                    answer.selectedOptionId ??
                    'Skipped';
                  const truncatedAnswer =
                    displayAnswer.length > 120
                      ? `${displayAnswer.slice(0, 120)}…`
                      : displayAnswer;

                  return (
                    <li
                      key={answer.id}
                      className={`flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${styles.row}`}
                    >
                      <span className="text-small text-foreground">
                        Question {idx + 1}
                      </span>
                      <span
                        className="max-w-md text-small font-semibold text-foreground-secondary sm:text-right"
                        title={displayAnswer}
                      >
                        {truncatedAnswer}
                      </span>
                      <span
                        className={`text-caption font-semibold ${styles.label}`}
                      >
                        {ANSWER_STATUS_LABELS[status]}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-divider pt-6">
            <Link
              href="/student/quiz-list"
              className="inline-flex items-center justify-center rounded-full bg-accent-500 px-6 py-3 text-body font-semibold text-inverse transition-colors hover:bg-accent-600"
            >
              Back to quiz list
            </Link>
            <Link
              href="/student"
              className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-6 py-3 text-body font-semibold text-foreground transition-colors hover:border-accent-200 hover:bg-accent-50"
            >
              Dashboard
            </Link>
          </div>
        </article>
      </div>
    </Container>
  );
}
