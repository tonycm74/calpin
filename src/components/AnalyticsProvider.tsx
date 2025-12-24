import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, usePageTracking } from '@/hooks/useAnalytics';

/**
 * Component that handles GA initialization and page tracking
 * Must be placed inside BrowserRouter
 */
function PageTracker() {
  usePageTracking();
  return null;
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Analytics Provider component
 * Initializes Google Analytics and tracks page views
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <>
      <PageTracker />
      {children}
    </>
  );
}

