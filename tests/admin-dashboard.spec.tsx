import { test, expect, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDashboardPage from '../src/pages/AdminDashboardPage';

const getAuth = vi.hoisted(() => vi.fn());
const getOverview = vi.hoisted(() => vi.fn());
const getUsers = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useAuth', () => ({ useAuth: getAuth }));
vi.mock('@/services/admin.service', () => ({ adminService: { getOverview, getUsers } }));

const renderPage = async () => render(
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter><AdminDashboardPage /></MemoryRouter>
  </QueryClientProvider>,
);

test('denies non-admin users', async () => {
  getAuth.mockReturnValue({ user: { role: 'TENANT' }, loading: false });
  const { getByText } = await renderPage();
  await expect(getByText(/administrator access required/i)).toBeInTheDocument();
});

test('lists users with subscription and ban controls', async () => {
  getAuth.mockReturnValue({ user: { role: 'ADMIN' }, loading: false });
  getOverview.mockResolvedValue({ users: { total: 1, active: 1, unverified: 0 }, reports: { total: 0, waiting: 0, generating: 0, ready: 0, failed: 0 }, orders: { total: 0, pending: 0, paid: 0, failed: 0, cancelled: 0 }, recentFailures: [] });
  getUsers.mockResolvedValue([{ userId: '1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', isActive: false, subscription: { status: 'ACTIVE', cancelAtPeriodEnd: false } }]);
  const { getByText, getByRole } = await renderPage();
  await expect(getByText('Ada Lovelace')).toBeInTheDocument();
  await expect(getByText('ada@example.com')).toBeInTheDocument();
  await expect(getByRole('cell', { name: 'ACTIVE' })).toBeInTheDocument();
  await expect(getByRole('button', { name: /unban/i })).toBeInTheDocument();
});

test('sorts users and paginates them by ten', async () => {
  getAuth.mockReturnValue({ user: { role: 'ADMIN' }, loading: false });
  getOverview.mockResolvedValue({ users: { total: 11, active: 11, unverified: 0 }, reports: { total: 0, waiting: 0, generating: 0, ready: 0, failed: 0 }, orders: { total: 0, pending: 0, paid: 0, failed: 0, cancelled: 0 }, recentFailures: [] });
  getUsers.mockResolvedValue(Array.from({ length: 11 }, (_, index) => ({
    userId: String(index),
    firstName: `User ${String(11 - index).padStart(2, '0')}`,
    lastName: 'Test',
    email: `user${index}@example.com`,
    isActive: true,
    subscription: null,
  })));
  const { getByLabelText, getByRole, getByText } = await renderPage();
  await expect(getByLabelText('Sort by')).toHaveValue('name');
  await expect(getByText('Page 1 of 2')).toBeInTheDocument();
  await expect(getByText('User 01 Test')).toBeInTheDocument();
  await expect(getByRole('button', { name: 'Next users page' })).toBeEnabled();
  await getByRole('button', { name: 'Next users page' }).click();
  await expect(getByText('Page 2 of 2')).toBeInTheDocument();
  await expect(getByText('User 11 Test')).toBeInTheDocument();
  await expect(getByRole('option', { name: 'Name (A-Z)' })).toBeInTheDocument();
  await expect(getByRole('option', { name: 'Subscription status' })).toBeInTheDocument();
  await expect(getByRole('option', { name: 'Ban / unban' })).toBeInTheDocument();
});

test('shows retry state when overview loading fails', async () => {
  getAuth.mockReturnValue({ user: { role: 'ADMIN' }, loading: false });
  getOverview.mockRejectedValueOnce(new Error('offline'));
  const { getByText, getByRole } = await renderPage();
  await expect(getByText(/overview could not be loaded/i)).toBeInTheDocument();
  await expect(getByRole('button', { name: /refresh/i })).toBeInTheDocument();
});
