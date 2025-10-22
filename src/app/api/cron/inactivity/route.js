import { supabaseAdmin } from '../../../../lib/supabase';
import { Resend } from 'resend';

const resend = new Resend('re_UY26SPxu_AksCHZNB8kJmyGEJT8HHZ1JS');

export async function GET() {
  try {
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
    
    const inactiveUsers = users.filter(u => {
      if (!u.last_sign_in_at) return false;
      const lastSignIn = new Date(u.last_sign_in_at);
      return lastSignIn < threeDaysAgo && lastSignIn > fourDaysAgo;
    });
    
    let sent = 0;
    for (const user of inactiveUsers) {
      try {
        await resend.emails.send({
          from: 'LearnerFast <onboarding@resend.dev>',
          to: user.email,
          subject: 'We Miss You!',
          html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2>We Miss You!</h2><p>Hi ${user.user_metadata?.full_name || 'there'},</p><p>We noticed you haven't been active lately.</p><p>Come back and continue building your courses.</p><br/><p style="color: #666; font-size: 12px;">Best regards,<br/>LearnerFast Team</p></div>`,
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${user.email}:`, err);
      }
    }
    
    return Response.json({ success: true, sent, total: inactiveUsers.length });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
