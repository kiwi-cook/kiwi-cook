import TelemetryDeck from '@telemetrydeck/sdk';

const td = new TelemetryDeck({
  appID: '80B28926-AC55-42FE-99CA-3EBCFDFF002E',
  clientUser: 'kiwi',
});

export function useAnalytics() {
  function trackEvent(event: string, data?: Record<string, unknown>) {
    // Only send events in production
    if (process.env.NODE_ENV === 'production') {
      td.signal(event, data);
    } else {
      console.log(`[Analytics] Event: ${event}`, data);
    }
  }

  function trackPageView(page: string, data?: Record<string, unknown>) {
    // Only send events in production
    if (process.env.NODE_ENV === 'production') {
      td.signal('page_view', { page, ...data });
    } else {
      console.log(`[Analytics] Page View: ${page}`, data);
    }
  }

  return {
    trackEvent,
    trackPageView,
  };
}
