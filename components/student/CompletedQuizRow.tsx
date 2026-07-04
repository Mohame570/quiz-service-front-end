import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AttemptStatusBadge from '@/components/student/AttemptStatusBadge';
import type { QuizDto } from '@/types/quiz/student';
import { isCompletedQuiz } from '@/lib/answer-status';

type CompletedQuizRowProps = {
  quiz: QuizDto;
};

export default function CompletedQuizRow({ quiz }: CompletedQuizRowProps) {
  if (!isCompletedQuiz(quiz.attemptStatus) || !quiz.attemptId) {
    return null;
  }

  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-foreground">{quiz.title}</p>
        <div className="mt-1 flex items-center gap-2">
          <AttemptStatusBadge status={quiz.attemptStatus} />
          <span className="text-caption text-muted-foreground">{quiz.questionCount} questions</span>
        </div>
      </div>
      <Button
        asChild
        variant="outline"
        className="shrink-0 rounded-full border-primary-200 text-primary-800 hover:bg-primary-50"
      >
        <Link href={`/student/quiz/result/${quiz.attemptId}`}>View result</Link>
      </Button>
    </li>
  );
}
