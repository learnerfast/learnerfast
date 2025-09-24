-- Videmy Dashboard Database Schema for Supabase

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'instructor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Websites/Sites table
CREATE TABLE public.sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  status TEXT DEFAULT 'draft',
  template_id TEXT,
  template_path TEXT,
  last_edited DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pages table
CREATE TABLE public.pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB,
  template_content TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page Elements table
CREATE TABLE public.page_elements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL,
  content TEXT,
  attributes JSONB,
  styles JSONB,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  thumbnail_url TEXT,
  template_path TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Theme Settings table
CREATE TABLE public.theme_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  primary_color TEXT DEFAULT '#0ea5e9',
  secondary_color TEXT DEFAULT '#64748b',
  font_family TEXT DEFAULT 'Inter',
  logo_url TEXT,
  favicon_url TEXT,
  custom_css TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own sites" ON public.sites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sites" ON public.sites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sites" ON public.sites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sites" ON public.sites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view pages of own sites" ON public.pages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sites WHERE sites.id = pages.site_id AND sites.user_id = auth.uid())
);
CREATE POLICY "Users can create pages for own sites" ON public.pages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.sites WHERE sites.id = pages.site_id AND sites.user_id = auth.uid())
);
CREATE POLICY "Users can update pages of own sites" ON public.pages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.sites WHERE sites.id = pages.site_id AND sites.user_id = auth.uid())
);
CREATE POLICY "Users can delete pages of own sites" ON public.pages FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.sites WHERE sites.id = pages.site_id AND sites.user_id = auth.uid())
);

CREATE POLICY "Users can view elements of own pages" ON public.page_elements FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.pages 
    JOIN public.sites ON sites.id = pages.site_id 
    WHERE pages.id = page_elements.page_id AND sites.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create elements for own pages" ON public.page_elements FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pages 
    JOIN public.sites ON sites.id = pages.site_id 
    WHERE pages.id = page_elements.page_id AND sites.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update elements of own pages" ON public.page_elements FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.pages 
    JOIN public.sites ON sites.id = pages.site_id 
    WHERE pages.id = page_elements.page_id AND sites.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete elements of own pages" ON public.page_elements FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.pages 
    JOIN public.sites ON sites.id = pages.site_id 
    WHERE pages.id = page_elements.page_id AND sites.user_id = auth.uid()
  )
);

CREATE POLICY "Everyone can view templates" ON public.templates FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Users can view theme settings of own sites" ON public.theme_settings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sites WHERE sites.id = theme_settings.site_id AND sites.user_id = auth.uid())
);
CREATE POLICY "Users can create theme settings for own sites" ON public.theme_settings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.sites WHERE sites.id = theme_settings.site_id AND sites.user_id = auth.uid())
);
CREATE POLICY "Users can update theme settings of own sites" ON public.theme_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.sites WHERE sites.id = theme_settings.site_id AND sites.user_id = auth.uid())
);

-- Insert default templates
INSERT INTO public.templates (name, category, thumbnail_url, template_path, description) VALUES
('Modern Minimal', 'Education', 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=300&h=200&fit=crop', '/templates/modern-minimal/', 'Clean, minimal design with focus on typography and simplicity'),
('Creative Pro', 'Creative', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=200&fit=crop', '/templates/creative-pro/', 'Vibrant, creative design for agencies and creative professionals'),
('Academic Pro', 'Academic', 'https://images.unsplash.com/photo-1562774053-701939374585?w=300&h=200&fit=crop', '/templates/academic-pro/', 'Professional, academic design for educational institutions');

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_elements_updated_at BEFORE UPDATE ON public.page_elements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_theme_settings_updated_at BEFORE UPDATE ON public.theme_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();