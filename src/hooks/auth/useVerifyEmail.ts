/**
 * useVerifyEmail.ts
 *
 * Two mutation hooks for the email verification flow:
 *
 *   useVerifyEmail      → GET /auth/email/verify?email=&code=
 *   useResendVerification → POST /auth/email/verify/reset
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useToast } from '@/components/common/Toast';
import { extractApiError } from '@/utils/apiError';
import type { VerifyEmailRequest, ResendVerificationRequest } from '@/types/auth.types';

/** Submit the 6-digit verification code */
export const useVerifyEmail = () => {
  const { showToast } = useToast();

  return useMutation<void, unknown, VerifyEmailRequest>({
    mutationFn: authService.verifyEmail,
    onError: (error) => {
      showToast(extractApiError(error), 'error');
    },
  });
};

/** Request a new verification code (resend email) */
export const useResendVerification = () => {
  const { showToast } = useToast();

  return useMutation<void, unknown, ResendVerificationRequest>({
    mutationFn: authService.resendVerificationEmail,
    onSuccess: () => {
      showToast('Verification email resent. Please check your inbox.', 'success');
    },
    onError: (error) => {
      showToast(extractApiError(error), 'error');
    },
  });
};
