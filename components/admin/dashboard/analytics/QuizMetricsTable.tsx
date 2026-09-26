// components/admin/dashboard/analytics/QuizMetricsTable.tsx

import Link from 'next/link';
import type { QuizMetricSummary } from '@/types/analytics/analytics';

function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

function formatScore(score: number | null): string {
  return score === null ? '—' : `${Math.round(score)}%`;
}

export default function QuizMetricsTable({ quizzes }: { quizzes: QuizMetricSummary[] }) {
  if (quizzes.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-primary-50/40 text-xs uppercase tracking-wide text-foreground-secondary">
          <tr>
            <th className="px-5 py-3">Quiz</th>
            <th className="px-5 py-3">Assigned</th>
            <th className="px-5 py-3">Participation</th>
            <th className="px-5 py-3">Completion</th>
            <th className="px-5 py-3">Absent</th>
            <th className="px-5 py-3">Follow-up</th>
            <th className="px-5 py-3">Avg. score</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((quiz) => (
            <tr key={quiz.quizId} className="border-b border-border last:border-0">
              <td className="px-5 py-3 font-medium text-foreground">
                <Link href={`/admin/dashboard/follow-up?quizId=${quiz.quizId}`} className="hover:underline">
                  {quiz.quizTitle}
                </Link>
                {!quiz.windowClosed && (
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-green-700">
                    Open
                  </span>
                )}
              </td>
              <td className="px-5 py-3 text-foreground-secondary">
                {quiz.assignedCount === 0 ? '—' : quiz.assignedCount}
              </td>
              <td className="px-5 py-3 text-foreground-secondary">
                {quiz.assignedCount === 0
                  ? 'No students assigned'
                  : `${quiz.participationCount} (${formatRate(quiz.participationRate)})`}
              </td>
              <td className="px-5 py-3 text-foreground-secondary">
                {quiz.assignedCount === 0
                  ? '—'
                  : `${quiz.completionCount} (${formatRate(quiz.completionRate)})`}
              </td>
              <td className="px-5 py-3 text-foreground-secondary">
                {quiz.windowClosed ? quiz.absenceCount : 'Window open'}
              </td>
              <td className="px-5 py-3 text-foreground-secondary">{quiz.followUpCount}</td>
              <td className="px-5 py-3 text-foreground-secondary">{formatScore(quiz.averageScore)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
