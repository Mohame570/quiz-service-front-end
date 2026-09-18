'use client';

import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HelpCircle, Plus, Trash2 } from 'lucide-react';

import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api/client';
import { createQuestion } from '@/lib/api/admin/questions';
import { getAdminQuizzes } from '@/lib/api/admin/quizzes';
import {
  CreateQuestionFormInput,
  CreateQuestionFormValues,
  createQuestionSchema,
} from '@/lib/validation';
import { CreateQuestionDto, QuestionDto } from '@/types/question/question';
import { QUESTION_TYPE_LABELS } from '@/lib/answers';
import { QuizData } from '@/types/quiz/admin';
import SectionTitle from './FormSectionTitle';
import FieldError from './FormFieldError';

const DEFAULT_VALUES: CreateQuestionFormInput = {
  type: 'MCQ',
  text: '',
  options: [{ value: '' }, { value: '' }],
  correctAnswer: '',
  points: 1,
  quizIds: [],
};

function CreateQuestionForm({
  onCreated,
  defaultOpen = false,
}: {
  onCreated?: (question: QuestionDto) => void;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [draftQuizzes, setDraftQuizzes] = useState<QuizData[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);

  const form = useForm<CreateQuestionFormInput, undefined, CreateQuestionFormValues>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onSubmit',
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({ control, name: 'options' });

  const type = watch('type');
  const options = watch('options') ?? [];
  const correctAnswer = watch('correctAnswer');

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setQuizzesLoading(true);
    getAdminQuizzes({ status: 'DRAFT' })
      .then((data) => {
        if (!cancelled) setDraftQuizzes(data.quizzes);
      })
      .catch(() => {
        if (!cancelled) setDraftQuizzes([]);
      })
      .finally(() => {
        if (!cancelled) setQuizzesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const closeAndReset = () => {
    setIsOpen(false);
    reset(DEFAULT_VALUES);
  };


    const handleRemoveOption = (index: number) => {
    const removed = options[index]?.value ?? '';
    removeOption(index);
    if (type === 'MULTI_SELECT' && removed) {
      const cur = watch('correctAnswers') ?? [];
      if (cur.includes(removed)) {
        setValue('correctAnswers', cur.filter((v) => v !== removed), { shouldValidate: true });
      }
    }
    if (type === 'MCQ' && correctAnswer === removed) {
      setValue('correctAnswer', '');
    }
  };

  useEffect(() => {
    if (type !== 'MULTI_SELECT') return;
    const valid = new Set((options ?? []).map((o) => o.value).filter(Boolean));
    const cur = watch('correctAnswers') ?? [];
    const pruned = cur.filter((v) => valid.has(v));
    if (pruned.length !== cur.length) {
      setValue('correctAnswers', pruned, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, type]);

  const submit = async (values: CreateQuestionFormValues) => {
    const dto: CreateQuestionDto = {
      type: values.type,
      text: values.text,
      points: values.points,
    };

    if (values.type === 'MCQ') {
      dto.options = (values.options ?? []).map((o) => o.value.trim()).filter(Boolean);
      dto.correctAnswer = values.correctAnswer;
    } else if (values.type === 'TRUE_FALSE') {
      dto.options = ['True', 'False'];
      dto.correctAnswer = values.correctAnswer;
    } else if (values.type === 'MULTI_SELECT') {
      dto.options = (values.options ?? []).map((o) => o.value.trim()).filter(Boolean);
      dto.correctAnswers = values.correctAnswers;
    } else if (values.type === 'SHORT_TEXT') {
      dto.correctAnswer = values.correctAnswer;
    }

    if (values.quizIds && values.quizIds.length > 0) {
      dto.quizIds = values.quizIds;
    }

    try {
      const created = await createQuestion(dto);
      onCreated?.(created);
      closeAndReset();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        form.setError('root', {
          message:
            err.message ||
            'One or more selected quizzes are already published and cannot receive new questions.',
        });
        return;
      }
      form.setError('root', {
        message:
          err instanceof Error ? err.message : 'Failed to create question. Please try again.',
      });
    }
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
      >
        <Plus className="h-4 w-4" />
        New Question
      </Button>
    );
  }

  return (
    <Card>
      <div className="border-b border-divider px-6 py-5">
        <SectionTitle icon={<HelpCircle className="h-4 w-4" />} title="New Question" />
      </div>

      <form onSubmit={handleSubmit(submit)} className="grid gap-5 px-6 py-6">
        <div className="grid gap-2">
          <Label htmlFor="q-type">Question Type</Label>
          <select
            id="q-type"
            className="flex h-12 w-full rounded-xl border border-border bg-surface px-4 text-body text-foreground shadow-none outline-none transition-colors focus:border-primary-300 focus:ring-2 focus:ring-primary-200/70"
            {...register('type')}
          >
            {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="q-text">Question Text</Label>
          <Textarea id="q-text" placeholder="Enter the question prompt..." {...register('text')} />
          <FieldError message={errors.text?.message} />
        </div>

        {type === 'MCQ' && (
          <div className="grid gap-2">
            <Label>Options</Label>
            <div className="grid gap-2">
              {optionFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    aria-label={`Mark option ${index + 1} as correct`}
                    checked={
                      Boolean(options[index]?.value) && options[index]?.value === correctAnswer
                    }
                    onChange={() => setValue('correctAnswer', options[index]?.value ?? '')}
                    className="h-4 w-4 shrink-0 accent-primary-700"
                  />
                  <Input
                    placeholder={`Option ${index + 1}`}
                    {...register(`options.${index}.value` as const)}
                  />
                  <button
                    type="button"
                    aria-label="Remove option"
                    onClick={() => handleRemoveOption(index)}
                    disabled={optionFields.length <= 2}
                    className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary-100 hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => appendOption({ value: '' })}
              className="w-fit text-small font-medium text-primary-700 hover:underline"
            >
              + Add option
            </button>
            <FieldError message={errors.options?.message as string | undefined} />
            <FieldError message={errors.correctAnswer?.message} />
            
          </div>
        )}

        {type === 'MULTI_SELECT' && (
          <div className="grid gap-2">
            <Label>Options (check all correct)</Label>
            <div className="grid gap-2">
              {optionFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(watch('correctAnswers') ?? []).includes(options[index]?.value ?? '')}
                    onChange={(e) => {
                      const val = options[index]?.value ?? '';
                      if (!val) return;
                      const cur = watch('correctAnswers') ?? [];
                      setValue('correctAnswers', e.target.checked ? [...cur, val] : cur.filter((v) => v !== val), { shouldValidate: true });
                    }}
                    className="h-4 w-4 accent-primary-700"
                  />
                  <Input placeholder={`Option ${index + 1}`} {...register(`options.${index}.value` as const)} />
                  <button type="button" onClick={() => handleRemoveOption(index)} disabled={optionFields.length <= 2} className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-primary-100"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => appendOption({ value: '' })} className="w-fit text-small font-medium text-primary-700 hover:underline">+ Add option</button>
            <FieldError message={(errors as any).correctAnswers?.message} />
          </div>
        )}

        {type === 'TRUE_FALSE' && (
          <div className="grid gap-2">
            <Label>Correct Answer</Label>
            <div className="flex gap-2">
              {['True', 'False'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('correctAnswer', value)}
                  className={cn(
                    'rounded-full border px-5 py-2 text-small font-medium transition-colors',
                    correctAnswer === value
                      ? 'border-primary-700 bg-primary-800 text-white'
                      : 'border-border bg-surface text-foreground-secondary hover:border-primary-200'
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            <FieldError message={errors.correctAnswer?.message} />
          </div>
        )}

        {type === 'SHORT_TEXT' && (
          <div className="grid gap-2">
            <Label htmlFor="q-correct-answer">Correct Answer</Label>
            <Input
              id="q-correct-answer"
              placeholder="Expected answer"
              {...register('correctAnswer')}
            />
            <FieldError message={errors.correctAnswer?.message} />
          </div>
        )}

        {type === 'ESSAY' && (
          <p className="text-small text-muted-foreground">
            Essay questions are graded manually — no correct answer needed.
          </p>
        )}

        <div className="grid max-w-40 gap-2">
          <Label htmlFor="q-points">Points</Label>
          <Input id="q-points" type="number" min={1} step={1} {...register('points')} />
          <FieldError message={errors.points?.message} />
        </div>

        <div className="grid gap-2">
          <Label>Attach to Draft Quizzes (optional)</Label>
          {quizzesLoading ? (
            <p className="text-small text-muted-foreground">Loading draft quizzes…</p>
          ) : draftQuizzes.length === 0 ? (
            <p className="text-small text-muted-foreground">No draft quizzes available.</p>
          ) : (
            <div className="grid gap-2 rounded-xl border border-border bg-surface p-3">
              {draftQuizzes.map((quiz) => (
                <label key={quiz.id} className="flex items-center gap-2 text-small text-foreground">
                  <input
                    type="checkbox"
                    value={quiz.id}
                    {...register('quizIds')}
                    className="h-4 w-4 accent-primary-700"
                  />
                  {quiz.title}
                </label>
              ))}
            </div>
          )}
        </div>

        {errors.root?.message && <FieldError message={errors.root.message} />}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={closeAndReset}
            className="rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
          >
            {isSubmitting ? 'Creating…' : 'Create Question'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default CreateQuestionForm;
