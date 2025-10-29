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
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
  
  try {
    const { email, password, name, website_name, program_interest } = await request.json();
    
    if (!website_name) {
      return NextResponse.json({ success: false, error: 'Website name is required' }, { status: 400, headers: corsHeaders });
    }

    // Check if user already exists for this specific website
    const { data: existingUser } = await supabase
      .from('website_users')
      .select('*')
      .eq('email', email)
      .eq('website_name', website_name)
      .single();

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User already exists for this website' }, { status: 400, headers: corsHeaders });
    }
    
    // Hash password for storage
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Create unique email for Supabase auth (email+website_name)
    const uniqueEmail = `${email.split('@')[0]}+${website_name}@${email.split('@')[1]}`;
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: uniqueEmail,
      password,
      email_confirm: true,
      user_metadata: { original_email: email, name, website_name, context: 'template' }
    });
    
    if (authError) throw authError;
    const { data: newUser, error: insertError } = await supabase.from('website_users').insert([{
      email,
      password_hash: passwordHash,
      name: name || email.split('@')[0],
      website_name,
      role: 'student',
      status: 'active',
      program_interest: program_interest || 'General',
      enrolled_courses: 0,
      progress: 0
    }]).select().single();

    if (insertError) throw insertError;

    // Sign in to get session
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: sessionData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: uniqueEmail,
      password
    });

    if (signInError) throw signInError;

    // Log analytics
    await supabase.from('user_analytics').insert([{
      user_id: newUser.id,
      event_type: 'registration',
      event_data: { website_name, program_interest },
      website_name
    }]);
    
    return NextResponse.json({ 
      success: true,
      user: newUser,
      session: sessionData?.session
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400, headers: corsHeaders });
  }
}
