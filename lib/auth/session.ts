import type { LoginResponse } from '@/types/user/user';
import type { UserRole } from '@/types/auth';

export const AUTH_CHANGED_EVENT = 'auth-changed';

const COOKIE_NAME = 'accessToken';
const COOKIE_MAX_AGE = 3600; // 1 hour
const USER_META_KEY = 'userMeta';

type UserMeta = {
  email: string;
  emailVerified: boolean;
  role: UserRole;
};

function notifyAuthChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
    document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    notifyAuthChanged();
  }
}

export function setUserMeta(meta: UserMeta): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_META_KEY, JSON.stringify(meta));
    notifyAuthChanged();
  }
}

function getUserMeta(): UserMeta | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserMeta;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem(USER_META_KEY);
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    notifyAuthChanged();
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getUser(): LoginResponse['user'] | null {
  const token = getToken();
  if (!token) return null;

  const meta = getUserMeta();

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub,
      email: meta?.email ?? payload.email,
      role: meta?.role ?? payload.role,
      emailVerified: meta?.emailVerified ?? payload.emailVerified ?? false,
    };
  } catch {
    return null;
  }
}
