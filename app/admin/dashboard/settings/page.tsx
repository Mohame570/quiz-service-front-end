import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import SettingsForm from '@/components/admin/dashboard/forms/SettingsForm';

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <DashboardHeader
          title="Institutional Settings"
          description="Manage organizational identity, scheduling timezone, assessment defaults, and integrity thresholds."
        />
        <SettingsForm />
      </section>
    </main>
  );
}
