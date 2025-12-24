import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Generate or retrieve a persistent visitor ID
function getVisitorId(): string {
  const storageKey = 'calping_visitor_id';
  let visitorId = localStorage.getItem(storageKey);
  
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(storageKey, visitorId);
  }
  
  return visitorId;
}

export interface EventAnalytics {
  total_views: number;
  unique_visitors: number;
  views_today: number;
  views_this_week: number;
  calendar_adds: {
    total: number;
    google: number;
    apple: number;
    outlook: number;
    ics: number;
  };
  views_by_day: Array<{
    day: string;
    views: number;
  }>;
}

/**
 * Hook to track a page view when an event page loads
 * Only tracks once per page load
 */
export function useTrackPageView(eventPageId: string | undefined) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!eventPageId || hasTracked.current) return;

    const trackView = async () => {
      try {
        const { error } = await supabase
          .from('page_views')
          .insert({
            event_page_id: eventPageId,
            visitor_id: getVisitorId(),
            referrer: document.referrer || null,
            user_agent: navigator.userAgent || null,
          });

        if (error) {
          console.error('Failed to track page view:', error);
        } else {
          hasTracked.current = true;
        }
      } catch (err) {
        console.error('Error tracking page view:', err);
      }
    };

    trackView();
  }, [eventPageId]);
}

/**
 * Hook to fetch analytics for a specific event page
 */
export function useEventAnalytics(eventPageId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['event-analytics', eventPageId],
    queryFn: async () => {
      if (!eventPageId) return null;

      const { data, error } = await supabase.rpc('get_event_analytics', {
        p_event_page_id: eventPageId,
      });

      if (error) throw error;
      return data as unknown as EventAnalytics | null;
    },
    enabled: !!eventPageId && !!user,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch analytics for all user's events
 */
export function useAllEventAnalytics(eventPageIds: string[]) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-event-analytics', eventPageIds],
    queryFn: async () => {
      if (!eventPageIds.length) return {};

      const results: Record<string, EventAnalytics> = {};

      await Promise.all(
        eventPageIds.map(async (id) => {
          const { data, error } = await supabase.rpc('get_event_analytics', {
            p_event_page_id: id,
          });

          if (!error && data) {
            results[id] = data as unknown as EventAnalytics;
          }
        })
      );

      return results;
    },
    enabled: !!user && eventPageIds.length > 0,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
}

