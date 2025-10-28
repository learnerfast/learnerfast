import { supabase } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    const response = Response.json({ success: true });
    response.headers.set('Set-Cookie', `sb-access-token=${data.session.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`);
    response.headers.append('Set-Cookie', `sb-refresh-token=${data.session.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`);
    
    return response;
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
