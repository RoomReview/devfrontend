import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '../components/common/Button';
import { H1, H2, H3, Body, Small } from '../components/common/Typography';
import { paymentService, type BillingStatus } from '@/services/payment.service';
import { scoreReportService } from '@/services/score-report.service';
import type { UserScoreReport } from '@/services/score-report.service';

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [reports, setReports] = useState<UserScoreReport[]>([]);
  const [reportPage, setReportPage] = useState(1);
  const [reportPageCount, setReportPageCount] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [orderActionId, setOrderActionId] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const earlyAccessDaysRemaining = billing?.trial.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(billing.trial.trialEndsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  useEffect(() => {
    if (!isAuthenticated) return;
    setHistoryLoading(true);
    setHistoryError(null);
    void Promise.all([scoreReportService.listMine(reportPage, 5), paymentService.getBilling()])
      .then(([reportHistory, billingStatus]) => {
        setReports(reportHistory.reports);
        setReportPageCount(reportHistory.pagination.totalPages);
        setBilling(billingStatus);
      })
      .catch(() => setHistoryError('We could not load your reports. Please try again.'))
      .finally(() => setHistoryLoading(false));
  }, [isAuthenticated, historyRefreshKey, reportPage]);

  const retryReport = async (report: UserScoreReport) => {
    setOrderActionId(report.scoreReportId);
    try {
      if (report.order && (report.order.status === 'FAILED' || report.order.status === 'CANCELLED')) {
        const checkout = await paymentService.createCheckout(report.scoreReportId);
        if (checkout.checkoutUrl) window.location.assign(checkout.checkoutUrl);
      } else if (report.status === 'FAILED') {
        await scoreReportService.generate(report.scoreReportId);
        setHistoryRefreshKey((current) => current + 1);
      } else {
        setHistoryRefreshKey((current) => current + 1);
      }
    } catch {
      setHistoryError('That action could not be completed. Please try again.');
    } finally {
      setOrderActionId(null);
    }
  };

  const deleteReport = async (report: UserScoreReport) => {
    const confirmed = window.confirm('Remove this report from your saved reports? Its credit and payment history will be retained.');
    if (!confirmed) return;

    setOrderActionId(`${report.scoreReportId}:delete`);
    try {
      await scoreReportService.delete(report.scoreReportId);
      if (reports.length === 1 && reportPage > 1) {
        setReportPage((page) => Math.max(1, page - 1));
      }
      setHistoryRefreshKey((current) => current + 1);
    } catch {
      setHistoryError('That report could not be deleted. Please try again.');
    } finally {
      setOrderActionId(null);
    }
  };

  const openSavedReport = async (report: UserScoreReport, action: 'print' | 'download') => {
    setOrderActionId(`${report.scoreReportId}:${action}`);
    try {
      const savedReport = await scoreReportService.get(report.scoreReportId);
      const reportData = savedReport.reportData;

      if (reportData?.reportType === 'buyer') {
        navigate('/report/view', { state: { reportData, printAfterLoad: action === 'print', downloadAfterLoad: action === 'download' } });
      } else if (reportData?.reportType === 'investor') {
        navigate('/investor-report/view', { state: { reportData, printAfterLoad: action === 'print', downloadAfterLoad: action === 'download' } });
      } else {
        throw new Error('This saved report does not contain its full visual snapshot.');
      }
    } catch {
      setHistoryError('That report could not be opened for PDF. Please try again.');
    } finally {
      setOrderActionId(null);
    }
  };

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
            {user?.role === 'ADMIN' && <Link to="/admin" className="inline-flex"><Button variant="secondary">Admin monitoring</Button></Link>}
            <Button variant="secondary" onClick={logout}>
              Sign out
            </Button>
            <Link to="/area-search" className="inline-flex">
              <Button variant="primary">Search areas</Button>
            </Link>
          </div>
        </div>

        {user?.isEmailVerified === false && (
          <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            Please verify your email address to secure your account.{' '}
            <Link
              to={`/verify-email?email=${encodeURIComponent(user.email)}&type=user`}
              className="font-semibold underline"
            >
              Continue to email verification
            </Link>
          </div>
        )}

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
                    ? user?.role === 'TENANT'
                      ? `Early access: ${earlyAccessDaysRemaining} ${earlyAccessDaysRemaining === 1 ? 'day' : 'days'} left. Three free branded reports are included.`
                      : `Your free trial ends ${billing.trial.trialEndsAt ? new Date(billing.trial.trialEndsAt).toLocaleDateString() : 'soon'}.`
                    : (billing?.creditsBalance ?? 0) > 0
                      ? 'You have report credits available to use.'
                    : 'Your free trial has ended. Choose the monthly report plan to continue.'}
              </Body>
              <p className="mt-2 text-sm font-semibold text-[#1A2B3C]">Available reports: {billing?.creditsBalance ?? 0}</p>
              {billing?.subscription?.status !== 'ACTIVE' && (
                <Button className="mt-4" isLoading={subscriptionLoading} onClick={() => void startSubscription()}>
                  10 reports per month - £35/month
                </Button>
              )}
            </div>
            <div className="rounded-[24px] border border-[#E5DCD5] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <H3 className="text-[#1A2B3C] mb-3">My reports</H3>
                {!historyLoading && <Button size="sm" variant="secondary" onClick={() => setHistoryRefreshKey((current) => current + 1)}>Refresh</Button>}
              </div>
              {historyError ? (
                <div className="space-y-3">
                  <Body className="text-[#8B0202]">{historyError}</Body>
                  <Button size="sm" onClick={() => setHistoryRefreshKey((current) => current + 1)}>Try again</Button>
                </div>
              ) : historyLoading ? <Body>Loading your reports...</Body> : reports.length === 0 ? <Body>No saved reports yet.</Body> : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div key={report.scoreReportId} className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5DCD5] pt-3 text-sm">
                      <div>
                        <p className="font-semibold text-[#1A2B3C]">{report.name || `Report ${report.scoreReportId.slice(0, 8)}`}</p>
                        <p className="text-[#6B7280]">{report.order ? `Payment: ${report.order.status} · ` : ''}Report: {report.status} · {new Date(report.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {report.status === 'READY' && report.hasFullReport && (
                          <>
                            <Button size="sm" variant="secondary" isLoading={orderActionId === `${report.scoreReportId}:print`} onClick={() => void openSavedReport(report, 'print')}>Print</Button>
                            <Button size="sm" isLoading={orderActionId === `${report.scoreReportId}:download`} onClick={() => void openSavedReport(report, 'download')}>Download PDF</Button>
                          </>
                        )}
                        <Button size="sm" variant="secondary" isLoading={orderActionId === `${report.scoreReportId}:delete`} onClick={() => void deleteReport(report)} aria-label={`Delete ${report.name || `report ${report.scoreReportId.slice(0, 8)}`}`}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Delete
                        </Button>
                        {report.status === 'READY' && !report.hasFullReport && <Small className="text-[#8B0202]">Regenerate for full visual PDF</Small>}
                        {report.order && (report.order.status === 'FAILED' || report.order.status === 'CANCELLED') && <Button size="sm" isLoading={orderActionId === report.scoreReportId} onClick={() => void retryReport(report)}>Retry payment</Button>}
                        {(!report.order || report.order.status === 'PAID') && report.status !== 'READY' && <Button size="sm" variant="secondary" isLoading={orderActionId === report.scoreReportId} onClick={() => void retryReport(report)}>{report.status === 'FAILED' ? 'Retry report' : 'Refresh status'}</Button>}
                      </div>
                    </div>
                  ))}
                  {reportPageCount > 1 && (
                    <div className="flex items-center justify-between border-t border-[#E5DCD5] pt-3">
                      <Button size="sm" variant="secondary" disabled={reportPage <= 1 || historyLoading} onClick={() => setReportPage((page) => Math.max(1, page - 1))}>Previous</Button>
                      <Small aria-live="polite">Page {reportPage} of {reportPageCount}</Small>
                      <Button size="sm" variant="secondary" disabled={reportPage >= reportPageCount || historyLoading} onClick={() => setReportPage((page) => Math.min(reportPageCount, page + 1))}>Next</Button>
                    </div>
                  )}
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
