-- Ensure website_users table has all required columns
ALTER TABLE website_users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_website_users_website_name ON website_users(website_name);
CREATE INDEX IF NOT EXISTS idx_website_users_email ON website_users(email);

-- Ensure enrollments table tracks website context and progress
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Create user_analytics table if not exists
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB,
  website_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_analytics_website ON user_analytics(website_name);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event ON user_analytics(event_type);
