import { QuizStatus } from '@/types/quiz/admin';

export const QUIZ_STATUS_LABEL: Record<QuizStatus, string> = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
};

export const QUIZ_STATUS_COLOR: Record<QuizStatus, 'success' | 'warning' | 'destructive' | 'muted-foreground'> = {
  PUBLISHED: 'success',
  DRAFT: 'warning',
  CLOSED: 'destructive',
  ARCHIVED: 'muted-foreground',
};

export const QUIZ_STATUS_PILL_CLASSES: Record<
  (typeof QUIZ_STATUS_COLOR)[QuizStatus],
  { container: string; dot: string; text: string }
> = {
  success: { container: 'bg-success/10', dot: 'bg-success', text: 'text-success' },
  warning: { container: 'bg-warning/10', dot: 'bg-warning', text: 'text-warning' },
  destructive: { container: 'bg-destructive/10', dot: 'bg-destructive', text: 'text-destructive' },
  'muted-foreground': {
    container: 'bg-muted-foreground/10',
    dot: 'bg-muted-foreground',
    text: 'text-muted-foreground',
  },
};

export function getQuizStatusPill(status: QuizStatus) {
  return QUIZ_STATUS_PILL_CLASSES[QUIZ_STATUS_COLOR[status]];
}
