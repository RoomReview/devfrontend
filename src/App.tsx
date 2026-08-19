import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AreaSearchPage from './pages/AreaSearchPage';
import PostcodeSearchPage from './pages/PostcodeSearchPage';
import BoroughPage from './pages/BoroughPage';
import PostcodePage from './pages/PostcodePage';
import AccountPage from './pages/AccountPage';
import ReviewsPage from './pages/ReviewsPage';
import PropertyPage from './pages/PropertyPage';
import ReportPage, { defaultReportPageContent } from './pages/ReportPage';
import { BuyerReportViewPage } from './pages/BuyerReportViewPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import EmailVerifiedPage from './pages/auth/EmailVerifiedPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import PasswordResetSentPage from './pages/auth/PasswordResetSentPage';
import PasswordResetSuccessPage from './pages/auth/PasswordResetSuccessPage';
import NotFoundPage from './pages/NotFoundPage';
import { generateBuyerReport } from './utils/reportGenerator';

function App() {
  const navigate = useNavigate();

  const handleSubmitReportRequest = async (type: 'buyer' | 'investor', formData: Record<string, unknown>) => {
    console.info('Report form submitted', { type, formData });
    
    if (type === 'buyer') {
      try {
        const reportData = await generateBuyerReport(formData);
        navigate('/buyer-report-view', {
          state: { reportData },
          replace: true,
        });
      } catch (error) {
        console.error('Failed to generate buyer report:', error);
      }
    } else {
      console.info('Investor report generation not yet implemented');
    }
  };

  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="verify-email" element={<VerifyEmailPage />} />
      <Route path="email-verified" element={<EmailVerifiedPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />
      <Route path="password-reset-sent" element={<PasswordResetSentPage />} />
      <Route path="password-reset-success" element={<PasswordResetSuccessPage />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="area-search" element={<AreaSearchPage />} />
        <Route path="postcode-search" element={<PostcodeSearchPage />} />
        <Route path="borough/:id" element={<BoroughPage />} />
        <Route path="boroughs/:id" element={<BoroughPage />} />
        <Route path="postcode/:postcode" element={<PostcodePage />} />
        <Route path="report" element={<ReportPage {...defaultReportPageContent} onSubmitReportRequest={handleSubmitReportRequest} />} />
        <Route path="buyer-report" element={<ReportPage {...defaultReportPageContent} onSubmitReportRequest={handleSubmitReportRequest} />} />
        <Route path="investor-report" element={<ReportPage {...defaultReportPageContent} onSubmitReportRequest={handleSubmitReportRequest} />} />
        <Route path="buyer-report-view" element={<BuyerReportViewPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="property/:id" element={<PropertyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;

