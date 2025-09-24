-- Additional tables for Course Builder functionality

-- Course settings table for General tab
CREATE TABLE IF NOT EXISTS course_settings (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  course_image TEXT,
  course_label TEXT,
  author_name TEXT,
  author_avatar TEXT,
  categories TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  robots_meta TEXT DEFAULT 'INDEX',
  auto_extract_seo BOOLEAN DEFAULT true,
  notification_emails JSONB DEFAULT '{"type": "default", "selected": []}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course access settings for Access tab
CREATE TABLE IF NOT EXISTS course_access (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  access_type TEXT DEFAULT 'free', -- paid, draft, coming-soon, enrollment-closed, free, private
  public_url TEXT,
  course_id_string TEXT,
  mobile_course_id TEXT,
  expiration_type TEXT DEFAULT 'never', -- never, 30days, 60days, 90days, 1year
  navigation_type TEXT DEFAULT 'global', -- global, product-specific
  navigation_option TEXT DEFAULT 'after-login', -- thank-you, course-player, product-page, after-login, another-page, specific-url
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course pricing for Pricing tab
CREATE TABLE IF NOT EXISTS course_pricing (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  price DECIMAL(10,2) DEFAULT 0,
  compare_price DECIMAL(10,2),
  show_compare_price BOOLEAN DEFAULT false,
  show_extended_menu BOOLEAN DEFAULT true,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course progress settings for User Progress tab
CREATE TABLE IF NOT EXISTS course_progress_settings (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  enable_progress_tracking BOOLEAN DEFAULT true,
  show_progress_bar BOOLEAN DEFAULT true,
  require_sequential_completion BOOLEAN DEFAULT false,
  minimum_completion_percentage INTEGER DEFAULT 80,
  require_passing_quizzes BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course player settings for Course Player tab
CREATE TABLE IF NOT EXISTS course_player_settings (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  player_skin TEXT DEFAULT 'coloured-minimal', -- coloured-minimal, classic, minimal, one-activity-minimal, one-activity-dark
  show_course_name BOOLEAN DEFAULT true,
  show_progress_bar BOOLEAN DEFAULT true,
  show_all_lessons BOOLEAN DEFAULT true,
  show_description_link BOOLEAN DEFAULT true,
  expand_menu_default BOOLEAN DEFAULT false,
  auto_complete_sections BOOLEAN DEFAULT false,
  navigation_position TEXT DEFAULT 'top', -- top, bottom, none
  previous_button_text TEXT DEFAULT 'Previous',
  next_button_text TEXT DEFAULT 'Next',
  back_button_type TEXT DEFAULT 'course-layout', -- none, course-layout, site-logo, another-page, specific-url
  auto_progress_enabled BOOLEAN DEFAULT false,
  free_navigation BOOLEAN DEFAULT true,
  completion_rule TEXT DEFAULT 'all-activities', -- all-activities, all-exams, specific-exam
  completion_exam_id INTEGER,
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
  trigger_type TEXT NOT NULL, -- enrollment, completion, tag-added, inactivity, etc.
  trigger_conditions JSONB,
  action_type TEXT NOT NULL, -- send-email, enroll-course, add-tag, etc.
  action_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video library for Video Library tab
CREATE TABLE IF NOT EXISTS course_video_library (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  duration TEXT,
  thumbnail_url TEXT,
  quality TEXT DEFAULT 'auto',
  auto_generate_thumbnails BOOLEAN DEFAULT true,
  enable_compression BOOLEAN DEFAULT false,
  upload_status TEXT DEFAULT 'completed', -- uploading, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all new tables
ALTER TABLE course_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_player_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_video_library ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their course settings" ON course_settings
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_settings.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Users can manage their course access" ON course_access
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_access.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Users can manage their course pricing" ON course_pricing
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_pricing.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Users can manage their course progress settings" ON course_progress_settings
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_progress_settings.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Users can manage their course player settings" ON course_player_settings
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_player_settings.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Users can manage their course sections" ON course_sections
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_sections.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Users can manage their course activities" ON course_activities
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_activities.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Users can manage their course automations" ON course_automations
  FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_automations.course_id AND courses.user_id = auth.uid()));

CREATE POLICY "Users can manage their video library" ON course_video_library
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_settings_course_id ON course_settings(course_id);
CREATE INDEX IF NOT EXISTS idx_course_access_course_id ON course_access(course_id);
CREATE INDEX IF NOT EXISTS idx_course_pricing_course_id ON course_pricing(course_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_settings_course_id ON course_progress_settings(course_id);
CREATE INDEX IF NOT EXISTS idx_course_player_settings_course_id ON course_player_settings(course_id);
CREATE INDEX IF NOT EXISTS idx_course_sections_course_id ON course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_course_activities_course_id ON course_activities(course_id);
CREATE INDEX IF NOT EXISTS idx_course_activities_section_id ON course_activities(section_id);
CREATE INDEX IF NOT EXISTS idx_course_automations_course_id ON course_automations(course_id);
CREATE INDEX IF NOT EXISTS idx_course_video_library_course_id ON course_video_library(course_id);
CREATE INDEX IF NOT EXISTS idx_course_video_library_user_id ON course_video_library(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_course_settings_updated_at 
  BEFORE UPDATE ON course_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_access_updated_at 
  BEFORE UPDATE ON course_access 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_pricing_updated_at 
  BEFORE UPDATE ON course_pricing 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_progress_settings_updated_at 
  BEFORE UPDATE ON course_progress_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_player_settings_updated_at 
  BEFORE UPDATE ON course_player_settings 
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

CREATE TRIGGER update_course_video_library_updated_at 
  BEFORE UPDATE ON course_video_library 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();