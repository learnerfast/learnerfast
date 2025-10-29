import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getCoursesByWebsite(websiteName) {
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('id, user_id')
    .eq('url', websiteName)
    .single();

  if (siteError || !site) return [];

  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select(`
      id, title, description, status,
      course_settings(course_image, course_label, what_you_learn, instructor_name, instructor_title, instructor_bio, website_id),
      course_pricing(price),
      course_sections(id, title, description, order_index)
    `)
    .eq('user_id', site.user_id)
    .eq('status', 'published');

  if (coursesError) return [];

  return (courses || [])
    .filter(course => {
      const settings = Array.isArray(course.course_settings) ? course.course_settings[0] : course.course_settings;
      if (!settings?.website_id) return false;
      const ids = typeof settings.website_id === 'string' ? settings.website_id.split(',') : [settings.website_id];
      return ids.includes(site.id);
    })
    .map(course => {
      const settings = Array.isArray(course.course_settings) ? course.course_settings[0] : course.course_settings;
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        image: settings?.course_image || null,
        label: settings?.course_label || '',
        whatYouLearn: settings?.what_you_learn || '',
        instructorName: settings?.instructor_name || '',
        instructorTitle: settings?.instructor_title || '',
        instructorBio: settings?.instructor_bio || '',
        price: course.course_pricing?.[0]?.price || 0,
        sections: (course.course_sections || []).sort((a, b) => a.order_index - b.order_index),
        slug: course.title.toLowerCase().replace(/\s+/g, '-')
      };
    });
}

export async function getCourseBySlug(websiteName, slug) {
  const courses = await getCoursesByWebsite(websiteName);
  return courses.find(c => c.slug === slug) || null;
}
