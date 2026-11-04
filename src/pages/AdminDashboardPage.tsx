import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Check,
  CheckCircle2,
  FileText,
  RefreshCw,
  ShoppingBag,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/common/Button";
import { H1, H2, Body } from "@/components/common/Typography";
import {
  adminService,
  type AdminAuditLogEntry,
  type AdminOverview,
  type AdminUser,
} from "@/services/admin.service";
import { extractApiError } from "@/utils/apiError";
import AffiliateOffersPanel from "@/components/admin/AffiliateOffersPanel";
import type { Review } from "@/types/review.types";
import { canAccessAdminDashboard, canViewAdminAuditLog } from "@/lib/adminAccess";

type UserSort = "name" | "subscription" | "access";
const USERS_PER_PAGE = 10;
const REVIEWS_PER_PAGE = 10;

const AdminDashboardPage = () => {
  const { user, loading } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [updatingReview, setUpdatingReview] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
  const [userSort, setUserSort] = useState<UserSort>("name");
  const [userPage, setUserPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [creditEmail, setCreditEmail] = useState("");
  const [creditAmount, setCreditAmount] = useState(1);
  const [grantingCredits, setGrantingCredits] = useState(false);
  const [creditGrantError, setCreditGrantError] = useState<string | null>(null);
  const [creditGrantNotice, setCreditGrantNotice] = useState<string | null>(null);
  const hasAuditLogAccess = canViewAdminAuditLog(user);

  const loadOverview = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [nextOverview, nextUsers, nextReviews, nextAuditLogs] =
        await Promise.all([
          adminService.getOverview(),
          adminService.getUsers(),
          adminService.getReviews(),
          hasAuditLogAccess ? adminService.getAuditLogs() : Promise.resolve([]),
        ]);
      setOverview(nextOverview);
      setUsers(nextUsers);
      setReviews(nextReviews);
      setAuditLogs(nextAuditLogs);
      setUserPage(1);
      setReviewPage(1);
    } catch {
      setError("The administrative overview could not be loaded.");
    } finally {
      setRefreshing(false);
    }
  };

  const moderate = async (review: Review, status: "APPROVED" | "REJECTED") => {
    const rejectionReason =
      status === "REJECTED"
        ? window.prompt(
            "Enter a reason for rejecting this review (shown to the author):",
          )
        : undefined;
    if (status === "REJECTED" && !rejectionReason?.trim()) return;

    setUpdatingReview(review.review_id);
    setReviewError(null);
    setReviewNotice(null);
    try {
      const result = await adminService.moderateReview(
        review.review_id,
        status,
        rejectionReason?.trim(),
      );
      setReviews((current) =>
        current.map((item) =>
          item.review_id === review.review_id ? result.review : item,
        ),
      );
      if (result.notificationWarning)
        setReviewNotice(result.notificationWarning);
    } catch {
      setReviewError(
        `“${review.title}” could not be moderated. Refresh and try again.`,
      );
    } finally {
      setUpdatingReview(null);
    }
  };

  const deleteAnyReview = async (review: Review) => {
    if (!window.confirm(`Delete “${review.title}”? This cannot be undone.`))
      return;

    setUpdatingReview(review.review_id);
    setReviewError(null);
    try {
      await adminService.deleteReview(review.review_id);
      setReviews((current) =>
        current.filter((item) => item.review_id !== review.review_id),
      );
      if (
        reviews.length > 1 &&
        reviews.length - 1 <= (reviewPage - 1) * REVIEWS_PER_PAGE
      ) {
        setReviewPage((page) => Math.max(1, page - 1));
      }
    } catch {
      setReviewError(
        `“${review.title}” could not be deleted. Refresh and try again.`,
      );
    } finally {
      setUpdatingReview(null);
    }
  };

  const updateUser = async (userId: string, action: () => Promise<void>) => {
    setUpdatingUser(userId);
    setError(null);
    try {
      await action();
      setUsers(await adminService.getUsers());
    } catch {
      setError("The user could not be updated.");
    } finally {
      setUpdatingUser(null);
    }
  };

  const grantReportCredits = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGrantingCredits(true);
    setCreditGrantError(null);
    setCreditGrantNotice(null);
    try {
      const result = await adminService.grantReportCredits(
        creditEmail.trim(),
        creditAmount,
      );
      setCreditGrantNotice(
        `${result.creditsAdded} report ${result.creditsAdded === 1 ? "credit" : "credits"} added for ${result.email}. ${result.creditAccountEmail !== result.email ? `Credits are shared with ${result.creditAccountEmail}. ` : ""}New balance: ${result.balance}.`,
      );
      setCreditEmail("");
      setCreditAmount(1);
    } catch (error) {
      setCreditGrantError(extractApiError(error));
    } finally {
      setGrantingCredits(false);
    }
  };

  useEffect(() => {
    if (canAccessAdminDashboard(user)) void loadOverview();
  }, [user?.email, user?.role]);

  useEffect(() => {
    if (!isReviewModalOpen && !isOffersModalOpen && !isAuditModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsReviewModalOpen(false);
        setIsOffersModalOpen(false);
        setIsAuditModalOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isReviewModalOpen, isOffersModalOpen, isAuditModalOpen]);

  if (loading)
    return (
      <main className="min-h-screen bg-[#F8F4F1] px-4 py-16">
        <Body>Checking administrator access...</Body>
      </main>
    );
  if (!canAccessAdminDashboard(user)) {
    return (
      <main className="min-h-screen bg-[#F8F4F1] px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#E5DCD5] bg-white p-8 text-center">
          <H2>Administrator access required</H2>
          <Body className="mt-3">
            This area is restricted to RoomReview administrators.
          </Body>
          <Link to="/account" className="mt-6 inline-flex">
            <Button>Return to account</Button>
          </Link>
        </div>
      </main>
    );
  }

  const cards = overview
    ? [
        {
          label: "Users",
          value: overview.users.total,
          detail: `${overview.users.active} active`,
          icon: Users,
        },
        {
          label: "Reports",
          value: overview.reports.total,
          detail: `${overview.reports.ready} ready`,
          icon: FileText,
        },
        {
          label: "Paid orders",
          value: overview.orders.paid,
          detail: `${overview.orders.pending} pending`,
          icon: ShoppingBag,
        },
        {
          label: "Open failures",
          value: overview.reports.failed + overview.orders.failed,
          detail: "Reports and payments",
          icon: AlertTriangle,
        },
      ]
    : [];
  const sortedUsers = [...users].sort((firstUser, secondUser) => {
    if (userSort === "name") {
      return `${firstUser.firstName} ${firstUser.lastName}`.localeCompare(
        `${secondUser.firstName} ${secondUser.lastName}`,
      );
    }
    if (userSort === "subscription") {
      return (firstUser.subscription?.status ?? "NONE").localeCompare(
        secondUser.subscription?.status ?? "NONE",
      );
    }
    return Number(secondUser.isActive) - Number(firstUser.isActive);
  });
  const totalUserPages = Math.max(
    1,
    Math.ceil(sortedUsers.length / USERS_PER_PAGE),
  );
  const visibleUsers = sortedUsers.slice(
    (userPage - 1) * USERS_PER_PAGE,
    userPage * USERS_PER_PAGE,
  );
  const totalReviewPages = Math.max(
    1,
    Math.ceil(reviews.length / REVIEWS_PER_PAGE),
  );
  const visibleReviews = reviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE,
  );

  return (
    <main className="min-h-screen bg-[#F8F4F1] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-[#D8CCC4] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/account"
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#8B0202]"
            >
              <ArrowLeft className="h-4 w-4" /> Account
            </Link>
            <H1>Administrative monitoring</H1>
            <Body className="mt-2">
              Operational health for users, reports, and payment orders.
            </Body>
          </div>
          <Button
            variant="secondary"
            isLoading={refreshing}
            onClick={() => void loadOverview()}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}
        {overview && (
          <>
            <section
              aria-label="Overview metrics"
              className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {cards.map(({ label, value, detail, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#E5DCD5] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#64707A]">
                      {label}
                    </span>
                    <Icon className="h-5 w-5 text-[#8B0202]" />
                  </div>
                  <p className="mt-4 text-3xl font-bold text-[#1A2B3C]">
                    {value}
                  </p>
                  <p className="mt-1 text-sm text-[#64707A]">{detail}</p>
                </div>
              ))}
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#E5DCD5] bg-white p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  <H2 className="text-xl">Report lifecycle</H2>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  {Object.entries({
                    Waiting: overview.reports.waiting,
                    Generating: overview.reports.generating,
                    Ready: overview.reports.ready,
                    Failed: overview.reports.failed,
                  }).map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-[#F8F4F1] p-3">
                      <p className="text-[#64707A]">{label}</p>
                      <p className="mt-1 text-xl font-bold text-[#1A2B3C]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[#E5DCD5] bg-white p-6">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-[#8B0202]" />
                  <H2 className="text-xl">Payment lifecycle</H2>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  {Object.entries({
                    Pending: overview.orders.pending,
                    Paid: overview.orders.paid,
                    Failed: overview.orders.failed,
                    Cancelled: overview.orders.cancelled,
                  }).map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-[#F8F4F1] p-3">
                      <p className="text-[#64707A]">{label}</p>
                      <p className="mt-1 text-xl font-bold text-[#1A2B3C]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setIsOffersModalOpen(true)}
              className="mt-8 flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5DCD5] bg-white p-6 text-left transition hover:border-[#8B0202] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8B0202]"
            >
              <span>
                <span className="block text-lg font-bold text-[#1A2B3C]">
                  Affiliate partner offers
                </span>
                <span className="mt-1 block text-sm text-[#64707A]">
                  Manage offers, Awin promotions, and transaction sync.
                </span>
              </span>
              <span className="text-sm font-semibold text-[#8B0202]">
                Open offers
              </span>
            </button>

            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setIsReviewModalOpen(true)}
              className="mt-8 flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5DCD5] bg-white p-6 text-left transition hover:border-[#8B0202] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8B0202]"
            >
              <span>
                <span className="block text-lg font-bold text-[#1A2B3C]">
                  Review moderation
                </span>
                <span className="mt-1 block text-sm text-[#64707A]">
                  Open review moderation and manage submitted reviews.
                </span>
              </span>
              <span
                className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900"
                aria-live="polite"
              >
                {reviews.filter((review) => review.status === "PENDING").length}{" "}
                pending
              </span>
            </button>

            {isReviewModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setIsReviewModalOpen(false);
                  }
                }}
              >
                <section
                  aria-label="Review moderation"
                  aria-modal="true"
                  role="dialog"
                  className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-[#E5DCD5] bg-white p-5 shadow-xl sm:p-6"
                >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <H2 className="text-xl">Review moderation</H2>
                  <Body className="mt-1">
                    Approve reviews to publish them, or reject them with a
                    reason for the author.
                  </Body>
                </div>
                <span
                  className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900"
                  aria-live="polite"
                >
                  {
                    reviews.filter((review) => review.status === "PENDING")
                      .length
                  }{" "}
                  pending
                </span>
                <button
                  type="button"
                  aria-label="Close review moderation"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="rounded-lg p-2 text-[#64707A] transition hover:bg-[#F8F4F1] hover:text-[#1A2B3C] focus:outline-none focus:ring-2 focus:ring-[#8B0202]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              {reviewNotice && (
                <p
                  role="status"
                  className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900"
                >
                  {reviewNotice}
                </p>
              )}
              {reviewError && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800"
                >
                  {reviewError}
                </p>
              )}
              {reviews.length === 0 ? (
                <Body className="mt-5">No reviews have been submitted.</Body>
              ) : (
                <ul className="mt-5 divide-y divide-[#E5DCD5]">
                  {visibleReviews.map((review) => {
                    const isUpdating = updatingReview === review.review_id;
                    const statusLabel =
                      review.status === "APPROVED"
                        ? "Published"
                        : review.status === "REJECTED"
                          ? "Rejected"
                          : "Pending moderation";
                    return (
                      <li
                        key={review.review_id}
                        className="py-5 first:pt-0 last:pb-0"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-[#1A2B3C]">
                                {review.title}
                              </h3>
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  review.status === "APPROVED"
                                    ? "bg-green-100 text-green-800"
                                    : review.status === "REJECTED"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-amber-100 text-amber-900"
                                }`}
                              >
                                {statusLabel}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-[#64707A]">
                              {review.postcodes?.code ?? "Postcode unavailable"}{" "}
                              · Submitted{" "}
                              {new Date(review.created_at).toLocaleDateString(
                                "en-GB",
                              )}
                              {" · "}
                              {review.anonymous
                                ? "Anonymous author"
                                : [
                                    review.author_first_name,
                                    review.author_last_name,
                                  ]
                                    .filter(Boolean)
                                    .join(" ") ||
                                  review.users?.firstName ||
                                  "Account holder"}
                            </p>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#1A2B3C]">
                              {review.content}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[#64707A]">
                              Overall rating: {review.overall_rating} / 5
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 lg:shrink-0">
                            {review.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  isLoading={isUpdating}
                                  disabled={Boolean(updatingReview)}
                                  onClick={() =>
                                    void moderate(review, "APPROVED")
                                  }
                                >
                                  <Check
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />{" "}
                                  Approve &amp; publish
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={Boolean(updatingReview)}
                                  onClick={() =>
                                    void moderate(review, "REJECTED")
                                  }
                                >
                                  <X className="h-4 w-4" aria-hidden="true" />{" "}
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              isLoading={isUpdating}
                              disabled={Boolean(updatingReview)}
                              onClick={() => void deleteAnyReview(review)}
                            >
                              <Ban className="h-4 w-4" aria-hidden="true" />{" "}
                              Delete
                            </Button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {reviews.length > 0 && (
                <div className="mt-5 flex items-center justify-between border-t border-[#E5DCD5] pt-4">
                  <span className="text-sm text-[#64707A]" aria-live="polite">
                    Showing {(reviewPage - 1) * REVIEWS_PER_PAGE + 1}-
                    {Math.min(reviewPage * REVIEWS_PER_PAGE, reviews.length)} of{" "}
                    {reviews.length} reviews · Page {reviewPage} of{" "}
                    {totalReviewPages}
                  </span>
                  {totalReviewPages > 1 && (
                    <div className="flex gap-2">
                      <Button
                        aria-label="Previous reviews page"
                        size="sm"
                        variant="outline"
                        disabled={reviewPage === 1}
                        onClick={() => setReviewPage((page) => page - 1)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        aria-label="Next reviews page"
                        size="sm"
                        variant="outline"
                        disabled={reviewPage === totalReviewPages}
                        onClick={() => setReviewPage((page) => page + 1)}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
                </section>
              </div>
            )}

            {hasAuditLogAccess && <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setIsAuditModalOpen(true)}
              className="mt-8 flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5DCD5] bg-white p-6 text-left transition hover:border-[#8B0202] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8B0202]"
            >
              <span>
                <span className="block text-lg font-bold text-[#1A2B3C]">
                  Admin activity log
                </span>
                <span className="mt-1 block text-sm text-[#64707A]">
                  View recent administrative actions recorded by the server.
                </span>
              </span>
              <span className="text-sm font-semibold text-[#8B0202]">
                {auditLogs.length} recent
              </span>
            </button>}

            <section className="mt-8 rounded-2xl border border-[#E5DCD5] bg-white p-6">
              <H2 className="text-xl">Recent failures</H2>
              {overview.recentFailures.length === 0 ? (
                <Body className="mt-4">
                  No recent report or payment failures.
                </Body>
              ) : (
                <div className="mt-4 divide-y divide-[#E5DCD5]">
                  {overview.recentFailures.map((failure) => (
                    <div
                      key={`${failure.kind}-${failure.id}`}
                      className="flex flex-col gap-1 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-[#1A2B3C]">
                          {failure.kind} · {failure.status}
                        </p>
                        <p className="text-[#64707A]">
                          {failure.reason ?? failure.id}
                        </p>
                      </div>
                      <time
                        className="text-[#64707A]"
                        dateTime={failure.createdAt}
                      >
                        {new Date(failure.createdAt).toLocaleString()}
                      </time>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8 rounded-2xl border border-[#E5DCD5] bg-white p-6">
              <H2 className="text-xl">Add report credits</H2>
              <Body className="mt-1">
                Admin override: grant report credits to a registered user by email.
              </Body>
              <form
                className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-end"
                onSubmit={(event) => void grantReportCredits(event)}
              >
                <label className="block text-sm font-semibold text-[#64707A]">
                  User email
                  <input
                    type="email"
                    required
                    maxLength={254}
                    value={creditEmail}
                    onChange={(event) => setCreditEmail(event.target.value)}
                    disabled={grantingCredits}
                    className="mt-1 w-full rounded-lg border border-[#D8CCC4] bg-white px-3 py-2 text-sm text-[#1A2B3C]"
                    placeholder="user@example.com"
                  />
                </label>
                <label className="block text-sm font-semibold text-[#64707A]">
                  Number of reports
                  <input
                    type="number"
                    required
                    min={1}
                    max={1000}
                    step={1}
                    value={creditAmount}
                    onChange={(event) =>
                      setCreditAmount(Number(event.target.value))
                    }
                    disabled={grantingCredits}
                    className="mt-1 w-full rounded-lg border border-[#D8CCC4] bg-white px-3 py-2 text-sm text-[#1A2B3C]"
                  />
                </label>
                <Button
                  type="submit"
                  isLoading={grantingCredits}
                  disabled={
                    grantingCredits ||
                    !creditEmail.trim() ||
                    !Number.isInteger(creditAmount) ||
                    creditAmount < 1 ||
                    creditAmount > 1000
                  }
                >
                  Add credits
                </Button>
              </form>
              {creditGrantError && (
                <p role="alert" className="mt-4 text-sm font-semibold text-red-800">
                  {creditGrantError}
                </p>
              )}
              {creditGrantNotice && (
                <p role="status" className="mt-4 text-sm font-semibold text-emerald-800">
                  {creditGrantNotice}
                </p>
              )}
            </section>

            {isOffersModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setIsOffersModalOpen(false);
                  }
                }}
              >
                <section
                  aria-labelledby="affiliate-offers-dialog-title"
                  aria-modal="true"
                  role="dialog"
                  className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-[#F8F4F1] p-3 shadow-xl sm:p-6"
                >
                  <button
                    type="button"
                    aria-label="Close affiliate partner offers"
                    onClick={() => setIsOffersModalOpen(false)}
                    className="sticky right-0 top-0 z-10 ml-auto flex rounded-lg bg-white p-2 text-[#64707A] shadow transition hover:text-[#1A2B3C] focus:outline-none focus:ring-2 focus:ring-[#8B0202]"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <h2 id="affiliate-offers-dialog-title" className="sr-only">
                    Affiliate partner offers
                  </h2>
                  <AffiliateOffersPanel />
                </section>
              </div>
            )}

            {hasAuditLogAccess && isAuditModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setIsAuditModalOpen(false);
                  }
                }}
              >
                <section
                  aria-labelledby="admin-audit-dialog-title"
                  aria-modal="true"
                  role="dialog"
                  className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-[#E5DCD5] bg-white p-5 shadow-xl sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <H2 id="admin-audit-dialog-title" className="text-xl">
                        Admin activity log
                      </H2>
                      <Body className="mt-1">
                        Recent administrative actions recorded by the server.
                      </Body>
                    </div>
                    <button
                      type="button"
                      aria-label="Close admin activity log"
                      onClick={() => setIsAuditModalOpen(false)}
                      className="rounded-lg p-2 text-[#64707A] transition hover:bg-[#F8F4F1] hover:text-[#1A2B3C] focus:outline-none focus:ring-2 focus:ring-[#8B0202]"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  {auditLogs.length === 0 ? (
                    <Body className="mt-4">
                      No administrative activity recorded yet.
                    </Body>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-[#E5DCD5] text-xs uppercase tracking-wide text-[#64707A]">
                          <tr>
                            <th className="px-3 py-3">Administrator</th>
                            <th className="px-3 py-3">Action</th>
                            <th className="px-3 py-3">Result</th>
                            <th className="px-3 py-3">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5DCD5]">
                          {auditLogs.map((entry) => (
                            <tr key={entry.auditLogId}>
                              <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#1A2B3C]">
                                {entry.actorEmail}
                              </td>
                              <td className="px-3 py-3 text-[#1A2B3C]">
                                <span>{entry.action}</span>
                                {entry.resourceId && (
                                  <span className="ml-1 text-[#64707A]">
                                    ({entry.resourceId})
                                  </span>
                                )}
                                {entry.details && (
                                  <span className="ml-2 text-[#64707A]">
                                    {Object.entries(entry.details)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(", ")}
                                  </span>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-[#64707A]">
                                {entry.statusCode ?? "In progress"}
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-[#64707A]">
                                <time dateTime={entry.createdAt}>
                                  {new Date(entry.createdAt).toLocaleString(
                                    "en-GB",
                                  )}
                                </time>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>
            )}

            <section className="mt-8 rounded-2xl border border-[#E5DCD5] bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <H2 className="text-xl">Users</H2>
                  <Body className="mt-1">Manage access and subscriptions.</Body>
                </div>
                <div className="flex items-center gap-3">
                  <label
                    className="flex items-center gap-2 text-sm font-semibold text-[#64707A]"
                    htmlFor="user-sort"
                  >
                    Sort by
                    <select
                      id="user-sort"
                      value={userSort}
                      onChange={(event) => {
                        setUserSort(event.target.value as UserSort);
                        setUserPage(1);
                      }}
                      className="rounded-lg border border-[#D8CCC4] bg-white px-3 py-2 text-sm font-semibold text-[#1A2B3C]"
                    >
                      <option value="name">Name (A-Z)</option>
                      <option value="subscription">Subscription status</option>
                      <option value="access">Ban / unban</option>
                    </select>
                  </label>
                  <span className="text-sm font-semibold text-[#64707A]">
                    {users.length} total
                  </span>
                </div>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-[#E5DCD5] text-xs uppercase tracking-wide text-[#64707A]">
                    <tr>
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Email</th>
                      <th className="px-3 py-3">Subscription</th>
                      <th className="px-3 py-3">Access</th>
                      <th className="px-3 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DCD5]">
                    {visibleUsers.map((listedUser) => {
                      const isUpdating = updatingUser === listedUser.userId;
                      const subscriptionLabel = listedUser.subscription
                        ? `${listedUser.subscription.status}${listedUser.subscription.cancelAtPeriodEnd ? " (cancels at period end)" : ""}`
                        : "No subscription";
                      return (
                        <tr key={listedUser.userId}>
                          <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#1A2B3C]">
                            {listedUser.firstName} {listedUser.lastName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-[#64707A]">
                            {listedUser.email}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-[#64707A]">
                            {subscriptionLabel}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#1A2B3C]">
                            {listedUser.isActive ? "Active" : "Banned"}
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex justify-end gap-2">
                              {listedUser.subscription &&
                                listedUser.subscription.status !== "CANCELED" &&
                                !listedUser.subscription.cancelAtPeriodEnd && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    isLoading={isUpdating}
                                    disabled={isUpdating}
                                    onClick={() =>
                                      void updateUser(listedUser.userId, () =>
                                        adminService.cancelSubscription(
                                          listedUser.userId,
                                        ),
                                      )
                                    }
                                  >
                                    Cancel subscription
                                  </Button>
                                )}
                              <Button
                                size="sm"
                                variant={
                                  listedUser.isActive ? "outline" : "secondary"
                                }
                                isLoading={isUpdating}
                                disabled={isUpdating}
                                onClick={() =>
                                  void updateUser(listedUser.userId, () =>
                                    adminService.setUserActive(
                                      listedUser.userId,
                                      !listedUser.isActive,
                                    ),
                                  )
                                }
                              >
                                {listedUser.isActive ? (
                                  <>
                                    <Ban className="h-4 w-4" /> Ban
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4" /> Unban
                                  </>
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <Body className="py-6 text-center">No users found.</Body>
                )}
              </div>
              {users.length > 0 && (
                <div className="mt-5 flex items-center justify-between border-t border-[#E5DCD5] pt-4">
                  <span className="text-sm text-[#64707A]">
                    Page {userPage} of {totalUserPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      aria-label="Previous users page"
                      size="sm"
                      variant="outline"
                      disabled={userPage === 1}
                      onClick={() => setUserPage((page) => page - 1)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      aria-label="Next users page"
                      size="sm"
                      variant="outline"
                      disabled={userPage === totalUserPages}
                      onClick={() => setUserPage((page) => page + 1)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default AdminDashboardPage;
