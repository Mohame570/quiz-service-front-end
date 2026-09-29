// app/admin/dashboard/sign-in-activity/page.tsx
//
// Admin view: System-wide sign-in activity and security telemetry.
//
// Displays historical and live sign-in records with IP, device user-agent,
// role, and timestamp information.

import { Suspense } from 'react';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import SignInActivityView from '@/components/admin/dashboard/SignInActivityView';

export const dynamic = 'force-dynamic';

export default function SignInActivityPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <DashboardHeader
          title="Sign-In Activity"
          description="Monitor administrative and student sign-in events, IP addresses, and session devices."
        />

        <Suspense
          fallback={
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
              <p className="text-body text-foreground-secondary">Loading sign-in telemetry...</p>
            </div>
          }
        >
          <SignInActivityView />
        </Suspense>
      </section>
    </main>
  );
}
