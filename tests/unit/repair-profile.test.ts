import { describe, expect, it, vi } from 'vitest';
import { handleRepairProfile } from '../../supabase/functions/_shared/repair-profile';

const profileFixture = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'user@example.com',
  email_verified: false,
  full_name: 'Ada Lovelace',
  avatar_url: null,
  plan_id: 'free',
  role: 'user',
  free_trip_credits: 1,
  created_at: '2026-10-21T00:00:00.000Z',
  updated_at: '2026-10-21T00:00:00.000Z',
};

function makeRequest(body?: unknown, method = 'POST'): Request {
  return new Request('https://example.supabase.co/functions/v1/repair-profile', {
    method,
    headers: {
      Authorization: 'Bearer test-token',
      'Content-Type': 'application/json',
    },
    body: method === 'GET' || body === undefined ? undefined : JSON.stringify(body),
  });
}

function makeDeps(overrides = {}) {
  return {
    appPublicUrl: 'https://app.example.com',
    authenticate: vi.fn(async () => ({ id: profileFixture.id })),
    repairProfile: vi.fn(async () => profileFixture),
    ...overrides,
  };
}

describe('handleRepairProfile', () => {
  it('repara el perfil propio e ignora campos protegidos del body', async () => {
    const deps = makeDeps();
    const response = await handleRepairProfile(
      makeRequest({
        role: 'admin',
        plan_id: 'frequent',
        email_verified: true,
        free_trip_credits: 99,
      }),
      deps,
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ profile: profileFixture });
    expect(deps.repairProfile).toHaveBeenCalledWith();
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://app.example.com',
    );
  });

  it('responde 401 sin usuario autenticado', async () => {
    const deps = makeDeps({ authenticate: vi.fn(async () => null) });
    const response = await handleRepairProfile(makeRequest(), deps);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'UNAUTHENTICATED' },
    });
    expect(deps.repairProfile).not.toHaveBeenCalled();
  });

  it('responde 503 si falla auth o la reparación', async () => {
    const authFailure = makeDeps({
      authenticate: vi.fn(async () => {
        throw new Error('auth down');
      }),
    });
    expect((await handleRepairProfile(makeRequest(), authFailure)).status).toBe(503);

    const repairFailure = makeDeps({
      repairProfile: vi.fn(async () => {
        throw new Error('db down');
      }),
    });
    expect((await handleRepairProfile(makeRequest(), repairFailure)).status).toBe(503);
  });

  it('responde 503 si la reparación no devuelve el perfil propio', async () => {
    const empty = makeDeps({ repairProfile: vi.fn(async () => null) });
    expect((await handleRepairProfile(makeRequest(), empty)).status).toBe(503);

    const other = makeDeps({
      repairProfile: vi.fn(async () => ({
        ...profileFixture,
        id: '00000000-0000-4000-8000-000000000099',
      })),
    });
    expect((await handleRepairProfile(makeRequest(), other)).status).toBe(503);
  });

  it('incluye headers de seguridad en errores', async () => {
    const deps = makeDeps({ authenticate: vi.fn(async () => null) });
    const response = await handleRepairProfile(makeRequest(), deps);

    expect(response.status).toBe(401);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://app.example.com',
    );
  });

  it('responde 405 y 204 para métodos/preflight', async () => {
    const deps = makeDeps();

    const getResponse = await handleRepairProfile(makeRequest(undefined, 'GET'), deps);
    expect(getResponse.status).toBe(405);

    const optionsResponse = await handleRepairProfile(
      makeRequest(undefined, 'OPTIONS'),
      deps,
    );
    expect(optionsResponse.status).toBe(204);
    expect(optionsResponse.headers.get('Access-Control-Allow-Methods')).toContain(
      'POST',
    );
  });
});
