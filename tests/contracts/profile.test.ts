import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import profileSchema from '../../specs/features/02-authentication/contracts/profile.schema.json';
import {
  PROFILE_SELECT_COLUMNS,
  ProfileRepositoryError,
  SupabaseProfileRepository,
  parseProfile,
} from '../../src/features/profile/profile-repository';
import type { Profile, ProfileUpdate } from '../../src/features/profile/types';

const USER_ID = '00000000-0000-4000-8000-000000000001';

const profileFixture: Profile = {
  id: USER_ID,
  email: 'user@example.com',
  email_verified: false,
  full_name: 'Ada Lovelace',
  avatar_url: 'https://example.com/avatar.png',
  plan_id: 'free',
  role: 'user',
  free_trip_credits: 1,
  created_at: '2026-10-21T00:00:00.000Z',
  updated_at: '2026-10-21T00:00:00.000Z',
};

type FakeOptions = {
  user?: { id: string } | null;
  authError?: unknown;
  authReject?: unknown;
  profile?: unknown;
  selectError?: unknown;
  updateResult?: unknown;
  updateError?: unknown;
};

function createFakeClient(options: FakeOptions = {}) {
  const calls = {
    tables: [] as string[],
    selectColumns: '',
    eq: [] as Array<[string, string]>,
    updates: [] as Array<Record<string, unknown>>,
  };

  const client = {
    auth: {
      getUser: vi.fn(async () => {
        if (options.authReject) {
          throw options.authReject;
        }
        return {
          data: { user: options.user === undefined ? { id: USER_ID } : options.user },
          error: options.authError ?? null,
        };
      }),
    },
    from: vi.fn((table: string) => {
      calls.tables.push(table);

      return {
        select: vi.fn((columns: string) => {
          calls.selectColumns = columns;
          return {
            eq: vi.fn((column: string, value: string) => {
              calls.eq.push([column, value]);
              return {
                maybeSingle: vi.fn(async () => ({
                  data: options.profile ?? null,
                  error: options.selectError ?? null,
                })),
              };
            }),
          };
        }),
        update: vi.fn((payload: Record<string, unknown>) => {
          calls.updates.push(payload);
          return {
            eq: vi.fn((column: string, value: string) => {
              calls.eq.push([column, value]);
              return {
                select: vi.fn((columns: string) => {
                  calls.selectColumns = columns;
                  return {
                    single: vi.fn(async () => ({
                      data: options.updateResult ?? options.profile ?? null,
                      error: options.updateError ?? null,
                    })),
                  };
                }),
              };
            }),
          };
        }),
      };
    }),
  } as unknown as SupabaseClient;

  return { client, calls };
}

describe('Profile contract', () => {
  it('el schema exige free_trip_credits entero no negativo', () => {
    expect(profileSchema.required).toContain('free_trip_credits');
    expect(profileSchema.required).toContain('full_name');
    expect(profileSchema.required).toContain('avatar_url');
    expect(profileSchema.properties.free_trip_credits).toMatchObject({
      type: 'integer',
      minimum: 0,
      default: 1,
    });
  });

  it('parseProfile acepta un perfil válido y rechaza campos extra', () => {
    expect(parseProfile(profileFixture)).toEqual(profileFixture);
    expect(() =>
      parseProfile({ ...profileFixture, extra: 'not-in-contract' }),
    ).toThrowError(expect.objectContaining({ code: 'INVALID_PROFILE' }));
  });

  it.each([
    ['plan inválido', { plan_id: 'gold' }],
    ['rol inválido', { role: 'root' }],
    ['crédito negativo', { free_trip_credits: -1 }],
    ['crédito no entero', { free_trip_credits: 1.5 }],
    ['avatar no http', { avatar_url: 'javascript:alert(1)' }],
    ['email no normalizado', { email: 'User@Example.com' }],
    ['email sin formato', { email: 'not-an-email' }],
    ['email incompleto', { email: 'a@' }],
    ['timestamp inválido', { created_at: 'not-a-date' }],
  ])('rechaza %s', (_label, patch) => {
    expect(() => parseProfile({ ...profileFixture, ...patch })).toThrowError(
      expect.objectContaining({ code: 'INVALID_PROFILE' }),
    );
  });

  it('el schema es estricto y fija los enums del contrato', () => {
    expect(profileSchema.additionalProperties).toBe(false);
    expect([...profileSchema.required].sort()).toEqual([
      'avatar_url',
      'created_at',
      'email',
      'email_verified',
      'free_trip_credits',
      'full_name',
      'id',
      'plan_id',
      'role',
      'updated_at',
    ]);
    expect(profileSchema.properties.plan_id.enum).toEqual([
      'free',
      'occasional',
      'frequent',
    ]);
    expect(profileSchema.properties.role.enum).toEqual(['user', 'admin']);
  });

  it('acepta el límite inferior del crédito y rechaza ausencias/límites inválidos', () => {
    expect(parseProfile({ ...profileFixture, free_trip_credits: 0 })).toMatchObject({
      free_trip_credits: 0,
    });

    const { free_trip_credits: _omitted, ...withoutCredit } = profileFixture;
    expect(() => parseProfile(withoutCredit)).toThrowError(
      expect.objectContaining({ code: 'INVALID_PROFILE' }),
    );
    expect(() =>
      parseProfile({ ...profileFixture, full_name: 'x'.repeat(121) }),
    ).toThrowError(expect.objectContaining({ code: 'INVALID_PROFILE' }));
    expect(() =>
      parseProfile({ ...profileFixture, avatar_url: 'ftp://example.com/a.png' }),
    ).toThrowError(expect.objectContaining({ code: 'INVALID_PROFILE' }));
    expect(() =>
      parseProfile({ ...profileFixture, avatar_url: 'https://' }),
    ).toThrowError(expect.objectContaining({ code: 'INVALID_PROFILE' }));
  });

  it('selecciona exactamente las columnas del schema, incluido el crédito', () => {
    expect(PROFILE_SELECT_COLUMNS.split(',')).toEqual(profileSchema.required);
  });
});

describe('SupabaseProfileRepository', () => {
  it('lee el perfil propio con id verificado y RLS', async () => {
    const { client, calls } = createFakeClient({ profile: profileFixture });
    const repository = new SupabaseProfileRepository(client);

    await expect(repository.getCurrent()).resolves.toEqual(profileFixture);

    expect(calls.tables).toEqual(['profiles']);
    expect(calls.selectColumns).toBe(PROFILE_SELECT_COLUMNS);
    expect(calls.eq).toEqual([['id', USER_ID]]);
  });

  it('devuelve null si el perfil no existe', async () => {
    const { client } = createFakeClient({ profile: null });
    const repository = new SupabaseProfileRepository(client);

    await expect(repository.getCurrent()).resolves.toBeNull();
  });

  it('falla de forma segura sin sesión', async () => {
    const { client } = createFakeClient({ user: null });
    const repository = new SupabaseProfileRepository(client);

    await expect(repository.getCurrent()).rejects.toMatchObject({
      code: 'UNAUTHENTICATED',
    });
  });

  it('mapea una excepción de auth a UNAUTHENTICATED', async () => {
    const { client } = createFakeClient({
      authReject: new Error('network details'),
    });
    const repository = new SupabaseProfileRepository(client);

    await expect(repository.getCurrent()).rejects.toMatchObject({
      code: 'UNAUTHENTICATED',
    });
  });

  it('mapea error de lectura sin filtrar detalles', async () => {
    const { client } = createFakeClient({
      profile: profileFixture,
      selectError: new Error('database details'),
    });
    const repository = new SupabaseProfileRepository(client);

    await expect(repository.getCurrent()).rejects.toMatchObject({
      code: 'PROFILE_UNAVAILABLE',
    });
  });

  it('actualiza solo full_name y envía la columna permitida', async () => {
    const updated = { ...profileFixture, full_name: 'Grace Hopper' };
    const { client, calls } = createFakeClient({
      profile: profileFixture,
      updateResult: updated,
    });
    const repository = new SupabaseProfileRepository(client);

    await expect(
      repository.updateCurrent({ full_name: 'Grace Hopper' }),
    ).resolves.toEqual(updated);

    expect(calls.updates).toEqual([{ full_name: 'Grace Hopper' }]);
    expect(calls.eq).toEqual([['id', USER_ID]]);
  });

  it('permite limpiar avatar_url con null', async () => {
    const updated = { ...profileFixture, avatar_url: null };
    const { client, calls } = createFakeClient({
      profile: profileFixture,
      updateResult: updated,
    });
    const repository = new SupabaseProfileRepository(client);

    await expect(repository.updateCurrent({ avatar_url: null })).resolves.toEqual(
      updated,
    );
    expect(calls.updates).toEqual([{ avatar_url: null }]);
  });

  it.each([
    ['crédito', { free_trip_credits: 5 }],
    ['plan', { plan_id: 'frequent' }],
    ['rol', { role: 'admin' }],
    ['email_verified', { email_verified: true }],
  ])('rechaza modificar %s desde el cliente', async (_label, patch) => {
    const { client, calls } = createFakeClient({ profile: profileFixture });
    const repository = new SupabaseProfileRepository(client);

    await expect(
      repository.updateCurrent(patch as unknown as ProfileUpdate),
    ).rejects.toMatchObject({ code: 'INVALID_UPDATE' });
    expect(calls.updates).toHaveLength(0);
  });

  it('rechaza un update vacío o con avatar inválido', async () => {
    const { client, calls } = createFakeClient({ profile: profileFixture });
    const repository = new SupabaseProfileRepository(client);

    await expect(repository.updateCurrent({})).rejects.toMatchObject({
      code: 'INVALID_UPDATE',
    });
    await expect(
      repository.updateCurrent({ avatar_url: 'javascript:alert(1)' }),
    ).rejects.toMatchObject({ code: 'INVALID_UPDATE' });
    expect(calls.updates).toHaveLength(0);
  });

  it('mapea error de actualización sin filtrar detalles', async () => {
    const { client } = createFakeClient({
      profile: profileFixture,
      updateError: new Error('database details'),
    });
    const repository = new SupabaseProfileRepository(client);

    await expect(
      repository.updateCurrent({ full_name: 'Grace Hopper' }),
    ).rejects.toMatchObject({ code: 'UPDATE_FAILED' });
  });

  it('rechaza update sin sesión', async () => {
    const { client } = createFakeClient({ user: null });
    const repository = new SupabaseProfileRepository(client);

    await expect(
      repository.updateCurrent({ full_name: 'Grace Hopper' }),
    ).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });

  it('ProfileRepositoryError expone solo un código estable', () => {
    const error = new ProfileRepositoryError('INVALID_UPDATE');
    expect(error.message).toBe('INVALID_UPDATE');
    expect(error.name).toBe('ProfileRepositoryError');
  });
});
