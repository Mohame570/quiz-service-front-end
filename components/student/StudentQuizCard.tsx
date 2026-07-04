import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import Card from '@/components/ui/Card';
import AttemptStatusBadge from '@/components/student/AttemptStatusBadge';
import type { QuizDto } from '@/types/quiz/student';
import { isCompletedQuiz } from '@/lib/answer-status';

type StudentQuizCardProps = {
  quiz: QuizDto;
  href?: string;
};

export default function StudentQuizCard({ quiz, href }: StudentQuizCardProps) {
  const completed = isCompletedQuiz(quiz.attemptStatus) && quiz.attemptId;
  const resolvedHref =
    href ??
    (completed
      ? `/student/quiz/result/${quiz.attemptId}`
      : `/student/quiz/${quiz.id}`);

  const actionLabel =
    quiz.attemptStatus === 'IN_PROGRESS'
      ? 'Resume →'
      : completed
        ? 'View result →'
        : 'Start →';

  return (
    <Link href={resolvedHref} className="group block">
      <Card className="flex flex-row overflow-hidden p-0 transition-all duration-150 ease-out hover:-translate-y-0.5">
        <div className="flex w-24 shrink-0 items-center justify-center bg-gradient-to-br from-primary-800 via-primary-900 to-[#040C24] sm:w-32">
          <BookOpen aria-hidden className="h-7 w-7 text-inverse/75 sm:h-8 sm:w-8" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
          <div className="min-w-0 flex flex-col gap-1.5">
            <div className="flex min-w-0 items-start gap-2 sm:items-center">
              <h3 className="line-clamp-2 text-h3 text-foreground sm:truncate sm:line-clamp-1">
                {quiz.title}
              </h3>
              <AttemptStatusBadge status={quiz.attemptStatus} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-foreground-secondary">
              <span>{quiz.questionCount} questions</span>
              {quiz.durationMinutes != null && <span>{quiz.durationMinutes} min</span>}
            </div>
          </div>

          <span className="shrink-0 text-small font-semibold text-accent-600 group-hover:text-accent-700">
            {actionLabel}
          </span>
        </div>
      </Card>
    </Link>
  );
}
