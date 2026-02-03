import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import CodeInput from '../../components/common/CodeInput';
import { H2, Body, Small } from '../../components/common/Typography';
import backgroundImage from '../../assets/bgimage.png';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '[email]';
  const userType = searchParams.get('type') || 'tenant';
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleCodeChange = (value: string) => {
    setCode(value);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 5) {
      setError('Please enter the complete code');
      return;
    }
    
    console.log('Verify:', { code, email, userType });
    
    // Navigate to email verified page
    navigate(`/email-verified?type=${userType}`);
  };

  const handleResend = async () => {
    setIsResending(true);
    // Simulate API call
    setTimeout(() => {
      setIsResending(false);
      console.log('Resend code to:', email);
    }, 1500);
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
        <H2 className="text-center text-primary mb-8 text-2xl sm:text-3xl">
          Confirm your email address
        </H2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code Input */}
          <div className="flex justify-center">
            <CodeInput
              length={5}
              onChange={handleCodeChange}
              error={error}
            />
          </div>

          {/* Instructions */}
          <div className="text-center">
            <Body className="text-sm text-gray-dark/80">
              A verification code has been sent to <strong>{email}</strong>.
            </Body>
            <Body className="text-sm text-gray-dark/80">
              Enter the code here to confirm your account.
            </Body>
          </div>

          {/* Resend */}
          <div className="text-center">
            <Small className="text-gray-dark/70">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-primary font-semibold hover:underline disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend'}
              </button>
            </Small>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            SUBMIT CODE
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
