-- Create course_settings table
CREATE TABLE IF NOT EXISTS course_settings (
  id BIGSERIAL PRIMARY KEY,
  course_id TEXT NOT NULL,
  course_image TEXT,
  course_label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id)
);

-- Create course_access table
CREATE TABLE IF NOT EXISTS course_access (
  id BIGSERIAL PRIMARY KEY,
  course_id TEXT NOT NULL,
  access_type TEXT DEFAULT 'free',
  navigation_type TEXT DEFAULT 'global',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_course_settings_course_id ON course_settings(course_id);
CREATE INDEX IF NOT EXISTS idx_course_access_course_id ON course_access(course_id);

-- Add triggers
DROP TRIGGER IF EXISTS update_course_settings_updated_at ON course_settings;
DROP TRIGGER IF EXISTS update_course_access_updated_at ON course_access;

CREATE TRIGGER update_course_settings_updated_at BEFORE UPDATE ON course_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_access_updated_at BEFORE UPDATE ON course_access FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();