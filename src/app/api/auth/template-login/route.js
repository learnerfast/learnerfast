import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function OPTIONS(request) {
  console.log('[TEMPLATE-LOGIN] OPTIONS preflight received', {
    origin: request.headers.get('origin'),
    host: request.headers.get('host'),
    method: request.headers.get('access-control-request-method'),
    headers: request.headers.get('access-control-request-headers')
  });
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
  console.log('[TEMPLATE-LOGIN] POST request received', {
    origin: request.headers.get('origin'),
    host: request.headers.get('host'),
    url: request.url
  });
  try {
    const { email, password, website_name } = await request.json();
    
    if (!website_name) {
      return NextResponse.json({ success: false, error: 'Website name is required' }, { status: 400, headers: corsHeaders });
    }

    const { data: user } = await supabase
      .from('website_users')
      .select('*')
      .eq('email', email)
      .eq('website_name', website_name)
      .single();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401, headers: corsHeaders });
    }
    
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401, headers: corsHeaders });
    }

    await supabaseClient.auth.signOut();

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
    
    return NextResponse.json({ success: true, session: { user, website_name } }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400, headers: corsHeaders });
  }
}
