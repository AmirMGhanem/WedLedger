-- ============================================
-- WedLedger - Supabase RLS Policies Setup
-- ============================================
-- Run this in your Supabase SQL Editor
-- Dashboard: https://fxvvpsfxqygftitvyuwo.supabase.co
-- ============================================

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Allow anon users to insert" ON public.users;
DROP POLICY IF EXISTS "Allow anon users to view all" ON public.users;
DROP POLICY IF EXISTS "Allow anon users to update" ON public.users;

DROP POLICY IF EXISTS "Allow anon users to view family members" ON public.family_members;
DROP POLICY IF EXISTS "Allow anon users to insert family members" ON public.family_members;
DROP POLICY IF EXISTS "Allow anon users to update family members" ON public.family_members;
DROP POLICY IF EXISTS "Allow anon users to delete family members" ON public.family_members;

DROP POLICY IF EXISTS "Allow anon users to view gifts" ON public.gifts;
DROP POLICY IF EXISTS "Allow anon users to insert gifts" ON public.gifts;
DROP POLICY IF EXISTS "Allow anon users to update gifts" ON public.gifts;
DROP POLICY IF EXISTS "Allow anon users to delete gifts" ON public.gifts;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Allow anonymous users to insert new users (for signup)
CREATE POLICY "Allow anon users to insert"
  ON public.users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to view all users (for login check)
CREATE POLICY "Allow anon users to view all"
  ON public.users
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to update users (for OTP updates)
CREATE POLICY "Allow anon users to update"
  ON public.users
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================
-- FAMILY MEMBERS TABLE POLICIES
-- ============================================

-- Allow anonymous users to view family members
CREATE POLICY "Allow anon users to view family members"
  ON public.family_members
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to insert family members
CREATE POLICY "Allow anon users to insert family members"
  ON public.family_members
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to update family members
CREATE POLICY "Allow anon users to update family members"
  ON public.family_members
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to delete family members
CREATE POLICY "Allow anon users to delete family members"
  ON public.family_members
  FOR DELETE
  TO anon
  USING (true);

-- ============================================
-- GIFTS TABLE POLICIES
-- ============================================

-- Allow anonymous users to view gifts
CREATE POLICY "Allow anon users to view gifts"
  ON public.gifts
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to insert gifts
CREATE POLICY "Allow anon users to insert gifts"
  ON public.gifts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to update gifts
CREATE POLICY "Allow anon users to update gifts"
  ON public.gifts
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to delete gifts
CREATE POLICY "Allow anon users to delete gifts"
  ON public.gifts
  FOR DELETE
  TO anon
  USING (true);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify policies are created:

-- Check users policies
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;

-- Check family_members policies
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'family_members' 
ORDER BY policyname;

-- Check gifts policies
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'gifts' 
ORDER BY policyname;

-- ============================================
-- SUCCESS!
-- ============================================
-- If you see policies listed above, you're all set!
-- Close this SQL Editor and test the app.
-- ============================================

