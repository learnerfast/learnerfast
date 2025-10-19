-- Create course_sections table
CREATE TABLE IF NOT EXISTS course_sections (
  id BIGSERIAL PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  access TEXT DEFAULT 'draft' CHECK (access IN ('draft', 'free', 'paid', 'soon')),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_activities table
CREATE TABLE IF NOT EXISTS course_activities (
  id BIGSERIAL PRIMARY KEY,
  section_id BIGINT REFERENCES course_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'pdf', 'audio', 'presentation', 'file')),
  source TEXT,
  url TEXT,
  file_data JSONB,
  completed BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_sections_course_id ON course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_course_activities_section_id ON course_activities(section_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_course_sections_updated_at ON course_sections;
DROP TRIGGER IF EXISTS update_course_activities_updated_at ON course_activities;

CREATE TRIGGER update_course_sections_updated_at BEFORE UPDATE ON course_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_activities_updated_at BEFORE UPDATE ON course_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();