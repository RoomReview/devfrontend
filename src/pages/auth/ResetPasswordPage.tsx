import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import AuthContainer from '../../components/layout/AuthContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import { H2, Body, Small } from '../../components/common/Typography';
import backgroundImage from '../../assets/bgimage.png';
import { useResetPassword } from '@/hooks/auth/useResetPassword';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Backend expects: email + code + newPassword
  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || '';

  const { mutate: resetPassword, isPending } = useResetPassword();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Min. 8 characters, 1 uppercase letter, 1 number';
    if (!/[A-Z]/.test(password)) return 'Min. 8 characters, 1 uppercase letter, 1 number';
    if (!/[0-9]/.test(password)) return 'Min. 8 characters, 1 uppercase letter, 1 number';
    return '';
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    if (field === 'password') {
      setErrors({ ...errors, password: validatePassword(value) });
    }
    if (field === 'confirmPassword') {
      setErrors({
        ...errors,
        confirmPassword: value !== formData.password ? 'Passwords do not match' : '',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(formData.password);
    const confirmError =
      formData.confirmPassword !== formData.password
        ? 'Passwords do not match'
        : !formData.confirmPassword
          ? 'Please confirm your password'
          : '';

    setErrors({ password: passwordError, confirmPassword: confirmError });
    if (passwordError || confirmError) return;

    resetPassword(
      { email, code, newPassword: formData.password },
      {
        onSuccess: () => navigate('/password-reset-success'),
        // onError handled by hook (toast)
      },
    );
  };

  return (
    <AuthContainer backgroundImage={backgroundImage}>
      {/* Logo */}
      <div className="mb-6 sm:mb-8">
        <Logo size="sm" linkTo="/" />
      </div>

      {/* Title */}
      <H2 className="text-primary mb-3">Create new password</H2>

      {/* Description */}
      <Body className="text-gray-dark/80 mb-8">
        Create a new password for your account.
      </Body>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Input
            label="Create new password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
          />
          <Small className={`mt-1 ${errors.password ? 'text-primary' : 'text-gray-dark/60'}`}>
            Min. 8 characters, 1 uppercase letter, 1 number
          </Small>
        </div>

        <div>
          <Input
            label="Re-type new password"
            type="password"
            placeholder="Enter your password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
          />
          <Small className={`mt-1 ${errors.confirmPassword ? 'text-primary' : 'text-gray-dark/60'}`}>
            Min. 8 characters, 1 uppercase letter, 1 number
          </Small>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'RESETTING...' : 'RESET PASSWORD'}
        </Button>
      </form>
    </AuthContainer>
  );
};

export default ResetPasswordPage;
