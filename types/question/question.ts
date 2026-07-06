import type { QuizData } from '@/types/quiz/admin';

export const QUESTION_TYPE = {
  MCQ: 'MCQ',
  TRUE_FALSE: 'TRUE_FALSE',
  SHORT_TEXT: 'SHORT_TEXT',
  ESSAY: 'ESSAY',
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
  points: number;
  createdAt: string;
  updatedAt: string;
  quizzes: QuizData[];
};

export type CreateQuestionDto = {
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer?: string;
  points?: number;
  quizIds?: string[];
};
