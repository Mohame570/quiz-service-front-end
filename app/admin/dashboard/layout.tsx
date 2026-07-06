import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/dashboard/AdminSidebar';
import { getServerUser } from '@/lib/auth/session';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="h-screen bg-background lg:flex flex-col lg:flex-row">
      <AdminSidebar userEmail={user.email} />
      <div className="flex-1 min-h-screen">{children}</div>
    </div>
  );
}
