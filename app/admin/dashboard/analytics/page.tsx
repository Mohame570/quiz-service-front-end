// app/admin/dashboard/analytics/page.tsx
//
// Admin view: Platform-wide analytics dashboard.
// Resolves the previously dead #analytics sidebar link.
// Data fetching is client-side so auth tokens from the browser are sent.

import { Suspense } from 'react';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import AnalyticsDashboardView from '@/components/admin/dashboard/AnalyticsDashboardView';

export const dynamic = 'force-dynamic';

export default function AnalyticsDashboardPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <DashboardHeader
          title="Analytics"
          description="Track platform-wide performance, student participation, and assessment metrics."
        />

        <Suspense
          fallback={
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
              <p className="text-body text-foreground-secondary">Loading analytics data...</p>
            </div>
          }
        >
          <AnalyticsDashboardView />
        </Suspense>
      </section>
    </main>
  );
}
