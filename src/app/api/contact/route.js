import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { name, email, phone, inquiry, message, siteId } = await request.json();

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
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

    // Phone validation (optional but if provided, must be valid)
    if (phone) {
      const phoneRegex = /^[0-9+\-\s()]{10,}$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        );
      }
    }

    // Store in database
    const { data, error } = await supabase
      .from('form_submissions')
      .insert({
        name,
        email,
        phone,
        inquiry,
        message,
        site_id: siteId || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Get site owner email if siteId provided
    let recipientEmail = process.env.ADMIN_EMAIL || 'support@learnerfast.com';
    
    if (siteId) {
      const { data: site } = await supabase
        .from('sites')
        .select('user_id, users:user_id(email)')
        .eq('id', siteId)
        .single();
      
      if (site?.users?.email) {
        recipientEmail = site.users.email;
      }
    }

    // Send email notification (using a service like Resend, SendGrid, etc.)
    // For now, we'll just log it
    console.log('Email notification:', {
      to: recipientEmail,
      subject: `New Contact Form Submission: ${inquiry || 'General Inquiry'}`,
      body: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone || 'N/A'}
        Inquiry: ${inquiry || 'N/A'}
        Message: ${message}
      `
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Form submitted successfully',
      id: data.id 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
