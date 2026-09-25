import { createQuestionSchema, createQuizSchema } from '@/lib/validation';

const baseQuestion = {
  text: 'Sample?',
  points: 1,
};

const baseQuiz = {
  title: 'Demo Quiz',
  description: 'A demo quiz for testing.',
  durationMinutes: 30,
  passingScore: 50,
};

function issuesForQuestion(input: Record<string, unknown>) {
  return createQuestionSchema.safeParse({ ...baseQuestion, ...input });
}

describe('createQuestionSchema — multi-select rules', () => {
  it('rejects fewer than 2 options', () => {
    const result = issuesForQuestion({
      type: 'MULTI_SELECT',
      options: [{ value: 'Only' }],
      correctAnswers: ['Only'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects duplicate options', () => {
    const result = issuesForQuestion({
      type: 'MULTI_SELECT',
      options: [{ value: 'A' }, { value: 'A' }],
      correctAnswers: ['A'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty correctAnswers array', () => {
    const result = issuesForQuestion({
      type: 'MULTI_SELECT',
      options: [{ value: 'A' }, { value: 'B' }],
      correctAnswers: [],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid multi-select question', () => {
    const result = issuesForQuestion({
      type: 'MULTI_SELECT',
      options: [{ value: 'A' }, { value: 'B' }],
      correctAnswers: ['A'],
    });
    expect(result.success).toBe(true);
  });
});

describe('createQuestionSchema — code-context and fill-blank rules', () => {
  it('requires a code snippet for CODE_CONTEXT', () => {
    const invalid = issuesForQuestion({
      type: 'CODE_CONTEXT',
      codeSnippet: '   ',
      correctAnswer: '3',
    });
    expect(invalid.success).toBe(false);

    const valid = issuesForQuestion({
      type: 'CODE_CONTEXT',
      codeSnippet: 'print(1 + 2)',
      codeLanguage: 'python',
      correctAnswer: '3',
    });
    expect(valid.success).toBe(true);
  });

  it('requires a correct answer for FILL_BLANK', () => {
    expect(
      issuesForQuestion({ type: 'FILL_BLANK', correctAnswer: '  ' }).success,
    ).toBe(false);
    expect(
      issuesForQuestion({ type: 'FILL_BLANK', correctAnswer: 'Paris' }).success,
    ).toBe(true);
  });
});

describe('createQuizSchema — retake policy fields', () => {
  it('treats a blank maxAttempts as unlimited', () => {
    const result = createQuizSchema.safeParse({ ...baseQuiz, maxAttempts: '' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maxAttempts).toBeUndefined();
    }
  });

  it('rejects maxAttempts below 1', () => {
    expect(
      createQuizSchema.safeParse({ ...baseQuiz, maxAttempts: 0 }).success,
    ).toBe(false);
  });

  it('accepts BEST / LATEST strategies and defaults a blank to undefined', () => {
    const best = createQuizSchema.safeParse({ ...baseQuiz, scoreStrategy: 'BEST' });
    expect(best.success).toBe(true);

    const blank = createQuizSchema.safeParse({ ...baseQuiz, scoreStrategy: '' });
    expect(blank.success).toBe(true);
    if (blank.success) {
      expect(blank.data.scoreStrategy).toBeUndefined();
    }
  });
});
