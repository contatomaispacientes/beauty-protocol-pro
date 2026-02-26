-- Add phone to profiles
ALTER TABLE public.profiles ADD COLUMN phone text;

-- Add approval status for professional accounts
ALTER TABLE public.profiles ADD COLUMN is_approved boolean NOT NULL DEFAULT true;

-- Professionals start as not approved
COMMENT ON COLUMN public.profiles.is_approved IS 'Professionals need super admin approval. Consumers are auto-approved.';