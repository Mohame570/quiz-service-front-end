import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import ComingSoonView from '@/components/admin/dashboard/ComingSoonView';
import { Users } from 'lucide-react';

export default function UsersPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <DashboardHeader
          title="User Management"
          description="Manage student accounts, roles, and access permissions."
        />
        <ComingSoonView
          icon={Users}
          title="User Management"
          description="Student account administration, role management, and access control are being developed for an upcoming release."
          status="Planned"
        />
      </section>
    </main>
  );
}
