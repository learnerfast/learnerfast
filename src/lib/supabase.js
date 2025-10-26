import { createClient } from '@supabase/supabase-js'
import { env } from './env'

let supabaseInstance = null;
let supabaseAdminInstance = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }
  return supabaseInstance;
})();

export const supabaseAdmin = (() => {
  if (typeof window !== 'undefined') {
    return null;
  }
  if (!supabaseAdminInstance && env.supabaseServiceKey) {
    supabaseAdminInstance = createClient(env.supabaseUrl, env.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdminInstance;
})();