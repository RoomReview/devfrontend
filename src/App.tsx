import { Routes, Route } from 'react-router';
import ScrollToTop from './components/common/ScrollToTop';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ReviewsPage from './pages/ReviewsPage';
import PropertyPage from './pages/PropertyPage';
import BoroughPage from './pages/BoroughPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import EmailVerifiedPage from './pages/auth/EmailVerifiedPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import PasswordResetSentPage from './pages/auth/PasswordResetSentPage';
import PasswordResetSuccessPage from './pages/auth/PasswordResetSuccessPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Auth pages without layout */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="email-verified" element={<EmailVerifiedPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="password-reset-sent" element={<PasswordResetSentPage />} />
        <Route path="password-reset-success" element={<PasswordResetSuccessPage />} />

        {/* Main pages with layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="property/:id" element={<PropertyPage />} />
          <Route path="boroughs/:id" element={<BoroughPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
