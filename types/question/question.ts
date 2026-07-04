import type { QuizData } from '@/types/quiz/admin';

export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_TEXT' | 'ESSAY';

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
  correctAnswer: string | number | boolean;
  points: number;
  createdAt: string;
  updatedAt: string;
  quizzes: QuizData[];
};
