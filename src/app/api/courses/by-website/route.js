import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const websiteName = searchParams.get('website_name');
  
  if (!websiteName) {
    return NextResponse.json({ courses: [], error: 'No website name provided' });
  }

  try {
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, name, url, user_id')
      .eq('url', websiteName)
      .single();

    if (siteError || !site) {
      console.log('Site lookup failed:', { websiteName, siteError });
      return NextResponse.json({ courses: [], error: 'Site not found', websiteName });
    }
    
    console.log('Found site:', site);

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        status,
        user_id,
        course_settings(course_image, course_label, what_you_learn, instructor_name, instructor_title, instructor_bio, website_id),
        course_pricing(price),
        course_sections(id, title, description, order_index)
      `)
      .eq('user_id', site.user_id)
      .eq('status', 'published');

    if (coursesError) {
      console.error('Courses query error:', coursesError);
      return NextResponse.json({ courses: [], error: coursesError.message });
    }

    console.log('Raw courses data:', JSON.stringify(courses, null, 2));
    
    // Filter courses that have this website_id in their comma-separated list
    const filteredCourses = (courses || []).filter(course => {
      const settings = Array.isArray(course.course_settings) ? course.course_settings[0] : course.course_settings;
      console.log('Course:', course.title, 'Settings:', settings);
      if (!settings) {
        console.log('No settings for course:', course.title);
        return false;
      }
      const websiteIds = settings.website_id;
      if (!websiteIds) {
        console.log('No website_id for course:', course.title);
        return false;
      }
      const ids = typeof websiteIds === 'string' ? websiteIds.split(',') : [websiteIds];
      console.log('Checking if', site.id, 'is in', ids);
      return ids.includes(site.id);
    });
    
    console.log('Filtered courses count:', filteredCourses.length);

    const mappedCourses = filteredCourses.map(course => {
      const settings = Array.isArray(course.course_settings) ? course.course_settings[0] : course.course_settings;
      const mapped = {
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
        sections: (course.course_sections || []).sort((a, b) => a.order_index - b.order_index)
      };
      console.log('Mapped course:', course.title, 'with settings:', {
        label: mapped.label,
        whatYouLearn: mapped.whatYouLearn,
        instructorName: mapped.instructorName,
        instructorTitle: mapped.instructorTitle,
        instructorBio: mapped.instructorBio?.substring(0, 50)
      });
      return mapped;
    });
    
    return NextResponse.json({ courses: mappedCourses });
  } catch (error) {
    return NextResponse.json({ courses: [] });
  }
}
