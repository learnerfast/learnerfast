-- Updated Course Builder Database Schema
-- This file contains all necessary tables and modifications for Course Builder functionality

-- First, ensure the base courses table exists with proper structure
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Course',
  description TEXT,
  category TEXT,
  level TEXT DEFAULT 'Beginner',
  thumbnail TEXT,
  status TEXT DEFAULT 'draft',
  students INTEGER DEFAULT 0,
  duration TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course settings table for General tab
CREATE TABLE IF NOT EXISTS course_settings (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE UNIQUE,
  course_image TEXT,
  course_label TEXT,
  notification_emails JSONB DEFAULT '{"type": "default", "selected": ["enrollment", "completion", "certificate", "installment_paid", "installment_failed", "payment_plan_completed", "payment_plan_cancelled"]}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course access settings for Access tab
CREATE TABLE IF NOT EXISTS course_access (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE UNIQUE,
  access_type TEXT DEFAULT 'free', -- paid, draft, coming-soon, enrollment-closed, free, private
  navigation_type TEXT DEFAULT 'global', -- global, product-specific
  navigation_option TEXT DEFAULT 'after-login', -- thank-you, course-player, product-page, after-login, another-page, specific-url
  navigation_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course pricing for Pricing tab
CREATE TABLE IF NOT EXISTS course_pricing (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE UNIQUE,
  price DECIMAL(10,2) DEFAULT 0,
  compare_price DECIMAL(10,2),
  show_compare_price BOOLEAN DEFAULT false,
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course sections for course outline
CREATE TABLE IF NOT EXISTS course_sections (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  access_type TEXT DEFAULT 'draft', -- draft, soon, free, paid
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course activities for course outline
CREATE TABLE IF NOT EXISTS course_activities (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  section_id INTEGER REFERENCES course_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- video, pdf, audio, presentation, scorm, file
  source TEXT, -- vimeo, youtube, vdocipher, gumlet, iframe, script, embed, upload
  url TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  duration TEXT,
  completed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course automations for Automations tab
CREATE TABLE IF NOT EXISTS course_automations (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- enrollment, completion, tag-added, inactivity, exam-fail
  trigger_conditions JSONB DEFAULT '{}',
  action_type TEXT NOT NULL, -- send-email, enroll-course, add-tag
  action_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  template_type TEXT, -- blank, course-enrollment, learning-engagement, course-completion
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course page layout settings
CREATE TABLE IF NOT EXISTS course_page_layout (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE UNIQUE,
  layout_type TEXT DEFAULT 'default',
  custom_css TEXT,
  header_settings JSONB DEFAULT '{}',
  footer_settings JSONB DEFAULT '{}',
  sidebar_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_page_layout ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their courses" ON courses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their course settings" ON course_settings
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_settings.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Users can manage their course access" ON course_access
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_access.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Users can manage their course pricing" ON course_pricing
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_pricing.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Users can manage their course sections" ON course_sections
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_sections.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Users can manage their course activities" ON course_activities
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_activities.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Users can manage their course automations" ON course_automations
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_automations.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Users can manage their course page layout" ON course_page_layout
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_page_layout.course_id AND courses.user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_course_settings_course_id ON course_settings(course_id);
CREATE INDEX IF NOT EXISTS idx_course_access_course_id ON course_access(course_id);
CREATE INDEX IF NOT EXISTS idx_course_pricing_course_id ON course_pricing(course_id);
CREATE INDEX IF NOT EXISTS idx_course_sections_course_id ON course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_course_activities_course_id ON course_activities(course_id);
CREATE INDEX IF NOT EXISTS idx_course_activities_section_id ON course_activities(section_id);
CREATE INDEX IF NOT EXISTS idx_course_automations_course_id ON course_automations(course_id);
CREATE INDEX IF NOT EXISTS idx_course_page_layout_course_id ON course_page_layout(course_id);

-- Create function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_settings_updated_at 
  BEFORE UPDATE ON course_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_access_updated_at 
  BEFORE UPDATE ON course_access 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_pricing_updated_at 
  BEFORE UPDATE ON course_pricing 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_sections_updated_at 
  BEFORE UPDATE ON course_sections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_activities_updated_at 
  BEFORE UPDATE ON course_activities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_automations_updated_at 
  BEFORE UPDATE ON course_automations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_page_layout_updated_at 
  BEFORE UPDATE ON course_page_layout 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();