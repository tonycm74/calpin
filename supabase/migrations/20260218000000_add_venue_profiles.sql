-- Add venue fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS venue_name TEXT,
  ADD COLUMN IF NOT EXISTS venue_description TEXT,
  ADD COLUMN IF NOT EXISTS venue_address TEXT,
  ADD COLUMN IF NOT EXISTS venue_image_url TEXT;

-- Add event categories
ALTER TABLE event_pages
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';

-- Public access to profiles (for resolving username → user_id)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (username IS NOT NULL);

-- Public access to non-parent events (for public schedule page)
CREATE POLICY "Public events are viewable by everyone"
  ON event_pages FOR SELECT
  USING (is_recurring_parent = false);
