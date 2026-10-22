import { hashToken } from './token.ts';

export type VerifyEmailStatus = 'verified' | 'invalid' | 'expired';

export interface VerifyEmailDependencies {
  verifyToken(tokenHash: string): Promise<VerifyEmailStatus>;
  appPublicUrl: string;
  /** Opcional: Q-10 mantiene el límite exacto configurable por entorno. */
  consumeRateLimit?(request: Request): Promise<boolean>;
  retryAfterSeconds?: number;
}

function corsHeaders(appPublicUrl: string): HeadersInit {
  let origin = appPublicUrl;
  try {
    origin = new URL(appPublicUrl).origin;
  } catch {
    origin = 'null';
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Expose-Headers': 'Retry-After',
    Vary: 'Origin',
  };
}

function jsonResponse(
  status: number,
  body: unknown,
  headers: HeadersInit,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function errorResponse(
  status: number,
  code: string,
  headers: HeadersInit,
  extraHeaders: HeadersInit = {},
): Response {
  return new Response(JSON.stringify({ error: { code } }), {
    status,
    headers: {
      ...headers,
      ...extraHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * Verifica un token público. No requiere sesión.
 * Nunca devuelve ni registra el token.
 */
export async function handleVerifyEmail(
  request: Request,
  deps: VerifyEmailDependencies,
): Promise<Response> {
  const headers = corsHeaders(deps.appPublicUrl);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', headers);
  }

  if (deps.consumeRateLimit) {
    let allowed = true;
    try {
      allowed = await deps.consumeRateLimit(request);
    } catch {
      // El rate limit es una defensa adicional; un fallo del contador no debe
      // impedir una verificación legítima.
      allowed = true;
    }
    if (!allowed) {
      return errorResponse(429, 'RATE_LIMITED', headers, {
        'Retry-After': String(deps.retryAfterSeconds ?? 300),
      });
    }
  }

  const body: unknown = await request.json().catch(() => null);
  if (
    typeof body !== 'object' ||
    body === null ||
    !('token' in body) ||
    typeof (body as { token?: unknown }).token !== 'string'
  ) {
    return errorResponse(400, 'VERIFICATION_INVALID', headers);
  }

  const token = (body as { token: string }).token;
  if (!/^[0-9a-f]{64}$/.test(token)) {
    return errorResponse(400, 'VERIFICATION_INVALID', headers);
  }

  let status: VerifyEmailStatus;
  try {
    status = await deps.verifyToken(await hashToken(token));
  } catch {
    return errorResponse(503, 'SERVICE_UNAVAILABLE', headers);
  }

  if (status === 'verified') {
    return jsonResponse(200, { verified: true }, headers);
  }
  if (status === 'expired') {
    return errorResponse(410, 'VERIFICATION_EXPIRED', headers);
  }
  return errorResponse(400, 'VERIFICATION_INVALID', headers);
}
