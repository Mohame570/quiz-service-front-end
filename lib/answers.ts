import type { QuestionType } from '@/types/question/question';

export type SaveAnswerItem =
  | { questionId: string; selectedOptionId: string | null }
  | { questionId: string; textAnswer: string | null };

export function isTextQuestionType(type: QuestionType): boolean {
  return type === 'SHORT_TEXT' || type === 'ESSAY';
}

export function buildAnswerPayload(
  questionId: string,
  type: QuestionType,
  value: string | null,
): SaveAnswerItem {
  if (isTextQuestionType(type)) {
    const trimmed = value?.trim() ?? '';
    return {
      questionId,
      textAnswer: trimmed.length > 0 ? trimmed : null,
    };
  }

  return {
    questionId,
    selectedOptionId: value,
  };
}

export function buildAnswerPayloads(
  questions: Array<{ id: string; type: QuestionType }>,
  answers: Record<string, string | null>,
): SaveAnswerItem[] {
  return questions.map((question) =>
    buildAnswerPayload(question.id, question.type, answers[question.id] ?? null),
  );
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: 'Multiple Choice',
  TRUE_FALSE: 'True / False',
  SHORT_TEXT: 'Short Text',
  ESSAY: 'Essay',
};
