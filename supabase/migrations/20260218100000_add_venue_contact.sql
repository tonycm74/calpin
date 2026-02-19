-- Add contact fields, Google Place ID, and image gallery to venue profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS venue_phone TEXT,
  ADD COLUMN IF NOT EXISTS venue_website TEXT,
  ADD COLUMN IF NOT EXISTS google_place_id TEXT,
  ADD COLUMN IF NOT EXISTS venue_images TEXT[] DEFAULT '{}';
