export type AcceptInvitationResponse = {
  quizId: string;
  title: string;
  assigned: boolean;
  alreadyAssigned: boolean;
};

export type QuizInviteeStatus = 'PENDING' | 'CLAIMED' | 'EXPIRED';

export type QuizInvitee = {
  id: string;
  recipientEmail: string;
  status: QuizInviteeStatus;
  createdAt: string;
  claimedAt?: string | null;
  expiresAt?: string | null;
};

export type ReminderPreviewResponse = {
  quizId: string;
  count: number;
  recipients: string[];
};

export type SendRemindersResponse = {
  quizId: string;
  attempted: number;
  sent: number;
  failed: number;
  results: Array<{
    recipientEmail: string;
    status: string;
    errorMessage?: string | null;
  }>;
};
