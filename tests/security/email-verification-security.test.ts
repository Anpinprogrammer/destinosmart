import { describe, expect, it, vi } from 'vitest';
import { MockEmailProvider } from '../../supabase/functions/_shared/email-provider';
import {
  handleRequestEmailVerification,
  type AuthenticatedUser,
  type InsertVerificationTokenInput,
  type RequestEmailVerificationDependencies,
} from '../../supabase/functions/_shared/request-email-verification';
import { handleVerifyEmail } from '../../supabase/functions/_shared/verify-email';
import { hashToken } from '../../supabase/functions/_shared/token';

const USER: AuthenticatedUser = {
  id: '00000000-0000-4000-8000-000000000019',
  email: 'security@example.com',
};
const TOKEN = 'a'.repeat(64);
const NOW = Date.parse('2026-10-21T12:00:00.000Z');

function makeRequest(headers: Record<string, string> = {}) {
  return new Request(
    'https://example.supabase.co/functions/v1/request-email-verification',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer synthetic-test-token',
        'x-forwarded-for': '203.0.113.10, 10.0.0.1',
        ...headers,
      },
    },
  );
}

function makeRequestDeps(
  overrides: Partial<RequestEmailVerificationDependencies> = {},
) {
  const emailProvider = new MockEmailProvider();
  const inserted: InsertVerificationTokenInput[] = [];
  const deleted: string[] = [];

  const deps: RequestEmailVerificationDependencies = {
    appPublicUrl: 'https://app.example.com',
    emailProvider,
    authenticate: vi.fn(async () => USER),
    insertToken: vi.fn(async (input) => {
      inserted.push(input);
      return { status: 'inserted' as const, id: `token-${inserted.length}` };
    }),
    deleteToken: vi.fn(async (id) => {
      deleted.push(id);
    }),
    now: () => NOW,
    ...overrides,
  };

  return { deps, emailProvider, inserted, deleted };
}

describe('seguridad de verificación de correo', () => {
  it('serializa la carrera de rate limit: una solicitud envía y las demás reciben 429', async () => {
    const storedWindows = new Set<string>();
    const inserted: InsertVerificationTokenInput[] = [];
    const emailProvider = new MockEmailProvider();
    const { deps } = makeRequestDeps({
      emailProvider,
      insertToken: vi.fn(async (input) => {
        const key = `${input.userId}:${input.rateLimitKey}`;
        if (storedWindows.has(key)) {
          return { status: 'rate_limited' as const };
        }
        storedWindows.add(key);
        inserted.push(input);
        return { status: 'inserted' as const, id: 'token-winner' };
      }),
    });

    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        handleRequestEmailVerification(makeRequest(), deps),
      ),
    );
    const statuses = responses.map((response) => response.status).sort();

    expect(statuses).toEqual([202, 429, 429, 429, 429]);
    expect(inserted).toHaveLength(1);
    expect(emailProvider.deliveries).toHaveLength(1);
    for (const response of responses) {
      expect(response.headers.get('Cache-Control')).toBe('no-store');
    }

    for (const response of responses.filter((item) => item.status === 429)) {
      expect(response.headers.get('Retry-After')).toBe('300');
      const body = JSON.stringify(await response.json());
      expect(body).not.toContain(USER.email);
      expect(body).not.toContain('token');
    }
  });

  it('persiste solo el hash y no devuelve el token ni la IP cruda', async () => {
    const { deps, emailProvider, inserted } = makeRequestDeps();
    const response = await handleRequestEmailVerification(makeRequest(), deps);

    expect(response.status).toBe(202);
    const responseBody = JSON.stringify(await response.json());
    expect(responseBody).not.toContain('token');

    const saved = inserted[0]!;
    const delivery = emailProvider.deliveries[0]!;
    const rawToken = new URL(delivery.verificationUrl).searchParams.get('token');

    expect(rawToken).toMatch(/^[0-9a-f]{64}$/);
    expect(saved.tokenHash).toBe(await hashToken(rawToken!));
    expect(saved.tokenHash).not.toBe(rawToken);
    expect(saved.requestedIpHash).toMatch(/^[0-9a-f]{64}$/);
    expect(saved.requestedIpHash ?? '').not.toContain('203.0.113.10');
    expect(JSON.stringify(saved)).not.toContain(rawToken);
    expect(responseBody).not.toContain(rawToken);
  });

  it('rechaza replay del mismo token y no lo refleja en la respuesta', async () => {
    const usedHashes = new Set<string>();
    const verifyToken = vi.fn(async (tokenHash: string) => {
      if (usedHashes.has(tokenHash)) {
        return 'invalid' as const;
      }
      usedHashes.add(tokenHash);
      return 'verified' as const;
    });
    const deps = {
      appPublicUrl: 'https://app.example.com',
      verifyToken,
    };

    const first = await handleVerifyEmail(
      new Request('https://example.supabase.co/functions/v1/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: TOKEN }),
      }),
      deps,
    );
    const second = await handleVerifyEmail(
      new Request('https://example.supabase.co/functions/v1/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: TOKEN }),
      }),
      deps,
    );

    expect(first.status).toBe(200);
    expect(second.status).toBe(400);
    expect(first.headers.get('Cache-Control')).toBe('no-store');
    expect(JSON.stringify(await first.json())).not.toContain(TOKEN);
    const secondBody = JSON.stringify(await second.json());
    expect(secondBody).not.toContain(TOKEN);
    expect(secondBody).toContain('VERIFICATION_INVALID');
    expect(verifyToken).toHaveBeenCalledTimes(2);
  });

  it('rechaza tokens mal formados o excesivos sin consultar la base', async () => {
    const verifyToken = vi.fn(async () => 'verified' as const);
    const deps = { appPublicUrl: 'https://app.example.com', verifyToken };

    for (const token of ['short', 'a'.repeat(10_000), 'A'.repeat(64)]) {
      const response = await handleVerifyEmail(
        new Request('https://example.supabase.co/functions/v1/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        }),
        deps,
      );
      expect(response.status).toBe(400);
      const body = JSON.stringify(await response.json());
      expect(body).not.toContain(token);
    }
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it('expone expired sin revelar identidad y conserva no-store', async () => {
    const deps = {
      appPublicUrl: 'https://app.example.com',
      verifyToken: vi.fn(async () => 'expired' as const),
    };
    const response = await handleVerifyEmail(
      new Request('https://example.supabase.co/functions/v1/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: TOKEN }),
      }),
      deps,
    );

    expect(response.status).toBe(410);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const body = JSON.stringify(await response.json());
    expect(body).toContain('VERIFICATION_EXPIRED');
    expect(body).not.toContain(USER.email);
    expect(body).not.toContain(TOKEN);
  });
});
