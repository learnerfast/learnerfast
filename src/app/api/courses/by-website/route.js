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
    return NextResponse.json({ courses: [] });
  }

  try {
    const { data: site } = await supabase
      .from('sites')
      .select('id')
      .eq('name', websiteName)
      .single();

    if (!site) {
      return NextResponse.json({ courses: [] });
    }

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        status,
        course_settings!left(course_image, course_label, what_you_learn, instructor_name, instructor_title, instructor_bio, website_id),
        course_pricing(price),
        course_sections(id, title, description, order_index)
      `)
      .eq('course_settings.website_id', site.id)
      .eq('status', 'published');

    if (coursesError) {
      console.error('Courses query error:', coursesError);
      return NextResponse.json({ courses: [], error: coursesError.message });
    }

    return NextResponse.json({ 
      courses: (courses || []).map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        image: course.course_settings?.course_image || null,
        label: course.course_settings?.course_label || '',
        whatYouLearn: course.course_settings?.what_you_learn || '',
        instructorName: course.course_settings?.instructor_name || '',
        instructorTitle: course.course_settings?.instructor_title || '',
        instructorBio: course.course_settings?.instructor_bio || '',
        price: course.course_pricing?.[0]?.price || 0,
        sections: (course.course_sections || []).sort((a, b) => a.order_index - b.order_index)
      }))
    });
  } catch (error) {
    return NextResponse.json({ courses: [] });
  }
}
