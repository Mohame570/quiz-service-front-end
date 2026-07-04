'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpen, Shield } from 'lucide-react';
import { getQuiz } from '@/lib/api/student';
import { useClientUser } from '@/lib/hooks/useClientUser';
import { consumeQuizAddedFlash } from '@/lib/quiz-invite-flash';
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

export default function QuizInstructionsPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const [quiz, setQuiz] = useState<QuizInstructionsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedTitle, setAddedTitle] = useState<string | null>(null);
  const user = useClientUser();
  const needsVerification = user != null && !user.emailVerified;

  useEffect(() => {
    setAddedTitle(consumeQuizAddedFlash(quizId));
  }, [quizId]);

  useEffect(() => {
    if (needsVerification) {
      setLoading(false);
      return;
    }

    async function fetchQuiz() {
      try {
        const data = await getQuiz(quizId);
        setQuiz(data);
      } catch (err) {
        console.error('Failed to fetch quiz:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId, needsVerification]);

  if (needsVerification) {
    return <VerifyEmailPrompt />;
  }

  if (loading) {
    return (
      <Container size="quiz">
        <div className="py-8">
          <LoadingPanel message="Loading quiz…" />
        </div>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container size="quiz">
        <div className="py-8">
          <EmptyPanel
            title="Quiz not found"
            description="This quiz isn't available to you. If you received an invitation, open the link from your email to join the quiz first."
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

        {addedTitle && (
          <StatusBanner variant="success">
            <span className="font-semibold">{addedTitle}</span> added
          </StatusBanner>
        )}

        <Card>
          <div className="border-b border-divider px-6 py-5">
            <SectionTitle icon={<BookOpen className="h-4 w-4" />} title="Quiz details" />
          </div>
          <div className="flex flex-col gap-6 px-6 py-6">
            <header className="flex flex-col gap-3">
              <AttemptStatusBadge status={quiz.attemptStatus} />
              <h1 className="text-h1 text-foreground">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-body text-foreground-secondary">{quiz.description}</p>
              )}
            </header>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
                <dt className="text-caption font-semibold uppercase tracking-wide text-foreground-secondary">Duration</dt>
                <dd className="text-h3 text-foreground">{quiz.durationMinutes ?? '—'} min</dd>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
                <dt className="text-caption font-semibold uppercase tracking-wide text-foreground-secondary">Questions</dt>
                <dd className="text-h3 text-foreground">{quiz.questionCount}</dd>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
                <dt className="text-caption font-semibold uppercase tracking-wide text-foreground-secondary">Starts</dt>
                <dd className="text-small text-foreground">
                  {quiz.startsAt ? new Date(quiz.startsAt).toLocaleDateString() : 'Anytime'}
                </dd>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
                <dt className="text-caption font-semibold uppercase tracking-wide text-foreground-secondary">Ends</dt>
                <dd className="text-small text-foreground">
                  {quiz.endsAt ? new Date(quiz.endsAt).toLocaleDateString() : 'No deadline'}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col gap-4 border-t border-divider pt-6">
              {canResume ? (
                <>
                  <p className="text-small text-foreground">
                    You have an in-progress attempt on this quiz. Continue where you left off.
                  </p>
                  <Button
                    asChild
                    className="w-fit rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
                  >
                    <Link href={`/student/quiz/${quiz.id}/solve?attemptId=${quiz.attemptId}`}>
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
                  <Button
                    asChild
                    className="w-fit rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
                  >
                    <Link href={`/student/quiz/result/${quiz.attemptId}`}>View result</Link>
                  </Button>
                </>
              ) : quiz.canStart ? (
                <>
                  <p className="text-small text-foreground">
                    Ready to begin? Click below to start the quiz. The timer will start immediately.
                  </p>
                  <Button
                    asChild
                    className="w-fit rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
                  >
                    <Link href={`/student/quiz/${quiz.id}/solve`}>Start quiz</Link>
                  </Button>
                </>
              ) : (
                <>
                  {quiz.reasonIfBlocked && (
                    <StatusBanner variant="error">{quiz.reasonIfBlocked}</StatusBanner>
                  )}
                  <Button
                    type="button"
                    disabled
                    className="w-fit rounded-full bg-muted/20 text-foreground-secondary opacity-50"
                  >
                    Start quiz
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="border-b border-divider px-6 py-5">
            <SectionTitle icon={<Shield className="h-4 w-4" />} title="Before you start" />
          </div>
          <div className="px-6 py-6">
            <QuizRules embedded />
          </div>
        </Card>
      </div>
    </Container>
  );
}
