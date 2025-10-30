import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const websiteName = searchParams.get('website_name');
  
  if (!websiteName) {
    return NextResponse.json({ courses: [], error: 'No website name provided' });
  }

  try {
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, user_id')
      .eq('url', websiteName)
      .single();

    if (siteError || !site) {
      return NextResponse.json({ courses: [], error: 'Site not found' });
    }

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id, title, description, status,
        course_settings(course_image, course_label, what_you_learn, instructor_name, instructor_title, instructor_bio, website_id, show_course_includes, show_what_you_learn, show_instructor),
        course_pricing(price),
        course_sections(id, title, description, order_index, course_activities(id, title, activity_type, source, url))
      `)
      .eq('user_id', site.user_id)
      .eq('status', 'published');

    if (coursesError) {
      return NextResponse.json({ courses: [], error: coursesError.message });
    }

    const filteredCourses = (courses || []).filter(course => {
      const settings = Array.isArray(course.course_settings) ? course.course_settings[0] : course.course_settings;
      if (!settings?.website_id) return false;
      const ids = typeof settings.website_id === 'string' ? settings.website_id.split(',') : [settings.website_id];
      return ids.includes(site.id);
    });

    const mappedCourses = filteredCourses.map(course => {
      const settings = Array.isArray(course.course_settings) ? course.course_settings[0] : course.course_settings;
      const sections = (course.course_sections || []).sort((a, b) => a.order_index - b.order_index).map(section => ({
        id: section.id,
        title: section.title,
        description: section.description,
        activities: section.course_activities || []
      }));
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
        showCourseIncludes: settings?.show_course_includes !== false,
        showWhatYouLearn: settings?.show_what_you_learn !== false,
        showInstructor: settings?.show_instructor !== false,
        price: course.course_pricing?.[0]?.price || 0,
        sections: sections,
        slug: course.title.toLowerCase().replace(/\s+/g, '-')
      };
    });
    
    return NextResponse.json({ courses: mappedCourses }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    return NextResponse.json({ courses: [] });
  }
}
