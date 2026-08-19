/**
 * useReviews.ts
 *
 * Query hook for GET /reviews (all) and optionally filtered by property.
 *
 * useReviews()                   → all reviews
 * usePropertyReviews(propertyId) → reviews for a specific property
 */

import { useQuery } from '@tanstack/react-query';
import { reviewService } from '@/services/review.service';
import { queryKeys } from '@/lib/queryKeys';
import type { Review } from '@/types/review.types';

/** All reviews */
export const useReviews = () => {
  return useQuery<Review[]>({
    queryKey: queryKeys.reviews,
    queryFn: reviewService.getAll,
    staleTime: 1000 * 60 * 2, // 2 minutes — reviews update more frequently
  });
};

/**
 * Reviews scoped to a single property.
 * NOTE: This uses the same getAll until the backend exposes a filtered endpoint.
 * Update the queryFn when /reviews?propertyId= is available.
 */
export const usePropertyReviews = (propertyId: string | undefined) => {
  return useQuery<Review[]>({
    queryKey: queryKeys.propertyReviews(propertyId ?? ''),
    queryFn: reviewService.getAll, // TODO: replace with filtered endpoint
    enabled: !!propertyId,
    staleTime: 1000 * 60 * 2,
    select: (reviews) =>
      reviews.filter((r) => r.propertyId === propertyId),
  });
};
