import { z } from 'zod';
import { QUIZ_STATUS } from '@/types/quiz/admin';
import { QUESTION_TYPE } from '@/types/question/question';

export type CreateQuizFormInput = z.input<typeof createQuizSchema>;
export type CreateQuizFormValues = z.output<typeof createQuizSchema>;
export type EditQuizFormInput = z.input<typeof editQuizSchema>;
export type EditQuizFormValues = z.output<typeof editQuizSchema>;
export type CreateQuestionFormInput = z.input<typeof createQuestionSchema>;
export type CreateQuestionFormValues = z.output<typeof createQuestionSchema>;
export type SettingsFormInput = z.input<typeof settingsSchema>;
export type SettingsFormValues = z.output<typeof settingsSchema>;

const quizFieldsSchema = z.object({
  title: z.string().min(3, 'Quiz title must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  durationMinutes: z.coerce
    .number({ error: 'Duration must be a number.' })
    .int('Duration must be a whole number.')
    .positive('Duration must be greater than 0.'),
  passingScore: z.coerce
    .number({ error: 'Passing score must be a number.' })
    .min(0, 'Passing score cannot be less than 0.')
    .max(100, 'Passing score cannot exceed 100.'),
   
  maxAttempts: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.coerce
      .number({ error: 'Max attempts must be a number.' })
      .int('Max attempts must be a whole number.')
      .min(1, 'Max attempts must be at least 1.')
      .optional(),
  ),
  scoreStrategy: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(['BEST', 'LATEST']).optional(),
  ),
  
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

function withDateRangeRefinement<Schema extends typeof quizFieldsSchema>(schema: Schema) {
  return schema.refine(
    (data) =>
      !data.startDate || !data.endDate || new Date(data.endDate) >= new Date(data.startDate),
    {
      message: 'End date must be on or after the start date.',
      path: ['endDate'],
    }
  );
}

export const createQuizSchema = withDateRangeRefinement(quizFieldsSchema);

export const editQuizSchema = withDateRangeRefinement(
  quizFieldsSchema.extend({
    status: z.enum([
      QUIZ_STATUS.DRAFT,
      QUIZ_STATUS.PUBLISHED,
      QUIZ_STATUS.CLOSED,
      QUIZ_STATUS.ARCHIVED,
    ]),
  })
);

const questionOptionSchema = z.object({
  value: z.string(),
});

const questionFieldsSchema = z.object({
   type: z.enum([
    QUESTION_TYPE.MCQ,
    QUESTION_TYPE.MULTI_SELECT,
    QUESTION_TYPE.TRUE_FALSE,
    QUESTION_TYPE.SHORT_TEXT,
    QUESTION_TYPE.ESSAY,
    QUESTION_TYPE.MULTI_SELECT,
    QUESTION_TYPE.CODE_CONTEXT,
    QUESTION_TYPE.FILL_BLANK,
  ]),
  codeSnippet: z.string().optional(),
  codeLanguage: z.string().optional(),

  text: z.string().min(1, 'Question text is required.'),
  options: z.array(questionOptionSchema).optional(),
  correctAnswer: z.string().optional(),
  correctAnswers: z.array(z.string()).optional(),
  points: z.coerce
    .number({ error: 'Points must be a number.' })
    .int('Points must be a whole number.')
    .min(1, 'Points must be at least 1.'),
  quizIds: z.array(z.string()).optional(),
});

export const invitationEmailSchema = z.email('Enter a valid email address.');

export const createQuestionSchema = questionFieldsSchema.superRefine((data, ctx) => {
  if (data.type === 'MCQ') {
    const opts = (data.options ?? []).map((o) => o.value.trim()).filter(Boolean);
    const unique = new Set(opts);
    if (opts.length < 2) {
      ctx.addIssue({ code: 'custom', message: 'MCQ needs at least 2 unique options.', path: ['options'] });
    } else if (unique.size !== opts.length) {
      ctx.addIssue({ code: 'custom', message: 'Options must be unique.', path: ['options'] });
    }
    if (!data.correctAnswer) {
      ctx.addIssue({ code: 'custom', message: 'Select the correct option.', path: ['correctAnswer'] });
    } else if (!opts.includes(data.correctAnswer)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Correct answer must match one of the options.',
        path: ['correctAnswer'],
      });
    }
  } else if (data.type === 'TRUE_FALSE') {
    if (data.correctAnswer !== 'True' && data.correctAnswer !== 'False') {
      ctx.addIssue({ code: 'custom', message: 'Select True or False.', path: ['correctAnswer'] });
    }
  } else if (data.type === 'MULTI_SELECT') {
    const opts = (data.options ?? []).map((o) => o.value.trim()).filter(Boolean);
    const corrects = data.correctAnswers ?? [];
    if (opts.length < 2) {
      ctx.addIssue({ code: 'custom', message: 'Multi-select needs at least 2 options.', path: ['options'] });
    }
    const unique = new Set(opts);
    if (unique.size !== opts.length) {
      ctx.addIssue({ code: 'custom', message: 'Options must be unique.', path: ['options'] });
    }
    if (corrects.length < 1) {
      ctx.addIssue({ code: 'custom', message: 'Select at least one correct answer.', path: ['correctAnswers'] });
    } else if (!corrects.every((c) => opts.includes(c))) {
      ctx.addIssue({ code: 'custom', message: 'All correct answers must match options.', path: ['correctAnswers'] });
    }
  } else if (data.type === 'SHORT_TEXT') {
    if (!data.correctAnswer || !data.correctAnswer.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Correct answer is required.', path: ['correctAnswer'] });
    }
  } else if (data.type === 'FILL_BLANK') {
    if (!data.correctAnswer || !data.correctAnswer.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Correct answer is required.', path: ['correctAnswer'] });
    }
  } else if (data.type === 'CODE_CONTEXT') {
    if (!data.codeSnippet || !data.codeSnippet.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Code snippet is required.', path: ['codeSnippet'] });
    }
    if (!data.correctAnswer || !data.correctAnswer.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Correct answer is required.', path: ['correctAnswer'] });
    }
  }
});

export const settingsSchema = z.object({
  organizationName: z
    .string()
    .min(1, 'Organization name is required.')
    .max(100, 'Name cannot exceed 100 characters.'),
  timezoneLabel: z
    .string()
    .min(1, 'Timezone label is required.')
    .max(100, 'Timezone label cannot exceed 100 characters.'),
  defaultPassThreshold: z.coerce
    .number({ error: 'Passing threshold must be a number.' })
    .int('Passing threshold must be an integer.')
    .min(0, 'Threshold cannot be less than 0.')
    .max(100, 'Threshold cannot exceed 100.'),
  defaultDurationMinutes: z.coerce
    .number({ error: 'Duration must be a number.' })
    .int('Duration must be an integer.')
    .min(1, 'Duration must be at least 1 minute.'),
  integrityReviewThreshold: z.coerce
    .number({ error: 'Integrity threshold must be a number.' })
    .int('Integrity threshold must be an integer.')
    .min(1, 'Integrity threshold must be at least 1 event.'),
});
