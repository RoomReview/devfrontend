import { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import {
  COOKIE_PREFERENCES_CHANGED_EVENT,
  defaultCookiePreferences,
  hasStoredCookiePreferences,
  saveCookiePreferences,
} from '@/lib/cookieConsent';

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!hasStoredCookiePreferences());

    const handlePreferencesChanged = () => setIsVisible(false);
    window.addEventListener(COOKIE_PREFERENCES_CHANGED_EVENT, handlePreferencesChanged);

    return () => window.removeEventListener(COOKIE_PREFERENCES_CHANGED_EVENT, handlePreferencesChanged);
  }, []);

  if (!isVisible) return null;

  const rejectNonEssential = () => {
    saveCookiePreferences(defaultCookiePreferences);
  };

  const acceptAll = () => {
    saveCookiePreferences({
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
    });
  };

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-xl border border-[#DCE7F2] bg-white p-5 shadow-xl" aria-label="Cookie consent">
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-[#8B0000]" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-bold text-[#1A202C]">Your cookie choices</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#5F6D7A]">
            We use necessary cookies to run RoomReview. With your permission, anonymous analytics cookies help us understand which pages are useful.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={rejectNonEssential}
          className="rounded-lg border border-[#CBD5E0] px-4 py-2 text-xs font-medium text-[#2D3748] transition-colors hover:bg-[#F7FAFC]"
        >
          Necessary only
        </button>
        <button
          type="button"
          onClick={acceptAll}
          className="rounded-lg bg-[#8B0000] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#700000]"
        >
          Accept all
        </button>
      </div>
    </aside>
  );
};

export default CookieConsentBanner;
