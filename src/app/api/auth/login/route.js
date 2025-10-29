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
    const { email, password, website_name } = body;

    if (website_name) {
      return NextResponse.json({ error: 'Use /api/auth/template-login for template login' }, { status: 400 });
    }

    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ success: true, session: data.session });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const website_name = searchParams.get('website_name');
  
  // Template callback - don't create session
  if (searchParams.get('template-callback') === 'true' && code && website_name) {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: { user }, error } = await supabaseClient.auth.exchangeCodeForSession(code);

    if (!error && user) {
      const { data: existingUser } = await supabase
        .from('website_users')
        .select('*')
        .eq('email', user.email)
        .eq('website_name', website_name)
        .single();

      if (!existingUser) {
        const { data: newUser } = await supabase.from('website_users').insert([{
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          website_name: website_name,
          role: 'student',
          status: 'active',
          enrolled_courses: 0,
          progress: 0
        }]).select().single();

        await supabase.from('user_analytics').insert([{
          user_id: newUser.id,
          event_type: 'registration',
          event_data: { provider: 'google', website_name },
          website_name
        }]);
      } else {
        await supabase
          .from('website_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', existingUser.id);

        await supabase.from('user_analytics').insert([{
          user_id: existingUser.id,
          event_type: 'login',
          event_data: { provider: 'google', website_name },
          website_name
        }]);
      }
      
      // Sign out immediately
      await supabaseClient.auth.signOut();
      
      // Redirect with HTML to prevent auth redirect
      const redirectUrl = `/templates/${website_name}/index.html?auth=template`;
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
        </head>
        <body>
          <script>window.location.href='${redirectUrl}';</script>
        </body>
        </html>`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          },
        }
      );
    }
  }

  // Dashboard callback
  if (code) {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: { user }, error } = await supabaseClient.auth.exchangeCodeForSession(code);

    if (!error && user) {
      await supabaseClient.auth.updateUser({
        data: { context: 'dashboard' }
      });
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.redirect(new URL('/login', request.url));
}
