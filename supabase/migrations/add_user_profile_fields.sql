-- Add user profile fields: firstname, lastname, birthdate
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS firstname TEXT,
ADD COLUMN IF NOT EXISTS lastname TEXT,
ADD COLUMN IF NOT EXISTS birthdate DATE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_firstname ON public.users(firstname);
CREATE INDEX IF NOT EXISTS idx_users_lastname ON public.users(lastname);

