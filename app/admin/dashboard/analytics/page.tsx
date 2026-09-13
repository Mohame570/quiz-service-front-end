// app/admin/dashboard/analytics/page.tsx
//
// Admin view: live participation/completion/absence/follow-up metrics
// and score distribution, aggregated across every quiz.
// Sourced from AnalyticsController.getDashboardMetrics() (Sprint 2).

import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import AnalyticsDashboardView from '@/components/admin/dashboard/analytics/AnalyticsDashboardView';

export const dynamic = 'force-dynamic';

export default function AnalyticsDashboardPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <DashboardHeader
          title="Analytics"
          description="Live participation, completion, and score metrics across every quiz."
        />
        <AnalyticsDashboardView />
      </section>
    </main>
  );
}
