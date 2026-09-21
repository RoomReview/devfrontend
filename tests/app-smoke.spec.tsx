import { test, expect } from 'vitest';
import { render } from 'vitest-browser-react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../src/App';

test('renders the application shell at the configured viewport', async () => {
  localStorage.clear();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { getByRole } = await render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );

  await expect(getByRole('link', { name: /RoomReview\.co\.uk/i })).toBeInTheDocument();
  const menu = getByRole('button', { name: /menu/i });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(getByRole('link', { name: 'Postcode', exact: true }).last()).toBeVisible();
});
