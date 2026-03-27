import { useSearchParams, useNavigate } from 'react-router';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import { H2, Body } from '../../components/common/Typography';
import backgroundImage from '../../assets/bgimage.png';

const EmailVerifiedPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userType = searchParams.get('type') || 'tenant';

  const messages = {
    tenant: {
      description: 'Your tenant account is now active. Start exploring properties and sharing your experiences with the community.',
      buttonText: 'Get Started',
      destination: '/',
    },
    agency: {
      description: "Your agency account is now active. Let's complete your public profile to start receiving reviews and building trust with tenants.",
      buttonText: 'Complete',
      destination: '/complete-profile',
    },
  };

  const config = messages[userType as keyof typeof messages] || messages.tenant;

  const handleContinue = () => {
    navigate(config.destination);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="sm" linkTo="/" />
        </div>

        {/* Title */}
        <H2 className="text-center text-primary mb-6 text-2xl sm:text-3xl">
          Your email has been verified!
        </H2>

        {/* Welcome message */}
        <div className="text-center mb-8">
          <Body className="text-gray-dark mb-2">
            Welcome to <strong>RoomReview LTD</strong>
          </Body>
          <Body className="text-sm text-gray-dark/80">
            {config.description}
          </Body>
        </div>

        {/* Continue Button */}
        <Button onClick={handleContinue} className="w-full">
          {config.buttonText}
        </Button>
      </div>
    </div>
  );
};

export default EmailVerifiedPage;
