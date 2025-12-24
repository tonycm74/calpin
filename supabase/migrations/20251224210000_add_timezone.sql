-- Add timezone column to event_pages table
ALTER TABLE public.event_pages
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Add comment for documentation
COMMENT ON COLUMN public.event_pages.timezone IS 'IANA timezone identifier for the event (e.g., America/New_York)';

