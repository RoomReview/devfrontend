import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '../components/common/Button';
import { H1, H2, H3, Body, Small } from '../components/common/Typography';
import { paymentService, type BillingStatus, type ReportOrder } from '@/services/payment.service';

const AccountPage = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [orders, setOrders] = useState<ReportOrder[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setHistoryLoading(true);
    void Promise.all([paymentService.getOrderHistory(), paymentService.getBilling()])
      .then(([orderHistory, billingStatus]) => { setOrders(orderHistory); setBilling(billingStatus); })
      .finally(() => setHistoryLoading(false));
  }, [isAuthenticated]);

  const startSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      const checkoutUrl = await paymentService.createSubscriptionCheckout();
      if (checkoutUrl) window.location.assign(checkoutUrl);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 py-16">
        <p className="text-lg font-semibold text-[#1A2B3C]">Loading your account...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-[30px] border border-[#E5DCD5] bg-[#F8F4F1] p-10 text-center">
          <H2 className="text-[#1A2B3C] mb-4">Welcome back</H2>
          <Body className="text-[#0B0B0B] mb-6">
            Sign in or create an account to manage your saved searches, reviews and profile details.
          </Body>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="w-full sm:w-auto">
              <Button className="w-full" variant="primary">
                Sign in
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button className="w-full" variant="secondary">
                Create account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <H1 className="text-[#1A2B3C]">My account</H1>
            <Body className="mt-3 text-[#0B0B0B] leading-8">
              Manage your profile, saved searches and review activity in one place.
            </Body>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={logout}>
              Sign out
            </Button>
            <Link to="/area-search" className="inline-flex">
              <Button variant="primary">Search areas</Button>
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[30px] border border-[#E5DCD5] bg-[#F8F4F1] p-8">
            <H2 className="text-[#1A2B3C] mb-4">Profile details</H2>
            <div className="space-y-4 text-[#0B0B0B]">
              <div>
                <Small className="block text-[#8B0202] uppercase tracking-[0.2em] mb-2">Name</Small>
                <Body>{user?.firstName} {user?.lastName}</Body>
              </div>
              <div>
                <Small className="block text-[#8B0202] uppercase tracking-[0.2em] mb-2">Email</Small>
                <Body>{user?.email}</Body>
              </div>
              <div>
                <Small className="block text-[#8B0202] uppercase tracking-[0.2em] mb-2">Role</Small>
                <Body>{user?.role === 'TENANT' ? 'User' : user?.role ?? 'User'}</Body>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[24px] border border-[#E5DCD5] bg-[#FFF9F0] p-6 shadow-sm">
              <H3 className="text-[#1A2B3C] mb-3">Report plan</H3>
              <Body>
                {billing?.subscription?.status === 'ACTIVE'
                  ? 'Your subscription is active: 10 reports per month.'
                  : billing?.trialActive
                    ? `Your free trial ends ${billing.trial.trialEndsAt ? new Date(billing.trial.trialEndsAt).toLocaleDateString() : 'soon'}.`
                    : 'Your free trial has ended. Choose the monthly report plan to continue.'}
              </Body>
              <p className="mt-2 text-sm font-semibold text-[#1A2B3C]">Available report credits: {billing?.creditsBalance ?? 0}</p>
              {billing?.subscription?.status !== 'ACTIVE' && (
                <Button className="mt-4" isLoading={subscriptionLoading} onClick={() => void startSubscription()}>
                  10 reports per month - £35/month
                </Button>
              )}
            </div>
            <div className="rounded-[24px] border border-[#E5DCD5] bg-white p-6 shadow-sm">
              <H3 className="text-[#1A2B3C] mb-3">Report orders</H3>
              {historyLoading ? <Body>Loading your orders...</Body> : orders.length === 0 ? <Body>No report orders yet.</Body> : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.orderId} className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5DCD5] pt-3 text-sm">
                      <div>
                        <p className="font-semibold text-[#1A2B3C]">Report {order.scoreReportId.slice(0, 8)}</p>
                        <p className="text-[#6B7280]">Payment: {order.status} · Report: {order.reportStatus ?? 'WAITING'} · {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      {order.status === 'PAID' && order.reportStatus === 'READY' && <Button size="sm" onClick={() => void paymentService.downloadReport(order.scoreReportId)}>Download PDF</Button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {[
              {
                title: 'Saved searches',
                description: 'View your most recent saved neighbourhood or postcode searches.',
              },
              {
                title: 'My reviews',
                description: 'Track review submissions and update the places you’ve shared feedback about.',
              },
              {
                title: 'Account settings',
                description: 'Change your password, email preferences and notification settings.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-[#E5DCD5] bg-white p-6 shadow-sm">
                <H3 className="text-[#1A2B3C] mb-3">{item.title}</H3>
                <Body>{item.description}</Body>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
