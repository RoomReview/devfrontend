import { API_BASE } from '@/config/api.config';

export type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

export const COOKIE_PREFERENCES_KEY = 'roomreview-cookie-preferences';
export const COOKIE_PREFERENCES_CHANGED_EVENT = 'roomreview-cookie-preferences-changed';

const ANALYTICS_ID_COOKIE = 'roomreview_analytics_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const defaultCookiePreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  functional: false,
  marketing: false,
};

const writeCookie = (name: string, value: string, maxAge = COOKIE_MAX_AGE) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
};

const getCookie = (name: string) => {
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.substring(name.length + 1)) : null;
};

const normalizePreferences = (value: Partial<CookiePreferences>): CookiePreferences => ({
  necessary: true,
  analytics: value.analytics === true,
  functional: value.functional === true,
  marketing: value.marketing === true,
});

export const hasStoredCookiePreferences = () => Boolean(localStorage.getItem(COOKIE_PREFERENCES_KEY));

export const getCookiePreferences = (): CookiePreferences => {
  const storedValue = localStorage.getItem(COOKIE_PREFERENCES_KEY) ?? getCookie(COOKIE_PREFERENCES_KEY);

  if (!storedValue) return defaultCookiePreferences;

  try {
    return normalizePreferences(JSON.parse(storedValue) as Partial<CookiePreferences>);
  } catch {
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    removeCookie(COOKIE_PREFERENCES_KEY);
    return defaultCookiePreferences;
  }
};

const getAnalyticsId = () => {
  const existingId = getCookie(ANALYTICS_ID_COOKIE);
  if (existingId) return existingId;

  const analyticsId = crypto.randomUUID();
  writeCookie(ANALYTICS_ID_COOKIE, analyticsId, COOKIE_MAX_AGE * 2);
  return analyticsId;
};

export const saveCookiePreferences = (preferences: CookiePreferences) => {
  const normalizedPreferences = normalizePreferences(preferences);
  const serializedPreferences = JSON.stringify(normalizedPreferences);

  localStorage.setItem(COOKIE_PREFERENCES_KEY, serializedPreferences);
  writeCookie(COOKIE_PREFERENCES_KEY, serializedPreferences);

  if (normalizedPreferences.analytics) {
    getAnalyticsId();
  } else {
    removeCookie(ANALYTICS_ID_COOKIE);
  }

  window.dispatchEvent(new Event(COOKIE_PREFERENCES_CHANGED_EVENT));
};

export const trackPageView = (path: string) => {
  if (!getCookiePreferences().analytics) return;

  void fetch(`${API_BASE}/analytics/events`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName: 'page_view',
      anonymousId: getAnalyticsId(),
      path,
      referrer: document.referrer || undefined,
    }),
  }).catch(() => {
    // Analytics must never interrupt the user's browsing experience.
  });
};
