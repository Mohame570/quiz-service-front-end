import { apiFetch } from '@/lib/api/client';

export type OrganizationSettings = {
  id: string;
  organizationName: string;
  timezoneLabel: string;
  defaultPassThreshold: number;
  defaultDurationMinutes: number;
  integrityReviewThreshold: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicSettings = {
  organizationName: string;
  timezoneLabel: string;
};

/**
 * Retrieves the current organization settings.
 * Requires ADMIN role.
 */
export async function getSettings(): Promise<OrganizationSettings> {
  return apiFetch<OrganizationSettings>('/api/admin/settings');
}

/**
 * Updates institutional defaults.
 * Requires ADMIN role.
 */
export async function updateSettings(
  settingsPayload: Partial<Omit<OrganizationSettings, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<OrganizationSettings> {
  return apiFetch<OrganizationSettings>('/api/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(settingsPayload),
  });
}

/**
 * Retrieves public-safe settings (e.g. timezone label) without requiring authentication.
 */
export async function getPublicSettings(): Promise<PublicSettings> {
  return apiFetch<PublicSettings>('/api/settings/public', {
    requireAuth: false,
  });
}
