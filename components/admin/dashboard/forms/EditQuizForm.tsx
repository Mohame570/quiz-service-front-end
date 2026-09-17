'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookCopy, Settings2 } from 'lucide-react';

import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EditQuizFormInput, EditQuizFormValues, editQuizSchema } from '@/lib/validation';
import {
  updateAdminQuiz,
  unpublishAdminQuiz,
  archiveAdminQuiz,
  updateAdminQuizStatus,
  deleteAdminQuiz,
} from '@/lib/api/admin/quizzes';
import { ApiError } from '@/lib/api/client';
import { QUIZ_STATUS_LABEL } from '@/lib/quiz-status';
import SectionTitle from './FormSectionTitle';
import FieldError from './FormFieldError';
import { useRouter } from 'next/navigation';

const ARCHIVE_DISABLED_TOOLTIP =
  'Only quizzes with student attempts can be archived — delete it instead if unused.';
const DELETE_DISABLED_TOOLTIP =
  'Cannot delete a quiz that already has student attempts. Archive it instead by setting its status to "archived".';

type EditQuizFormProps = EditQuizFormInput & { id: string; hasAttempts: boolean };

function EditQuizForm({ id, hasAttempts, ...defaultValues }: EditQuizFormProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const initialStatus = defaultValues.status;
  const isPublished = initialStatus === 'PUBLISHED';
  const isClosed = initialStatus === 'CLOSED';
  const isLocked = isPublished || isClosed;

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
    const isArchiving = values.status === 'ARCHIVED' && initialStatus !== 'ARCHIVED';
    const isUnarchiving = initialStatus === 'ARCHIVED' && values.status === 'DRAFT';
    if (isArchiving) {
      const confirmed = confirm(
        `Archive "${defaultValues.title}"? It will be removed from students' active list, just like closing it.`
      );
      if (!confirmed) return;
    }
    const isReopening =
      (initialStatus === 'PUBLISHED' || initialStatus === 'CLOSED') && values.status === 'DRAFT';
    if (isClosed && values.status === 'DRAFT') {
      const confirmed = confirm(
        `Reopen "${defaultValues.title}" as a draft? It will need to be published again before students can take it.`
      );
      if (!confirmed) return;
    }
    try {
      await updateAdminQuiz(id, values);
      if (isReopening) {
        await unpublishAdminQuiz(id);
        if (redirectTo === 'questions') {
          router.push(`/admin/dashboard/edit/${id}/questions`);
          return;
        }
        router.refresh();
        return;
      }
      if (isArchiving) {
        await archiveAdminQuiz(id);
        router.push('/admin/dashboard');
        return;
      }
      if (isUnarchiving) {
        await updateAdminQuizStatus(id, 'DRAFT');
        router.push(
          redirectTo === 'questions' ? `/admin/dashboard/edit/${id}/questions` : '/admin/dashboard'
        );
        return;
      }
      router.push(
        redirectTo === 'questions' ? `/admin/dashboard/edit/${id}/questions` : '/admin/dashboard'
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        form.setError('root', {
          message: 'Access denied. Please sign in as an admin.',
        });
        return;
      }
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to update quiz. Please try again.',
      });
    }
  };

  const handleDelete = async () => {
    const confirmed = confirm(`Delete "${defaultValues.title}"? This cannot be undone.`);
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await deleteAdminQuiz(id);
      router.push('/admin/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        form.setError('root', {
          message: 'Access denied. You can only delete your own quizzes.',
        });
        return;
      }

      form.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to delete quiz. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit((values) => submit(values, 'questions'))} className="grid gap-6">
      {isLocked && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-small text-amber-700">
          {isPublished
            ? 'This quiz is published, so its content is locked. Switch the status to Draft below to edit it.'
            : 'This quiz has closed, so its content is locked. Switch the status to Draft below to reopen it for editing.'}
        </div>
      )}

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
              disabled={isLocked}
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
              disabled={isLocked}
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
                disabled={isLocked}
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
                disabled={isLocked}
                {...register('passingScore')}
              />
              <FieldError message={errors.passingScore?.message} />
            </div>
          </div>
            <div className="grid gap-2">
              <Label htmlFor="maxAttempts">Max Attempts (optional)</Label>
              <Input
                id="maxAttempts"
                type="number"
                min={1}
                step={1}
                placeholder="Unlimited"
                aria-invalid={Boolean(errors.maxAttempts)}
                {...register('maxAttempts')}
              />
              <FieldError message={errors.maxAttempts?.message} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scoreStrategy">Official Score</Label>
              <select
                id="scoreStrategy"
                aria-invalid={Boolean(errors.scoreStrategy)}
                {...register('scoreStrategy')}
                className="flex h-12 w-full rounded-xl border border-border bg-surface px-4 text-body text-foreground outline-none focus:border-primary-300"
              >
                <option value="">Default (Latest)</option>
                <option value="BEST">Best attempt</option>
                <option value="LATEST">Latest attempt</option>
              </select>
              <FieldError message={errors.scoreStrategy?.message} />
            </div>


          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              disabled={
                initialStatus !== 'PUBLISHED' &&
                initialStatus !== 'ARCHIVED' &&
                initialStatus !== 'CLOSED'
              }
              aria-invalid={Boolean(errors.status)}
              className="flex h-12 w-full rounded-xl border border-border bg-surface px-4 text-body text-foreground shadow-none outline-none transition-colors focus:border-primary-300 focus:ring-2 focus:ring-primary-200/70 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('status')}
            >
              {initialStatus === 'PUBLISHED' ? (
                <>
                  <option value="PUBLISHED">{QUIZ_STATUS_LABEL.PUBLISHED}</option>
                  <option value="DRAFT">{QUIZ_STATUS_LABEL.DRAFT}</option>
                  <option
                    value="ARCHIVED"
                    disabled={!hasAttempts}
                    title={!hasAttempts ? ARCHIVE_DISABLED_TOOLTIP : undefined}
                  >
                    {QUIZ_STATUS_LABEL.ARCHIVED}
                  </option>
                </>
              ) : initialStatus === 'ARCHIVED' ? (
                <>
                  <option value="ARCHIVED">{QUIZ_STATUS_LABEL.ARCHIVED}</option>
                  <option value="DRAFT">{QUIZ_STATUS_LABEL.DRAFT}</option>
                </>
              ) : initialStatus === 'CLOSED' ? (
                <>
                  <option value="CLOSED">{QUIZ_STATUS_LABEL.CLOSED}</option>
                  <option value="DRAFT">{QUIZ_STATUS_LABEL.DRAFT}</option>
                  <option
                    value="ARCHIVED"
                    disabled={!hasAttempts}
                    title={!hasAttempts ? ARCHIVE_DISABLED_TOOLTIP : undefined}
                  >
                    {QUIZ_STATUS_LABEL.ARCHIVED}
                  </option>
                </>
              ) : (
                <option value={initialStatus}>{QUIZ_STATUS_LABEL[initialStatus]}</option>
              )}
            </select>
            {!isLocked && initialStatus !== 'ARCHIVED' && (
              <p className="text-small text-muted-foreground">
                Publish this quiz from the Manage Questions page once it has attached questions.
              </p>
            )}
            {isLocked && !hasAttempts && (
              <p className="text-small text-muted-foreground">{ARCHIVE_DISABLED_TOOLTIP}</p>
            )}
            {initialStatus === 'ARCHIVED' && (
              <p className="text-small text-muted-foreground">
                Switch back to Draft to unarchive this quiz. You&apos;ll need to publish it again
                for students to take it.
              </p>
            )}
            {isClosed && (
              <p className="text-small text-muted-foreground">
                This quiz&apos;s window has closed. Switch to Draft to reopen it for editing —
                you&apos;ll need to publish it again for students to take it.
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
                disabled={isLocked}
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
                disabled={isLocked}
                {...register('endDate')}
              />
              <FieldError message={errors.endDate?.message} />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-2 pt-2">
        {errors.root?.message && <FieldError message={errors.root.message} />}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span title={hasAttempts ? DELETE_DISABLED_TOOLTIP : undefined}>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="rounded-full px-6"
              disabled={hasAttempts || isDeleting || isSubmitting}
            >
              {isDeleting ? 'Deleting…' : 'Delete Quiz'}
            </Button>
          </span>
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit((values) => submit(values, 'dashboard'))}
              className="rounded-full border-primary-200 px-6 text-primary-800 hover:bg-primary-50"
              disabled={isSubmitting || isDeleting}
            >
              Save
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700"
              disabled={isSubmitting || isDeleting}
            >
              Save &amp; Manage Questions
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default EditQuizForm;
