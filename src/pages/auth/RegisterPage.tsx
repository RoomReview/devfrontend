import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import AuthContainer from '../../components/layout/AuthContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import { H2, Body, Small } from '../../components/common/Typography';
import { GoogleIcon, FacebookIcon } from '../../components/common/Icons';
import backgroundImage from '../../assets/bgimage.png';
import { useRegister } from '@/hooks/auth/useRegister';
import type { UserRole } from '@/types/user.types';

// Map the UI tab labels to the backend role enum values
const ROLE_MAP: Record<string, UserRole> = {
  tenant:   'TENANT',
  agency:   'AGENCY',
  agent:    'AGENT',
  landlord: 'LANDLORD',
};

type UserType = 'tenant' | 'agency' | 'agent' | 'landlord';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { mutate: register, isPending } = useRegister();

  const [userType, setUserType] = useState<UserType>('tenant');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      // Inline validation — toast is reserved for API errors
      return;
    }

    register(
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: ROLE_MAP[userType],
        // Agency-specific fields
        ...(userType === 'agency' && {
          agencyName: formData.companyName,
        }),
      },
      {
        onSuccess: () => {
          navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&type=${userType}`);
        },
        // onError handled by hook (toast)
      },
    );
  };

  const descriptions = {
    tenant:   'Find better places to live with trusted reviews from real tenants.',
    agency:   'Create a public profile, receive reviews, and build trust in your brand.',
    agent:    'Join your agency, manage properties, and receive feedback from tenants.',
    landlord: 'Manage your properties, collect reviews, and build trust with tenants.',
  };

  return (
    <AuthContainer backgroundImage={backgroundImage}>
      {/* Logo */}
      <div className="mb-6 sm:mb-8">
        <Logo size="sm" linkTo="/" />
      </div>

      {/* Title */}
      <H2 className="mb-2 text-primary text-2xl sm:text-3xl">Create an account</H2>
      <Body className="mb-6 text-sm sm:text-base">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          Sign In
        </Link>
      </Body>
      <Small className="mb-6 text-gray-dark/70">{descriptions[userType]}</Small>

      {/* User Type Toggle Tabs */}
      <div className="flex mb-6 border-b border-gray-light">
        {(['tenant', 'agency', 'agent', 'landlord'] as UserType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setUserType(type)}
            className={`flex-1 pb-2 text-sm sm:text-base font-bold capitalize transition-all border-b-2 -mb-[1px] ${
              userType === type
                ? 'text-black border-primary'
                : 'text-gray-dark/40 border-transparent hover:text-gray-dark'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 -mr-2">
        {(userType === 'agency' || userType === 'agent') && (
          <Input
            label="Agency / Company name"
            name="companyName"
            placeholder="Agency / Company Name"
            value={formData.companyName}
            onChange={handleChange}
          />
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            label="First name"
            name="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={handleChange}
          />
          <Input
            label="Last name"
            name="lastName"
            placeholder="Lewis"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Email@domain.com"
          value={formData.email}
          onChange={handleChange}
        />

        <div>
          <Input
            label="Create password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
          <Small className="mt-1.5 text-gray-dark/60">
            Min. 8 characters, 1 uppercase letter, 1 number
          </Small>
        </div>

        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          placeholder="Enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={
            formData.confirmPassword && formData.password !== formData.confirmPassword
              ? 'Passwords do not match'
              : ''
          }
        />

        <Button type="submit" className="w-full mt-2 shrink-0" disabled={isPending}>
          {isPending ? 'CREATING ACCOUNT...' : 'SIGN UP'}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-light"></div>
        <span className="px-4 text-sm text-gray-dark/50">Or Sign Up with</span>
        <div className="flex-1 border-t border-gray-light"></div>
      </div>

      {/* Social Login */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" className="flex-1 border-gray-light hover:border-gray-dark text-secondary" type="button" disabled>
          <GoogleIcon />
          <span className="text-sm sm:text-base font-bold text-secondary">GOOGLE</span>
        </Button>
        <Button variant="outline" className="flex-1 border-gray-light hover:border-gray-dark text-secondary" type="button" disabled>
          <FacebookIcon />
          <span className="text-sm sm:text-base font-bold text-secondary">FACEBOOK</span>
        </Button>
      </div>
    </AuthContainer>
  );
};

export default RegisterPage;
