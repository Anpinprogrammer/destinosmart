import { describe, expect, it, vi } from 'vitest';
import { handleRepairProfile } from '../../supabase/functions/_shared/repair-profile';

const USER_ID = '00000000-0000-4000-8000-000000000019';
const OTHER_ID = '00000000-0000-4000-8000-000000000020';

const profileFixture = {
  id: USER_ID,
  email: 'security@example.com',
  email_verified: false,
  full_name: null,
  avatar_url: null,
  plan_id: 'free',
  role: 'user',
  free_trip_credits: 1,
  created_at: '2026-10-21T00:00:00.000Z',
  updated_at: '2026-10-21T00:00:00.000Z',
};

function makeRequest(body: unknown = {}) {
  return new Request('https://example.supabase.co/functions/v1/repair-profile', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer synthetic-test-token',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function makeDeps(overrides = {}) {
  return {
    appPublicUrl: 'https://app.example.com',
    authenticate: vi.fn(async () => ({ id: USER_ID })),
    repairProfile: vi.fn(async () => profileFixture),
    ...overrides,
  };
}

describe('seguridad de repair-profile', () => {
  it('ignora campos protegidos del body y no los reenvía', async () => {
    const deps = makeDeps();
    const response = await handleRepairProfile(
      makeRequest({
        id: OTHER_ID,
        role: 'admin',
        plan_id: 'frequent',
        email_verified: true,
        free_trip_credits: 999,
        email: 'attacker@example.com',
      }),
      deps,
    );

    expect(response.status).toBe(200);
    expect(deps.repairProfile).toHaveBeenCalledWith();
    expect(deps.repairProfile).toHaveBeenCalledTimes(1);
    const body = JSON.stringify(await response.json());
    expect(body).not.toContain('attacker@example.com');
    expect(body).not.toContain(OTHER_ID);
  });

  it('no devuelve el perfil de otra identidad', async () => {
    const deps = makeDeps({
      repairProfile: vi.fn(async () => ({ ...profileFixture, id: OTHER_ID })),
    });
    const response = await handleRepairProfile(makeRequest(), deps);

    expect(response.status).toBe(503);
    const body = JSON.stringify(await response.json());
    expect(body).not.toContain(OTHER_ID);
    expect(body).not.toContain('security@example.com');
  });

  it('rechaza una petición sin usuario autenticado', async () => {
    const deps = makeDeps({ authenticate: vi.fn(async () => null) });
    const response = await handleRepairProfile(makeRequest(), deps);

    expect(response.status).toBe(401);
    expect(deps.repairProfile).not.toHaveBeenCalled();
    expect(JSON.stringify(await response.json())).not.toContain(USER_ID);
  });
});
