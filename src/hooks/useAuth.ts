/**
 * useAuth.ts
 *
 * Thin session-state orchestrator.
 *
 * Responsibilities (this hook only):
 *   - Read the current user from the React Query cache (via useCurrentUser)
 *   - Provide a logout function that clears tokens + cache
 *
 * Network calls for login / register / verify / etc. live in their own
 * dedicated hooks under hooks/auth/. This keeps concerns separated and
 * each hook independently testable.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './auth/useCurrentUser';
import { authService } from '@/services/auth.service';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryKeys';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loading } = useCurrentUser();

  const logout = async () => {
    const userId = user?.userId;
    try {
      if (userId) {
        await authService.logout(userId);
      }
    } finally {
      // Always clear local state, even if the server request fails.
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      // Set cached user to null and notify all subscribers so the UI
      // re-renders immediately (undefined is a no-op in React Query).
      queryClient.setQueryData(queryKeys.me, null);
    }
  };

  return {
    user: user ?? null,
    loading,
    isAuthenticated: !!user,
    logout,
  };
};
