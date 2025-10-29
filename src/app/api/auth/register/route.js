import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, website_name, program_interest } = body;

    if (website_name) {
      return NextResponse.json({ error: 'Use /api/auth/template-register for template registration' }, { status: 400 });
    }

    const { data, error: authError } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        data: { name, context: 'landing' },
        emailRedirectTo: 'https://learnerfast.com/dashboard'
      }
    });

    if (authError) {
      throw authError;
    }

    return NextResponse.json({ 
      success: true, 
      session: data.session,
      message: data.session ? null : 'Check your email to confirm your account'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
