export const QUIZ_STATUS = {
  PUBLISHED: 'PUBLISHED',
  DRAFT: 'DRAFT',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type QuizStatus = (typeof QUIZ_STATUS)[keyof typeof QUIZ_STATUS];

export type QuizData = {
  id: string;
  title: string;
  description: string;
  status: QuizStatus;
  durationMinutes: number;
  passingScore: number;
  startsAt: string;
  endsAt: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedQuizData = {
  quizzes: QuizData[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type QuizFilterOptions = {
  key: 'all' | QuizStatus;
  label: string;
};
