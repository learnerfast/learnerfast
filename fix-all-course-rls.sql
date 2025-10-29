-- Fix RLS for all course-related tables

-- COURSES TABLE
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own courses" ON public.courses;
CREATE POLICY "Users can manage their own courses"
ON public.courses FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- COURSE_SECTIONS TABLE
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage sections of their courses" ON public.course_sections;
CREATE POLICY "Users can manage sections of their courses"
ON public.course_sections FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_sections.course_id AND courses.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_sections.course_id AND courses.user_id = auth.uid()));

-- COURSE_SETTINGS TABLE
ALTER TABLE public.course_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage settings of their courses" ON public.course_settings;
CREATE POLICY "Users can manage settings of their courses"
ON public.course_settings FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_settings.course_id AND courses.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_settings.course_id AND courses.user_id = auth.uid()));

-- COURSE_ACCESS TABLE
ALTER TABLE public.course_access ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage access of their courses" ON public.course_access;
CREATE POLICY "Users can manage access of their courses"
ON public.course_access FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_access.course_id AND courses.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_access.course_id AND courses.user_id = auth.uid()));

-- COURSE_ACTIVITIES TABLE
ALTER TABLE public.course_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage activities of their courses" ON public.course_activities;
CREATE POLICY "Users can manage activities of their courses"
ON public.course_activities FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_activities.course_id AND courses.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_activities.course_id AND courses.user_id = auth.uid()));

-- COURSE_PRICING TABLE
ALTER TABLE public.course_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage pricing of their courses" ON public.course_pricing;
CREATE POLICY "Users can manage pricing of their courses"
ON public.course_pricing FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_pricing.course_id AND courses.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_pricing.course_id AND courses.user_id = auth.uid()));

-- COURSE_VIDEOS TABLE
ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own videos" ON public.course_videos;
CREATE POLICY "Users can manage their own videos"
ON public.course_videos FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
