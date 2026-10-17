import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { accountSettingsService, type EmailPreferences } from '@/services/account-settings.service';
import Button from '@/components/common/Button';
import { Body, H1, H2 } from '@/components/common/Typography';
import Input from '@/components/common/Input';
import { extractApiError } from '@/utils/apiError';

const initialPreferences: EmailPreferences = {
  emailOnReviewApproved: true,
  emailOnReviewRejected: true,
};

const AccountSettingsPage = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferences>(initialPreferences);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [preferencesError, setPreferencesError] = useState('');
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const loadPreferences = async () => {
    setPreferencesLoading(true);
    setPreferencesError('');
    try {
      setPreferences(await accountSettingsService.getEmailPreferences());
      setPreferencesReady(true);
    } catch (error) {
      setPreferencesReady(false);
      setPreferencesError(extractApiError(error));
    } finally {
      setPreferencesLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) void loadPreferences();
  }, [isAuthenticated]);

  const savePreferences = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPreferencesSaving(true);
    setPreferencesError('');
    setPreferencesSaved(false);
    try {
      setPreferences(await accountSettingsService.updateEmailPreferences(preferences));
      setPreferencesSaved(true);
    } catch (error) {
      setPreferencesError(extractApiError(error));
    } finally {
      setPreferencesSaving(false);
    }
  };

  const submitPasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSaved(false);

    if (newPassword.length < 8 || newPassword.length > 128) {
      setPasswordError('Your new password must be between 8 and 128 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('The new password and confirmation do not match.');
      return;
    }
    if (oldPassword === newPassword) {
      setPasswordError('Your new password must be different from your current password.');
      return;
    }
    if (!user?.userId) {
      setPasswordError('Your account could not be verified. Please sign in again.');
      return;
    }

    setPasswordSaving(true);
    try {
      await accountSettingsService.changePassword(user.userId, { oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);
    } catch (error) {
      setPasswordError(extractApiError(error));
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <main className="min-h-[60vh] px-4 py-16"><Body>Loading your account...</Body></main>;
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-[60vh] px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#E5DCD5] bg-white p-8 text-center">
          <H2>Sign in to manage your account settings</H2>
          <Link to="/login?returnTo=%2Faccount%2Fsettings" className="mt-5 inline-flex">
            <Button>Sign in</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F4F1] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link to="/account" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#8B0202]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> My account
        </Link>
        <H1 className="text-[#1A2B3C]">Account settings</H1>
        <Body className="mt-2 text-[#4B5563]">Update your password and choose which review status emails you receive.</Body>

        <section className="mt-8 rounded-2xl border border-[#E5DCD5] bg-white p-6 shadow-sm" aria-labelledby="password-settings-title">
          <H2 id="password-settings-title" className="text-xl text-[#1A2B3C]">Change password</H2>
          <form className="mt-5 space-y-4" onSubmit={(event) => void submitPasswordChange(event)}>
            <Input
              label="Current password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
            />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <p className="text-xs text-[#64707A]">Use 8–128 characters. If you signed in with Google or Facebook and have no password yet, use the password reset flow to set one.</p>
            {passwordError && <p role="alert" className="text-sm font-semibold text-red-700">{passwordError}</p>}
            {passwordSaved && <p role="status" className="flex items-center gap-2 text-sm font-semibold text-green-800"><CheckCircle2 className="h-4 w-4" /> Password changed successfully.</p>}
            <Button type="submit" isLoading={passwordSaving}>Save password</Button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-[#E5DCD5] bg-white p-6 shadow-sm" aria-labelledby="email-preferences-title">
          <H2 id="email-preferences-title" className="text-xl text-[#1A2B3C]">Email preferences</H2>
          <Body className="mt-2 text-sm text-[#64707A]">Choose whether we email you when a moderator reviews one of your submissions. Essential security and account emails are not affected.</Body>
          {preferencesLoading ? (
            <Body className="mt-5">Loading email preferences...</Body>
          ) : !preferencesReady ? (
            <div className="mt-5 space-y-3">
              <p role="alert" className="text-sm font-semibold text-red-700">{preferencesError || 'Email preferences could not be loaded.'}</p>
              <Button size="sm" variant="secondary" onClick={() => void loadPreferences()}>Try again</Button>
            </div>
          ) : (
            <form className="mt-5 space-y-4" onSubmit={(event) => void savePreferences(event)}>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[#8B0202]"
                  checked={preferences.emailOnReviewApproved}
                  onChange={(event) => {
                    setPreferences((current) => ({ ...current, emailOnReviewApproved: event.target.checked }));
                    setPreferencesSaved(false);
                  }}
                />
                <span><span className="block font-semibold text-[#1A2B3C]">Review approved and published</span><span className="text-sm text-[#64707A]">Email me when my review is approved.</span></span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[#8B0202]"
                  checked={preferences.emailOnReviewRejected}
                  onChange={(event) => {
                    setPreferences((current) => ({ ...current, emailOnReviewRejected: event.target.checked }));
                    setPreferencesSaved(false);
                  }}
                />
                <span><span className="block font-semibold text-[#1A2B3C]">Review not approved</span><span className="text-sm text-[#64707A]">Email me if my review is rejected, including the moderator’s reason.</span></span>
              </label>
              {preferencesError && <p role="alert" className="text-sm font-semibold text-red-700">{preferencesError}</p>}
              {preferencesSaved && <p role="status" className="flex items-center gap-2 text-sm font-semibold text-green-800"><CheckCircle2 className="h-4 w-4" /> Email preferences saved.</p>}
              <Button type="submit" isLoading={preferencesSaving}>Save email preferences</Button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
};

export default AccountSettingsPage;
