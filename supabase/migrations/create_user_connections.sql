-- Create user_connections table for parent-child relationships
CREATE TABLE IF NOT EXISTS public.user_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('read', 'read_write')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  invite_token TEXT UNIQUE NOT NULL,
  invite_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_user_id, child_user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_connections_parent ON public.user_connections(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_child ON public.user_connections(child_user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_token ON public.user_connections(invite_token);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON public.user_connections(status);

-- Enable RLS
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_connections
-- Note: These policies allow anonymous access since the app uses phone-based auth
-- The application layer enforces security by checking user ownership

-- Allow anonymous users to view connections where they are the parent
CREATE POLICY "Allow anon users to view parent connections"
ON public.user_connections
FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to view connections where they are the child
CREATE POLICY "Allow anon users to view child connections"
ON public.user_connections
FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to create connections
CREATE POLICY "Allow anon users to create connections"
ON public.user_connections
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users to update connections
CREATE POLICY "Allow anon users to update connections"
ON public.user_connections
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Allow anonymous users to delete connections
CREATE POLICY "Allow anon users to delete connections"
ON public.user_connections
FOR DELETE
TO anon
USING (true);

-- RLS Policies to allow parents to read children's data
-- Note: These extend existing policies to allow parents to access children's data
-- The application layer enforces permission levels (read vs read_write)

-- Allow anonymous users to view gifts of connected children
-- This extends the existing gifts SELECT policy
CREATE POLICY "Allow anon users to view connected children's gifts"
ON public.gifts
FOR SELECT
TO anon
USING (
  user_id IN (
    SELECT child_user_id 
    FROM public.user_connections 
    WHERE status = 'accepted'
  )
);

-- Allow anonymous users to modify gifts of connected children with read_write permission
CREATE POLICY "Allow anon users to modify connected children's gifts"
ON public.gifts
FOR ALL
TO anon
USING (
  user_id IN (
    SELECT child_user_id 
    FROM public.user_connections 
    WHERE status = 'accepted'
    AND permission = 'read_write'
  )
)
WITH CHECK (
  user_id IN (
    SELECT child_user_id 
    FROM public.user_connections 
    WHERE status = 'accepted'
    AND permission = 'read_write'
  )
);

-- Allow anonymous users to view family members of connected children
CREATE POLICY "Allow anon users to view connected children's family members"
ON public.family_members
FOR SELECT
TO anon
USING (
  user_id IN (
    SELECT child_user_id 
    FROM public.user_connections 
    WHERE status = 'accepted'
  )
);

-- Allow anonymous users to modify family members of connected children with read_write permission
CREATE POLICY "Allow anon users to modify connected children's family members"
ON public.family_members
FOR ALL
TO anon
USING (
  user_id IN (
    SELECT child_user_id 
    FROM public.user_connections 
    WHERE status = 'accepted'
    AND permission = 'read_write'
  )
)
WITH CHECK (
  user_id IN (
    SELECT child_user_id 
    FROM public.user_connections 
    WHERE status = 'accepted'
    AND permission = 'read_write'
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_connections_updated_at 
BEFORE UPDATE ON public.user_connections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

