import Link from 'next/link';
import type { QuizDto } from '@/types/quiz/student';
import { isCompletedQuiz } from '@/lib/answer-status';

const statusLabels: Record<'SUBMITTED' | 'TIMED_OUT', string> = {
  SUBMITTED: 'Completed',
  TIMED_OUT: 'Timed out',
};

const statusStyles: Record<'SUBMITTED' | 'TIMED_OUT', string> = {
  SUBMITTED: 'bg-success/10 text-success',
  TIMED_OUT: 'bg-error/10 text-error',
};

type CompletedQuizRowProps = {
  quiz: QuizDto;
};

export default function CompletedQuizRow({ quiz }: CompletedQuizRowProps) {
  if (!isCompletedQuiz(quiz.attemptStatus) || !quiz.attemptId) {
    return null;
  }

  const status = quiz.attemptStatus as 'SUBMITTED' | 'TIMED_OUT';

  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-foreground">
          {quiz.title}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-caption font-semibold ${statusStyles[status]}`}
          >
            {statusLabels[status]}
          </span>
          <span className="text-caption text-muted">
            {quiz.questionCount} questions
          </span>
        </div>
      </div>
      <Link
        href={`/student/quiz/result/${quiz.attemptId}`}
        className="shrink-0 text-small font-semibold text-accent-600 transition-colors hover:text-accent-700"
      >
        View result →
      </Link>
    </li>
  );
}
