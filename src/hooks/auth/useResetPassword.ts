/**
 * useResetPassword.ts
 *
 * Mutation hook for POST /auth/reset-password.
 * On success: caller navigates to /password-reset-success.
 * On error:   shows toast.
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useToast } from '@/components/common/Toast';
import { extractApiError } from '@/utils/apiError';
import type { ResetPasswordRequest } from '@/types/auth.types';

export const useResetPassword = () => {
  const { showToast } = useToast();

  return useMutation<void, unknown, ResetPasswordRequest>({
    mutationFn: authService.resetPassword,
    onError: (error) => {
      showToast(extractApiError(error), 'error');
    },
  });
};
