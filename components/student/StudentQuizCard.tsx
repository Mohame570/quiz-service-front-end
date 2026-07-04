import Link from 'next/link';
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

  return (
    <Link href={resolvedHref} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden p-0 transition-all duration-150 ease-out hover:-translate-y-0.5">
        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary-800 via-primary-900 to-[#040C24] px-4">
          <span className="line-clamp-2 text-center text-caption font-semibold uppercase tracking-wide text-inverse">
            {quiz.title}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-h3 text-foreground">{quiz.title}</h3>
            <AttemptStatusBadge status={quiz.attemptStatus} />
          </div>
          <div className="flex items-center gap-3 text-caption text-muted-foreground">
            <span>{quiz.questionCount} questions</span>
            {quiz.durationMinutes != null && <span>{quiz.durationMinutes} min</span>}
          </div>
          {quiz.attemptStatus === 'IN_PROGRESS' && (
            <div className="mt-auto pt-2">
              <span className="text-small font-semibold text-accent-600 group-hover:text-accent-700">
                Resume →
              </span>
            </div>
          )}
          {completed && (
            <div className="mt-auto pt-2">
              <span className="text-small font-semibold text-accent-600 group-hover:text-accent-700">
                View result →
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
