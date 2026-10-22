import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleRepairProfile } from '../_shared/repair-profile.ts';

function serviceUnavailable(appPublicUrl?: string): Response {
  let origin = '*';
  if (appPublicUrl) {
    try {
      origin = new URL(appPublicUrl).origin;
    } catch {
      origin = '*';
    }
  }

  return new Response(
    JSON.stringify({ error: { code: 'SERVICE_UNAVAILABLE' } }),
    {
      status: 503,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
        Vary: 'Origin',
      },
    },
  );
}

Deno.serve(async (request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey =
    Deno.env.get('SUPABASE_ANON_KEY') ??
    Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  const appPublicUrl = Deno.env.get('APP_PUBLIC_URL');

  if (!supabaseUrl || !anonKey || !appPublicUrl) {
    return serviceUnavailable(appPublicUrl);
  }

  const authorization = request.headers.get('Authorization');
  const userClient = authorization?.startsWith('Bearer ')
    ? createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authorization } },
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

  return handleRepairProfile(request, {
    appPublicUrl,
    authenticate: async () => {
      if (!userClient) {
        return null;
      }

      const { data, error } = await userClient.auth.getUser();

      if (error) {
        const status = (error as { status?: number }).status;
        const code = (error as { code?: string }).code;
        if (
          status === 401 ||
          code === 'bad_jwt' ||
          code === 'invalid_jwt' ||
          code === 'session_not_found'
        ) {
          return null;
        }
        throw error;
      }
      if (!data.user) {
        return null;
      }

      return { id: data.user.id };
    },
    repairProfile: async () => {
      if (!userClient) {
        throw new Error('UNAUTHENTICATED');
      }

      const { data, error } = await userClient.rpc('repair_profile');

      if (error) {
        throw error;
      }

      const profile = Array.isArray(data) ? data[0] : data;
      if (!profile) {
        throw new Error('PROFILE_REPAIR_EMPTY');
      }
      return profile;
    },
  });
});
