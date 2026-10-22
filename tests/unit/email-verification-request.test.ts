import { describe, expect, it, vi } from 'vitest';
import {
  MockEmailProvider,
  createEmailProvider,
} from '../../supabase/functions/_shared/email-provider';
import {
  handleRequestEmailVerification,
  type AuthenticatedUser,
  type RequestEmailVerificationDependencies,
} from '../../supabase/functions/_shared/request-email-verification';
import {
  generateVerificationToken,
  hashToken,
  verificationTokenExpiry,
  VERIFICATION_TOKEN_TTL_MS,
} from '../../supabase/functions/_shared/token';

const USER: AuthenticatedUser = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'user@example.com',
};

function makeRequest(headers: Record<string, string> = {}) {
  return new Request('https://example.supabase.co/functions/v1/request-email-verification', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer test-token',
      ...headers,
    },
  });
}

function makeDeps(overrides: Partial<RequestEmailVerificationDependencies> = {}) {
  const emailProvider = new MockEmailProvider();
  const inserted: Array<{
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: string;
    requestedIpHash: string | null;
    rateLimitKey: string;
  }> = [];
  const deleted: string[] = [];

  const deps: RequestEmailVerificationDependencies = {
    appPublicUrl: 'https://app.example.com',
    emailProvider,
    authenticate: vi.fn(async () => USER),
    insertToken: vi.fn(async (input) => {
      const item = { id: 'token-1', ...input };
      inserted.push(item);
      return { status: 'inserted' as const, id: item.id };
    }),
    deleteToken: vi.fn(async (id) => {
      deleted.push(id);
    }),
    now: () => Date.parse('2026-10-21T12:00:00.000Z'),
    ...overrides,
  };

  return { deps, emailProvider, inserted, deleted };
}

describe('token helpers', () => {
  it('genera tokens aleatorios de 32 bytes y hash SHA-256 hex', async () => {
    const token = generateVerificationToken();
    const other = generateVerificationToken();
    const hash = await hashToken(token);

    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(other).not.toBe(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashToken(token)).toBe(hash);
  });

  it('expira exactamente a 24 h', () => {
    const now = Date.parse('2026-10-21T12:00:00.000Z');
    expect(verificationTokenExpiry(now)).toBe(
      new Date(now + VERIFICATION_TOKEN_TTL_MS).toISOString(),
    );
  });
});

describe('email provider', () => {
  it('usa mock solo cuando EMAIL_PROVIDER=mock', async () => {
    const provider = createEmailProvider({ EMAIL_PROVIDER: 'mock' });
    expect(provider).toBeInstanceOf(MockEmailProvider);
    await provider.sendVerificationEmail({
      to: 'user@example.com',
      verificationUrl: 'https://app.example.com/verify-email?token=secret',
    });
    expect(provider).toBeInstanceOf(MockEmailProvider);
  });

  it('rechaza EMAIL_PROVIDER ausente', () => {
    expect(() => createEmailProvider({})).toThrow('EMAIL_PROVIDER_UNSUPPORTED');
  });

  it('rechaza un proveedor no implementado', () => {
    expect(() => createEmailProvider({ EMAIL_PROVIDER: 'resend' })).toThrow(
      'EMAIL_PROVIDER_UNSUPPORTED',
    );
  });
});

describe('handleRequestEmailVerification', () => {
  it('responde 401 sin usuario autenticado', async () => {
    const { deps } = makeDeps({ authenticate: vi.fn(async () => null) });
    const response = await handleRequestEmailVerification(makeRequest(), deps);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'UNAUTHENTICATED' },
    });
  });

  it('responde 405 para métodos no permitidos y 204 para preflight', async () => {
    const { deps } = makeDeps();
    const getResponse = await handleRequestEmailVerification(
      new Request('https://example.supabase.co/functions/v1/request-email-verification'),
      deps,
    );
    expect(getResponse.status).toBe(405);

    const optionsResponse = await handleRequestEmailVerification(
      new Request('https://example.supabase.co/functions/v1/request-email-verification', {
        method: 'OPTIONS',
      }),
      deps,
    );
    expect(optionsResponse.status).toBe(204);
    expect(optionsResponse.headers.get('Access-Control-Allow-Methods')).toContain(
      'POST',
    );
  });

  it('aplica rate limit sin generar ni enviar token', async () => {
    const { deps, emailProvider, inserted } = makeDeps({
      insertToken: vi.fn(async () => ({ status: 'rate_limited' as const })),
    });
    const response = await handleRequestEmailVerification(makeRequest(), deps);

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('300');
    expect(response.headers.get('Access-Control-Expose-Headers')).toContain(
      'Retry-After',
    );
    expect(emailProvider.deliveries).toHaveLength(0);
    expect(inserted).toHaveLength(0);
  });

  it('crea token hasheado, envía el enlace y no devuelve el token', async () => {
    const { deps, emailProvider, inserted } = makeDeps();
    const response = await handleRequestEmailVerification(
      makeRequest({ 'x-forwarded-for': '203.0.113.10, 10.0.0.1' }),
      deps,
    );

    expect(response.status).toBe(202);
    const body = await response.json();
    expect(body).toEqual({ accepted: true, retry_after_seconds: 300 });
    expect(JSON.stringify(body)).not.toContain('token');

    expect(inserted).toHaveLength(1);
    const saved = inserted[0]!;
    expect(saved.userId).toBe(USER.id);
    expect(saved.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(saved.expiresAt).toBe('2026-10-22T12:00:00.000Z');
    expect(saved.rateLimitKey).toBe(String(Math.floor(Date.parse('2026-10-21T12:00:00.000Z') / 300000)));
    expect(saved.requestedIpHash).toMatch(/^[0-9a-f]{64}$/);
    expect(saved.requestedIpHash).not.toBe('203.0.113.10');

    expect(emailProvider.deliveries).toHaveLength(1);
    const delivery = emailProvider.deliveries[0]!;
    expect(delivery.to).toBe(USER.email);
    const url = new URL(delivery.verificationUrl);
    expect(url.origin).toBe('https://app.example.com');
    expect(url.pathname).toBe('/verify-email');
    const token = url.searchParams.get('token');
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashToken(token!)).toBe(saved.tokenHash);
    expect(JSON.stringify(body)).not.toContain(token);
  });

  it('omite requested_ip_hash si no hay cabecera de IP', async () => {
    const { deps, inserted } = makeDeps();
    const response = await handleRequestEmailVerification(makeRequest(), deps);

    expect(response.status).toBe(202);
    expect(inserted[0]?.requestedIpHash).toBeNull();
  });

  it('borra el token si falla el envío de correo', async () => {
    const failingProvider = {
      sendVerificationEmail: vi.fn(async () => {
        throw new Error('provider down');
      }),
    };
    const { deps, deleted } = makeDeps({ emailProvider: failingProvider });
    const response = await handleRequestEmailVerification(makeRequest(), deps);

    expect(response.status).toBe(503);
    expect(deleted).toEqual(['token-1']);
  });

  it('responde 503 si falla la persistencia', async () => {
    const { deps } = makeDeps({
      insertToken: vi.fn(async () => {
        throw new Error('db down');
      }),
    });
    const response = await handleRequestEmailVerification(makeRequest(), deps);

    expect(response.status).toBe(503);
  });

  it('responde 503 si authenticate lanza una excepción', async () => {
    const { deps } = makeDeps({
      authenticate: vi.fn(async () => {
        throw new Error('auth down');
      }),
    });
    const response = await handleRequestEmailVerification(makeRequest(), deps);

    expect(response.status).toBe(503);
  });
});
