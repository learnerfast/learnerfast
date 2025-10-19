-- Fix website data storage to ensure all data is properly persisted

-- First, clean up any invalid site_id references
DELETE FROM public.website_builder_saves 
WHERE site_id NOT IN (SELECT id::text FROM public.sites);

-- Update website_builder_saves to use UUID for site_id
ALTER TABLE public.website_builder_saves 
ALTER COLUMN site_id TYPE uuid USING site_id::uuid;

-- Add foreign key constraint
ALTER TABLE public.website_builder_saves 
ADD CONSTRAINT website_builder_saves_site_id_fkey 
FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;

-- Fix sites foreign key to reference auth.users instead of profiles
ALTER TABLE public.sites 
DROP CONSTRAINT IF EXISTS sites_user_id_fkey;

ALTER TABLE public.sites 
ADD CONSTRAINT sites_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_website_builder_saves_site_id ON public.website_builder_saves(site_id);
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON public.sites(user_id);