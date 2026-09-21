/**
 * useProperty.ts
 *
 * Query hook for GET /properties/:id.
 * Only runs when a valid id is provided.
 */

import { useQuery } from '@tanstack/react-query';
import { propertyService } from '@/services/property.service';
import { queryKeys } from '@/lib/queryKeys';
import type { Property } from '@/types/property.types';

export const useProperty = (id: string | undefined) => {
  return useQuery<Property>({
    queryKey: queryKeys.property(id ?? ''),
    queryFn: () => propertyService.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
