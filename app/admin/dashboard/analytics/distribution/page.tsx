// app/admin/dashboard/analytics/distribution/page.tsx
//
// Cohort Score Distribution + Relative Standing view. Sourced from
// CohortDistributionController (Sprint 3) — see
// docs/analytics-calculations.md §2 for the exact formulas. Includes the
// filtered CSV export (same filters as the on-screen table).

import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import AnalyticsTabs from '@/components/admin/dashboard/analytics/AnalyticsTabs';
import CohortDistributionView from '@/components/admin/dashboard/analytics/CohortDistributionView';

export const dynamic = 'force-dynamic';

export default function CohortDistributionPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <DashboardHeader
          title="Cohort distribution"
          description="Score distribution and relative standing, filterable by cohort, tag, and date range."
        />
        <AnalyticsTabs />
        <CohortDistributionView />
      </section>
    </main>
  );
}
