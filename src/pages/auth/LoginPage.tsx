import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContainer from '../../components/layout/AuthContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import { H2, Body } from '../../components/common/Typography';
import { GoogleIcon, FacebookIcon } from '../../components/common/Icons';
import backgroundImage from '../../assets/bgimage.png';
import { useLogin } from '@/hooks/auth/useLogin';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');

    login(
      { email, password },
      {
        onSuccess: () => navigate('/'),
      },
    );
  };

  return (
    <AuthContainer backgroundImage={backgroundImage}>
      <div className="mb-6 sm:mb-10">
        <Logo size="sm" linkTo="/" />
      </div>

      <H2 className="mb-2 text-primary text-2xl sm:text-3xl">Welcome back</H2>
      <Body className="mb-6 sm:mb-8 text-sm sm:text-base">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary font-semibold hover:underline">
          Sign Up
        </Link>
      </Body>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="Email@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-right mt-2">
            <Link to="/forgot-password" className="text-sm text-secondary font-medium hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'SIGNING IN...' : 'SIGN IN'}
        </Button>
      </form>

      <div className="flex items-center my-4 sm:my-6">
        <div className="flex-1 border-t border-gray-light"></div>
        <span className="px-3 sm:px-4 text-xs sm:text-sm text-gray-dark/50">Or Sign In with</span>
        <div className="flex-1 border-t border-gray-light"></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button variant="outline" className="flex-1" type="button" disabled>
          <GoogleIcon />
          <span className="text-sm sm:text-base">GOOGLE</span>
        </Button>
        <Button variant="outline" className="flex-1" type="button" disabled>
          <FacebookIcon />
          <span className="text-sm sm:text-base">FACEBOOK</span>
        </Button>
      </div>
    </AuthContainer>
  );
};

export default LoginPage;

