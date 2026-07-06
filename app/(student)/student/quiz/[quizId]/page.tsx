'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getQuiz } from '@/lib/api/student';
import { ApiError } from '@/lib/api/client';
import type { QuizInstructionsDto } from '@/types/quiz/student';
import Breadcrumb from '@/components/shared/Breadcrumb';
import Container from '@/components/shared/Container';

type PageState =
  | { status: 'loading' }
  | { status: 'ready'; quiz: QuizInstructionsDto }
  | { status: 'error'; message: string };

export default function QuizInstructionsPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const [state, setState] = useState<PageState>({ status: 'loading' });

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const data = await getQuiz(quizId);
        setState({ status: 'ready', quiz: data });
      } catch (err) {
        console.error('Failed to fetch quiz:', err);
        const message =
          err instanceof ApiError && err.status === 404
            ? 'This quiz is no longer available.'
            : 'Failed to load quiz. Please try again.';
        setState({ status: 'error', message });
      }
    }

    fetchQuiz();
  }, [quizId]);

  if (state.status === 'loading') {
    return (
      <Container size="quiz">
        <div className="py-16 text-center text-foreground-secondary">Loading quiz...</div>
      </Container>
    );
  }

  if (state.status === 'error') {
    return (
      <Container size="quiz">
        <div className="py-16 text-center">
          <h1 className="text-h1 text-foreground">Quiz unavailable</h1>
          <p className="mt-2 text-body text-foreground-secondary">{state.message}</p>
          <Link href="/student/quiz-list" className="mt-4 inline-block text-accent-600 hover:text-accent-700">
            ← Back to quiz list
          </Link>
        </div>
      </Container>
    );
  }

  const quiz = state.quiz;

  const canResume =
    quiz.attemptStatus === 'IN_PROGRESS' && Boolean(quiz.attemptId);

  const statusBadge = canResume
    ? 'In progress'
    : quiz.canStart
      ? 'Ready to start'
      : 'Not available';

  return (
    <Container size="quiz">
      <div className="flex flex-col gap-6 py-8">
        <Breadcrumb
          items={[
            { label: 'PitIQ', href: '/student' },
            { label: 'Quiz List', href: '/student/quiz-list' },
            { label: quiz.title },
          ]}
        />

        <article className="flex flex-col gap-6 rounded-[20px] border border-border bg-card p-8">
          <header className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center rounded-full bg-accent-50 px-3 py-1 text-caption font-semibold text-accent-700">
              {statusBadge}
            </span>
            <h1 className="text-h1 text-foreground">{quiz.title}</h1>
            <p className="text-body text-foreground-secondary">{quiz.description}</p>
          </header>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
              <dt className="text-caption uppercase tracking-wide text-muted">Duration</dt>
              <dd className="text-h3 text-foreground">{quiz.durationMinutes} min</dd>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
              <dt className="text-caption uppercase tracking-wide text-muted">Questions</dt>
              <dd className="text-h3 text-foreground">{quiz.questionCount}</dd>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
              <dt className="text-caption uppercase tracking-wide text-muted">Starts</dt>
              <dd className="text-small text-foreground">
                {quiz.startsAt ? new Date(quiz.startsAt).toLocaleDateString() : 'Anytime'}
              </dd>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
              <dt className="text-caption uppercase tracking-wide text-muted">Ends</dt>
              <dd className="text-small text-foreground">
                {quiz.endsAt ? new Date(quiz.endsAt).toLocaleDateString() : 'No deadline'}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-4 border-t border-divider pt-6">
            {canResume ? (
              <>
                <p className="text-small text-foreground-secondary">
                  You have an in-progress attempt on this quiz. Continue where you left off.
                </p>
                <Link
                  href={`/student/quiz/${quiz.id}/solve?attemptId=${quiz.attemptId}`}
                  className="inline-flex items-center justify-center rounded-full bg-accent-500 px-6 py-3 text-body font-semibold text-inverse transition-colors duration-150 ease-out hover:bg-accent-600 focus:outline-2 focus:outline-offset-2 focus:outline-accent-500"
                >
                  Continue quiz
                </Link>
              </>
            ) : quiz.canStart ? (
              <>
                <p className="text-small text-foreground-secondary">
                  Ready to begin? Click below to start the quiz. The timer will start immediately.
                </p>
                <Link
                  href={`/student/quiz/${quiz.id}/solve`}
                  className="inline-flex items-center justify-center rounded-full bg-accent-500 px-6 py-3 text-body font-semibold text-inverse transition-colors duration-150 ease-out hover:bg-accent-600 focus:outline-2 focus:outline-offset-2 focus:outline-accent-500"
                >
                  Start quiz
                </Link>
              </>
            ) : (
              <>
                {quiz.reasonIfBlocked && (
                  <p className="text-small text-error">{quiz.reasonIfBlocked}</p>
                )}
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center rounded-full bg-muted/20 px-6 py-3 text-body font-semibold text-foreground-secondary opacity-50"
                >
                  Start quiz
                </button>
              </>
            )}
          </div>
        </article>
      </div>
    </Container>
  );
}
