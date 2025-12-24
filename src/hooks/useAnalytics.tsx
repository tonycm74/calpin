import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Extend window type for gtag
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Initialize Google Analytics
 * Called once when the app loads
 */
export function initGA() {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics: VITE_GA_MEASUREMENT_ID not set');
    return;
  }

  // Load GA script dynamically
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll handle page views manually for SPA
  });
}

/**
 * Track a page view
 */
export function trackPageView(path: string, title?: string) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
  });
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, eventParams);
}

/**
 * Hook to automatically track page views on route changes
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Small delay to ensure the page title has updated
    const timeoutId = setTimeout(() => {
      trackPageView(location.pathname + location.search);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location]);
}

/**
 * Predefined event tracking functions for common actions
 */
export const analytics = {
  // User events
  signUp: () => trackEvent('sign_up'),
  login: () => trackEvent('login'),
  logout: () => trackEvent('logout'),

  // Event page events
  viewEvent: (eventSlug: string, eventName?: string) =>
    trackEvent('view_event', {
      event_slug: eventSlug,
      event_name: eventName || '',
    }),

  addToCalendar: (eventSlug: string, calendarType: string) =>
    trackEvent('add_to_calendar', {
      event_slug: eventSlug,
      calendar_type: calendarType,
    }),

  createEvent: (eventName: string) =>
    trackEvent('create_event', {
      event_name: eventName,
    }),

  shareEvent: (eventSlug: string, shareMethod: string) =>
    trackEvent('share_event', {
      event_slug: eventSlug,
      share_method: shareMethod,
    }),

  // Custom event for any action
  custom: trackEvent,
};

