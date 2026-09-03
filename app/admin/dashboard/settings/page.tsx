import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import ComingSoonView from '@/components/admin/dashboard/ComingSoonView';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <DashboardHeader
          title="Platform Settings"
          description="Configure platform preferences, notification rules, and grading policies."
        />
        <ComingSoonView
          icon={Settings}
          title="Platform Settings"
          description="Configuration options for notifications, grading policies, and platform preferences are being developed for an upcoming release."
          status="Planned"
        />
      </section>
    </main>
  );
}
