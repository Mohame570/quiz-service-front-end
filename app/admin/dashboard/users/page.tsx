import { Metadata } from 'next';
import { AlertCircle } from 'lucide-react';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import UsersSearch from '@/components/admin/dashboard/UsersSearch';
import UsersFilter from '@/components/admin/dashboard/UsersFilter';
import UsersTable from '@/components/admin/dashboard/UsersTable';
import { getAdminUsers } from '@/lib/api/admin/users';
import { PaginatedUsersData } from '@/types/user/admin-user';
import { searchParamsProps } from '@/types';

export const metadata: Metadata = {
  title: 'User Management | Admin Command Centre',
  description: 'Manage student accounts, role permissions, and access status in real time.',
};

function parsePage(value: unknown): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function parseIsActive(status: string | undefined): boolean | undefined {
  if (status === 'active') return true;
  if (status === 'inactive') return false;
  return undefined;
}

export default async function UsersPage({ searchParams }: searchParamsProps) {
  const params = await searchParams;
  const currentPage = parsePage(params.page);
  const search = params.search?.trim() || undefined;
  const role = params.role && params.role !== 'all' ? params.role : undefined;
  const isActive = parseIsActive(params.status);

  let paginatedUsers: PaginatedUsersData | null = null;
  let loadError: string | null = null;

  try {
    paginatedUsers = await getAdminUsers({
      page: currentPage,
      search,
      role,
      isActive,
      pageSize: 10,
    });
  } catch (err: unknown) {
    loadError =
      err instanceof Error
        ? err.message
        : 'Failed to load users. Please check your network connection and try again.';
  }

  // Calculate quick stats from current data or fallback
  const totalUsersCount = paginatedUsers ? String(paginatedUsers.totalItems) : '—';

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        {/* Header */}
        <DashboardHeader
          title="User Management"
          description="View registered accounts, verify credentials, and manage student access permissions."
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            icon="👥"
            label="Total Accounts"
            value={totalUsersCount}
          />
          <StatsCard
            icon="🎓"
            label="Current Page Accounts"
            value={paginatedUsers ? String(paginatedUsers.users.length) : '—'}
          />
          <StatsCard
            icon="🛡️"
            label="Role Scope"
            value={role ? role : 'All Roles'}
          />
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <UsersSearch />
          <UsersFilter />
        </div>

        {/* Content / Error */}
        {loadError ? (
          <div
            id="users-error-banner"
            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/40 p-4 text-rose-800 dark:text-rose-300"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold text-sm">Failed to retrieve user accounts</h4>
              <p className="text-xs opacity-90">{loadError}</p>
            </div>
          </div>
        ) : paginatedUsers ? (
          <UsersTable usersData={paginatedUsers} />
        ) : (
          <div className="h-48 rounded-2xl border border-border bg-surface/50 animate-pulse" />
        )}
      </section>
    </main>
  );
}
