import type { QuizData } from '@/types/quiz/admin';

export const QUESTION_TYPE = {
  MCQ: 'MCQ',
  MULTI_SELECT: 'MULTI_SELECT',
  TRUE_FALSE: 'TRUE_FALSE',
  SHORT_TEXT: 'SHORT_TEXT',
  ESSAY: 'ESSAY',
  CODE_CONTEXT: 'CODE_CONTEXT',
  FILL_BLANK: 'FILL_BLANK',
} as const;

export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];

export type QuestionOption = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  prompt: string;
  type: QuestionType;
  options: QuestionOption[];
};

export type StudentQuestion = {
  id: string;
  type: QuestionType;
  codeSnippet?: string | null;
  codeLanguage?: string | null;
  text: string;
  options: string[];
  order: number;
};

export type QuestionDto = {
  id: string;
  type: QuestionType;
  text: string;
  options: string[];
  correctAnswer: string;
  correctAnswers: string[];
  codeSnippet: string | null;
  codeLanguage: string | null;
  points: number;
  difficulty: string;
  topic: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  quizzes: QuizData[];
};

export type CreateQuestionDto = {
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  codeSnippet?: string;
  codeLanguage?: string;
  points?: number;
  difficulty?: string;
  topic?: string;
  tags?: string[];
  quizIds?: string[];
};
