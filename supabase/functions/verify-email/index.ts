import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleVerifyEmail } from '../_shared/verify-email.ts';
import { hashToken } from '../_shared/token.ts';

function serviceUnavailable(): Response {
  return new Response(
    JSON.stringify({ error: { code: 'SERVICE_UNAVAILABLE' } }),
    {
      status: 503,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  );
}

Deno.serve(async (request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const appPublicUrl = Deno.env.get('APP_PUBLIC_URL');
  const rateLimitRaw = Deno.env.get('VERIFY_EMAIL_RATE_LIMIT');
  const rateWindowRaw = Deno.env.get('VERIFY_EMAIL_RATE_WINDOW_SECONDS');
  const rateLimit = Number(rateLimitRaw);
  const rateWindow = Number(rateWindowRaw ?? '300');

  if (!supabaseUrl || !serviceRoleKey || !appPublicUrl) {
    return serviceUnavailable();
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const hasRateLimit =
    Number.isInteger(rateLimit) && rateLimit > 0 && Number.isInteger(rateWindow) && rateWindow > 0;

  return handleVerifyEmail(request, {
    appPublicUrl,
    ...(hasRateLimit
      ? {
          retryAfterSeconds: rateWindow,
          consumeRateLimit: async (req: Request) => {
            const forwarded = req.headers
              .get('x-forwarded-for')
              ?.split(',')[0]
              ?.trim();
            const clientIp =
              forwarded || req.headers.get('cf-connecting-ip')?.trim();
            if (!clientIp) {
              // Sin IP confiable no se comparte un bucket global.
              return true;
            }
            const key = await hashToken(clientIp);
            const { data, error } = await serviceClient.rpc(
              'consume_verify_email_attempt',
              {
                p_rate_key: key,
                p_window_seconds: rateWindow,
                p_limit: rateLimit,
              },
            );
            if (error) {
              throw error;
            }
            return data === true;
          },
        }
      : {}),
    verifyToken: async (tokenHash) => {
      const { data, error } = await serviceClient.rpc('verify_email_token', {
        p_token_hash: tokenHash,
      });

      if (error) {
        throw error;
      }

      const row = Array.isArray(data) ? data[0] : data;
      const status = (row as { status?: string } | null)?.status;

      if (status === 'verified' || status === 'invalid' || status === 'expired') {
        return status;
      }

      throw new Error('VERIFY_EMAIL_UNEXPECTED_STATUS');
    },
  });
});
