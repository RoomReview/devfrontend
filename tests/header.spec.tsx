import { test, expect } from 'vitest';
import { render } from 'vitest-browser-react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from '../src/components/layout/Header';

test('renders a mobile menu button', async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const { getByRole } = await render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <Header />
      </QueryClientProvider>
    </MemoryRouter>
  );

  await expect(getByRole('button', { name: /menu/i })).toBeInTheDocument();
});
