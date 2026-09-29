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

export type SignInActivityItem = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  userRole: string;
  ipAddress: string | null;
  userAgent: string | null;
  signedInAt: string;
};

export type PaginatedSignInActivities = {
  items: SignInActivityItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getAdminSignInActivity(params?: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedSignInActivities> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));

  const qs = query.toString();
  return apiFetch<PaginatedSignInActivities>(
    `/api/admin/users/sign-in-activity${qs ? `?${qs}` : ''}`,
  );
}
