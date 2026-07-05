import type { LoginResponse } from '@/types/user/user';

const COOKIE_NAME = 'accessToken';
const COOKIE_MAX_AGE = 3600; // 1 hour

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
    document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

function decodeUser(token: string): LoginResponse['user'] | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      emailVerified: payload.emailVerified ?? true,
    };
  } catch {
    return null;
  }
}

export function getUser(): LoginResponse['user'] | null {
  const token = getToken();
  if (!token) return null;
  return decodeUser(token);
}

export async function getServerUser(): Promise<LoginResponse['user'] | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeUser(token);
}
