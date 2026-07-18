/**
 * useLogin.ts
 *
 * React Query mutation hook for POST /auth/login.
 *
 * Responsibilities:
 *   - Call authService.login
 *   - On success: persist tokens to localStorage
 *   - On error: show toast with the API error message
 *
 * The hook does NOT navigate — the caller (LoginPage) handles that in
 * its own onSuccess callback so navigation logic stays in the page layer.
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useToast } from '@/components/common/Toast';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/apiClient';
import { extractApiError } from '@/utils/apiError';
import type { LoginRequest, AuthLoginResponse } from '@/types/auth.types';

export const useLogin = () => {
  const { showToast } = useToast();

  return useMutation<AuthLoginResponse, unknown, LoginRequest>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      localStorage.setItem(TOKEN_KEY, data.data.session.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.data.session.refreshToken);
    },
    onError: (error) => {
      showToast(extractApiError(error), 'error');
    },
  });
};
