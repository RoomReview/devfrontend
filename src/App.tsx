import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import PolicyPage from '@/pages/PolicyPage';
import { CookiesPolicyPage } from './pages/CooliePage';
import { DataSourcesPage } from './pages/DataSourcePage';
import CookieConsentBanner from './components/common/CookieConsentBanner';
import { COOKIE_PREFERENCES_CHANGED_EVENT, trackPageView } from './lib/cookieConsent';
import { useAuth } from './hooks/useAuth';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const AreaSearchPage = lazy(() => import('./pages/AreaSearchPage'));
const PostcodeSearchPage = lazy(() => import('./pages/PostcodeSearchPage'));
const BoroughPage = lazy(() => import('@/pages/BoroughPage'));
const PostcodePage = lazy(() => import('./pages/PostcodePage'));
const ReportPage = lazy(() => import('./pages/ReportPage').then((module) => ({ default: module.RoomReviewPage })));
const BuyerReportViewPage = lazy(() => import('./pages/BuyerReportViewPage').then((module) => ({ default: module.BuyerReportViewPage })));
const InvestorReportViewPage = lazy(() => import('./pages/InvestorReportViewPage').then((module) => ({ default: module.InvestorReportViewPage })));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const EmailVerifiedPage = lazy(() => import('./pages/auth/EmailVerifiedPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const PasswordResetSentPage = lazy(() => import('./pages/auth/PasswordResetSentPage'));
const PasswordResetSuccessPage = lazy(() => import('./pages/auth/PasswordResetSuccessPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const CheckoutCancelPage = lazy(() => import('./pages/CheckoutCancelPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage'));

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const recordPageView = () => {
      trackPageView(`${location.pathname}${location.search}`);
    };

    recordPageView();
    window.addEventListener(COOKIE_PREFERENCES_CHANGED_EVENT, recordPageView);

    return () => window.removeEventListener(COOKIE_PREFERENCES_CHANGED_EVENT, recordPageView);
  }, [location.pathname, location.search]);

  return null;
}

function AdminRoute() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <main className="flex min-h-[60vh] items-center justify-center">Loading account...</main>;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;

  return <AdminDashboardPage />;
}

function App() {
  return (
    <>
      <AnalyticsTracker />
      <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#F8F4F1] px-4"><p className="font-semibold text-[#1A2B3C]">Loading RoomReview...</p></main>}>
        <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="email-verified" element={<EmailVerifiedPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="password-reset-sent" element={<PasswordResetSentPage />} />
        <Route path="password-reset-success" element={<PasswordResetSuccessPage />} />
        <Route path="checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="checkout/cancel" element={<CheckoutCancelPage />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="report/view" element={<BuyerReportViewPage />} />
          <Route path="investor-report/view" element={<InvestorReportViewPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactUsPage />} />
          <Route path="area-search" element={<AreaSearchPage />} />
          <Route path="postcode-search" element={<PostcodeSearchPage />} />
          <Route path="borough/:id" element={<BoroughPage />} />
          <Route path="boroughs/:id" element={<BoroughPage />} />
          <Route path="postcode/:postcode" element={<PostcodePage />} />
          <Route path="privacy" element={<PolicyPage type="privacy" />} />
          <Route path="cookie-policy" element={<CookiesPolicyPage />} />
          <Route path="data-sources" element={<DataSourcesPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="admin" element={<AdminRoute />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        </Routes>
      </Suspense>
      <CookieConsentBanner />
    </>
  );
}

export default App;
