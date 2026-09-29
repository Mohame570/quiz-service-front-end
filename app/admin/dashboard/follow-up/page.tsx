// app/admin/dashboard/follow-up/page.tsx
//
// Admin view: learner follow-up queue, categorized into 6 operational
// reason groups with actionable next steps for each.
// Sourced from FollowUpController (Sprint 2). Optionally scoped to a
// single quiz via ?quizId=, e.g. linked from the analytics breakdown
// table.

import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import FollowUpView from '@/components/admin/dashboard/follow-up/FollowUpView';
import { searchParamsProps } from '@/types';

export const dynamic = 'force-dynamic';

export default async function FollowUpPage({ searchParams }: searchParamsProps) {
  const params = await searchParams;
  const quizId = typeof params.quizId === 'string' ? params.quizId : undefined;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <DashboardHeader
          title="Follow-up"
          description="Learners who need action, grouped by why — with a concrete next step for each."
        />
        <FollowUpView quizId={quizId} />
      </section>
    </main>
  );
}
