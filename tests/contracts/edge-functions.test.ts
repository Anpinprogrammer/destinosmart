import { describe, expect, it, vi } from 'vitest';
import { handleRequestEmailVerification } from '../../supabase/functions/_shared/request-email-verification';
import { handleVerifyEmail } from '../../supabase/functions/_shared/verify-email';
import { handleRepairProfile } from '../../supabase/functions/_shared/repair-profile';

const USER_ID = '00000000-0000-4000-8000-000000000020';
const TOKEN = 'a'.repeat(64);
const NOW = Date.parse('2026-10-21T12:00:00.000Z');

const profileFixture = {
  id: USER_ID,
  email: 'contract@example.com',
  email_verified: false,
  full_name: 'Ada Lovelace',
  avatar_url: null,
  plan_id: 'free',
  role: 'user',
  free_trip_credits: 1,
  created_at: '2026-10-21T00:00:00.000Z',
  updated_at: '2026-10-21T00:00:00.000Z',
};

function jsonRequest(
  path: string,
  body: unknown = {},
  method = 'POST',
): Request {
  return new Request(`https://example.supabase.co/functions/v1/${path}`, {
    method,
    headers: {
      Authorization: 'Bearer synthetic-test-token',
      'Content-Type': 'application/json',
    },
    body: method === 'GET' ? undefined : JSON.stringify(body),
  });
}

function makeRequestDeps() {
  return {
    appPublicUrl: 'https://app.example.com',
    emailProvider: { sendVerificationEmail: vi.fn(async () => undefined) },
    authenticate: vi.fn(async () => ({
      id: USER_ID,
      email: 'contract@example.com',
    })),
    insertToken: vi.fn(async () => ({
      status: 'inserted' as const,
      id: 'contract-token',
    })),
    deleteToken: vi.fn(async () => undefined),
    now: () => NOW,
  };
}

describe('Edge Function contract — request-email-verification', () => {
  it('202 devuelve exactamente accepted y retry_after_seconds', async () => {
    const response = await handleRequestEmailVerification(
      jsonRequest('request-email-verification'),
      makeRequestDeps(),
    );

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      accepted: true,
      retry_after_seconds: 300,
    });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://app.example.com',
    );
  });

  it('401 y 503 usan solo el código de error contractual', async () => {
    const unauthenticated = await handleRequestEmailVerification(
      jsonRequest('request-email-verification'),
      { ...makeRequestDeps(), authenticate: vi.fn(async () => null) },
    );
    expect(unauthenticated.status).toBe(401);
    await expect(unauthenticated.json()).resolves.toEqual({
      error: { code: 'UNAUTHENTICATED' },
    });

    const unavailable = await handleRequestEmailVerification(
      jsonRequest('request-email-verification'),
      {
        ...makeRequestDeps(),
        insertToken: vi.fn(async () => {
          throw new Error('database details');
        }),
      },
    );
    expect(unavailable.status).toBe(503);
    const unavailableBody = JSON.stringify(await unavailable.json());
    expect(unavailableBody).toBe(
      JSON.stringify({ error: { code: 'SERVICE_UNAVAILABLE' } }),
    );
    expect(unavailableBody).not.toContain('database details');
  });

  it('503 EMAIL_DELIVERY_FAILED no filtra detalles del proveedor', async () => {
    const response = await handleRequestEmailVerification(
      jsonRequest('request-email-verification'),
      {
        ...makeRequestDeps(),
        emailProvider: {
          sendVerificationEmail: vi.fn(async () => {
            throw new Error('provider details');
          }),
        },
      },
    );

    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const body = JSON.stringify(await response.json());
    expect(body).toBe(
      JSON.stringify({ error: { code: 'EMAIL_DELIVERY_FAILED' } }),
    );
    expect(body).not.toContain('provider details');
  });

  it('429 respeta el contrato de rate limit y Retry-After', async () => {
    const response = await handleRequestEmailVerification(
      jsonRequest('request-email-verification'),
      {
        ...makeRequestDeps(),
        insertToken: vi.fn(async () => ({ status: 'rate_limited' as const })),
      },
    );

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('300');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({
      error: { code: 'RATE_LIMITED' },
    });
  });
});

describe('Edge Function contract — verify-email', () => {
  function verifyDeps(status: 'verified' | 'invalid' | 'expired') {
    return {
      appPublicUrl: 'https://app.example.com',
      verifyToken: vi.fn(async () => status),
    };
  }

  it('200 devuelve exactamente verified:true', async () => {
    const response = await handleVerifyEmail(
      jsonRequest('verify-email', { token: TOKEN }),
      verifyDeps('verified'),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({ verified: true });
  });

  it.each([
    ['invalid', 400, 'VERIFICATION_INVALID'],
    ['expired', 410, 'VERIFICATION_EXPIRED'],
  ] as const)('mapea %s a %i %s', async (status, httpStatus, code) => {
    const response = await handleVerifyEmail(
      jsonRequest('verify-email', { token: TOKEN }),
      verifyDeps(status),
    );

    expect(response.status).toBe(httpStatus);
    await expect(response.json()).resolves.toEqual({ error: { code } });
  });

  it('503 no filtra detalles internos', async () => {
    const response = await handleVerifyEmail(
      jsonRequest('verify-email', { token: TOKEN }),
      {
        appPublicUrl: 'https://app.example.com',
        verifyToken: vi.fn(async () => {
          throw new Error('database details');
        }),
      },
    );

    expect(response.status).toBe(503);
    const body = JSON.stringify(await response.json());
    expect(body).toBe(JSON.stringify({ error: { code: 'SERVICE_UNAVAILABLE' } }));
    expect(body).not.toContain('database details');
  });
});

describe('Edge Function contract — repair-profile', () => {
  function repairDeps(overrides = {}) {
    return {
      appPublicUrl: 'https://app.example.com',
      authenticate: vi.fn(async () => ({ id: USER_ID })),
      repairProfile: vi.fn(async () => profileFixture),
      ...overrides,
    };
  }

  it('200 devuelve exactamente { profile } y no reenvía el body', async () => {
    const deps = repairDeps();
    const response = await handleRepairProfile(
      jsonRequest('repair-profile', {
        role: 'admin',
        free_trip_credits: 99,
        email_verified: true,
      }),
      deps,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({ profile: profileFixture });
    expect(deps.repairProfile).toHaveBeenCalledWith();
  });

  it('401 y 503 conservan el contrato de error', async () => {
    const unauthenticated = await handleRepairProfile(
      jsonRequest('repair-profile'),
      { ...repairDeps(), authenticate: vi.fn(async () => null) },
    );
    expect(unauthenticated.status).toBe(401);
    await expect(unauthenticated.json()).resolves.toEqual({
      error: { code: 'UNAUTHENTICATED' },
    });

    const unavailable = await handleRepairProfile(
      jsonRequest('repair-profile'),
      {
        ...repairDeps(),
        repairProfile: vi.fn(async () => {
          throw new Error('database details');
        }),
      },
    );
    expect(unavailable.status).toBe(503);
    expect(JSON.stringify(await unavailable.json())).toBe(
      JSON.stringify({ error: { code: 'SERVICE_UNAVAILABLE' } }),
    );
  });

  it('503 si el perfil reparado no pertenece al usuario', async () => {
    const response = await handleRepairProfile(
      jsonRequest('repair-profile'),
      repairDeps({
        repairProfile: vi.fn(async () => ({
          ...profileFixture,
          id: '00000000-0000-4000-8000-000000000021',
        })),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'SERVICE_UNAVAILABLE' },
    });
  });
});
