import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useMyReviews } from '@/hooks/reviews/useReviews';
import { reviewService } from '@/services/review.service';
import { queryKeys } from '@/lib/queryKeys';
import Button from '../components/common/Button';
import { H1, H2, H3, Body, Small } from '../components/common/Typography';
import { paymentService, type BillingStatus } from '@/services/payment.service';
import { scoreReportService } from '@/services/score-report.service';
import type { UserScoreReport } from '@/services/score-report.service';
import { savedSearchService, type SavedSearch } from '@/services/saved-search.service';
import { teamService, type TeamDetails } from '@/services/team.service';
import { postcodePath } from '@/utils/helpers';

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { data: myReviews = [], isLoading: reviewsLoading, isError: reviewsLoadFailed, refetch: refetchReviews } = useMyReviews(user?.userId);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [reviewActionError, setReviewActionError] = useState<string | null>(null);
  const [reports, setReports] = useState<UserScoreReport[]>([]);
  const [reportPage, setReportPage] = useState(1);
  const [reportPageCount, setReportPageCount] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [orderActionId, setOrderActionId] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedSearchesLoading, setSavedSearchesLoading] = useState(false);
  const [savedSearchesError, setSavedSearchesError] = useState<string | null>(null);
  const [removingSavedSearchId, setRemovingSavedSearchId] = useState<string | null>(null);
  const [teamManagementOpen, setTeamManagementOpen] = useState(false);
  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamSuccess, setTeamSuccess] = useState<string | null>(null);
  const [invitationEmail, setInvitationEmail] = useState('');
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const earlyAccessDaysRemaining = billing?.trial.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(billing.trial.trialEndsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;
  const canManageTeam = user?.role === 'AGENCY' || user?.role === 'AGENT';

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

  useEffect(() => {
    if (!isAuthenticated) return;
    setSavedSearchesLoading(true);
    setSavedSearchesError(null);
    void savedSearchService.list()
      .then(setSavedSearches)
      .catch(() => setSavedSearchesError('We could not load your saved searches. Please try again.'))
      .finally(() => setSavedSearchesLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !teamManagementOpen || !canManageTeam) return;
    setTeamLoading(true);
    setTeamError(null);
    void teamService.getTeam()
      .then(setTeam)
      .catch(() => setTeamError('We could not load your team. Please try again.'))
      .finally(() => setTeamLoading(false));
  }, [canManageTeam, isAuthenticated, teamManagementOpen]);

  const refreshTeam = async () => {
    const updatedTeam = await teamService.getTeam();
    setTeam(updatedTeam);
  };

  const inviteTeamMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendingInvitation(true);
    setTeamError(null);
    setTeamSuccess(null);
    try {
      await teamService.invite(invitationEmail);
      setInvitationEmail('');
      setTeamSuccess('Invitation sent successfully.');
      try {
        await refreshTeam();
      } catch {
        setTeamError('The invitation was sent, but we could not refresh the team list.');
      }
    } catch (error) {
      setTeamError(error instanceof Error ? error.message : 'We could not send the invitation. Please try again.');
    } finally {
      setSendingInvitation(false);
    }
  };

  const removeTeamMember = async (memberUserId: string) => {
    if (!window.confirm('Remove this person from your team?')) return;
    setTeamError(null);
    setTeamSuccess(null);
    try {
      await teamService.removeMember(memberUserId);
      setTeamSuccess('Team member removed.');
      try {
        await refreshTeam();
      } catch {
        setTeamError('The member was removed, but we could not refresh the team list.');
      }
    } catch (error) {
      setTeamError(error instanceof Error ? error.message : 'We could not remove this team member.');
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    setTeamError(null);
    setTeamSuccess(null);
    try {
      await teamService.revokeInvitation(invitationId);
      setTeamSuccess('Invitation revoked.');
      try {
        await refreshTeam();
      } catch {
        setTeamError('The invitation was revoked, but we could not refresh the team list.');
      }
    } catch (error) {
      setTeamError(error instanceof Error ? error.message : 'We could not revoke this invitation.');
    }
  };

  const removeSavedSearch = async (search: SavedSearch) => {
    setRemovingSavedSearchId(search.savedSearchId);
    setSavedSearchesError(null);
    try {
      await savedSearchService.remove(search.savedSearchId);
      setSavedSearches((current) => current.filter((item) => item.savedSearchId !== search.savedSearchId));
    } catch {
      setSavedSearchesError(`We could not remove ${search.postcode}. Please try again.`);
    } finally {
      setRemovingSavedSearchId(null);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;

    setDeletingReviewId(reviewId);
    setReviewActionError(null);
    try {
      await reviewService.delete(reviewId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.myReviews });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
    } catch {
      setReviewActionError('We could not delete this review. Please try again.');
    } finally {
      setDeletingReviewId(null);
    }
  };

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
      const checkoutUrl = await paymentService.createSubscriptionCheckout('individual');
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
                  ? `Your subscription adds ${billing.monthlyReportAllowance} shared reports each month. Unused reports roll over.`
                  : user?.role === 'AGENCY' || user?.role === 'AGENT'
                    ? 'Early access includes three reports. Get 50% off your first paid month, then renew at the full price.'
                  : billing?.trialActive
                    ? user?.role === 'TENANT'
                      ? `Early access: ${earlyAccessDaysRemaining} ${earlyAccessDaysRemaining === 1 ? 'day' : 'days'} left. Three free branded reports are included.`
                      : `Your free trial ends ${billing.trial.trialEndsAt ? new Date(billing.trial.trialEndsAt).toLocaleDateString('en-GB') : 'soon'}.`
                    : (billing?.creditsBalance ?? 0) > 0
                      ? 'You have report credits available to use.'
                    : 'Your free trial has ended. Choose the monthly report plan to continue.'}
              </Body>
              <p className="mt-2 text-sm font-semibold text-[#1A2B3C]">
                Available {canManageTeam ? 'shared ' : ''}reports: {billing?.creditsBalance ?? 0}
                {billing?.subscription?.status === 'ACTIVE'
                  ? ` · ${billing.monthlyReportAllowance} added monthly`
                  : ''}
              </p>
              {billing?.earlyAccessDiscountEligible && (
                <p className="mt-2 text-sm font-semibold text-[#A20B0B]">
                  Early access offer: 50% off your first paid month, then £35/month.
                </p>
              )}
              {billing?.subscription?.status !== 'ACTIVE' && (
                <Button
                  className="mt-4"
                  isLoading={subscriptionLoading}
                  onClick={() => {
                    if (canManageTeam) {
                      navigate('/pricing');
                      return;
                    }
                    void startSubscription();
                  }}
                >
                  {canManageTeam
                    ? 'Choose an Agency and Agent plan'
                    : billing?.earlyAccessDiscountEligible
                    ? 'First month £17.50, then £35/month'
                    : '20 reports per month - £35/month'}
                </Button>
              )}
            </div>
            {canManageTeam && (
              <div className="rounded-[24px] border border-[#E5DCD5] bg-white p-6 shadow-sm">
                <label className="flex cursor-pointer items-center gap-3 text-[#1A2B3C]">
                  <input
                    type="checkbox"
                    checked={teamManagementOpen}
                    onChange={(event) => {
                      setTeamManagementOpen(event.target.checked);
                      setTeamError(null);
                      setTeamSuccess(null);
                    }}
                    className="h-4 w-4 accent-[#8B0202]"
                  />
                  <span className="font-semibold">Agency and Agent team</span>
                </label>

                {teamManagementOpen && (
                  <div className="mt-5 space-y-5">
                    <div>
                      <H3 className="text-[#1A2B3C]">Manage {team?.agencyName ?? 'your'} team</H3>
                      <Body className="mt-2">
                        The founder is not counted. Invited members and pending invitations use subscription seats.
                      </Body>
                      {team && (
                        <p className="mt-2 text-sm font-semibold text-[#1A2B3C]">
                          Seats used: {team.usedSeats} / {team.seatLimit}
                        </p>
                      )}
                    </div>

                    {teamError && <Body className="text-[#8B0202]" role="alert">{teamError}</Body>}
                    {teamSuccess && <Body className="text-green-700" role="status">{teamSuccess}</Body>}
                    {teamLoading ? (
                      <Body>Loading team...</Body>
                    ) : (
                      <>
                        {team?.seatLimit === 0 && (
                          <Body className="text-[#8B0202]">
                            An active team subscription is required to invite people.{' '}
                            <Link to="/pricing" className="font-semibold underline">View plans</Link>
                          </Body>
                        )}
                        <form onSubmit={(event) => void inviteTeamMember(event)} className="flex flex-col gap-3 sm:flex-row">
                          <input
                            type="email"
                            required
                            maxLength={254}
                            value={invitationEmail}
                            onChange={(event) => setInvitationEmail(event.target.value)}
                            placeholder="Person's email address"
                            aria-label="Person's email address"
                            className="min-w-0 flex-1 rounded-lg border border-[#D8CEC6] px-3 py-2 text-sm"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            disabled={sendingInvitation || !team || team.availableSeats < 1}
                            isLoading={sendingInvitation}
                          >
                            Send invite
                          </Button>
                        </form>

                        {(team?.members.length ?? 0) > 0 && (
                          <div>
                            <H3 className="text-[#1A2B3C]">Team members</H3>
                            <ul className="mt-3 divide-y divide-[#E5DCD5]">
                              {team?.members.map((member) => (
                                <li key={member.userId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                  <div className="text-sm">
                                    <p className="font-semibold text-[#1A2B3C]">{member.firstName} {member.lastName}</p>
                                    <p className="text-gray-600">{member.email}</p>
                                  </div>
                                  <Button size="sm" variant="secondary" onClick={() => void removeTeamMember(member.userId)}>
                                    Remove
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {(team?.invitations.length ?? 0) > 0 && (
                          <div>
                            <H3 className="text-[#1A2B3C]">Pending invitations</H3>
                            <ul className="mt-3 divide-y divide-[#E5DCD5]">
                              {team?.invitations.map((invitation) => (
                                <li key={invitation.invitationId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                  <div className="text-sm">
                                    <p className="font-semibold text-[#1A2B3C]">{invitation.email}</p>
                                    <p className="text-gray-600">Expires {new Date(invitation.expiresAt).toLocaleDateString('en-GB')}</p>
                                  </div>
                                  <Button size="sm" variant="secondary" onClick={() => void revokeInvitation(invitation.invitationId)}>
                                    Revoke
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
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
            <div className="rounded-[24px] border border-[#E5DCD5] bg-white p-6 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <H3 className="text-[#1A2B3C]">Saved searches</H3>
                <Link to="/postcode-search" className="text-sm font-semibold text-[#8B0202] underline">Find a postcode</Link>
              </div>
              {savedSearchesError ? (
                <div className="space-y-3">
                  <Body className="text-[#8B0202]">{savedSearchesError}</Body>
                  <Button size="sm" variant="secondary" onClick={() => {
                    setSavedSearchesLoading(true);
                    void savedSearchService.list()
                      .then((items) => {
                        setSavedSearches(items);
                        setSavedSearchesError(null);
                      })
                      .catch(() => setSavedSearchesError('We could not load your saved searches. Please try again.'))
                      .finally(() => setSavedSearchesLoading(false));
                  }}>Try again</Button>
                </div>
              ) : savedSearchesLoading ? (
                <Body>Loading your saved searches...</Body>
              ) : savedSearches.length === 0 ? (
                <Body>You have no saved postcodes yet. Open a postcode and select “Save postcode” to keep it here.</Body>
              ) : (
                <ul className="space-y-3">
                  {savedSearches.map((search) => (
                    <li key={search.savedSearchId} className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5DCD5] pt-3">
                      <div>
                        <Link to={postcodePath(search.postcode)} className="font-semibold text-[#8B0202] underline">{search.postcode}</Link>
                        <Small className="block text-[#6B7280]">Saved {new Date(search.createdAt).toLocaleDateString('en-GB')}</Small>
                      </div>
                      <div className="flex gap-2">
                        <Link to={postcodePath(search.postcode)} className="inline-flex items-center rounded-lg border border-[#E5DCD5] px-3 py-2 text-sm font-semibold text-[#1A2B3C] hover:bg-[#F8F4F1]">Open</Link>
                        <button
                          type="button"
                          disabled={removingSavedSearchId === search.savedSearchId}
                          onClick={() => void removeSavedSearch(search)}
                          aria-label={`Remove ${search.postcode} from saved searches`}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#E5DCD5] px-3 py-2 text-sm font-semibold text-[#8B0202] hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          {removingSavedSearchId === search.savedSearchId ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-[24px] border border-[#E5DCD5] bg-white p-6 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <H3 className="text-[#1A2B3C]">My reviews</H3>
                <Link to="/postcode-search" className="text-sm font-semibold text-[#8B0202] underline">Write a review</Link>
              </div>
              {reviewActionError && <Body className="mb-3 text-[#8B0202]" role="alert">{reviewActionError}</Body>}
              {reviewsLoadFailed ? (
                <div className="space-y-3">
                  <Body className="text-[#8B0202]">We could not load your reviews. Please try again.</Body>
                  <Button size="sm" variant="secondary" onClick={() => void refetchReviews()}>Try again</Button>
                </div>
              ) : reviewsLoading ? (
                <Body>Loading your reviews...</Body>
              ) : myReviews.length === 0 ? (
                <Body>You have not submitted any reviews yet. Share your experience from a postcode page.</Body>
              ) : (
                <ul className="space-y-4">
                  {myReviews.map((review) => {
                    const statusLabel = review.status === 'APPROVED'
                      ? 'Published'
                      : review.status === 'REJECTED'
                        ? 'Not published'
                        : 'Pending moderation';
                    const statusClass = review.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : review.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-900';

                    return (
                      <li key={review.review_id} className="border-t border-[#E5DCD5] pt-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <H3 className="text-[#1A2B3C]">{review.title}</H3>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
                            </div>
                            <Small className="block text-[#6B7280]">
                              {review.postcodes?.code ? (
                                <Link to={postcodePath(review.postcodes.code)} className="font-semibold text-[#8B0202] underline">{review.postcodes.code}</Link>
                              ) : 'Postcode unavailable'}
                              {' · '}Submitted {new Date(review.created_at).toLocaleDateString('en-GB')}
                            </Small>
                            <Body className="mt-2 whitespace-pre-wrap">{review.content}</Body>
                            {review.status === 'REJECTED' && review.rejection_reason && (
                              <Small className="mt-2 block text-[#8B0202]">Moderation note: {review.rejection_reason}</Small>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            isLoading={deletingReviewId === review.review_id}
                            onClick={() => void deleteReview(review.review_id)}
                            aria-label={`Delete review: ${review.title}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Delete
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="rounded-[24px] border border-[#E5DCD5] bg-white p-6 shadow-sm">
              <H3 className="text-[#1A2B3C] mb-3">Account settings</H3>
              <Body className="mb-4">Change your password and manage review email preferences.</Body>
              <Link to="/account/settings" className="inline-flex rounded-lg border border-[#8B0202] px-4 py-2 text-sm font-semibold text-[#8B0202] hover:bg-red-50">
                Manage account settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
