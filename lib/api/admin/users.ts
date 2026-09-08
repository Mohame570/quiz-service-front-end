import { apiFetch } from '@/lib/api/client';
import { AdminUser, PaginatedUsersData } from '@/types/user/admin-user';

export async function getAdminUsers(params?: {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedUsersData> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.role && params.role !== 'all') query.set('role', params.role);
  if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
  if (params?.page) query.set('page', String(params.page));
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));

  const qs = query.toString();
  return apiFetch<PaginatedUsersData>(`/api/admin/users${qs ? `?${qs}` : ''}`);
}

export async function updateAdminUserStatus(
  id: string,
  isActive: boolean,
): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/api/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}
