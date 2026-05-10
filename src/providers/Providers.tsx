/**
 * Providers.tsx
 *
 * Global provider tree. Add any new providers here, not in main.tsx.
 *
 * QueryClient defaults:
 *   - staleTime 5 min      → don't refetch fresh data unnecessarily
 *   - gcTime 10 min        → keep unused data in cache for a while
 *   - retry 1              → one automatic retry on network failure
 *   - refetchOnWindowFocus false → don't hammer the server on tab switch
 */

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../components/common/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes
      gcTime: 1000 * 60 * 10,     // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default Providers;
