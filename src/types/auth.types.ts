/**
 * auth.types.ts
 *
 * All auth-related request and response types.
 * Field names match the backend DTOs exactly (auth.dto.ts, RegisterUserDto, etc.)
 */

import type { UserRole } from './user.types';

// ── Requests ──────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  /** Required when role is AGENCY */
  agencyName?: string;
  agencyDescription?: string;
  agencyEmail?: string;
  agencyPhone?: string;
  agencyWebsite?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface RefreshTokenRequest {
  userId: string;
  refreshToken: string;
}

// ── Responses ─────────────────────────────────────────────────────────────────

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  sessionId: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  role: UserRole;
}

export interface AuthLoginResponse {
  data: {
    session: AuthSession;
    user: AuthUser;
  };
}

export interface RegisterResponse {
  data: {
    userId: string;
    email: string;
  };
}

export interface RefreshResponse {
  data: {
    session: AuthSession;
  };
}
