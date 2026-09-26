import { apiFetch } from '@/lib/api/client';
import type { LoginResponse } from '@/types/user/user';
import { setToken, clearToken, setUserMeta } from '@/lib/auth/session';
import type {
  AuthResult,
  UserRole,
  VerifyEmailResponse,
  ResendVerificationResponse,
} from '@/types/auth';

function persistAuthResult(response: {
  user: { email: string; emailVerified: boolean; role: UserRole };
  tokens: { accessToken: string };
}): void {
  setToken(response.tokens.accessToken);
  setUserMeta({
    email: response.user.email,
    emailVerified: response.user.emailVerified,
    role: response.user.role,
  });
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    requireAuth: false,
  });

  persistAuthResult(response);
  return response;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const response = await apiFetch<AuthResult>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
    requireAuth: false,
  });

  persistAuthResult(response);
  return response;
}

export function logout(): void {
  clearToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  return apiFetch<VerifyEmailResponse>('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
    requireAuth: false,
  });
}

export async function resendVerification(email: string): Promise<ResendVerificationResponse> {
  return apiFetch<ResendVerificationResponse>('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
    requireAuth: false,
  });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
    requireAuth: false,
  });
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
    requireAuth: false,
  });
}
