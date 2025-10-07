-- ============================================
-- Add new fields and tables for Gift tracking
-- Run this in Supabase SQL Editor
-- ============================================

-- Add new columns to gifts table
ALTER TABLE public.gifts 
ADD COLUMN IF NOT EXISTS direction text DEFAULT 'given',
ADD COLUMN IF NOT EXISTS event_type text,
ADD COLUMN IF NOT EXISTS gift_type text;

-- Create event_types table
CREATE TABLE IF NOT EXISTS public.event_types (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp WITH time zone DEFAULT NOW()
);

-- Create gift_types table
CREATE TABLE IF NOT EXISTS public.gift_types (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp WITH time zone DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_types
CREATE POLICY "Users can view their event types" 
  ON public.event_types FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their event types" 
  ON public.event_types FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their event types" 
  ON public.event_types FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their event types" 
  ON public.event_types FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow anon access for demo
CREATE POLICY "Allow anon to view event types" 
  ON public.event_types FOR SELECT TO anon USING (TRUE);

CREATE POLICY "Allow anon to insert event types" 
  ON public.event_types FOR INSERT TO anon WITH CHECK (TRUE);

CREATE POLICY "Allow anon to update event types" 
  ON public.event_types FOR UPDATE TO anon USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow anon to delete event types" 
  ON public.event_types FOR DELETE TO anon USING (TRUE);

-- RLS Policies for gift_types
CREATE POLICY "Users can view their gift types" 
  ON public.gift_types FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their gift types" 
  ON public.gift_types FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their gift types" 
  ON public.gift_types FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their gift types" 
  ON public.gift_types FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow anon access for demo
CREATE POLICY "Allow anon to view gift types" 
  ON public.gift_types FOR SELECT TO anon USING (TRUE);

CREATE POLICY "Allow anon to insert gift types" 
  ON public.gift_types FOR INSERT TO anon WITH CHECK (TRUE);

CREATE POLICY "Allow anon to update gift types" 
  ON public.gift_types FOR UPDATE TO anon USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow anon to delete gift types" 
  ON public.gift_types FOR DELETE TO anon USING (TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_event_types_user_id ON public.event_types(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_types_user_id ON public.gift_types(user_id);

-- Insert some default event types (optional)
-- Users can add their own or use these defaults
-- Uncomment if you want defaults:
-- INSERT INTO public.event_types (name, user_id) VALUES ('Wedding', NULL);
-- INSERT INTO public.event_types (name, user_id) VALUES ('Birthday', NULL);
-- INSERT INTO public.event_types (name, user_id) VALUES ('Anniversary', NULL);

-- ============================================
-- Done! Now update the gifts table defaults
-- ============================================

