-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create event_pages table
CREATE TABLE public.event_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  slug TEXT NOT NULL UNIQUE,
  reminder_minutes INTEGER[] DEFAULT ARRAY[60, 1440],
  ui_schema JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on event_pages
ALTER TABLE public.event_pages ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_pages
CREATE POLICY "Anyone can view event pages"
ON public.event_pages FOR SELECT
USING (true);

CREATE POLICY "Users can create their own event pages"
ON public.event_pages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own event pages"
ON public.event_pages FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event pages"
ON public.event_pages FOR DELETE
USING (auth.uid() = user_id);

-- Create calendar_adds table for tracking
CREATE TABLE public.calendar_adds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_page_id UUID NOT NULL REFERENCES public.event_pages(id) ON DELETE CASCADE,
  calendar_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on calendar_adds
ALTER TABLE public.calendar_adds ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_adds (public insert, owner can view)
CREATE POLICY "Anyone can add calendar entries"
ON public.calendar_adds FOR INSERT
WITH CHECK (true);

CREATE POLICY "Event owners can view calendar adds"
ON public.calendar_adds FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.event_pages
    WHERE event_pages.id = calendar_adds.event_page_id
    AND event_pages.user_id = auth.uid()
  )
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_pages_updated_at
  BEFORE UPDATE ON public.event_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create index for faster slug lookups
CREATE INDEX idx_event_pages_slug ON public.event_pages(slug);
CREATE INDEX idx_event_pages_user_id ON public.event_pages(user_id);
CREATE INDEX idx_calendar_adds_event_page_id ON public.calendar_adds(event_page_id);