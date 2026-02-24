/**
 * Lightweight analytics tracker for The Menon Lab
 * Sends page views to our JSON analytics service
 */
(function() {
  // Configure your analytics endpoint here
  const ANALYTICS_URL = window.ANALYTICS_URL || '';
  
  if (!ANALYTICS_URL) {
    console.debug('[analytics] No ANALYTICS_URL configured, skipping');
    return;
  }

  // Don't track in development
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.debug('[analytics] Skipping localhost');
    return;
  }

  // Send page view
  function trackPageView() {
    const data = {
      path: location.pathname,
      referrer: document.referrer || 'direct'
    };

    fetch(ANALYTICS_URL + '/hit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true
    }).catch(() => {});  // Silently fail
  }

  // Track on load
  if (document.readyState === 'complete') {
    trackPageView();
  } else {
    window.addEventListener('load', trackPageView);
  }

  // Track SPA navigation (if using View Transitions or similar)
  document.addEventListener('astro:page-load', trackPageView);
})();
