import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('GTM analytics events and CookieYes consent', () => {
  beforeEach(() => {
    vi.resetModules();
    window.dataLayer = [];
    document.cookie = 'cookieyes-consent=; Max-Age=0; Path=/';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  test('queues sanitized page views and custom events for GTM', async () => {
    const { trackAnalyticsEvent, trackPageView } = await import('../src/lib/cookieConsent');

    trackPageView('/postcode/AB1%202CD?email=private@example.com');
    trackAnalyticsEvent('report_download');

    expect(window.dataLayer).toEqual([
      { event: 'page_view', page_path: '/postcode/:postcode' },
      { event: 'report_download' },
    ]);
    expect(JSON.stringify(window.dataLayer)).not.toMatch(/AB1|private@example\.com/);
    expect(fetch).not.toHaveBeenCalled();
  });

  test('sends backend page analytics only when CookieYes analytics consent is granted', async () => {
    document.cookie = 'cookieyes-consent=consent:yes,necessary:yes,analytics:yes,functional:no,advertisement:no; Path=/';
    const { trackPageView } = await import('../src/lib/cookieConsent');

    trackPageView('/postcode/NW1%201AA?token=secret');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/analytics/events'), expect.objectContaining({
      body: expect.stringContaining('"path":"/postcode/:postcode"'),
    }));
    expect(JSON.stringify(fetch.mock.calls)).not.toMatch(/NW1|secret/);
  });
});
