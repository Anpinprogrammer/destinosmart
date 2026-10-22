import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { parseSupabaseEnv, type SupabaseEnv } from './env';

export function createSupabaseClient(config: SupabaseEnv): SupabaseClient {
  const validated = parseSupabaseEnv({
    VITE_SUPABASE_URL: config.supabaseUrl,
    VITE_SUPABASE_ANON_KEY: config.supabaseAnonKey,
  });

  return createClient(validated.supabaseUrl, validated.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
}
