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

    const { data: courses } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        status,
        course_settings!inner(course_image, course_label, website_id),
        course_pricing(price)
      `)
      .eq('course_settings.website_id', site.id)
      .eq('status', 'published');

    return NextResponse.json({ 
      courses: (courses || []).map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        image: course.course_settings?.course_image,
        label: course.course_settings?.course_label,
        price: course.course_pricing?.[0]?.price || 0
      }))
    });
  } catch (error) {
    return NextResponse.json({ courses: [] });
  }
}
