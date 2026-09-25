// components/admin/dashboard/analytics/CohortStandingsTable.tsx

import type { CohortStudentStanding } from '@/types/analytics/quality-and-distribution';

export default function CohortStandingsTable({ standings }: { standings: CohortStudentStanding[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b border-border bg-primary-50/40 text-xs uppercase tracking-wide text-foreground-secondary">
          <tr>
            <th className="px-5 py-3">Rank</th>
            <th className="px-5 py-3">Student</th>
            <th className="px-5 py-3">Cohort</th>
            <th className="px-5 py-3">Quiz</th>
            <th className="px-5 py-3">Score</th>
            <th className="px-5 py-3">Percentile</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr key={`${s.quizId}-${s.studentId}`} className="border-b border-border last:border-0">
              <td className="px-5 py-3 font-semibold text-foreground">#{s.rank}</td>
              <td className="px-5 py-3 text-foreground">{s.studentName}</td>
              <td className="px-5 py-3 text-foreground-secondary">{s.cohort ?? '—'}</td>
              <td className="px-5 py-3 text-foreground-secondary">{s.quizTitle}</td>
              <td className="px-5 py-3 text-foreground-secondary">
                {s.score}/{s.maxScore} ({Math.round(s.percentage)}%)
              </td>
              <td className="px-5 py-3 text-foreground-secondary">{s.percentile}th</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
