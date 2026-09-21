/**
 * useProperties.ts
 *
 * Query hook for GET /properties.
 * Cached for 5 minutes (staleTime). Used by the property listing page.
 */

import { useQuery } from '@tanstack/react-query';
import { propertyService } from '@/services/property.service';
import { queryKeys } from '@/lib/queryKeys';
import type { Property } from '@/types/property.types';

export const useProperties = () => {
  return useQuery<Property[]>({
    queryKey: queryKeys.properties,
    queryFn: propertyService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
