-- Create future_events table
CREATE TABLE IF NOT EXISTS public.future_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_type TEXT, -- Can be null, user can enter custom types
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_future_events_user_id ON public.future_events(user_id);
CREATE INDEX idx_future_events_date ON public.future_events(date);
CREATE INDEX idx_future_events_user_date ON public.future_events(user_id, date);

-- Enable RLS
ALTER TABLE public.future_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anon users to view their own events (for server-side API routes)
CREATE POLICY "Allow anon users to view future events"
  ON public.future_events
  FOR SELECT
  TO anon
  USING (true);

-- Users can view their own events (for authenticated clients)
CREATE POLICY "Users can view their own future events"
  ON public.future_events
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Allow anon users to insert their own events (for server-side API routes)
CREATE POLICY "Allow anon users to insert future events"
  ON public.future_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Users can insert their own events
CREATE POLICY "Users can insert their own future events"
  ON public.future_events
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Allow anon users to update their own events (for server-side API routes)
CREATE POLICY "Allow anon users to update future events"
  ON public.future_events
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Users can update their own events
CREATE POLICY "Users can update their own future events"
  ON public.future_events
  FOR UPDATE
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Allow anon users to delete their own events (for server-side API routes)
CREATE POLICY "Allow anon users to delete future events"
  ON public.future_events
  FOR DELETE
  TO anon
  USING (true);

-- Users can delete their own events
CREATE POLICY "Users can delete their own future events"
  ON public.future_events
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_future_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_future_events_updated_at
  BEFORE UPDATE ON public.future_events
  FOR EACH ROW
  EXECUTE FUNCTION update_future_events_updated_at();

