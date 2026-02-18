-- Create site_users table for tracking registrations on template websites
CREATE TABLE IF NOT EXISTS site_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, site_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_site_users_site_id ON site_users(site_id);
CREATE INDEX IF NOT EXISTS idx_site_users_email ON site_users(email);
CREATE INDEX IF NOT EXISTS idx_site_users_registered_at ON site_users(registered_at DESC);

-- Enable RLS
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;

-- Policy: Site owners can view their site's registered users
CREATE POLICY "Site owners can view their users"
  ON site_users FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM sites WHERE user_id = auth.uid()
    )
  );

-- Policy: Anyone can register (for public registration forms)
CREATE POLICY "Anyone can register on sites"
  ON site_users FOR INSERT
  WITH CHECK (true);
