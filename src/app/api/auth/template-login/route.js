import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { email, password, website_name } = await request.json();
    
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;

    if (website_name) {
      const { data: user } = await supabase
        .from('website_users')
        .select('*')
        .eq('email', email)
        .eq('website_name', website_name)
        .single();

      if (user) {
        await supabase
          .from('website_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', user.id);

        await supabase.from('user_analytics').insert([{
          user_id: user.id,
          event_type: 'login',
          event_data: { website_name },
          website_name
        }]);
      }
    }
    
    return NextResponse.json({ success: true, session: data.session });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
