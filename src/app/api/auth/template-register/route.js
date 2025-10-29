import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { email, password, name, website_name, program_interest } = await request.json();
    
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: website_name 
          ? `${process.env.NEXT_PUBLIC_APP_URL}/templates/${website_name}/index.html`
          : `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      }
    });
    
    if (error) throw error;

    if (data.user && website_name) {
      const { data: existingUser } = await supabase
        .from('website_users')
        .select('*')
        .eq('email', email)
        .eq('website_name', website_name)
        .single();

      if (!existingUser) {
        const { data: newUser } = await supabase.from('website_users').insert([{
          email,
          name: name || email.split('@')[0],
          website_name,
          role: 'student',
          status: 'active',
          program_interest: program_interest || 'General',
          enrolled_courses: 0,
          progress: 0
        }]).select().single();

        await supabase.from('user_analytics').insert([{
          user_id: newUser.id,
          event_type: 'registration',
          event_data: { website_name, program_interest },
          website_name
        }]);
      }
    }
    
    return NextResponse.json({ 
      success: true,
      session: data.session,
      message: data.session ? null : 'Check your email to confirm your account'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
