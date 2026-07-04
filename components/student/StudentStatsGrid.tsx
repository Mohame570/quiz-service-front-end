import Link from 'next/link';
import { BookOpen, CheckCircle, Clock, ListChecks } from 'lucide-react';
import StatsCard from '@/components/shared/StatsCard';
import type { QuizDto } from '@/types/quiz/student';
import { isCompletedQuiz } from '@/lib/answer-status';

type StudentStatsGridProps = {
  quizzes: QuizDto[];
};

export default function StudentStatsGrid({ quizzes }: StudentStatsGridProps) {
  const completedCount = quizzes.filter((q) => isCompletedQuiz(q.attemptStatus)).length;
  const inProgressCount = quizzes.filter((q) => q.attemptStatus === 'IN_PROGRESS').length;
  const notStartedCount = quizzes.filter((q) => q.attemptStatus === 'NOT_STARTED').length;

  return (
    <section aria-label="Your stats" className="grid-auto-fit">
      <StatsCard
        icon={<ListChecks className="h-4 w-4" />}
        label="Quizzes"
        value={quizzes.length}
        trend="Available"
      />
      <StatsCard
        icon={<CheckCircle className="h-4 w-4" />}
        label="Completed"
        value={completedCount}
        trend={completedCount > 0 ? 'Submitted — see below' : 'Submitted'}
      />
      <StatsCard
        icon={<Clock className="h-4 w-4" />}
        label="In progress"
        value={inProgressCount}
        trend="Active"
      />
      <StatsCard
        icon={<BookOpen className="h-4 w-4" />}
        label="Not started"
        value={notStartedCount}
        trend="Pending"
      />
    </section>
  );
}
