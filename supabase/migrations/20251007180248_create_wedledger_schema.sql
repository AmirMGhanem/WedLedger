/*
  # WedLedger Database Schema

  ## Overview
  Creates the core tables for WedLedger - a wedding gift tracking application.

  ## New Tables
  
  ### `users`
  - `id` (uuid, primary key) - Unique user identifier
  - `phone_number` (text, unique) - User's phone number for authentication
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### `family_members`
  - `id` (uuid, primary key) - Unique family member identifier
  - `user_id` (uuid, foreign key) - Links to the user who created this family member
  - `name` (text) - Family member's name
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `gifts`
  - `id` (uuid, primary key) - Unique gift record identifier
  - `user_id` (uuid, foreign key) - Links to the user who created this gift
  - `date` (date) - Date the gift was given
  - `amount` (numeric) - Gift amount in currency
  - `recipient_name` (text) - Name of the person who received the gift
  - `from_family` (boolean) - True if family gift, false if personal gift
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  
  - Enables Row Level Security (RLS) on all tables
  - Creates policies to ensure users can only access their own data
  - SELECT policies: Users can view only their own records
  - INSERT policies: Users can create records associated with their account
  - UPDATE policies: Users can modify only their own records
  - DELETE policies: Users can delete only their own records
  
  ## Notes
  
  1. All tables use UUID for primary keys with automatic generation
  2. Timestamps are stored in UTC using timestamptz
  3. RLS ensures complete data isolation between users
  4. Foreign key constraints maintain referential integrity
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own family members"
  ON family_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own family members"
  ON family_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own family members"
  ON family_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own family members"
  ON family_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create gifts table
CREATE TABLE IF NOT EXISTS gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric NOT NULL,
  recipient_name text NOT NULL,
  from_family boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gifts"
  ON gifts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own gifts"
  ON gifts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own gifts"
  ON gifts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own gifts"
  ON gifts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_user_id ON gifts(user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_date ON gifts(date DESC);