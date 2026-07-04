'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookCopy, CheckCircle2, CircleDashed, Loader2, Settings2, Trash2 } from 'lucide-react';

import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CreateQuizFormInput, CreateQuizFormValues, createQuizSchema } from '@/lib/validation';
import { createAdminQuiz } from '@/lib/api/admin/quizzes';
import { getQuestions } from '@/lib/api/admin/questions';
import { QUESTION_TYPE_LABELS } from '@/lib/answers';
import { Question, StudentQuestion } from '@/types/question/question';
import SectionTitle from './FormSectionTitle';
import FormLabel from './FormLabel';
import FieldError from './FormFieldError';
import { useRouter } from 'next/navigation';

const DEFAULT_VALUES: CreateQuizFormInput = {
  title: '',
  description: '',
  visibilityStatus: 'DRAFT',
  durationMinutes: 60,
  passingScore: 50,
  startDate: '',
  endDate: '',
};

const TYPE_LABELS = QUESTION_TYPE_LABELS satisfies Record<Question['type'], string>;

function CreateQuizForm() {
  const router = useRouter();

  const [allQuestions, setAllQuestions] = useState<StudentQuestion[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const data = await getQuestions();
        setAllQuestions(data);
      } catch {
        setQuestionsError('Failed to load questions. Please refresh the page.');
      } finally {
        setQuestionsLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  const toggleQuestion = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const form = useForm<CreateQuizFormInput, undefined, CreateQuizFormValues>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onSubmit',
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const visibility = form.watch('visibilityStatus');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = form;

  const statusOptions = [
    { key: 'DRAFT', label: 'Draft' },
    { key: 'PUBLISHED', label: 'Published' },
  ] as const;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAdminQuiz(values);
      router.push('/admin/dashboard');
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to create quiz. Please try again.',
      });
    }
  });

  const selectedQuestions = allQuestions.filter((q) => selectedIds.has(q.id));
  const unselectedQuestions = allQuestions.filter((q) => !selectedIds.has(q.id));

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <Card>
        <div className="border-b border-divider px-6 py-5">
          <SectionTitle icon={<BookCopy className="h-4 w-4" />} title="Quiz Identity" />
        </div>

        <div className="grid gap-5 px-6 py-6">
          <div className="grid gap-2">
            <FormLabel htmlFor="title" label="Quiz title" />
            <Input
              id="title"
              placeholder="e.g. Advanced Calculus Final Examination"
              aria-invalid={Boolean(errors.title)}
              {...register('title')}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="grid gap-2">
            <FormLabel htmlFor="description" label="Description" />
            <Textarea
              id="description"
              placeholder="Briefly describe the learning outcomes and scope of this assessment..."
              aria-invalid={Boolean(errors.description)}
              {...register('description')}
            />
            <FieldError message={errors.description?.message} />
          </div>
        </div>
      </Card>

      <Card>
        <div className="border-b border-divider px-6 py-5">
          <SectionTitle icon={<Settings2 className="h-4 w-4" />} title="Configuration" />
        </div>

        <div className="grid gap-6 px-6 py-6">
          <div className="grid gap-2">
            <FormLabel label="Visibility Status" />
            <div className="rounded-2xl border border-border bg-surface p-1">
              <div className="grid grid-cols-2 gap-1">
                {statusOptions.map((option) => {
                  const isActive = visibility === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() =>
                        setValue('visibilityStatus', option.key, { shouldValidate: true })
                      }
                      className={cn(
                        'rounded-xl px-4 py-3 text-small font-medium transition-colors duration-150',
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
            <FieldError message={errors.visibilityStatus?.message} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <FormLabel htmlFor="durationMinutes" label="Duration (min)" />
              <Input
                id="durationMinutes"
                type="number"
                min={1}
                step={1}
                placeholder="60"
                aria-invalid={Boolean(errors.durationMinutes)}
                {...register('durationMinutes')}
              />
              <FieldError message={errors.durationMinutes?.message} />
            </div>

            <div className="grid gap-2">
              <FormLabel htmlFor="passingScore" label="Passing Score (%)" />
              <Input
                id="passingScore"
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="70"
                aria-invalid={Boolean(errors.passingScore)}
                {...register('passingScore')}
              />
              <FieldError message={errors.passingScore?.message} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <FormLabel htmlFor="startDate" label="Starts At" />
              <Input
                id="startDate"
                type="date"
                aria-invalid={Boolean(errors.startDate)}
                {...register('startDate')}
              />
              <FieldError message={errors.startDate?.message} />
            </div>

            <div className="grid gap-2">
              <FormLabel htmlFor="endDate" label="Ends At" />
              <Input
                id="endDate"
                type="date"
                aria-invalid={Boolean(errors.endDate)}
                {...register('endDate')}
              />
              <FieldError message={errors.endDate?.message} />
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-divider px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <SectionTitle icon={<CircleDashed className="h-4 w-4" />} title="Questions" />
            {selectedIds.size > 0 && (
              <span className="rounded-full bg-primary-50 px-3 py-1 text-caption font-semibold text-primary-800">
                {selectedIds.size} selected
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6">
          {/* Selected questions */}
          {selectedQuestions.length > 0 && (
            <div className="grid gap-2">
              <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                Added to quiz
              </p>
              <ul className="grid gap-2">
                {selectedQuestions.map((q) => (
                  <li
                    key={q.id}
                    className="flex items-start gap-3 rounded-xl border border-primary-200 bg-primary-50/60 px-4 py-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                    <div className="min-w-0 flex-1">
                      <p className="text-small font-medium text-foreground">{q.text}</p>
                      <p className="mt-0.5 text-caption text-muted-foreground">
                        {TYPE_LABELS[q.type]}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove question"
                      onClick={() => toggleQuestion(q.id)}
                      className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-primary-100 hover:text-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Available questions pool */}
          <div className="grid gap-2">
            {selectedQuestions.length > 0 && (
              <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                Available questions
              </p>
            )}

            {questionsLoading && (
              <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-small">Loading questions…</span>
              </div>
            )}

            {questionsError && (
              <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-small text-error">
                {questionsError}
              </div>
            )}

            {!questionsLoading && !questionsError && unselectedQuestions.length === 0 && (
              <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-primary-50/40 px-6 py-10 text-center">
                {allQuestions.length === 0 ? (
                  <p className="text-small text-foreground-secondary">
                    No questions available yet.
                  </p>
                ) : (
                  <p className="text-small text-muted-foreground">
                    All available questions have been added.
                  </p>
                )}
              </div>
            )}

            {!questionsLoading && !questionsError && unselectedQuestions.length > 0 && (
              <ul className="grid gap-2">
                {unselectedQuestions.map((q) => (
                  <li key={q.id}>
                    <button
                      type="button"
                      onClick={() => toggleQuestion(q.id)}
                      className="group flex w-full items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors duration-150 hover:border-primary-200 hover:bg-primary-50/40"
                    >
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-border bg-background transition-colors group-hover:border-primary-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-small font-medium text-foreground">{q.text}</p>
                        <p className="mt-0.5 text-caption text-muted-foreground">
                          {TYPE_LABELS[q.type]}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-col items-end gap-2 pt-2">
        {errors.root?.message && <FieldError message={errors.root.message} />}
        <Button
          type="submit"
          className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700 disabled:bg-primary-400"
          disabled={isSubmitting}
        >
          Save Quiz
        </Button>
      </div>
    </form>
  );
}

export default CreateQuizForm;
