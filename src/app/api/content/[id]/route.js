import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const contentId = params.id;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: content, error: contentError } = await supabase
      .from('course_content')
      .select('*, course:courses(*)')
      .eq('id', contentId)
      .single();

    if (contentError || !content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', content.course_id)
      .eq('status', 'active')
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('course-content')
      .createSignedUrl(content.file_path, 3600);

    if (urlError) {
      return NextResponse.json({ error: 'Failed to generate access URL' }, { status: 500 });
    }

    return NextResponse.json({
      url: signedUrl.signedUrl,
      type: content.content_type,
      title: content.title,
      expires: Date.now() + 3600000
    });
  } catch (error) {
    console.error('Content access error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
