/**
 * useCreateReview.ts
 *
 * Mutation hook for POST /reviews.
 * On success: invalidates the reviews cache so lists refresh automatically.
 * On error:   shows toast.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/review.service';
import { useToast } from '@/components/common/Toast';
import { extractApiError } from '@/utils/apiError';
import { queryKeys } from '@/lib/queryKeys';
import type { CreateReviewRequest, Review } from '@/types/review.types';

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<Review, unknown, CreateReviewRequest>({
    mutationFn: reviewService.create,
    onSuccess: (newReview) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
      queryClient.invalidateQueries({
        queryKey: queryKeys.propertyReviews(newReview.propertyId),
      });
      showToast('Review submitted successfully.', 'success');
    },
    onError: (error) => {
      showToast(extractApiError(error), 'error');
    },
  });
};
