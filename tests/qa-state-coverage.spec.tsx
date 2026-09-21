import { test, expect, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MemoryRouter } from 'react-router-dom';

const getAuth = vi.hoisted(() => vi.fn());
const getOrderHistory = vi.hoisted(() => vi.fn());
const getBilling = vi.hoisted(() => vi.fn());
const previewReport = vi.hoisted(() => vi.fn());
const createReport = vi.hoisted(() => vi.fn());
const generateReport = vi.hoisted(() => vi.fn());
const confirmCheckout = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useAuth', () => ({
  useAuth: getAuth,
}));

vi.mock('@/services/payment.service', () => ({
  paymentService: {
    getOrderHistory,
    getBilling,
    createCheckout: vi.fn(),
    createSubscriptionCheckout: vi.fn(),
    downloadReport: vi.fn(),
    confirmCheckout,
  },
}));

vi.mock('@/services/score-report.service', () => ({
  scoreReportService: {
    preview: previewReport,
    create: createReport,
    generate: generateReport,
  },
}));

import AccountPage from '../src/pages/AccountPage';
import CheckoutSuccessPage from '../src/pages/CheckoutSuccessPage';
import ScoreReportPanel from '../src/components/score-reports/ScoreReportPanel';

const mockBilling = {
  trial: { trialStartedAt: null, trialEndsAt: null },
  trialActive: false,
  creditsBalance: 0,
  subscription: null,
};

const renderAccountPage = () => render(
  <MemoryRouter>
    <AccountPage />
  </MemoryRouter>,
);

test('account page shows an empty state when the user has no report orders', async () => {
  getAuth.mockReturnValue({
    user: { userId: 'user-1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', role: 'TENANT' },
    loading: false,
    isAuthenticated: true,
    logout: vi.fn(),
  });
  getOrderHistory.mockResolvedValue([]);
  getBilling.mockResolvedValue(mockBilling);

  const { getByText } = await renderAccountPage();

  await expect(getByText('No report orders yet.')).toBeInTheDocument();
});

test('account page surfaces a retryable error when order history fails to load', async () => {
  getAuth.mockReturnValue({
    user: { userId: 'user-1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', role: 'TENANT' },
    loading: false,
    isAuthenticated: true,
    logout: vi.fn(),
  });
  getOrderHistory.mockRejectedValue(new Error('offline'));
  getBilling.mockResolvedValue(mockBilling);

  const { getByText, getByRole } = await renderAccountPage();

  await expect(getByText('We could not load your order history. Please try again.')).toBeInTheDocument();
  await expect(getByRole('button', { name: /try again/i })).toBeInTheDocument();
});

test('score report panel shows a failure state when the preview request errors', async () => {
  previewReport.mockRejectedValue(new Error('preview failed'));

  const { container } = await render(
    <MemoryRouter>
      <ScoreReportPanel boroughId="borough-1" postcodeId="postcode-1" boroughName="Brixton" postcodeCode="SW9 6DE" />
    </MemoryRouter>,
  );

  const matches = Array.from(container.querySelectorAll('span, p')).filter((node) =>
    node.textContent?.toLowerCase().includes("we couldn't generate the report. please try again."),
  );

  await expect(matches.length).toBeGreaterThan(0);
});

test('checkout success page shows an actionable error when payment confirmation is missing', async () => {
  confirmCheckout.mockRejectedValue(new Error('Confirmation failed'));

  const { getByText } = await render(
    <MemoryRouter initialEntries={['/checkout/success']}>
      <CheckoutSuccessPage />
    </MemoryRouter>,
  );

  await expect(getByText('We could not confirm this payment')).toBeInTheDocument();
  await expect(getByText(/please open your account/i)).toBeInTheDocument();
});
