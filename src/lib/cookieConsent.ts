import { API_BASE } from '@/config/api.config';

export type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

const ANALYTICS_ID_COOKIE = 'roomreview_analytics_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const defaultCookiePreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  functional: false,
  marketing: false,
};

const getCookie = (name: string) => {
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.substring(name.length + 1)) : null;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
};

const getAnalyticsId = () => {
  const existingId = getCookie(ANALYTICS_ID_COOKIE);
  if (existingId) return existingId;

  const analyticsId = crypto.randomUUID();
  document.cookie = `${ANALYTICS_ID_COOKIE}=${encodeURIComponent(analyticsId)}; Max-Age=${COOKIE_MAX_AGE * 2}; Path=/; SameSite=Lax`;
  return analyticsId;
};

const sanitizePath = (path: string) => (path.split(/[?#]/, 1)[0] || '/')
  .replace(/\/postcode\/[^/]+/gi, '/postcode/:postcode')
  .replace(/\/boroughs?\/[^/]+/gi, '/borough/:id');

export const getCookiePreferences = (): CookiePreferences => {
  const cookieYesConsent = getCookie('cookieyes-consent');
  if (!cookieYesConsent) return defaultCookiePreferences;

  const categories = new Map(
    cookieYesConsent.split(/[;,]/).map((entry) => {
      const [category, value] = entry.trim().split(':', 2);
      return [category?.toLowerCase(), value?.toLowerCase()] as const;
    }),
  );

  return {
    necessary: true,
    analytics: categories.get('analytics') === 'yes',
    functional: categories.get('functional') === 'yes',
    marketing: categories.get('advertisement') === 'yes',
  };
};

export const trackPageView = (path: string) => {
  const dataLayer = window.dataLayer = window.dataLayer || [];
  const sanitizedPath = sanitizePath(path);
  dataLayer.push({
    event: 'page_view',
    page_path: sanitizedPath,
  });

  if (!getCookiePreferences().analytics) {
    removeCookie(ANALYTICS_ID_COOKIE);
    return;
  }

  void fetch(`${API_BASE}/analytics/events`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName: 'page_view',
      anonymousId: getAnalyticsId(),
      path: sanitizedPath,
    }),
  }).catch(() => {
    // Analytics must never interrupt the user's browsing experience.
  });
};

export const trackAnalyticsEvent = (eventName: string) => {
  const dataLayer = window.dataLayer = window.dataLayer || [];
  dataLayer.push({ event: eventName });
};

