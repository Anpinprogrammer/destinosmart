import { createHash, randomBytes } from 'node:crypto';
import { expect, type APIRequestContext } from '@playwright/test';

const apiUrl =
  process.env.E2E_SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  'http://127.0.0.1:54321';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const serviceRoleKey =
  process.env.E2E_SUPABASE_SERVICE_ROLE_KEY ?? '';
const mailpitUrl =
  process.env.E2E_MAILPIT_URL ?? 'http://127.0.0.1:54324';

function isLoopbackUrl(value: string): boolean {
  try {
    const host = new URL(value).hostname;
    return host === '127.0.0.1' || host === 'localhost' || host === '[::1]';
  } catch {
    return false;
  }
}

if (serviceRoleKey.length > 0 && !isLoopbackUrl(apiUrl)) {
  throw new Error(
    'E2E_SUPABASE_SERVICE_ROLE_KEY solo se permite contra Supabase local.',
  );
}

const hasServiceRole =
  serviceRoleKey.length > 0 && isLoopbackUrl(apiUrl);

export const authE2E = {
  apiUrl,
  anonKey,
  serviceRoleKey,
  mailpitUrl,
  functionsEnabled: process.env.E2E_FUNCTIONS === '1',
  canRun:
    process.env.E2E_AUTH === '1' && anonKey.length > 0 && hasServiceRole,
  hasServiceRole,
};

export function uniqueEmail(label: string): string {
  const nonce = `${Date.now()}.${randomBytes(4).toString('hex')}`;
  return `e2e.${label}.${nonce}@example.com`;
}

export interface TestUser {
  id: string;
  email: string;
  accessToken: string;
}

export async function signUpViaApi(
  request: APIRequestContext,
  email: string,
  password: string,
  fullName = 'E2E User',
): Promise<TestUser> {
  const response = await request.post(`${apiUrl}/auth/v1/signup`, {
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    data: {
      email,
      password,
      data: { full_name: fullName },
    },
  });
  const body = await response.json();
  expect(response.ok(), JSON.stringify(body)).toBeTruthy();
  expect(body.access_token).toEqual(expect.any(String));
  expect(body.user?.id).toEqual(expect.any(String));

  return {
    id: body.user.id,
    email,
    accessToken: body.access_token,
  };
}

export async function getProfileWithToken(
  request: APIRequestContext,
  accessToken: string,
) {
  const response = await request.get(
    `${apiUrl}/rest/v1/profiles?select=*`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const body = await response.json();
  expect(response.ok(), JSON.stringify(body)).toBeTruthy();
  expect(body).toHaveLength(1);
  return body[0] as {
    id: string;
    email: string;
    email_verified: boolean;
    full_name: string | null;
    free_trip_credits: number;
  };
}

export async function getProfileWithServiceRole(
  request: APIRequestContext,
  userId: string,
) {
  const response = await request.get(
    `${apiUrl}/rest/v1/profiles?select=*&id=eq.${userId}`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );
  const body = await response.json();
  expect(response.ok(), JSON.stringify(body)).toBeTruthy();
  return body[0] as {
    id: string;
    email: string;
    email_verified: boolean;
    full_name: string | null;
    free_trip_credits: number;
  };
}

export async function insertVerificationToken(
  request: APIRequestContext,
  userId: string,
  options: { expired?: boolean } = {},
): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(
    Date.now() + (options.expired ? -60_000 : 24 * 60 * 60 * 1000),
  ).toISOString();

  const response = await request.post(
    `${apiUrl}/rest/v1/email_verification_tokens`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        ...(options.expired
          ? { created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
          : {}),
      },
    },
  );
  const body = await response.json();
  expect(response.ok(), JSON.stringify(body)).toBeTruthy();

  return token;
}

export async function getMailpitResetLink(
  request: APIRequestContext,
  email: string,
): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const listResponse = await request.get(
      `${mailpitUrl}/api/v1/messages?limit=50`,
    );
    expect(listResponse.ok()).toBeTruthy();
    const list = (await listResponse.json()) as {
      messages: Array<{
        ID: string;
        Created: string;
        To: Array<{ Address: string }>;
      }>;
    };
    const messages = list.messages
      .filter((message) =>
        message.To.some((recipient) => recipient.Address === email),
      )
      .sort((left, right) => right.Created.localeCompare(left.Created));
    const message = messages[0];
    if (message) {
      const detailResponse = await request.get(
        `${mailpitUrl}/api/v1/message/${message.ID}`,
      );
      expect(detailResponse.ok()).toBeTruthy();
      const detail = (await detailResponse.json()) as {
        HTML?: string;
        Text?: string;
      };
      const html = detail.HTML ?? detail.Text ?? '';
      const href = html.match(/href="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&');
      if (href) {
        return href;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`No se encontró correo de reset para ${email}`);
}

export async function canReachFunctions(
  request: APIRequestContext,
): Promise<boolean> {
  try {
    const response = await request.get(
      `${apiUrl}/functions/v1/verify-email`,
    );
    return response.status() === 405;
  } catch {
    return false;
  }
}
