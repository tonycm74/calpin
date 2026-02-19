-- Add page_type and capacity to event_pages
ALTER TABLE public.event_pages
  ADD COLUMN IF NOT EXISTS page_type TEXT NOT NULL DEFAULT 'calendar',
  ADD COLUMN IF NOT EXISTS capacity INTEGER;

-- Create event_rsvps table
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_page_id UUID NOT NULL REFERENCES public.event_pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_page_id, email)
);

-- Enable RLS
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an RSVP (public insert)
CREATE POLICY "Anyone can submit RSVP"
  ON public.event_rsvps
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Event owners can view RSVPs for their events
CREATE POLICY "Event owners can view RSVPs"
  ON public.event_rsvps
  FOR SELECT
  TO authenticated
  USING (
    event_page_id IN (
      SELECT id FROM public.event_pages WHERE user_id = auth.uid()
    )
  );

-- Allow public to count RSVPs (for showing spots left)
CREATE POLICY "Anyone can count RSVPs"
  ON public.event_rsvps
  FOR SELECT
  TO anon, authenticated
  USING (true);
