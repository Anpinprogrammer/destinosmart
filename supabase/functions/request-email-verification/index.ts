import { createClient } from 'npm:@supabase/supabase-js@2';
import { createEmailProvider } from '../_shared/email-provider.ts';
import { handleRequestEmailVerification } from '../_shared/request-email-verification.ts';

function serviceUnavailable(): Response {
  return new Response(
    JSON.stringify({ error: { code: 'SERVICE_UNAVAILABLE' } }),
    {
      status: 503,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
}

Deno.serve(async (request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey =
    Deno.env.get('SUPABASE_ANON_KEY') ??
    Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const appPublicUrl = Deno.env.get('APP_PUBLIC_URL');
  const emailProviderName = Deno.env.get('EMAIL_PROVIDER');

  if (
    !supabaseUrl ||
    !anonKey ||
    !serviceRoleKey ||
    !appPublicUrl ||
    !emailProviderName
  ) {
    return serviceUnavailable();
  }

  let emailProvider;
  try {
    emailProvider = createEmailProvider({
      EMAIL_PROVIDER: emailProviderName,
    });
  } catch {
    return serviceUnavailable();
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return handleRequestEmailVerification(request, {
    appPublicUrl,
    emailProvider,
    authenticate: async (req) => {
      const authorization = req.headers.get('Authorization');
      if (!authorization?.startsWith('Bearer ')) {
        return null;
      }

      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authorization } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await authClient.auth.getUser();

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
      if (!data.user?.email) {
        return null;
      }

      return { id: data.user.id, email: data.user.email };
    },
    insertToken: async (input) => {
      const { data, error } = await serviceClient
        .from('email_verification_tokens')
        .insert({
          user_id: input.userId,
          token_hash: input.tokenHash,
          expires_at: input.expiresAt,
          requested_ip_hash: input.requestedIpHash,
          rate_limit_key: input.rateLimitKey,
        })
        .select('id')
        .single();

      if (error?.code === '23505') {
        return { status: 'rate_limited' };
      }
      if (error || !data?.id) {
        throw error ?? new Error('TOKEN_INSERT_FAILED');
      }
      return { status: 'inserted', id: data.id as string };
    },
    deleteToken: async (id) => {
      const { error } = await serviceClient
        .from('email_verification_tokens')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
  });
});
