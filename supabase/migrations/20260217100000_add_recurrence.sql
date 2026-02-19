-- Add recurrence columns to event_pages
ALTER TABLE public.event_pages
  ADD COLUMN IF NOT EXISTS recurrence_rule JSONB,
  ADD COLUMN IF NOT EXISTS parent_event_id UUID REFERENCES public.event_pages(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_recurring_parent BOOLEAN NOT NULL DEFAULT false;
