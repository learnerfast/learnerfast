import { supabaseAdmin } from '../../../../lib/supabase';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { env } from '../../../../lib/env';
import * as Sentry from '@sentry/nextjs';

const resend = new Resend(env.resendApiKey);

const emailRateLimit = new Map();
const MAX_EMAILS_PER_HOUR = 100;

function checkRateLimit(ip) {
  const now = Date.now();
  const userLimit = emailRateLimit.get(ip) || { count: 0, resetTime: now + 3600000 };
  
  if (now > userLimit.resetTime) {
    emailRateLimit.set(ip, { count: 1, resetTime: now + 3600000 });
    return true;
  }
  
  if (userLimit.count >= MAX_EMAILS_PER_HOUR) {
    return false;
  }
  
  userLimit.count++;
  emailRateLimit.set(ip, userLimit);
  return true;
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded. Max 100 emails per hour.' }, { status: 429 });
    }
    
    const { type, email, fullname, emails, subject, message } = await request.json();
    
    if (type === 'welcome') {
      const { data, error } = await resend.emails.send({
        from: 'LearnerFast <support@learnerfast.com>',
        to: [email],
        subject: 'Welcome to LearnerFast!',
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2>Welcome to LearnerFast!</h2><p>Dear ${fullname},</p><p>Welcome to LearnerFast! We're excited to have you on board.</p><p>Get started by creating your first course website.</p><br/><p style="color: #666; font-size: 12px;">Best regards,<br/>LearnerFast Team</p></div>`,
      });
      
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }
    
    if (type === 'bulk') {
      let sent = 0;
      let failed = 0;
      
      for (const email of emails) {
        try {
          const { error } = await resend.emails.send({
            from: 'LearnerFast <support@learnerfast.com>',
            to: [email],
            subject: subject,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><p style="white-space: pre-wrap;">${message}</p><br/><p style="color: #666; font-size: 12px;">Best regards,<br/>LearnerFast Team</p></div>`,
          });
          
          if (error) {
            failed++;
          } else {
            sent++;
          }
        } catch (err) {
          failed++;
        }
      }
      
      return NextResponse.json({ success: true, sent, failed, total: emails.length });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { api: 'email', method: 'POST' },
      extra: { type: 'email_send_error' }
    });
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const getData = searchParams.get('getData');
    
    if (getData === 'true') {
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const [sitesRes, coursesRes, lessonsRes] = await Promise.all([
        supabaseAdmin.from('sites').select('*'),
        supabaseAdmin.from('courses').select('*'),
        supabaseAdmin.from('lessons').select('*')
      ]);
      return NextResponse.json({
        users: users || [],
        sites: sitesRes.data || [],
        courses: coursesRes.data || [],
        lessons: lessonsRes.data || []
      });
    }
    
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const inactiveUsers = users.filter(u => {
      const lastActivity = u.last_sign_in_at || u.created_at;
      if (!lastActivity) return false;
      const lastDate = new Date(lastActivity);
      return lastDate < twoDaysAgo && lastDate > threeDaysAgo;
    });
    
    let sent = 0;
    for (const user of inactiveUsers) {
      try {
        const { error } = await resend.emails.send({
          from: 'LearnerFast <support@learnerfast.com>',
          to: [user.email],
          subject: 'We Miss You!',
          html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2>We Miss You!</h2><p>Hi ${user.user_metadata?.full_name || 'there'},</p><p>We noticed you haven't been active lately.</p><p>Come back and continue building your courses.</p><br/><p style="color: #666; font-size: 12px;">Best regards,<br/>LearnerFast Team</p></div>`,
        });
        if (!error) sent++;
      } catch (err) {
        // Failed to send email
      }
    }
    
    return NextResponse.json({ success: true, sent, total: inactiveUsers.length });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { api: 'email', method: 'GET' },
      extra: { type: 'inactivity_check_error' }
    });
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
