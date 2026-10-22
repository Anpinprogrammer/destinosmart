import { getSupabaseEnv } from './env';
import { createSupabaseClient } from './supabase-client';

export const supabase = createSupabaseClient(getSupabaseEnv());
