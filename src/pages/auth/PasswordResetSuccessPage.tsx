import { useNavigate } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import { H2, Body } from '../../components/common/Typography';
import backgroundImage from '../../assets/bgimage.png';

const PasswordResetSuccessPage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
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
          Password reset successful
        </H2>

        <div className="text-center mb-8">
          <Body className="text-gray-dark/80">
            Your password has been updated. You can now sign in with your new password.
          </Body>
        </div>

        <Button onClick={handleSignIn} className="w-full">
          SIGN IN
        </Button>
      </div>
    </div>
  );
};

export default PasswordResetSuccessPage;
