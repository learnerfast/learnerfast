import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { email, name, phone, siteId } = await request.json();

    // Validation
    if (!email || !name || !siteId) {
      return NextResponse.json(
        { error: 'Email, name, and siteId are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already registered for this site
    const { data: existing } = await supabase
      .from('site_users')
      .select('id')
      .eq('email', email)
      .eq('site_id', siteId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'User already registered for this site' },
        { status: 400 }
      );
    }

    // Register user
    const { data, error } = await supabase
      .from('site_users')
      .insert({
        email,
        name,
        phone,
        site_id: siteId,
        registered_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful',
      user: data 
    });

  } catch (error) {
    console.error('Site user registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
