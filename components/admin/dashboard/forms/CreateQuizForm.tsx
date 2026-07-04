'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookCopy, Settings2 } from 'lucide-react';

import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CreateQuizFormInput, CreateQuizFormValues, createQuizSchema } from '@/lib/validation';
import { createAdminQuiz } from '@/lib/api/admin/quizzes';
import SectionTitle from './FormSectionTitle';
import FormLabel from './FormLabel';
import FieldError from './FormFieldError';
import { useRouter } from 'next/navigation';

const DEFAULT_VALUES: CreateQuizFormInput = {
  title: '',
  description: '',
  durationMinutes: 60,
  passingScore: 50,
  startDate: '',
  endDate: '',
};

function CreateQuizForm() {
  const router = useRouter();

  const form = useForm<CreateQuizFormInput, undefined, CreateQuizFormValues>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onSubmit',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const submit = async (values: CreateQuizFormValues, redirectTo: 'questions' | 'dashboard') => {
    try {
      const quiz = await createAdminQuiz(values);
      router.push(
        redirectTo === 'questions' ? `/admin/dashboard/edit/${quiz.id}/questions` : '/admin/dashboard'
      );
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to create quiz. Please try again.',
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
            Save as Draft
          </Button>
          <Button
            type="submit"
            className="rounded-full bg-primary-800 px-6 text-white hover:bg-primary-700 disabled:bg-primary-400"
            disabled={isSubmitting}
          >
            Save &amp; Add Questions
          </Button>
        </div>
      </div>
    </form>
  );
}

export default CreateQuizForm;
