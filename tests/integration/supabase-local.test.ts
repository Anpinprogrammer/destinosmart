// @vitest-environment node
import { createHash, randomBytes } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const enabled = process.env.INTEGRATION_SUPABASE === '1';
const apiUrl =
  process.env.INTEGRATION_SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  'http://127.0.0.1:54321';
const anonKey =
  process.env.INTEGRATION_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  '';
const serviceRoleKey = process.env.INTEGRATION_SUPABASE_SERVICE_ROLE_KEY ?? '';
const mailpitUrl =
  process.env.INTEGRATION_MAILPIT_URL ?? 'http://127.0.0.1:54324';
const googleEnabled =
  process.env.INTEGRATION_GOOGLE === '1' &&
  Boolean(process.env.GOOGLE_TEST_EMAIL);

const PASSWORD = 'SyntheticPass123!';
const describeIntegration = enabled ? describe : describe.skip;

interface TestUser {
  id: string;
  email: string;
  accessToken: string;
}

function headers(token?: string, service = false): HeadersInit {
  return {
    apikey: service ? serviceRoleKey : anonKey,
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : service
        ? { Authorization: `Bearer ${serviceRoleKey}` }
        : {}),
    'Content-Type': 'application/json',
  };
}

function uniqueEmail(label: string): string {
  return `integration.${label}.${Date.now()}.${randomBytes(4).toString('hex')}@example.com`;
}

function uniqueClientIp(label: string): string {
  return `integration-${label}-${Date.now()}-${randomBytes(4).toString('hex')}`;
}

async function jsonResponse(response: Response) {
  return response.json().catch(() => null);
}

async function signup(email: string, fullName = 'Integration User'): Promise<TestUser> {
  const response = await fetch(`${apiUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      email,
      password: PASSWORD,
      data: { full_name: fullName },
    }),
  });
  const body = await jsonResponse(response);
  expect(response.ok, JSON.stringify(body)).toBe(true);
  expect(body?.access_token).toEqual(expect.any(String));
  expect(body?.user?.id).toEqual(expect.any(String));
  createdUserIds.push(body.user.id);
  return { id: body.user.id, email, accessToken: body.access_token };
}

async function profile(token: string) {
  const response = await fetch(
    `${apiUrl}/rest/v1/profiles?select=*`,
    { headers: headers(token) },
  );
  const body = await jsonResponse(response);
  expect(response.ok, JSON.stringify(body)).toBe(true);
  expect(body).toHaveLength(1);
  return body[0];
}

async function adminInsertVerificationToken(
  userId: string,
  options: { expired?: boolean } = {},
): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const now = Date.now();
  const response = await fetch(
    `${apiUrl}/rest/v1/email_verification_tokens`,
    {
      method: 'POST',
      headers: {
        ...headers(undefined, true),
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: new Date(
          now + (options.expired ? -60_000 : 24 * 60 * 60 * 1000),
        ).toISOString(),
        ...(options.expired
          ? { created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString() }
          : {}),
      }),
    },
  );
  expect(response.ok, JSON.stringify(await jsonResponse(response))).toBe(true);
  return token;
}

async function verifyEmail(
  token: string,
  extraHeaders: Record<string, string> = {},
) {
  return fetch(`${apiUrl}/functions/v1/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify({ token }),
  });
}

async function requestVerification(accessToken: string) {
  return fetch(`${apiUrl}/functions/v1/request-email-verification`, {
    method: 'POST',
    headers: headers(accessToken),
    body: '{}',
  });
}

const createdUserIds: string[] = [];

async function cleanupIntegrationUsers() {
  if (!serviceRoleKey) return;
  for (const id of createdUserIds.splice(0)) {
    const response = await fetch(`${apiUrl}/auth/v1/admin/users/${id}`, {
      method: 'DELETE',
      headers: headers(undefined, true),
    });
    expect([200, 204, 404]).toContain(response.status);
  }
}

describeIntegration('integración con Supabase local', () => {
  beforeAll(async () => {
    expect(anonKey, 'INTEGRATION_SUPABASE_ANON_KEY').toBeTruthy();
    expect(serviceRoleKey, 'INTEGRATION_SUPABASE_SERVICE_ROLE_KEY').toBeTruthy();
    const authHealth = await fetch(`${apiUrl}/auth/v1/health`);
    expect(authHealth.ok, 'GoTrue local no responde').toBe(true);
    const functionsHealth = await fetch(
      `${apiUrl}/functions/v1/verify-email`,
    );
    expect(functionsHealth.status, 'Edge Functions locales no responden').toBe(405);
    const mailpitHealth = await fetch(`${mailpitUrl}/api/v1/messages?limit=1`);
    expect(mailpitHealth.ok, 'Mailpit local no responde').toBe(true);
  });

  afterAll(async () => {
    await cleanupIntegrationUsers();
  });

  it('registro y login reales crean perfil con crédito 1 y email pendiente', async () => {
    const email = uniqueEmail('auth');
    const user = await signup(email);
    const current = await profile(user.accessToken);

    expect(current).toMatchObject({
      id: user.id,
      email,
      email_verified: false,
      free_trip_credits: 1,
      plan_id: 'free',
      role: 'user',
    });

    const login = await fetch(`${apiUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, password: PASSWORD }),
    });
    const loginBody = await jsonResponse(login);
    expect(login.ok, JSON.stringify(loginBody)).toBe(true);
    expect(loginBody?.access_token).toEqual(expect.any(String));
    expect(loginBody?.user?.id).toBe(user.id);
  });

  it('RLS cross-user y crédito protegido con JWT reales', async () => {
    const userA = await signup(uniqueEmail('rls-a'));
    const userB = await signup(uniqueEmail('rls-b'));

    const readB = await fetch(
      `${apiUrl}/rest/v1/profiles?select=id,email&id=eq.${userB.id}`,
      { headers: headers(userA.accessToken) },
    );
    expect(readB.ok).toBe(true);
    expect(await readB.json()).toEqual([]);

    const updateB = await fetch(
      `${apiUrl}/rest/v1/profiles?id=eq.${userB.id}`,
      {
        method: 'PATCH',
        headers: {
          ...headers(userA.accessToken),
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ full_name: 'hacked' }),
      },
    );
    expect([200, 204]).toContain(updateB.status);
    expect(await updateB.text()).not.toContain('hacked');

    const currentB = await profile(userB.accessToken);
    expect(currentB.full_name).not.toBe('hacked');

    const creditUpdate = await fetch(
      `${apiUrl}/rest/v1/profiles?id=eq.${userA.id}`,
      {
        method: 'PATCH',
        headers: headers(userA.accessToken),
        body: JSON.stringify({ free_trip_credits: 99 }),
      },
    );
    expect(creditUpdate.ok).toBe(false);
    expect((await profile(userA.accessToken)).free_trip_credits).toBe(1);
  });

  it('rate limit real de request-email-verification y verificación con token', async () => {
    const user = await signup(uniqueEmail('verify'));
    const first = await requestVerification(user.accessToken);
    expect(first.status, await first.text()).toBe(202);

    const second = await requestVerification(user.accessToken);
    expect(second.status).toBe(429);
    expect(second.headers.get('retry-after')).toBe('300');

    const clientIp = uniqueClientIp('verify');
    const token = await adminInsertVerificationToken(user.id);
    const verify = await verifyEmail(token, { 'x-forwarded-for': clientIp });
    expect(verify.status, await verify.text()).toBe(200);
    expect(await profile(user.accessToken)).toMatchObject({
      email_verified: true,
    });

    const replay = await verifyEmail(token, { 'x-forwarded-for': clientIp });
    expect(replay.status).toBe(400);

    const expired = await adminInsertVerificationToken(user.id, {
      expired: true,
    });
    const expiredResponse = await verifyEmail(expired, {
      'x-forwarded-for': clientIp,
    });
    expect(expiredResponse.status).toBe(410);
  });

  it('concurrencia real del token: un 200 y un 400, sin doble consumo', async () => {
    const user = await signup(uniqueEmail('concurrent'));
    const clientIp = uniqueClientIp('concurrent');
    const token = await adminInsertVerificationToken(user.id);
    const responses = await Promise.all([
      verifyEmail(token, { 'x-forwarded-for': clientIp }),
      verifyEmail(token, { 'x-forwarded-for': clientIp }),
    ]);
    const statuses = responses.map((response) => response.status).sort();

    expect(statuses).toEqual([200, 400]);
    expect((await profile(user.accessToken)).email_verified).toBe(true);
  });

  it('reset solicita correo en Mailpit sin revelar existencia', async () => {
    const email = uniqueEmail('reset');
    const user = await signup(email);
    const known = await fetch(`${apiUrl}/auth/v1/recover`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        email,
        redirect_to: 'http://127.0.0.1:3000/reset-password',
      }),
    });
    expect(known.status).toBe(200);

    const unknown = await fetch(`${apiUrl}/auth/v1/recover`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        email: uniqueEmail('missing'),
        redirect_to: 'http://127.0.0.1:3000/reset-password',
      }),
    });
    expect(unknown.status).toBe(200);

    let found = false;
    for (let attempt = 0; attempt < 20 && !found; attempt += 1) {
      const messages = await fetch(`${mailpitUrl}/api/v1/messages?limit=50`);
      const body = (await messages.json()) as {
        messages?: Array<{ ID: string; To: Array<{ Address: string }> }>;
      };
      found = Boolean(
        body.messages?.some((message) =>
          message.To.some((recipient) => recipient.Address === email),
        ),
      );
      if (!found) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    expect(found).toBe(true);
    expect(user.id).toEqual(expect.any(String));
  });

  it.skipIf(process.env.INTEGRATION_VERIFY_RATE_LIMIT !== '1')(
    'rate limit configurable del endpoint público verify-email',
    async () => {
      const clientIp = `integration-rate-${Date.now()}-${randomBytes(4).toString('hex')}`;
      const limit = Number(
        process.env.INTEGRATION_VERIFY_RATE_LIMIT_VALUE ?? '3',
      );
      const windowSeconds =
        process.env.INTEGRATION_VERIFY_RATE_WINDOW_SECONDS ?? '300';
      const statuses: number[] = [];
      for (let attempt = 0; attempt < limit + 1; attempt += 1) {
        const response = await verifyEmail('a'.repeat(64), {
          'x-forwarded-for': clientIp,
        });
        statuses.push(response.status);
        if (attempt === limit) {
          expect(response.headers.get('retry-after')).toBe(windowSeconds);
          expect(await response.json()).toEqual({
            error: { code: 'RATE_LIMITED' },
          });
        }
      }
      expect(statuses).toEqual([
        ...Array.from({ length: limit }, () => 400),
        429,
      ]);
    },
  );

  it.skipIf(!googleEnabled)(
    'OAuth Google configurado redirige a Google sin probar una cuenta real',
    async () => {
      const response = await fetch(
        `${apiUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
          'http://127.0.0.1:3000/auth/callback',
        )}`,
        { redirect: 'manual' },
      );
      expect([302, 303]).toContain(response.status);
      expect(response.headers.get('location')).toContain('accounts.google.com');
    },
  );
});
