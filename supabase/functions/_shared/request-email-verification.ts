import type { EmailProvider } from './email-provider.ts';
import {
  generateVerificationToken,
  hashToken,
  verificationTokenExpiry,
} from './token.ts';

export const DEFAULT_RETRY_AFTER_SECONDS = 300;

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface InsertVerificationTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: string;
  requestedIpHash: string | null;
  rateLimitKey: string;
}

export type InsertVerificationTokenResult =
  | { status: 'inserted'; id: string }
  | { status: 'rate_limited' };

export interface RequestEmailVerificationDependencies {
  authenticate(request: Request): Promise<AuthenticatedUser | null>;
  insertToken(
    input: InsertVerificationTokenInput,
  ): Promise<InsertVerificationTokenResult>;
  deleteToken(id: string): Promise<void>;
  emailProvider: EmailProvider;
  appPublicUrl: string;
  now?: () => number;
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
  extraHeaders: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      ...extraHeaders,
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
  return jsonResponse(status, { error: { code } }, headers, extraHeaders);
}

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('cf-connecting-ip')?.trim() || null;
}

/**
 * Handler puro (sin Deno) para poder probarlo con Vitest.
 * Devuelve solo `accepted`; nunca devuelve el token.
 */
export async function handleRequestEmailVerification(
  request: Request,
  deps: RequestEmailVerificationDependencies,
): Promise<Response> {
  const headers = corsHeaders(deps.appPublicUrl);
  const retryAfterSeconds =
    deps.retryAfterSeconds ?? DEFAULT_RETRY_AFTER_SECONDS;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', headers);
  }

  let user: AuthenticatedUser | null;
  try {
    user = await deps.authenticate(request);
  } catch {
    return errorResponse(503, 'SERVICE_UNAVAILABLE', headers);
  }

  if (!user) {
    return errorResponse(401, 'UNAUTHENTICATED', headers);
  }

  const now = deps.now?.() ?? Date.now();
  const rateLimitKey = String(
    Math.floor(now / (retryAfterSeconds * 1000)),
  );

  const token = generateVerificationToken();
  const tokenHash = await hashToken(token);
  const expiresAt = verificationTokenExpiry(now);
  const clientIp = getClientIp(request);
  const requestedIpHash = clientIp ? await hashToken(clientIp) : null;

  let inserted: InsertVerificationTokenResult;
  try {
    inserted = await deps.insertToken({
      userId: user.id,
      tokenHash,
      expiresAt,
      requestedIpHash,
      rateLimitKey,
    });
  } catch {
    return errorResponse(503, 'SERVICE_UNAVAILABLE', headers);
  }

  if (inserted.status === 'rate_limited') {
    return errorResponse(429, 'RATE_LIMITED', headers, {
      'Retry-After': String(retryAfterSeconds),
    });
  }

  let verificationUrl: string;
  try {
    const url = new URL('/verify-email', deps.appPublicUrl);
    url.searchParams.set('token', token);
    verificationUrl = url.toString();
  } catch {
    await deps.deleteToken(inserted.id).catch(() => undefined);
    return errorResponse(503, 'SERVICE_UNAVAILABLE', headers);
  }

  try {
    await deps.emailProvider.sendVerificationEmail({
      to: user.email,
      verificationUrl,
    });
  } catch {
    await deps.deleteToken(inserted.id).catch(() => undefined);
    return errorResponse(503, 'EMAIL_DELIVERY_FAILED', headers);
  }

  return jsonResponse(
    202,
    { accepted: true, retry_after_seconds: retryAfterSeconds },
    headers,
  );
}
