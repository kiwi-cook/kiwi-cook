export function useAnalytics() {
  function trackEvent(event: string, data?: Record<string, unknown>) {
    console.log(`[Analytics] Event: ${event}`, data);
  }

  function trackPageView(page: string, data?: Record<string, unknown>) {
    console.log(`[Analytics] Page View: ${page}`, data);
  }

  return {
    trackEvent,
    trackPageView,
  };
}
