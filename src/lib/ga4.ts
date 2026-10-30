type AnalyticsEvent = 'page_view' | 'postcode_search' | 'review_submission' | 'report_download' | 'newsletter_signup';
type DeploymentEnvironment = 'development' | 'production';

type Gtag = (...arguments_: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID?.trim();
const deploymentEnvironment: DeploymentEnvironment = import.meta.env.VITE_GA4_ENVIRONMENT === 'production'
  || (import.meta.env.VITE_GA4_ENVIRONMENT === undefined && import.meta.env.PROD)
  ? 'production'
  : 'development';

let initializedMeasurementId: string | null = null;
let loadingScript: Promise<void> | null = null;
let initializationPromise: Promise<boolean> | null = null;
let lastPageView: string | null = null;
const pendingPageViews = new Set<string>();
let analyticsConsentGranted = false;

const getGtag = (): Gtag => {
  window.dataLayer ??= [];
  window.gtag ??= (...arguments_: unknown[]) => window.dataLayer?.push(arguments_);
  return window.gtag;
};

const loadGoogleTag = async () => {
  if (!measurementId || !analyticsConsentGranted) return false;
  if (initializedMeasurementId === measurementId) return true;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    const gtag = getGtag();
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    gtag('set', {
      deployment_environment: deploymentEnvironment,
      traffic_type: deploymentEnvironment,
    });

    if (!loadingScript) {
      gtag('js', new Date());
      loadingScript = new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector<HTMLScriptElement>(`script[src*="${measurementId}"]`);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        script.onload = () => resolve();
        script.onerror = () => {
          script.remove();
          loadingScript = null;
          reject(new Error('Google Analytics could not be loaded.'));
        };
        document.head.appendChild(script);
      });
    }

    await loadingScript;
    if (!analyticsConsentGranted) return false;
    gtag('config', measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    initializedMeasurementId = measurementId;
    return true;
  })();

  try {
    return await initializationPromise;
  } finally {
    initializationPromise = null;
  }
};

const sanitizedPath = (path: string) => {
  const pathname = path.split(/[?#]/, 1)[0] || '/';
  if (/^\/postcode\/[^/]+$/i.test(pathname)) return '/postcode/:postcode';
  if (/^\/borough\/[^/]+$/i.test(pathname)) return '/borough/:id';
  if (/^\/boroughs\/[^/]+$/i.test(pathname)) return '/boroughs/:id';
  return pathname;
};

export const setGa4Consent = (granted: boolean) => {
  analyticsConsentGranted = granted;
  if (!measurementId || !window.dataLayer) return;
  getGtag()('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
};

export const trackGa4PageView = async (path: string) => {
  const safePath = sanitizedPath(path);
  if (lastPageView === safePath || pendingPageViews.has(safePath)) return;
  pendingPageViews.add(safePath);

  try {
    if (!await loadGoogleTag()) return;
    getGtag()('event', 'page_view', {
      page_location: new URL(safePath, window.location.origin).toString(),
      page_path: safePath,
      page_title: 'RoomReview',
      deployment_environment: deploymentEnvironment,
      traffic_type: deploymentEnvironment,
    });
    lastPageView = safePath;
  } catch {
    // Analytics must not interrupt the user's browsing experience.
  } finally {
    pendingPageViews.delete(safePath);
  }
};

export const trackGa4Event = async (eventName: Exclude<AnalyticsEvent, 'page_view'>) => {
  try {
    if (!await loadGoogleTag()) return;
    getGtag()('event', eventName, {
      deployment_environment: deploymentEnvironment,
      traffic_type: deploymentEnvironment,
    });
  } catch {
    // Analytics must not interrupt the user's browsing experience.
  }
};
