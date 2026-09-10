import { CheckCircle2, XCircle, Shield, GraduationCap, Calendar, Users as UsersIcon } from 'lucide-react';
import { PaginatedUsersData } from '@/types/user/admin-user';
import UserStatusToggle from './UserStatusToggle';
import UsersTablePagination from './UsersTablePagination';

type Props = {
  usersData: PaginatedUsersData;
};

function formatDate(dateString: string): string {
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateString;
  }
  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function UsersTable({ usersData }: Props) {
  const { users, page, totalItems, totalPages, hasNextPage, hasPreviousPage } = usersData;

  return (
    <div
      id="users-table-container"
      className="w-full rounded-2xl border border-border bg-surface shadow-sm overflow-hidden"
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Users management table">
          <thead>
            <tr className="border-b border-border bg-slate-50/80 dark:bg-slate-900/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="px-6 py-3.5">
                User
              </th>
              <th scope="col" className="px-6 py-3.5">
                Role
              </th>
              <th scope="col" className="px-6 py-3.5">
                Email Status
              </th>
              <th scope="col" className="px-6 py-3.5">
                Account Status
              </th>
              <th scope="col" className="px-6 py-3.5">
                Joined
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {users.length > 0 ? (
              users.map((user) => {
                const isAdmin = user.role === 'ADMIN';
                const initial = (user.name || user.email)[0].toUpperCase();

                return (
                  <tr
                    key={user.id}
                    id={`user-row-${user.id}`}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* User name & email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white shadow-xs ${
                            isAdmin
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                              : 'bg-gradient-to-br from-sky-500 to-blue-600'
                          }`}
                          aria-hidden="true"
                        >
                          {initial}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
                            {user.name || 'Unnamed User'}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40">
                          <GraduationCap className="h-3.5 w-3.5" />
                          Student
                        </span>
                      )}
                    </td>

                    {/* Email verification status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.emailVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                          <XCircle className="h-3.5 w-3.5 text-amber-500" />
                          Unverified
                        </span>
                      )}
                    </td>

                    {/* Account active status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Joined date */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <UserStatusToggle user={user} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                      <UsersIcon className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-foreground">No users found</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      No accounts match your current search query or filter criteria. Try clearing filters to see all users.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with counts and pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border px-6 py-4 text-xs text-muted-foreground bg-slate-50/40 dark:bg-slate-900/30">
        <p id="users-count-summary">
          Showing <strong className="text-foreground">{users.length}</strong> of{' '}
          <strong className="text-foreground">{totalItems}</strong> users
        </p>
        <UsersTablePagination
          page={page}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
        />
      </div>
    </div>
  );
}
