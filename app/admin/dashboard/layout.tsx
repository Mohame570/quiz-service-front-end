import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth/session';
import AdminShellProvider from '@/components/admin/dashboard/AdminShellProvider';
import AdminTopbar from '@/components/admin/dashboard/AdminTopbar';
import AdminSidebar from '@/components/admin/dashboard/AdminSidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <AdminShellProvider>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Persistent topbar */}
        <AdminTopbar userEmail={user.email} />

        {/* Sidebar + content area */}
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AdminShellProvider>
  );
}
