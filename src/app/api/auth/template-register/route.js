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
  console.log('[TEMPLATE-REGISTER] OPTIONS preflight received', {
    origin: request.headers.get('origin'),
    host: request.headers.get('host'),
    method: request.headers.get('access-control-request-method'),
    headers: request.headers.get('access-control-request-headers')
  });
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
  console.log('[TEMPLATE-REGISTER] POST request received', {
    method: request.method,
    origin: request.headers.get('origin'),
    host: request.headers.get('host'),
    url: request.url
  });
  
  try {
    const { email, password, name, website_name, program_interest } = await request.json();
    console.log('[TEMPLATE-REGISTER] Processing:', { email, website_name });
    
    if (!website_name) {
      console.log('[TEMPLATE-REGISTER] Error: Missing website_name');
      return NextResponse.json({ success: false, error: 'Website name is required' }, { status: 400, headers: corsHeaders });
    }

    // Check if user already exists in website_users
    const { data: existingUser } = await supabase
      .from('website_users')
      .select('*')
      .eq('email', email)
      .eq('website_name', website_name)
      .single();

    if (existingUser) {
      console.log('[TEMPLATE-REGISTER] User already exists in website_users');
      return NextResponse.json({ success: false, error: 'User already exists for this website' }, { status: 400, headers: corsHeaders });
    }
    
    // Use service role to create user without email confirmation
    console.log('[TEMPLATE-REGISTER] Creating auth user with service role');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, website_name, context: 'template' }
    });
    
    console.log('[TEMPLATE-REGISTER] Auth user creation result:', { 
      success: !authError, 
      error: authError?.message,
      userId: authData?.user?.id
    });
    
    if (authError) {
      console.log('[TEMPLATE-REGISTER] Auth error:', authError);
      throw authError;
    }

    // Insert into website_users
    console.log('[TEMPLATE-REGISTER] Inserting into website_users');
    const { data: newUser, error: insertError } = await supabase.from('website_users').insert([{
      email,
      name: name || email.split('@')[0],
      website_name,
      role: 'student',
      status: 'active',
      program_interest: program_interest || 'General',
      enrolled_courses: 0,
      progress: 0
    }]).select().single();

    if (insertError) {
      console.log('[TEMPLATE-REGISTER] Insert error:', insertError);
      throw insertError;
    }

    console.log('[TEMPLATE-REGISTER] User created successfully:', newUser.id);

    // Auto sign-in the user using anon client
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: sessionData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.log('[TEMPLATE-REGISTER] Auto sign-in error:', signInError.message);
    } else {
      console.log('[TEMPLATE-REGISTER] Auto sign-in successful');
    }

    // Log analytics
    await supabase.from('user_analytics').insert([{
      user_id: newUser.id,
      event_type: 'registration',
      event_data: { website_name, program_interest },
      website_name
    }]);
    
    console.log('[TEMPLATE-REGISTER] Registration complete with auto sign-in');
    
    return NextResponse.json({ 
      success: true,
      user: newUser,
      session: sessionData?.session
    }, { headers: corsHeaders });
  } catch (error) {
    console.log('[TEMPLATE-REGISTER] Caught error:', error.message, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400, headers: corsHeaders });
  }
}
