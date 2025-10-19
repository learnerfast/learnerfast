-- Enable RLS on all public tables
ALTER TABLE public.website_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_builder_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;

-- website_users policies (id is text)
CREATE POLICY "Users can read own data" ON public.website_users
  FOR SELECT USING (true);

CREATE POLICY "Service role full access" ON public.website_users
  FOR ALL USING (auth.role() = 'service_role');

-- user_analytics policies (user_id is text)
CREATE POLICY "Public read analytics" ON public.user_analytics
  FOR SELECT USING (true);

CREATE POLICY "Service role full access analytics" ON public.user_analytics
  FOR ALL USING (auth.role() = 'service_role');

-- theme_customizations policies (user_id is text)
CREATE POLICY "Public read themes" ON public.theme_customizations
  FOR SELECT USING (true);

CREATE POLICY "Service role full access themes" ON public.theme_customizations
  FOR ALL USING (auth.role() = 'service_role');

-- website_builder_saves policies (user_id is text)
CREATE POLICY "Public read saves" ON public.website_builder_saves
  FOR SELECT USING (true);

CREATE POLICY "Service role full access saves" ON public.website_builder_saves
  FOR ALL USING (auth.role() = 'service_role');

-- user_settings policies (user_id is text)
CREATE POLICY "Public read settings" ON public.user_settings
  FOR SELECT USING (true);

CREATE POLICY "Service role full access settings" ON public.user_settings
  FOR ALL USING (auth.role() = 'service_role');

-- user_messages policies (user_id and sender_id are text)
CREATE POLICY "Public read messages" ON public.user_messages
  FOR SELECT USING (true);

CREATE POLICY "Service role full access messages" ON public.user_messages
  FOR ALL USING (auth.role() = 'service_role');
