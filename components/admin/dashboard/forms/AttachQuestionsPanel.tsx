'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ListChecks, Loader2, Trash2 } from 'lucide-react';

import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api/client';
import { getQuestions } from '@/lib/api/admin/questions';
import { attachQuestionsToQuiz, publishAdminQuiz } from '@/lib/api/admin/quizzes';
import { QUESTION_TYPE_LABELS } from '@/lib/answers';
import { QuestionDto, QuestionType } from '@/types/question/question';
import { QuizStatus } from '@/types/quiz/admin';
import SectionTitle from './FormSectionTitle';
import FieldError from './FormFieldError';
import CreateQuestionForm from './CreateQuestionForm';

const TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: 'Multiple Choice',
  TRUE_FALSE: 'True / False',
  SHORT_TEXT: 'Short Text',
  ESSAY: 'Essay',
  MULTI_SELECT: 'Multi Select',
  CODE_CONTEXT: 'Code Context',
  FILL_BLANK: 'Fill in the Blank',
};

type SelectedEntry = { question: QuestionDto; order: number };

function SuccessBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-small text-success">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

function AttachQuestionsPanel({ quizId, status }: { quizId: string; status: QuizStatus }) {
  const router = useRouter();

  const [currentStatus, setCurrentStatus] = useState<QuizStatus>(status);
  const [forceReadOnly, setForceReadOnly] = useState(false);

  const [attached, setAttached] = useState<QuestionDto[]>([]);
  const [attachedLoading, setAttachedLoading] = useState(true);
  const [attachedError, setAttachedError] = useState<string | null>(null);

  const [bankQuestions, setBankQuestions] = useState<QuestionDto[]>([]);
  const [bankLoading, setBankLoading] = useState(true);
  const [bankError, setBankError] = useState<string | null>(null);
  const [unassignedOnly, setUnassignedOnly] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'ALL' | QuestionType>('ALL');

  const [selected, setSelected] = useState<Map<string, SelectedEntry>>(new Map());

  const [attaching, setAttaching] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [attachSuccess, setAttachSuccess] = useState<string | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  const isDraftEditable = currentStatus === 'DRAFT' && !forceReadOnly;

  const loadAttached = useCallback(async () => {
    setAttachedLoading(true);
    setAttachedError(null);
    try {
      setAttached(await getQuestions({ quizId }));
    } catch (err) {
      setAttachedError(err instanceof Error ? err.message : 'Failed to load attached questions.');
    } finally {
      setAttachedLoading(false);
    }
  }, [quizId]);

  const loadBank = useCallback(async () => {
    setBankLoading(true);
    setBankError(null);
    try {
      setBankQuestions(
        await getQuestions({
          unassigned: unassignedOnly,
          ...(typeFilter !== 'ALL' ? { type: typeFilter } : {}),
        })
      );
    } catch (err) {
      setBankError(err instanceof Error ? err.message : 'Failed to load question bank.');
    } finally {
      setBankLoading(false);
    }
  }, [unassignedOnly, typeFilter]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadAttached();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAttached]);

  useEffect(() => {
    if (!isDraftEditable) return;
    let cancelled = false;
    (async () => {
      await loadBank();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [loadBank, isDraftEditable]);

  const toggleSelect = (question: QuestionDto) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(question.id)) {
        next.delete(question.id);
      } else {
        next.set(question.id, { question, order: next.size + 1 });
      }
      return next;
    });
  };

  const updateOrder = (questionId: string, order: number) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const entry = next.get(questionId);
      if (entry) next.set(questionId, { ...entry, order: Math.max(1, Math.trunc(order) || 1) });
      return next;
    });
  };

  const selectedList = Array.from(selected.values())
    .sort((a, b) => a.order - b.order)
    .map(({ question, order }) => ({ questionId: question.id, order }));

  const handleAttach = async () => {
    if (selectedList.length === 0) return;
    setAttaching(true);
    setAttachError(null);
    setAttachSuccess(null);
    try {
      await attachQuestionsToQuiz(quizId, selectedList);
      setAttachSuccess(`${selectedList.length} question(s) attached.`);
      setSelected(new Map());
      await Promise.all([loadAttached(), loadBank()]);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          router.push('/admin/dashboard');
          return;
        }
        if (err.status === 403) {
          setForceReadOnly(true);
          setAttachError(err.message);
          return;
        }
      }
      setAttachError(err instanceof Error ? err.message : 'Failed to attach questions.');
    } finally {
      setAttaching(false);
    }
  };

  const canPublish = isDraftEditable && attached.length > 0 && !attachedLoading;

  const handlePublish = async () => {
    if (!canPublish) return;
    setPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);
    try {
      await publishAdminQuiz(quizId);
      setCurrentStatus('PUBLISHED');
      setPublishSuccess('Quiz published.');
      router.push('/admin/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          router.push('/admin/dashboard');
          return;
        }
        if (err.status === 403) {
          setForceReadOnly(true);
          setPublishError(err.message);
          return;
        }
        if (err.status === 400) {
          setPublishError(err.message);
          await loadAttached();
          return;
        }
      }
      setPublishError(err instanceof Error ? err.message : 'Failed to publish quiz.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Card>
      <div className="border-b border-divider px-6 py-5">
        <SectionTitle icon={<ListChecks className="h-4 w-4" />} title="Questions" />
      </div>

      <div className="grid gap-6 px-6 py-6">
        <div className="grid gap-2">
          <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
            Attached to this quiz
          </p>

          {attachedLoading && (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-small">Loading attached questions…</span>
            </div>
          )}

          {attachedError && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-small text-error">
              {attachedError}
              <button
                type="button"
                onClick={loadAttached}
                className="ml-2 font-medium underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}

          {!attachedLoading && !attachedError && attached.length === 0 && (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-primary-50/40 px-6 py-10 text-center">
              <p className="text-small text-foreground-secondary">
                {isDraftEditable
                  ? 'No questions attached yet.'
                  : 'This quiz has no attached questions.'}
              </p>
            </div>
          )}

          {!attachedLoading && !attachedError && attached.length > 0 && (
            <ul className="grid gap-2">
              {attached.map((q) => (
                <li
                  key={q.id}
                  className="flex items-start gap-3 rounded-xl border border-primary-200 bg-primary-50/60 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-small font-medium text-foreground">{q.text}</p>
                    <p className="mt-0.5 text-caption text-muted-foreground">
                      {TYPE_LABELS[q.type]}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isDraftEditable && (
          <>
            <div className="grid gap-4 border-t border-divider pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                  Question bank
                </p>

                <CreateQuestionForm
                  onCreated={(question) => setBankQuestions((prev) => [question, ...prev])}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-border bg-surface p-1">
                  <div className="grid grid-cols-2 gap-1">
                    {(
                      [
                        { key: true, label: 'Unassigned only' },
                        { key: false, label: 'All questions' },
                      ] as const
                    ).map((option) => {
                      const isActive = unassignedOnly === option.key;
                      return (
                        <button
                          key={String(option.key)}
                          type="button"
                          onClick={() => setUnassignedOnly(option.key)}
                          className={cn(
                            'rounded-xl px-3 py-2 text-caption font-medium transition-colors duration-150',
                            isActive
                              ? 'bg-primary-800 text-white'
                              : 'text-foreground-secondary hover:bg-primary-50 hover:text-primary-800'
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-1">
                  <div className="grid grid-cols-5 gap-1">
                    {(
                      [
                        { key: 'ALL', label: 'All' },
                        { key: 'MCQ', label: 'MCQ' },
                        { key: 'TRUE_FALSE', label: 'True/False' },
                        { key: 'SHORT_TEXT', label: 'Short Text' },
                        { key: 'ESSAY', label: 'Essay' },
                      ] as const
                    ).map((option) => {
                      const isActive = typeFilter === option.key;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setTypeFilter(option.key)}
                          className={cn(
                            'rounded-xl px-3 py-2 text-caption font-medium transition-colors duration-150',
                            isActive
                              ? 'bg-primary-800 text-white'
                              : 'text-foreground-secondary hover:bg-primary-50 hover:text-primary-800'
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {bankLoading && (
                <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-small">Loading question bank…</span>
                </div>
              )}

              {bankError && (
                <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-small text-error">
                  {bankError}
                  <button
                    type="button"
                    onClick={loadBank}
                    className="ml-2 font-medium underline underline-offset-2"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!bankLoading && !bankError && bankQuestions.length === 0 && (
                <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-primary-50/40 px-6 py-10 text-center">
                  <p className="text-small text-foreground-secondary">
                    No questions match the current filters.
                  </p>
                </div>
              )}

              {!bankLoading && !bankError && bankQuestions.length > 0 && (
                <ul className="grid gap-2">
                  {bankQuestions.map((q) => {
                    const isSelected = selected.has(q.id);
                    const alreadyAttached = q.quizzes.some((quiz) => quiz.id === quizId);
                    return (
                      <li key={q.id}>
                        <button
                          type="button"
                          onClick={() => toggleSelect(q)}
                          className={cn(
                            'group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-150',
                            isSelected
                              ? 'border-primary-400 bg-primary-50/60'
                              : 'border-border bg-surface hover:border-primary-200 hover:bg-primary-50/40'
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors',
                              isSelected
                                ? 'border-primary-700 bg-primary-700'
                                : 'border-border bg-background group-hover:border-primary-400'
                            )}
                          >
                            {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-small font-medium text-foreground">{q.text}</p>
                            <p className="mt-0.5 text-caption text-muted-foreground">
                              {TYPE_LABELS[q.type]} · {q.points} pts
                              {alreadyAttached && ' · Already attached'}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {selected.size > 0 && (
              <div className="grid gap-2">
                <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                  Selected to attach ({selected.size})
                </p>
                <ul className="grid gap-2">
                  {Array.from(selected.values())
                    .sort((a, b) => a.order - b.order)
                    .map(({ question, order }) => (
                      <li
                        key={question.id}
                        className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50/60 px-4 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-small font-medium text-foreground">{question.text}</p>
                          <p className="mt-0.5 text-caption text-muted-foreground">
                            {TYPE_LABELS[question.type]}
                          </p>
                        </div>
                        <label className="flex items-center gap-1 text-caption text-muted-foreground">
                          Order
                          <Input
                            type="number"
                            min={1}
                            step={1}
                            value={order}
                            onChange={(e) => updateOrder(question.id, Number(e.target.value))}
                            className="h-8 w-16 px-2 text-center"
                          />
                        </label>
                        <button
                          type="button"
                          aria-label="Remove from selection"
                          onClick={() => toggleSelect(question)}
                          className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-primary-100 hover:text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col items-end gap-2">
              {attachError && <FieldError message={attachError} />}
              <SuccessBanner message={attachSuccess} />
              <Button
                type="button"
                onClick={handleAttach}
                disabled={selectedList.length === 0 || attaching}
                className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700 disabled:bg-primary-400"
              >
                {attaching
                  ? 'Attaching…'
                  : `Attach Selected${selected.size ? ` (${selected.size})` : ''}`}
              </Button>
            </div>

            <div className="grid gap-2 border-t border-divider pt-6">
              {!canPublish && (
                <p className="text-caption text-muted-foreground">
                  Attach at least one question before publishing.
                </p>
              )}
              {publishError && <FieldError message={publishError} />}
              <SuccessBanner message={publishSuccess} />
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handlePublish}
                  disabled={!canPublish || publishing}
                  className="rounded-full bg-success px-6 text-white hover:bg-success/90 disabled:bg-muted-foreground"
                >
                  {publishing ? 'Publishing…' : 'Publish Quiz'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export default AttachQuestionsPanel;
