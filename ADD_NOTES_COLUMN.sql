-- Add notes column to gifts table
-- Run this SQL in your Supabase SQL Editor

-- Add notes column (if it doesn't already exist)
ALTER TABLE gifts 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gifts' 
AND column_name = 'notes';

