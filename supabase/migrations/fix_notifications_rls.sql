-- Fix RLS policies for notifications table to allow server-side API queries
-- This migration adds anon access policies so API routes can query notifications

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anon users to view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow anon users to update notifications" ON public.notifications;

-- Allow anon users to view notifications (for server-side API routes)
CREATE POLICY "Allow anon users to view notifications"
  ON public.notifications
  FOR SELECT
  TO anon
  USING (true);

-- Allow anon users to update notifications (for server-side API routes)
CREATE POLICY "Allow anon users to update notifications"
  ON public.notifications
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

