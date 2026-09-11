import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AreaSearchPage from './pages/AreaSearchPage';
import PostcodeSearchPage from './pages/PostcodeSearchPage';
import BoroughPage from '@/pages/BoroughPage';
import PostcodePage from './pages/PostcodePage';
import AccountPage from './pages/AccountPage';
import ReviewsPage from './pages/ReviewsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import EmailVerifiedPage from './pages/auth/EmailVerifiedPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import PasswordResetSentPage from './pages/auth/PasswordResetSentPage';
import PasswordResetSuccessPage from './pages/auth/PasswordResetSuccessPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CheckoutCancelPage from './pages/CheckoutCancelPage';
import NotFoundPage from './pages/NotFoundPage';
import PolicyPage from '@/pages/PolicyPage';
import { CookiesPolicyPage } from './pages/CooliePage';
import { DataSourcesPage } from './pages/DataSourcePage';
import CookieConsentBanner from './components/common/CookieConsentBanner';
import { COOKIE_PREFERENCES_CHANGED_EVENT, trackPageView } from './lib/cookieConsent';

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

function App() {
  return (
    <>
      <AnalyticsTracker />
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
          <Route path="about" element={<AboutPage />} />
          <Route path="area-search" element={<AreaSearchPage />} />
          <Route path="postcode-search" element={<PostcodeSearchPage />} />
          <Route path="borough/:id" element={<BoroughPage />} />
          <Route path="boroughs/:id" element={<BoroughPage />} />
          <Route path="postcode/:postcode" element={<PostcodePage />} />
          <Route path="privacy" element={<PolicyPage type="privacy" />} />
          <Route path="cookie-policy" element={<CookiesPolicyPage />} />
          <Route path="data-sources" element={<DataSourcesPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <CookieConsentBanner />
    </>
  );
}

export default App;
