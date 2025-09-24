-- Final Course Builder Database Schema - Safe execution
-- This will work regardless of existing state

-- Drop policies only if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users manage own courses" ON courses;
    DROP POLICY IF EXISTS "courses_policy" ON courses;
    DROP POLICY IF EXISTS "course_settings_policy" ON course_settings;
    DROP POLICY IF EXISTS "course_access_policy" ON course_access;
    DROP POLICY IF EXISTS "course_pricing_policy" ON course_pricing;
    DROP POLICY IF EXISTS "course_sections_policy" ON course_sections;
    DROP POLICY IF EXISTS "course_activities_policy" ON course_activities;
    DROP POLICY IF EXISTS "course_automations_policy" ON course_automations;
    DROP POLICY IF EXISTS "course_page_layout_policy" ON course_page_layout;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- Drop tables only if they exist
DROP TABLE IF EXISTS course_page_layout CASCADE;
DROP TABLE IF EXISTS course_automations CASCADE;
DROP TABLE IF EXISTS course_activities CASCADE;
DROP TABLE IF EXISTS course_sections CASCADE;
DROP TABLE IF EXISTS course_pricing CASCADE;
DROP TABLE IF EXISTS course_access CASCADE;
DROP TABLE IF EXISTS course_settings CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- Create all tables
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Course',
  description TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE UNIQUE,
  course_image TEXT,
  course_label TEXT,
  notification_emails JSONB DEFAULT '{"type": "default"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE UNIQUE,
  access_type TEXT DEFAULT 'free',
  navigation_type TEXT DEFAULT 'global',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE UNIQUE,
  price DECIMAL(10,2) DEFAULT 0,
  compare_price DECIMAL(10,2),
  show_compare_price BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  access_type TEXT DEFAULT 'draft',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  source TEXT,
  url TEXT,
  file_url TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_automations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  action_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_page_layout (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE UNIQUE,
  layout_type TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_page_layout ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "courses_policy" ON courses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "course_settings_policy" ON course_settings FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_settings.course_id AND courses.user_id = auth.uid()));
CREATE POLICY "course_access_policy" ON course_access FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_access.course_id AND courses.user_id = auth.uid()));
CREATE POLICY "course_pricing_policy" ON course_pricing FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_pricing.course_id AND courses.user_id = auth.uid()));
CREATE POLICY "course_sections_policy" ON course_sections FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_sections.course_id AND courses.user_id = auth.uid()));
CREATE POLICY "course_activities_policy" ON course_activities FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_activities.course_id AND courses.user_id = auth.uid()));
CREATE POLICY "course_automations_policy" ON course_automations FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_automations.course_id AND courses.user_id = auth.uid()));
CREATE POLICY "course_page_layout_policy" ON course_page_layout FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_page_layout.course_id AND courses.user_id = auth.uid()));

-- Function and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_settings_updated_at BEFORE UPDATE ON course_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_access_updated_at BEFORE UPDATE ON course_access FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_pricing_updated_at BEFORE UPDATE ON course_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_sections_updated_at BEFORE UPDATE ON course_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_activities_updated_at BEFORE UPDATE ON course_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_automations_updated_at BEFORE UPDATE ON course_automations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_page_layout_updated_at BEFORE UPDATE ON course_page_layout FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();