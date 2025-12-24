-- Create page_views table for tracking event page views
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_page_id UUID NOT NULL REFERENCES public.event_pages(id) ON DELETE CASCADE,
  visitor_id TEXT, -- Anonymous identifier for unique visitor tracking
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on page_views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert page views (for tracking)
CREATE POLICY "Anyone can record page views"
ON public.page_views FOR INSERT
WITH CHECK (true);

-- Event owners can view their page views
CREATE POLICY "Event owners can view page views"
ON public.page_views FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.event_pages
    WHERE event_pages.id = page_views.event_page_id
    AND event_pages.user_id = auth.uid()
  )
);

-- Create indexes for efficient querying
CREATE INDEX idx_page_views_event_page_id ON public.page_views(event_page_id);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_visitor_id ON public.page_views(visitor_id);

-- Create a function to get analytics summary for an event
CREATE OR REPLACE FUNCTION public.get_event_analytics(p_event_page_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user owns this event
  IF NOT EXISTS (
    SELECT 1 FROM event_pages 
    WHERE id = p_event_page_id 
    AND user_id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  SELECT json_build_object(
    'total_views', (
      SELECT COUNT(*) FROM page_views WHERE event_page_id = p_event_page_id
    ),
    'unique_visitors', (
      SELECT COUNT(DISTINCT visitor_id) FROM page_views 
      WHERE event_page_id = p_event_page_id AND visitor_id IS NOT NULL
    ),
    'views_today', (
      SELECT COUNT(*) FROM page_views 
      WHERE event_page_id = p_event_page_id 
      AND created_at >= CURRENT_DATE
    ),
    'views_this_week', (
      SELECT COUNT(*) FROM page_views 
      WHERE event_page_id = p_event_page_id 
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    ),
    'calendar_adds', (
      SELECT json_build_object(
        'total', COUNT(*),
        'google', COUNT(*) FILTER (WHERE calendar_type = 'google'),
        'apple', COUNT(*) FILTER (WHERE calendar_type = 'apple'),
        'outlook', COUNT(*) FILTER (WHERE calendar_type = 'outlook'),
        'ics', COUNT(*) FILTER (WHERE calendar_type = 'ics')
      )
      FROM calendar_adds WHERE event_page_id = p_event_page_id
    ),
    'views_by_day', (
      SELECT COALESCE(json_agg(daily_views ORDER BY day), '[]'::json)
      FROM (
        SELECT 
          DATE(created_at) as day,
          COUNT(*) as views
        FROM page_views 
        WHERE event_page_id = p_event_page_id
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
      ) daily_views
    )
  ) INTO result;

  RETURN result;
END;
$$;

