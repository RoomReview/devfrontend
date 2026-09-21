/**
 * useCurrentUser.ts
 *
 * Query hook for GET /auth/me.
 *
 * Only runs when a token is present in localStorage.
 * staleTime: Infinity — the profile is considered fresh until the user
 * explicitly logs out or the token expires (interceptor handles the latter).
 *
 * Invalidate this query after login / logout:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.me })
 */

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { TOKEN_KEY } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryKeys';
import type { User } from '@/types/user.types';

export const useCurrentUser = () => {
  const hasToken = !!localStorage.getItem(TOKEN_KEY);

  return useQuery<User | null>({
    queryKey: queryKeys.me,
    queryFn: authService.getMe,
    enabled: hasToken,
    staleTime: Infinity,
    retry: false,          // don't retry /me — if it fails the token is invalid
  });
};
