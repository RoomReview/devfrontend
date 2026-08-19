import { useSearchParams, useNavigate } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import { H2, Body } from '../../components/common/Typography';
import backgroundImage from '../../assets/bgimage.png';

const PasswordResetSentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '[email]';

  const handleComplete = () => {
    navigate('/login');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10">
        <div className="flex justify-center mb-8">
          <Logo size="sm" linkTo="/" />
        </div>

        <H2 className="text-center text-primary mb-6 text-2xl sm:text-3xl">
          Reset your password
        </H2>

        <div className="text-center mb-8">
          <Body className="text-gray-dark/80">
            We've sent a password reset link to <strong>{email}</strong>.
          </Body>
          <Body className="text-gray-dark/80">
            Click the link in the email to continue.
          </Body>
        </div>

        <Button onClick={handleComplete} className="w-full">
          COMPLETE
        </Button>
      </div>
    </div>
  );
};

export default PasswordResetSentPage;

