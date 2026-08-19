import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '../components/common/Button';
import { H1, H2, H3, Body, Small } from '../components/common/Typography';

const AccountPage = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 py-16">
        <p className="text-lg font-semibold text-[#1A2B3C]">Loading your account...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-[30px] border border-[#E5DCD5] bg-[#F8F4F1] p-10 text-center">
          <H2 className="text-[#1A2B3C] mb-4">Welcome back</H2>
          <Body className="text-[#0B0B0B] mb-6">
            Sign in or create an account to manage your saved searches, reviews and profile details.
          </Body>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="w-full sm:w-auto">
              <Button className="w-full" variant="primary">
                Sign in
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button className="w-full" variant="secondary">
                Create account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <H1 className="text-[#1A2B3C]">My account</H1>
            <Body className="mt-3 text-[#0B0B0B] leading-8">
              Manage your profile, saved searches and review activity in one place.
            </Body>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={logout}>
              Sign out
            </Button>
            <Link to="/area-search" className="inline-flex">
              <Button variant="primary">Search areas</Button>
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[30px] border border-[#E5DCD5] bg-[#F8F4F1] p-8">
            <H2 className="text-[#1A2B3C] mb-4">Profile details</H2>
            <div className="space-y-4 text-[#0B0B0B]">
              <div>
                <Small className="block text-[#8B0202] uppercase tracking-[0.2em] mb-2">Name</Small>
                <Body>{user?.firstName} {user?.lastName}</Body>
              </div>
              <div>
                <Small className="block text-[#8B0202] uppercase tracking-[0.2em] mb-2">Email</Small>
                <Body>{user?.email}</Body>
              </div>
              <div>
                <Small className="block text-[#8B0202] uppercase tracking-[0.2em] mb-2">Role</Small>
                <Body>{user?.role ?? 'Tenant'}</Body>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {[
              {
                title: 'Saved searches',
                description: 'View your most recent saved neighbourhood or postcode searches.',
              },
              {
                title: 'My reviews',
                description: 'Track review submissions and update the places you’ve shared feedback about.',
              },
              {
                title: 'Account settings',
                description: 'Change your password, email preferences and notification settings.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-[#E5DCD5] bg-white p-6 shadow-sm">
                <H3 className="text-[#1A2B3C] mb-3">{item.title}</H3>
                <Body>{item.description}</Body>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
