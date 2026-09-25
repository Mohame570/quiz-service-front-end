// components/admin/dashboard/analytics/QuestionQualityTable.tsx

import type { QuestionQualityMetric } from '@/types/analytics/quality-and-distribution';

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export default function QuestionQualityTable({ questions }: { questions: QuestionQualityMetric[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-border bg-primary-50/40 text-xs uppercase tracking-wide text-foreground-secondary">
          <tr>
            <th className="px-5 py-3">Question</th>
            <th className="px-5 py-3">Quiz</th>
            <th className="px-5 py-3">Correct</th>
            <th className="px-5 py-3">Wrong</th>
            <th className="px-5 py-3">Skipped</th>
            <th className="px-5 py-3">Confusion</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, i) => (
            <tr key={q.questionId} className="border-b border-border last:border-0 align-top">
              <td className="px-5 py-3">
                <div className="flex items-start gap-2">
                  {i < 3 && (
                    <span className="mt-0.5 shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                      #{i + 1} hardest
                    </span>
                  )}
                  <span className="font-medium text-foreground">{q.questionText}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-foreground-secondary">{q.quizTitle}</td>
              <td className="px-5 py-3">
                <RateBar rate={q.correctRate} color="bg-green-500" count={q.correctCount} />
              </td>
              <td className="px-5 py-3">
                <RateBar rate={q.wrongRate} color="bg-red-500" count={q.wrongCount} />
              </td>
              <td className="px-5 py-3">
                <RateBar rate={q.skippedRate} color="bg-gray-400" count={q.skippedCount} />
              </td>
              <td className="px-5 py-3 text-foreground-secondary">
                {q.confusionScore === null ? '—' : pct(q.confusionScore)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RateBar({ rate, color, count }: { rate: number; color: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${color}`} style={{ width: `${Math.round(rate * 100)}%` }} />
      </div>
      <span className="whitespace-nowrap text-xs text-foreground-secondary">
        {pct(rate)} ({count})
      </span>
    </div>
  );
}
