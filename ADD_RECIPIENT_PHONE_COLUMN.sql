-- Add recipient_phone column to gifts table
-- Run this SQL in your Supabase SQL Editor

-- Add recipient_phone column (if it doesn't already exist)
ALTER TABLE gifts 
ADD COLUMN IF NOT EXISTS recipient_phone TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gifts' 
AND column_name = 'recipient_phone';

