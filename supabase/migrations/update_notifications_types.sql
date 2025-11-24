-- Update notifications table to allow new notification types
-- This migration adds support for: permission_update, revoked, viewed, accepted

-- Drop the old CHECK constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new CHECK constraint with all notification types
ALTER TABLE public.notifications 
  ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('system', 'invite', 'connection', 'gift', 'permission_update', 'revoked', 'viewed', 'accepted', 'general'));

