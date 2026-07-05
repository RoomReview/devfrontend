/**
 * useBorough.ts
 *
 * Query hook for GET /boroughs/:id.
 * Cached for 5 minutes.
 */

import { useQuery } from '@tanstack/react-query';
import { boroughService } from '@/services/borough.service';
import { queryKeys } from '@/lib/queryKeys';
import type { Borough } from '@/types/borough.types';

export const useBorough = (id: string | undefined) => {
  return useQuery<Borough>({
    queryKey: id ? queryKeys.borough(id) : ['boroughs', 'detail', 'none'],
    queryFn: () => {
      if (!id) throw new Error('Borough ID is required');
      return boroughService.getById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
