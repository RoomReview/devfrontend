/**
 * auth.service.ts
 *
 * Pure async functions for every auth endpoint.
 * No state, no hooks — just HTTP calls via apiClient.
 *
 * Endpoint reference (backend auth.routes.ts):
 *   POST   /auth/register
 *   POST   /auth/login
 *   POST   /auth/logout
 *   GET    /auth/me
 *   POST   /auth/forgot-password
 *   POST   /auth/reset-password
 *   GET    /auth/email/verify?email=&code=
 *   POST   /auth/email/verify/reset
 *   POST   /auth/refresh
 */

import apiClient from '@/lib/apiClient';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  AuthLoginResponse,
  RegisterResponse,
} from '@/types/auth.types';
import type { User } from '@/types/user.types';

export const authService = {
  /** POST /auth/login */
  login: async (credentials: LoginRequest): Promise<AuthLoginResponse> => {
    const response = await apiClient.post<AuthLoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /** POST /auth/register */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  /** POST /auth/logout */
  logout: async (userId: string): Promise<void> => {
    await apiClient.post('/auth/logout', { userId });
  },

  /** GET /auth/me — returns the currently authenticated user */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<{ data: User }>('/auth/me');
    return response.data.data;
  },

  /** POST /auth/forgot-password */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data);
  },

  /** POST /auth/reset-password */
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },

  /** GET /auth/email/verify?email=&code= */
  verifyEmail: async (data: VerifyEmailRequest): Promise<void> => {
    await apiClient.get('/auth/email/verify', {
      params: { email: data.email, code: data.code },
    });
  },

  /** POST /auth/email/verify/reset — resend verification email */
  resendVerificationEmail: async (data: ResendVerificationRequest): Promise<void> => {
    await apiClient.post('/auth/email/verify/reset', data);
  },
};
