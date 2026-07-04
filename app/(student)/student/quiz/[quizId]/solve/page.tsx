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
  isTextQuestionType,
  QUESTION_TYPE_LABELS,
} from '@/lib/answers';
import Container from '@/components/shared/Container';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

  function countAnswered(
    answerMap: Record<string, string | null>,
    questionList: AttemptQuestion[],
  ): number {
    return questionList.filter((q) => {
      const value = answerMap[q.id];
      if (isTextQuestionType(q.type)) {
        return (value?.trim().length ?? 0) > 0;
      }
      return value != null && value.length > 0;
    }).length;
  }

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
        <div className="py-16 text-center text-foreground-secondary">
          Starting quiz...
        </div>
      </Container>
    );
  }

  if (phase === 'error' || !attemptId || questions.length === 0) {
    return (
      <Container size="quiz">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-h1 text-foreground">{errorTitle}</h1>
          {error && <p className="max-w-md text-body text-error">{error}</p>}
          <button
            onClick={() => router.push('/student/quiz-list')}
            className="mt-4 inline-block rounded-full bg-accent-500 px-6 py-3 text-body font-semibold text-inverse hover:bg-accent-600"
          >
            Back to quiz list
          </button>
        </div>
      </Container>
    );
  }

  const currentQuestion = questions[currentIndex];
  const lowTime = secondsLeft <= 60;
  const submitting = phase === 'submitting';
  const answeredCount = countAnswered(answers, questions);

  return (
    <Container size="quiz">
      <div className="flex flex-col gap-6 py-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-caption uppercase tracking-wide text-muted">
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
            <button
              onClick={() => router.push('/student/quiz-list')}
              className="rounded-full border border-border bg-surface px-4 py-2 text-small font-semibold text-foreground hover:bg-accent-50"
            >
              Quit
            </button>
          </div>
        </header>

        {/* Anti-cheat integrity notice */}
        {showIntegrityNotice && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0 text-amber-600"
              aria-hidden
            >
              <path d="M10 1.5 3 4.5v5.5c0 4.5 3 8.8 7 9.5 4-.7 7-5 7-9.5V4.5Z" />
              <path d="m7 10 2 2 4-4" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                Integrity monitoring active
              </p>
              <p className="text-xs text-amber-600">
                Switching tabs, copying text, exiting fullscreen, or losing
                window focus during this quiz will be recorded and may flag
                your attempt for review.
              </p>
            </div>
            <button
              onClick={() => setShowIntegrityNotice(false)}
              className="shrink-0 text-amber-500 hover:text-amber-700"
              aria-label="Dismiss integrity notice"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        <div className="rounded-[20px] border border-border bg-card p-8">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-small text-foreground-secondary">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-small text-foreground-secondary">
              {answeredCount} answered
            </span>
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
              {currentQuestion.options.map((option, idx) => {
                const optionId = option;
                const isSelected = answers[currentQuestion.id] === optionId;
                return (
                  <button
                    key={optionId}
                    onClick={() => handleSelect(currentQuestion.id, optionId)}
                    disabled={submitting}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                      isSelected
                        ? 'border-2 border-accent-500 bg-accent-50'
                        : 'border border-border bg-surface hover:border-accent-200 hover:bg-accent-50'
                    }`}
                  >
                    <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-border text-caption font-semibold text-foreground-secondary">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-body text-foreground">{option}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-divider pt-6">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0 || submitting}
              className="rounded-full border border-border bg-surface px-5 py-2.5 text-body font-semibold text-foreground hover:bg-accent-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Previous
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-full bg-success px-6 py-2.5 text-body font-semibold text-inverse hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit quiz'}
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                }
                disabled={submitting}
                className="rounded-full bg-accent-500 px-6 py-2.5 text-body font-semibold text-inverse hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
