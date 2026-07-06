export function getSafeRedirectPath(
  redirect: string | null | undefined,
): string | null {
  if (!redirect) return null;
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return null;
  if (redirect.includes('://')) return null;
  return redirect;
}

export function getPostAuthDestination(
  user: { role: string; emailVerified: boolean } | null,
  redirect: string | null | undefined,
): string {
  const safeRedirect = getSafeRedirectPath(redirect);
  if (safeRedirect) return safeRedirect;

  if (!user) return '/student';

  if (user.role === 'ADMIN') return '/admin/dashboard';
  if (!user.emailVerified) return '/verify-email';
  return '/student';
}
