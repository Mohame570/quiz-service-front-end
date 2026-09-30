// app/admin/dashboard/analytics/quality/page.tsx
//
// Question Quality view: correct/wrong/skipped rates per question,
// hardest + most-confusing sorted first. Sourced from
// QuestionQualityController (Sprint 3) — see
// docs/analytics-calculations.md §1 for the exact formulas.

import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import AnalyticsTabs from '@/components/admin/dashboard/analytics/AnalyticsTabs';
import QuestionQualityView from '@/components/admin/dashboard/analytics/QuestionQualityView';

export const dynamic = 'force-dynamic';

export default function QuestionQualityPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <DashboardHeader
          title="Question quality"
          description="Which questions are hardest and most confusing, based on real attempt data."
        />
        <AnalyticsTabs />
        <QuestionQualityView />
      </section>
    </main>
  );
}
