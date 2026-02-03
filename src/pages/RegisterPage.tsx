import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContainer from '../components/layout/AuthContainer';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';
import { H2, Body, Small } from '../components/common/Typography';
import { GoogleIcon, FacebookIcon } from '../components/common/Icons';
import backgroundImage from "../assets/bgimage.png";

type UserType = 'tenant' | 'agency';

const RegisterPage = () => {
  const [userType, setUserType] = useState<UserType>('tenant');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register:', { userType, ...formData });
  };

  const descriptions = {
    tenant: 'Find better places to live with trusted reviews from real tenants.',
    agency: 'Create a public profile, receive reviews, and build trust in your brand.',
  };

  return (
    <AuthContainer backgroundImage={backgroundImage}>
      {/* Logo */}
      <div className="mb-6 sm:mb-8">
        <Logo size="sm" linkTo="/" />
      </div>

      {/* Title */}
      <H2 className="mb-2 text-primary text-2xl sm:text-3xl">Create an account</H2>
      <Body className="mb-2 text-sm sm:text-base">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Sign In
        </Link>
      </Body>
      <Small className="mb-6 text-gray-dark/70">{descriptions[userType]}</Small>

      {/* User Type Toggle */}
      <div className="flex mb-6 bg-gray-light/50 rounded-full p-1">
        <button
          type="button"
          onClick={() => setUserType('tenant')}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
            userType === 'tenant'
              ? 'bg-secondary text-white'
              : 'text-secondary hover:bg-gray-light'
          }`}
        >
          Tenant
        </button>
        <button
          type="button"
          onClick={() => setUserType('agency')}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
            userType === 'agency'
              ? 'bg-secondary text-white'
              : 'text-secondary hover:bg-gray-light'
          }`}
        >
          Agency
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {userType === 'tenant' ? (
          <Input
            label="First name"
            name="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={handleChange}
          />
        ) : (
          <Input
            label="Agency / Company Name"
            name="companyName"
            placeholder="Agency / Company Name"
            value={formData.companyName}
            onChange={handleChange}
          />
        )}

        <Input
          label="Last name"
          name="lastName"
          placeholder="Smith"
          value={formData.lastName}
          onChange={handleChange}
        />

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

        <Button type="submit" className="w-full">
          SIGN UP
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-4 sm:my-6">
        <div className="flex-1 border-t border-gray-light"></div>
        <span className="px-3 sm:px-4 text-xs sm:text-sm text-gray-dark/50">Or Sign Up with</span>
        <div className="flex-1 border-t border-gray-light"></div>
      </div>

      {/* Social Login */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button variant="outline" className="flex-1" type="button">
          <GoogleIcon />
          <span className="text-sm sm:text-base">GOOGLE</span>
        </Button>
        <Button variant="outline" className="flex-1" type="button">
          <FacebookIcon />
          <span className="text-sm sm:text-base">FACEBOOK</span>
        </Button>
      </div>
    </AuthContainer>
  );
};

export default RegisterPage;
