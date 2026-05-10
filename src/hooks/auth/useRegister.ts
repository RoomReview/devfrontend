/**
 * useRegister.ts
 *
 * React Query mutation hook for POST /auth/register.
 *
 * On success: caller navigates to /verify-email.
 * On error:   shows a toast with the API message.
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useToast } from '@/components/common/Toast';
import { extractApiError } from '@/utils/apiError';
import type { RegisterRequest, RegisterResponse } from '@/types/auth.types';

export const useRegister = () => {
  const { showToast } = useToast();

  return useMutation<RegisterResponse, unknown, RegisterRequest>({
    mutationFn: authService.register,
    onError: (error) => {
      showToast(extractApiError(error), 'error');
    },
  });
};
