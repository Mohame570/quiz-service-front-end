// types/auth.ts
//
// Mirrors the backend's auth.types.ts (SafeUser / AuthResult) so frontend
// and backend agree on shape. Follows the same convention as
// types/quiz/admin.ts: const object + derived union type for enums,
// plain `type` (not `interface`) for shapes.

export const USER_ROLE = {
  ADMIN: 'ADMIN',
  STUDENT: 'STUDENT',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export type SafeUser = {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string; // ISO string over JSON, not a Date object
  updatedAt: string;
};

export type AuthTokens = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
};

export type AuthResult = {
  user: SafeUser;
  tokens: AuthTokens;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

// POST /auth/verify-email response shape
export type VerifyEmailResponse = {
  success: boolean;
};

// POST /auth/resend-verification response shape
export type ResendVerificationResponse = {
  success: boolean;
};

// The three UI states this task asks for, modeled as a discriminated union
// so each state only carries the data it actually has.
export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  INVALID: 'INVALID',
} as const;

export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

export type VerificationState =
  | { status: typeof VERIFICATION_STATUS.PENDING }
  | { status: typeof VERIFICATION_STATUS.VERIFIED }
  | { status: typeof VERIFICATION_STATUS.INVALID; message: string };