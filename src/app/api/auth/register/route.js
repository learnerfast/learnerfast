import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, website_name, program_interest } = body;

    const { data: existingUser } = await supabase
      .from('website_users')
      .select('*')
      .eq('email', email)
      .eq('website_name', website_name)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const { data: newUser, error } = await supabase
      .from('website_users')
      .insert([{
        email,
        name: name || email.split('@')[0],
        website_name,
        role: 'student',
        status: 'active',
        program_interest: program_interest || 'General',
        enrolled_courses: 0,
        progress: 0
      }])
      .select()
      .single();

    if (error) throw error;

    await supabase.from('user_analytics').insert([{
      user_id: newUser.id,
      event_type: 'registration',
      event_data: { website_name, program_interest },
      website_name
    }]);

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
