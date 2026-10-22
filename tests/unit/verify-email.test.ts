import { describe, expect, it, vi } from 'vitest';
import { handleVerifyEmail } from '../../supabase/functions/_shared/verify-email';
import { hashToken } from '../../supabase/functions/_shared/token';

const TOKEN = 'a'.repeat(64);

function makeRequest(
  body: unknown = { token: TOKEN },
  method = 'POST',
): Request {
  return new Request('https://example.supabase.co/functions/v1/verify-email', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'GET' ? undefined : JSON.stringify(body),
  });
}

function makeDeps(status: 'verified' | 'invalid' | 'expired' = 'verified') {
  return {
    appPublicUrl: 'https://app.example.com',
    verifyToken: vi.fn(async () => status),
  };
}

describe('handleVerifyEmail', () => {
  it('verifica un token válido sin devolverlo', async () => {
    const deps = makeDeps('verified');
    const response = await handleVerifyEmail(makeRequest(), deps);

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://app.example.com',
    );
    expect(response.headers.get('Access-Control-Expose-Headers')).toContain(
      'Retry-After',
    );
    const body = await response.json();
    expect(body).toEqual({ verified: true });
    expect(JSON.stringify(body)).not.toContain(TOKEN);
    expect(deps.verifyToken).toHaveBeenCalledWith(await hashToken(TOKEN));
  });

  it('responde 400 para token inválido o body mal formado', async () => {
    const deps = makeDeps('invalid');

    const malformed = await handleVerifyEmail(makeRequest({ token: 'short' }), deps);
    expect(malformed.status).toBe(400);

    const missing = await handleVerifyEmail(makeRequest({}), deps);
    expect(missing.status).toBe(400);

    const noBody = await handleVerifyEmail(
      new Request('https://example.supabase.co/functions/v1/verify-email', {
        method: 'POST',
      }),
      deps,
    );
    expect(noBody.status).toBe(400);
    expect(deps.verifyToken).not.toHaveBeenCalled();
  });

  it('responde 400 si el token no existe o ya fue usado', async () => {
    const deps = makeDeps('invalid');
    const response = await handleVerifyEmail(makeRequest(), deps);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'VERIFICATION_INVALID' },
    });
  });

  it('responde 410 si el token expiró', async () => {
    const deps = makeDeps('expired');
    const response = await handleVerifyEmail(makeRequest(), deps);

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'VERIFICATION_EXPIRED' },
    });
  });

  it('responde 429 si el rate limit configurado rechaza la petición', async () => {
    const deps = {
      appPublicUrl: 'https://app.example.com',
      verifyToken: vi.fn(async () => 'verified' as const),
      consumeRateLimit: vi.fn(async () => false),
      retryAfterSeconds: 120,
    };
    const response = await handleVerifyEmail(makeRequest(), deps);

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('120');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(deps.verifyToken).not.toHaveBeenCalled();
  });

  it('responde 503 si falla la verificación', async () => {
    const deps = {
      appPublicUrl: 'https://app.example.com',
      verifyToken: vi.fn(async () => {
        throw new Error('db down');
      }),
    };
    const response = await handleVerifyEmail(makeRequest(), deps);

    expect(response.status).toBe(503);
  });

  it('responde 405/204 y no permite métodos distintos', async () => {
    const deps = makeDeps();

    const getResponse = await handleVerifyEmail(makeRequest(undefined, 'GET'), deps);
    expect(getResponse.status).toBe(405);

    const optionsResponse = await handleVerifyEmail(
      makeRequest(undefined, 'OPTIONS'),
      deps,
    );
    expect(optionsResponse.status).toBe(204);
    expect(optionsResponse.headers.get('Access-Control-Allow-Methods')).toContain(
      'POST',
    );
  });
});
