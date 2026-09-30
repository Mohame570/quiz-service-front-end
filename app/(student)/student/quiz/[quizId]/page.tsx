'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Shield } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { getQuiz, getOfficialScore } from '@/lib/api/student';
import type { OfficialScoreResponse } from '@/types/attempt/attempt';
import { getPublicSettings } from '@/lib/api/admin/settings';
import { useClientUser } from '@/lib/hooks/useClientUser';
import {
  readInviteBannerForQuiz,
  type InviteBannerKind,
} from '@/lib/quiz-invite-flash';
import type { QuizInstructionsDto } from '@/types/quiz/student';
import Breadcrumb from '@/components/shared/Breadcrumb';
import Container from '@/components/shared/Container';
import LoadingPanel from '@/components/shared/LoadingPanel';
import EmptyPanel from '@/components/shared/EmptyPanel';
import SectionTitle from '@/components/shared/SectionTitle';
import StatusBanner from '@/components/shared/StatusBanner';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import AttemptStatusBadge from '@/components/student/AttemptStatusBadge';
import QuizRules from '@/components/student/QuizRules';
import VerifyEmailPrompt from '@/components/student/VerifyEmailPrompt';
import { getSafeTimezone, formatScheduleWindow } from '@/lib/date';

type QuizPageState =
  | { status: 'loading' }
  | { status: 'ready'; quiz: QuizInstructionsDto }
  | { status: 'error'; message: string };

export default function QuizInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  const [state, setState] = useState<QuizPageState>({ status: 'loading' });
  const [timezoneLabel, setTimezoneLabel] = useState<string>('UTC');
  const [official, setOfficial] = useState<OfficialScoreResponse | null>(null);
  const [inviteBanner] = useState<InviteBannerKind | null>(() => {
    if (typeof window === 'undefined') return null;
    return readInviteBannerForQuiz(
      quizId,
      new URLSearchParams(window.location.search),
    );
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('invited') !== '1') return;
    router.replace(`/student/quiz/${quizId}`, { scroll: false });
  }, [quizId, router]);

  const user = useClientUser();
  const needsVerification = user != null && !user.emailVerified;

  useEffect(() => {
    if (needsVerification) return;

    async function fetchQuiz() {
      try {
        const data = await getQuiz(quizId);
        setState({ status: 'ready', quiz: data });
        getOfficialScore(quizId)
          .then((score) => setOfficial(score))
          .catch(() => setOfficial(null));
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
  }, [quizId, needsVerification]);

  useEffect(() => {
    getPublicSettings()
      .then((settings) => {
        if (settings?.timezoneLabel) {
          setTimezoneLabel(settings.timezoneLabel);
        }
      })
      .catch((error) => {
        console.warn(
          'Failed to load timezone setting, using default UTC:',
          error,
        );
      });
  }, []);

  if (needsVerification) {
    return <VerifyEmailPrompt />;
  }

  if (state.status === 'loading') {
    return (
      <Container size="quiz">
        <div className="py-8">
          <LoadingPanel message="Loading quiz…" />
        </div>
      </Container>
    );
  }

  if (state.status === 'error') {
    return (
      <Container size="quiz">
        <div className="py-8">
          <EmptyPanel
            title="Quiz not found"
            description={state.message}
            action={
              <Button
                asChild
                variant="outline"
                className="rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
              >
                <Link href="/student/quiz-list">Back to quiz list</Link>
              </Button>
            }
          />
        </div>
      </Container>
    );
  }

  const quiz = state.quiz;

  const canResume =
    quiz.attemptStatus === 'IN_PROGRESS' && Boolean(quiz.attemptId);

  const isCompleted =
    quiz.attemptStatus === 'SUBMITTED' && Boolean(quiz.attemptId);
  const isTimedOut =
    quiz.attemptStatus === 'TIMED_OUT' && Boolean(quiz.attemptId);

  return (
    <Container size="quiz">
      <div className="flex flex-col gap-8 py-8">
        <Breadcrumb
          items={[
            { label: 'PitIQ', href: '/student' },
            { label: 'Quiz List', href: '/student/quiz-list' },
            { label: quiz.title },
          ]}
        />

        {inviteBanner === 'new' && (
          <StatusBanner variant="success">
            <span className="font-semibold">{quiz.title}</span> added to your
            quizzes
          </StatusBanner>
        )}
        {inviteBanner === 'existing' && (
          <StatusBanner variant="success">
            You&apos;re already enrolled in{' '}
            <span className="font-semibold">{quiz.title}</span>
          </StatusBanner>
        )}

        <Card>
          <div className="border-b border-divider px-6 py-5">
            <SectionTitle
              icon={<BookOpen className="h-4 w-4" />}
              title="Quiz details"
            />
          </div>
          <div className="flex flex-col gap-6 px-6 py-6">
            <header className="flex flex-col gap-3">
              <AttemptStatusBadge status={quiz.attemptStatus} />
              <h1 className="text-h1 text-foreground">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-body text-foreground-secondary">
                  {quiz.description}
                </p>
              )}
            </header>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
                <dt className="text-caption font-semibold uppercase tracking-wide text-foreground-secondary">
                  Duration
                </dt>
                <dd className="text-h3 text-foreground">
                  {quiz.durationMinutes ?? '—'} min
                </dd>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
                <dt className="text-caption font-semibold uppercase tracking-wide text-foreground-secondary">
                  Questions
                </dt>
                <dd className="text-h3 text-foreground">
                  {quiz.questionCount}
                </dd>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
                <dt className="text-caption font-semibold uppercase tracking-wide text-foreground-secondary">
                  Starts
                </dt>
                <dd className="text-small text-foreground">
                  {quiz.startsAt
                    ? new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        timeZone: getSafeTimezone(timezoneLabel),
                      }).format(new Date(quiz.startsAt))
                    : 'Anytime'}
                </dd>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
                <dt className="text-caption font-semibold uppercase tracking-wide text-foreground-secondary">
                  Ends
                </dt>
                <dd className="text-small text-foreground">
                  {quiz.endsAt
                    ? new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        timeZone: getSafeTimezone(timezoneLabel),
                      }).format(new Date(quiz.endsAt))
                    : 'No deadline'}
                </dd>
              </div>
            </dl>

            {quiz.startsAt && quiz.endsAt && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">
                    Schedule Window:
                  </span>
                  <span>
                    {' '}
                    {formatScheduleWindow(
                      quiz.startsAt,
                      quiz.endsAt,
                      timezoneLabel,
                    )}{' '}
                  </span>
                  <span className="rounded bg-primary-100 px-2 py-0.5 font-semibold text-primary-800">
                    {timezoneLabel}
                  </span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-4 border-t border-divider pt-6">
              {canResume ? (
                <>
                  <p className="text-small text-foreground">
                    You have an in-progress attempt on this quiz. Continue where
                    you left off.
                  </p>
                  <Button
                    asChild
                    className="w-fit rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
                  >
                    <Link
                      href={`/student/quiz/${quiz.id}/solve?attemptId=${quiz.attemptId}`}
                    >
                      Continue quiz
                    </Link>
                  </Button>
                </>
              ) : isCompleted || isTimedOut ? (
                <>
                  <p className="text-small text-foreground">
                    {isTimedOut
                      ? 'Your attempt was finalised when time ran out. Review your answers and score below.'
                      : 'You have already completed this quiz. Review your answers and score below.'}
                  </p>
                  {official?.officialScore != null && (
                    <p className="text-small text-foreground">
                      <span className="font-semibold">
                        Official Score (
                        {official.strategy === 'BEST' ? 'Best' : 'Latest'} Attempt):
                      </span>{' '}
                      {official.officialScore} · {official.attemptsCount} attempt
                      {official.attemptsCount === 1 ? '' : 's'}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      asChild
                      className="w-fit rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
                    >
                      <Link href={`/student/quiz/result/${quiz.attemptId}`}>
                        View result
                      </Link>
                    </Button>
                    {quiz.canStart &&
                      (quiz.maxAttempts == null ||
                        (official?.attemptsCount ?? 0) < quiz.maxAttempts) && (
                        <Button
                          asChild
                          variant="outline"
                          className="w-fit rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
                        >
                          <Link href={`/student/quiz/${quiz.id}/solve`}>
                            Retake quiz
                          </Link>
                        </Button>
                      )}
                  </div>
                </>
              ) : quiz.canStart ? (
                <>
                  <p className="text-small text-foreground">
                    Ready to begin? Click below to start the quiz. The timer
                    will start immediately.
                  </p>
                  <Button
                    asChild
                    className="w-fit rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
                  >
                    <Link href={`/student/quiz/${quiz.id}/solve`}>
                      Start quiz
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  {quiz.reasonIfBlocked && (
                    <StatusBanner variant="error">
                      {quiz.reasonIfBlocked}
                    </StatusBanner>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="w-fit rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
                    >
                      <Link href="/student/quiz-list">Back to quiz list</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-fit rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
                    >
                      <Link href="/student/profile">View my profile</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="border-b border-divider px-6 py-5">
            <SectionTitle
              icon={<Shield className="h-4 w-4" />}
              title="Before you start"
            />
          </div>
          <div className="px-6 py-6">
            <QuizRules embedded />
          </div>
        </Card>
      </div>
    </Container>
  );
}
