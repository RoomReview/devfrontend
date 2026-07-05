/**
 * useBoroughs.ts
 *
 * Query hook for GET /boroughs.
 * Cached for 5 minutes. Borough data rarely changes so a generous staleTime
 * avoids unnecessary refetches.
 */

import { useQuery } from '@tanstack/react-query';
import { boroughService } from '@/services/borough.service';
import { queryKeys } from '@/lib/queryKeys';
import type { BoroughSummary } from '@/types/borough.types';

export const useBoroughs = () => {
  return useQuery<BoroughSummary[]>({
    queryKey: queryKeys.boroughs,
    queryFn: () => boroughService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
