'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookCopy, Settings2 } from 'lucide-react';

import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EditQuizFormInput, EditQuizFormValues, editQuizSchema } from '@/lib/validation';
import { updateAdminQuiz, unpublishAdminQuiz } from '@/lib/api/admin/quizzes';
import { QUIZ_STATUS_LABEL } from '@/lib/quiz-status';
import SectionTitle from './FormSectionTitle';
import FieldError from './FormFieldError';
import { useRouter } from 'next/navigation';

type EditQuizFormProps = EditQuizFormInput & { id: string };

function EditQuizForm({ id, ...defaultValues }: EditQuizFormProps) {
  const router = useRouter();
  const initialStatus = defaultValues.status;

  const form = useForm<EditQuizFormInput, undefined, EditQuizFormValues>({
    resolver: zodResolver(editQuizSchema),
    defaultValues,
    mode: 'onSubmit',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const submit = async (values: EditQuizFormValues, redirectTo: 'questions' | 'dashboard') => {
    try {
      await updateAdminQuiz(id, values);
      if (initialStatus === 'PUBLISHED' && values.status === 'DRAFT') {
        await unpublishAdminQuiz(id);
      }
      router.push(
        redirectTo === 'questions' ? `/admin/dashboard/edit/${id}/questions` : '/admin/dashboard'
      );
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to update quiz. Please try again.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit((values) => submit(values, 'questions'))} className="grid gap-6">
      <Card>
        <div className="border-b border-divider px-6 py-5">
          <SectionTitle icon={<BookCopy className="h-4 w-4" />} title="Quiz Identity" />
        </div>

        <div className="grid gap-5 px-6 py-6">
          <div className="grid gap-2">
            <Label htmlFor="title" className="uppercase tracking-[0.12em]">
              Quiz Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. Advanced Calculus Final Examination"
              aria-invalid={Boolean(errors.title)}
              {...register('title')}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="durationMinutes">Duration (min)</Label>
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
              <Label htmlFor="passingScore">Passing Score (%)</Label>
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

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              disabled={initialStatus !== 'PUBLISHED'}
              aria-invalid={Boolean(errors.status)}
              className="flex h-12 w-full rounded-xl border border-border bg-surface px-4 text-body text-foreground shadow-none outline-none transition-colors focus:border-primary-300 focus:ring-2 focus:ring-primary-200/70 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('status')}
            >
              {initialStatus === 'PUBLISHED' ? (
                <>
                  <option value="PUBLISHED">{QUIZ_STATUS_LABEL.PUBLISHED}</option>
                  <option value="DRAFT">{QUIZ_STATUS_LABEL.DRAFT}</option>
                </>
              ) : (
                <option value={initialStatus}>{QUIZ_STATUS_LABEL[initialStatus]}</option>
              )}
            </select>
            {initialStatus !== 'PUBLISHED' && (
              <p className="text-small text-muted-foreground">
                Publish this quiz from the Manage Questions page once it has attached questions.
              </p>
            )}
            <FieldError message={errors.status?.message} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Starts At</Label>
              <Input
                id="startDate"
                type="date"
                aria-invalid={Boolean(errors.startDate)}
                {...register('startDate')}
              />
              <FieldError message={errors.startDate?.message} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endDate">Ends At</Label>
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

      <div className="flex flex-col items-end gap-2 pt-2">
        {errors.root?.message && <FieldError message={errors.root.message} />}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit((values) => submit(values, 'dashboard'))}
            className="rounded-full border-primary-200 px-6 text-primary-800 hover:bg-primary-50"
            disabled={isSubmitting}
          >
            Save
          </Button>
          <Button
            type="submit"
            className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
            disabled={isSubmitting}
          >
            Save &amp; Manage Questions
          </Button>
        </div>
      </div>
    </form>
  );
}

export default EditQuizForm;
