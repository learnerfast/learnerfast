-- Additional tables for complete localStorage migration

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  settings_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User messages table
CREATE TABLE IF NOT EXISTS user_messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Website builder saves table
CREATE TABLE IF NOT EXISTS website_builder_saves (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  page_contents JSONB DEFAULT '{}',
  page_data JSONB DEFAULT '{}',
  template_id TEXT,
  site_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(site_id, user_id)
);

-- Course videos table (for course video tracking)
CREATE TABLE IF NOT EXISTS course_videos (
  id BIGSERIAL PRIMARY KEY,
  course_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_data JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- Theme customizations table
CREATE TABLE IF NOT EXISTS theme_customizations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  page_name TEXT NOT NULL,
  theme_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, page_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_messages_sender_id ON user_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_recipient ON user_messages(recipient_email);
CREATE INDEX IF NOT EXISTS idx_website_builder_saves_user_id ON website_builder_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_website_builder_saves_site_id ON website_builder_saves(site_id);
CREATE INDEX IF NOT EXISTS idx_course_videos_user_id ON course_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_course_videos_course_id ON course_videos(course_id);
CREATE INDEX IF NOT EXISTS idx_theme_customizations_user_id ON theme_customizations(user_id);

-- Add updated_at triggers for new tables
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS update_user_messages_updated_at ON user_messages;
DROP TRIGGER IF EXISTS update_website_builder_saves_updated_at ON website_builder_saves;
DROP TRIGGER IF EXISTS update_course_videos_updated_at ON course_videos;
DROP TRIGGER IF EXISTS update_theme_customizations_updated_at ON theme_customizations;

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_messages_updated_at BEFORE UPDATE ON user_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_website_builder_saves_updated_at BEFORE UPDATE ON website_builder_saves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_videos_updated_at BEFORE UPDATE ON course_videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_theme_customizations_updated_at BEFORE UPDATE ON theme_customizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();