import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContainer from '../../components/layout/AuthContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import { H2, Body } from '../../components/common/Typography';
import backgroundImage from '../../assets/bgimage.png';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    
    console.log('Reset password for:', email);
    navigate(`/password-reset-sent?email=${encodeURIComponent(email)}`);
  };

  return (
    <AuthContainer backgroundImage={backgroundImage}>
      {/* Logo */}
      <div className="mb-6 sm:mb-8">
        <Logo size="sm" linkTo="/" />
      </div>

      {/* Title */}
      <H2 className="text-primary mb-3">Reset your password</H2>
      
      {/* Description */}
      <Body className="text-gray-dark/80 mb-8">
        Enter the email associated with your account, and we'll send you instructions to reset your password.
      </Body>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email"
          type="email"
          placeholder="Email@domain.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          error={error}
        />

        <Button type="submit" className="w-full">
          SUBMIT
        </Button>
      </form>
    </AuthContainer>
  );
};

export default ForgotPasswordPage;
