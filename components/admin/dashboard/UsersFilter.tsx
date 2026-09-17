'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UserRoleFilter, UserStatusFilter } from '@/types/user/admin-user';

type FilterOption<T extends string> = {
  key: T;
  label: string;
};

const ROLE_FILTERS: FilterOption<UserRoleFilter>[] = [
  { key: 'all', label: 'All Roles' },
  { key: 'STUDENT', label: 'Students' },
  { key: 'ADMIN', label: 'Admins' },
];

const STATUS_FILTERS: FilterOption<UserStatusFilter>[] = [
  { key: 'all', label: 'All Status' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

export default function UsersFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const roleParam = searchParams.get('role') ?? 'all';
  const statusParam = searchParams.get('status') ?? 'all';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3">
      {/* Role filter pills */}
      <div
        className="flex w-full sm:w-auto items-center gap-1 rounded-2xl border border-border bg-surface/90 p-1"
        role="tablist"
        aria-label="User role filter"
      >
        {ROLE_FILTERS.map((filter) => {
          const isActive = roleParam === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`role-filter-${filter.key.toLowerCase()}`}
              onClick={() => updateParam('role', filter.key)}
              className={[
                'flex-1 sm:flex-initial rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60',
                isActive
                  ? 'bg-primary-800 text-white shadow-sm'
                  : 'text-foreground-secondary hover:bg-primary-50 hover:text-primary-800',
              ].join(' ')}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Status filter pills */}
      <div
        className="flex w-full sm:w-auto items-center gap-1 rounded-2xl border border-border bg-surface/90 p-1"
        role="tablist"
        aria-label="User status filter"
      >
        {STATUS_FILTERS.map((filter) => {
          const isActive = statusParam === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`status-filter-${filter.key.toLowerCase()}`}
              onClick={() => updateParam('status', filter.key)}
              className={[
                'flex-1 sm:flex-initial rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60',
                isActive
                  ? 'bg-primary-800 text-white shadow-sm'
                  : 'text-foreground-secondary hover:bg-primary-50 hover:text-primary-800',
              ].join(' ')}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
