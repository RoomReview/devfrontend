/**
 * useForgotPassword.ts
 *
 * Mutation hook for POST /auth/forgot-password.
 * On success: caller navigates to /password-reset-sent.
 * On error:   shows toast.
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useToast } from '@/components/common/Toast';
import { extractApiError } from '@/utils/apiError';
import type { ForgotPasswordRequest } from '@/types/auth.types';

export const useForgotPassword = () => {
  const { showToast } = useToast();

  return useMutation<void, unknown, ForgotPasswordRequest>({
    mutationFn: authService.forgotPassword,
    onError: (error) => {
      showToast(extractApiError(error), 'error');
    },
  });
};
