import { UserRole } from './user';

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
};

export type PaginatedUsersData = {
  users: AdminUser[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type UserRoleFilter = 'all' | 'STUDENT' | 'ADMIN';
export type UserStatusFilter = 'all' | 'active' | 'inactive';
