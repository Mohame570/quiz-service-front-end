// lib/api/admin/notifications.ts
//
// API client for admin email delivery monitoring endpoints.
// Backend: NotificationsAdminController
//   GET /api/admin/notifications/delivery-summary
//   GET /api/admin/notifications/invitation-status

import { apiFetch } from '@/lib/api/client';
import type {
  DeliverySummary,
  InvitationStatus,
  SendQuizInvitationResponse,
} from '@/types/notification/notification';

/** Fetch aggregated delivery stats + per-quiz invitation breakdown. */
export async function getDeliverySummary(): Promise<DeliverySummary> {
  return apiFetch<DeliverySummary>('/api/admin/notifications/delivery-summary');
}

/** Fetch per-quiz invitation delivery status breakdown. */
export async function getInvitationStatus(): Promise<InvitationStatus[]> {
  return apiFetch<InvitationStatus[]>('/api/admin/notifications/invitation-status');
}

/**
 * Email quiz invitations to one or more students. Only works for PUBLISHED quizzes.
 * `invitationUrl` is intentionally not accepted here - the backend default is correct
 * for every UI flow, so this signature has no field for a caller to misuse.
 */
export async function sendQuizInvitations(dto: {
  quizId: string;
  recipientEmails: string[];
}): Promise<SendQuizInvitationResponse> {
  return apiFetch<SendQuizInvitationResponse>('/api/admin/notifications/send-invitation', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}
