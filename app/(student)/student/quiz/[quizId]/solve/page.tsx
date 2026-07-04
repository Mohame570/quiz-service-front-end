'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  getActiveAttempt,
  getAttemptQuestions,
  getQuiz,
  saveAnswers,
  startAttempt,
  submitAttempt,
} from '@/lib/api/student';
import {
  buildAnswerPayloads,
  answersFromAttempt,
  countAnsweredQuestions,
  isTextQuestionType,
  QUESTION_TYPE_LABELS,
} from '@/lib/answers';
import Container from '@/components/shared/Container';
import Breadcrumb from '@/components/shared/Breadcrumb';
import LoadingPanel from '@/components/shared/LoadingPanel';
import EmptyPanel from '@/components/shared/EmptyPanel';
import StatusBanner from '@/components/shared/StatusBanner';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import QuestionOption from '@/components/student/QuestionOption';
import QuestionProgress from '@/components/student/QuestionProgress';
import type { AttemptQuestion } from '@/types/attempt/attempt';
import { isStaleAttemptError, toIdOrNull } from '@/lib/ids';
import { useIntegrityTracking } from '@/lib/hooks/useIntegrityTracking';
import { useClientUser } from '@/lib/hooks/useClientUser';
import VerifyEmailPrompt from '@/components/student/VerifyEmailPrompt';

function readActiveAttemptId(
  attempt: { attemptId?: string; id?: string } | null | undefined,
): string | null {
  if (!attempt) return null;
  return toIdOrNull(attempt.attemptId ?? attempt.id);
}

function attemptStorageKey(quizId: string): string {
  return `quiz-attempt:${quizId}`;
}

async function resolveAttemptId(
  quizId: string,
  fromUrl: string | null,
): Promise<string> {
  let id =
    fromUrl ?? toIdOrNull(sessionStorage.getItem(attemptStorageKey(quizId)));
  if (id) return id;

  const active = await getActiveAttempt();
  if (active.attempt?.quizId === quizId) {
    id = readActiveAttemptId(active.attempt);
    if (id) return id;
  }

  try {
    const attempt = await startAttempt(quizId);
    id = toIdOrNull(attempt.id);
    if (id) return id;
    throw new Error('Attempt id missing from server response.');
  } catch (err) {
    const msg = err instanceof Error ? err.message.toLowerCase() : '';
    if (!msg.includes('active attempt')) {
      throw err;
    }

    const retryActive = await getActiveAttempt();
    if (retryActive.attempt?.quizId === quizId) {
      id = readActiveAttemptId(retryActive.attempt);
      if (id) return id;
    }

    const quiz = await getQuiz(quizId);
    id = toIdOrNull(quiz.attemptId);
    if (id) return id;

    throw err;
  }
}

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

type Phase = 'init' | 'loading' | 'ready' | 'submitting' | 'error';

export default function QuizSolvePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = params.quizId as string;
  const initialAttemptId = toIdOrNull(searchParams.get('attemptId'));

  const [phase, setPhase] = useState<Phase>('init');
  const [attemptId, setAttemptId] = useState<string | null>(initialAttemptId);
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string>('Failed to load quiz');
  const [showIntegrityNotice, setShowIntegrityNotice] = useState(true);

  const user = useClientUser();
  const needsVerification = user != null && !user.emailVerified;

  const attemptIdRef = useRef<string | null>(initialAttemptId);
  const answersRef = useRef<Record<string, string | null>>({});
  const questionsRef = useRef<AttemptQuestion[]>([]);
  const submittedRef = useRef(false);
  const initRef = useRef(false);

  // ── Integrity tracking: monitor tab switches, window focus, fullscreen, copy ──
  useIntegrityTracking({
    attemptId,
    enabled: phase === 'ready',
  });

  useEffect(() => {
    if (needsVerification) return;
    if (initRef.current) return;
    initRef.current = true;

    async function init() {
      setPhase('loading');
      try {
        const id = await resolveAttemptId(quizId, initialAttemptId);
        sessionStorage.setItem(attemptStorageKey(quizId), id);
        attemptIdRef.current = id;
        setAttemptId(id);

        const data = await getAttemptQuestions(id);
        const sorted = [...data.questions].sort((a, b) => a.order - b.order);
        setQuestions(sorted);
        questionsRef.current = sorted;
        if (data.answers?.length) {
          setAnswers(answersFromAttempt(data.answers));
        }
        setSecondsLeft(data.remainingSeconds);
        setPhase('ready');

        if (!initialAttemptId) {
          router.replace(`/student/quiz/${quizId}/solve?attemptId=${id}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        const id = attemptIdRef.current;

        if (id && isStaleAttemptError(msg)) {
          sessionStorage.removeItem(attemptStorageKey(quizId));
          router.replace(`/student/quiz/result/${id}`);
          return;
        }

        console.error('Failed to start attempt:', err);
        setError(msg || 'Failed to start attempt.');
        setPhase('error');
      }
    }

    init();
  }, [quizId, initialAttemptId, router, needsVerification]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const doSubmit = useCallback(
    async (id: string) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setPhase('submitting');
      try {
        const answersArray = buildAnswerPayloads(
          questionsRef.current,
          answersRef.current,
        );
        await submitAttempt(id, answersArray);
        sessionStorage.removeItem(attemptStorageKey(quizId));
        router.replace(`/student/quiz/result/${id}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (isStaleAttemptError(msg)) {
          sessionStorage.removeItem(attemptStorageKey(quizId));
          router.replace(`/student/quiz/result/${id}`);
          return;
        }
        console.error('Failed to submit:', err);
        submittedRef.current = false;
        setPhase('ready');
        setError(msg || 'Failed to submit attempt.');
        setErrorTitle('Submission failed');
      }
    },
    [quizId, router],
  );

  useEffect(() => {
    if (phase !== 'ready') return;
    if (secondsLeft <= 0) {
      const id = attemptIdRef.current;
      if (id) {
        doSubmit(id);
      }
      return;
    }
    const timer = setTimeout(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, phase, doSubmit]);

  useEffect(() => {
    if (phase !== 'ready') return;
    if (!attemptId || Object.keys(answers).length === 0) return;

    const timer = setTimeout(async () => {
      if (submittedRef.current) return;

      try {
        const answersArray = buildAnswerPayloads(
          questionsRef.current,
          answers,
        );
        await saveAnswers(attemptId, answersArray);
      } catch (err) {
        if (submittedRef.current) return;

        const msg = err instanceof Error ? err.message : '';
        if (isStaleAttemptError(msg)) {
          const id = attemptIdRef.current;
          if (id) {
            sessionStorage.removeItem(attemptStorageKey(quizId));
            router.replace(`/student/quiz/result/${id}`);
          }
          return;
        }
        console.error('Failed to save answers:', err);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [answers, attemptId, phase, quizId, router]);

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    const id = attemptIdRef.current;
    if (!id || submittedRef.current) return;
    doSubmit(id);
  };

  if (needsVerification) {
    return <VerifyEmailPrompt />;
  }

  if (phase === 'init' || phase === 'loading') {
    return (
      <Container size="quiz">
        <div className="py-8">
          <LoadingPanel message="Starting quiz…" />
        </div>
      </Container>
    );
  }

  if (phase === 'error' || !attemptId || questions.length === 0) {
    return (
      <Container size="quiz">
        <div className="py-8">
          <EmptyPanel
            title={errorTitle}
            description={error ?? undefined}
            action={
              <Button
                onClick={() => router.push('/student/quiz-list')}
                className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
              >
                Back to quiz list
              </Button>
            }
          />
        </div>
      </Container>
    );
  }

  const currentQuestion = questions[currentIndex];
  const lowTime = secondsLeft <= 60;
  const submitting = phase === 'submitting';
  const answeredCount = countAnsweredQuestions(questions, answers);

  return (
    <Container size="quiz">
      <div className="flex flex-col gap-8 py-8">
        <Breadcrumb
          items={[
            { label: 'PitIQ', href: '/student' },
            { label: 'Quiz List', href: '/student/quiz-list' },
            { label: 'Solving' },
          ]}
        />

        <header className="flex items-center justify-between">
          <div>
            <p className="text-caption uppercase tracking-wide text-muted-foreground">
              Solving
            </p>
            <h1 className="text-h2 text-foreground">Quiz Attempt</h1>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-4 py-2 text-small font-semibold tabular-nums ${
                lowTime
                  ? 'bg-error/10 text-error'
                  : 'bg-accent-50 text-accent-700'
              }`}
              aria-label="Time remaining"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {formatTime(secondsLeft)}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/student/quiz-list')}
              className="rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
            >
              Quit
            </Button>
          </div>
        </header>

        {showIntegrityNotice && (
          <div className="relative">
            <StatusBanner variant="warning">
              <span className="font-medium">Integrity monitoring active.</span>{' '}
              Switching tabs, copying text, exiting fullscreen, or losing window
              focus during this quiz will be recorded and may flag your attempt
              for review.
            </StatusBanner>
            <button
              type="button"
              onClick={() => setShowIntegrityNotice(false)}
              className="absolute top-3 right-3 text-warning/70 hover:text-warning"
              aria-label="Dismiss integrity notice"
            >
              ×
            </button>
          </div>
        )}

        <Card className="p-8">
          <div className="mb-6">
            <QuestionProgress
              current={currentIndex}
              total={questions.length}
              answeredCount={answeredCount}
            />
          </div>

          <div className="mb-8">
            <span className="mb-2 inline-block rounded-full bg-accent-50 px-3 py-1 text-caption font-semibold text-accent-700">
              {QUESTION_TYPE_LABELS[currentQuestion.type]}
            </span>
            <h2 className="text-h3 text-foreground">{currentQuestion.text}</h2>
          </div>

          {isTextQuestionType(currentQuestion.type) ? (
            <div>
              {currentQuestion.type === 'SHORT_TEXT' ? (
                <Input
                  value={answers[currentQuestion.id] ?? ''}
                  onChange={(e) =>
                    handleTextChange(currentQuestion.id, e.target.value)
                  }
                  disabled={submitting}
                  placeholder="Type your answer..."
                  className="text-body"
                />
              ) : (
                <Textarea
                  value={answers[currentQuestion.id] ?? ''}
                  onChange={(e) =>
                    handleTextChange(currentQuestion.id, e.target.value)
                  }
                  disabled={submitting}
                  placeholder="Write your essay answer..."
                  rows={8}
                  className="text-body"
                />
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <QuestionOption
                  key={option}
                  option={{ id: option, text: option }}
                  isSelected={answers[currentQuestion.id] === option}
                  onSelect={(id) => handleSelect(currentQuestion.id, id)}
                  optionLabel={String.fromCharCode(65 + idx)}
                  disabled={submitting}
                />
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-divider pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0 || submitting}
              className="rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
            >
              ← Previous
            </Button>

            {currentIndex === questions.length - 1 ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-full bg-success px-6 text-white hover:bg-success/90"
              >
                {submitting ? 'Submitting…' : 'Submit quiz'}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() =>
                  setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                }
                disabled={submitting}
                className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
              >
                Next →
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Container>
  );
}
