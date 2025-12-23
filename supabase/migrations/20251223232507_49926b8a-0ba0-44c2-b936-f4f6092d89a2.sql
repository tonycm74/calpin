-- Add image_url and url columns to event_pages
ALTER TABLE public.event_pages 
ADD COLUMN image_url TEXT,
ADD COLUMN url TEXT;