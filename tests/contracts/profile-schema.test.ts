import { describe, expect, it } from 'vitest';
import profileSchema from '../../specs/features/02-authentication/contracts/profile.schema.json';
import { parseProfile } from '../../src/features/profile/profile-repository';
import type { Profile } from '../../src/features/profile/types';
import { validateJsonSchema } from './schema-validator';

const profileFixture: Profile = {
  id: '00000000-0000-4000-8000-000000000001',
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

function schemaErrors(value: unknown) {
  return validateJsonSchema(value, profileSchema);
}

describe('Profile JSON Schema contract', () => {
  it.each([
    ['perfil completo', profileFixture],
    ['crédito consumido', { ...profileFixture, free_trip_credits: 0 }],
    ['opcionales nulos', { ...profileFixture, full_name: null, avatar_url: null }],
    ['nombre de 120 emojis', { ...profileFixture, full_name: '😀'.repeat(120) }],
    ['plan ocasional', { ...profileFixture, plan_id: 'occasional' }],
    ['plan frecuente', { ...profileFixture, plan_id: 'frequent' }],
    ['rol admin', { ...profileFixture, role: 'admin' }],
  ])('acepta %s', (_label, value) => {
    expect(schemaErrors(value)).toEqual([]);
    expect(() => parseProfile(value)).not.toThrow();
  });

  it.each([
    ['sin crédito', (({ free_trip_credits: _credit, ...rest }) => rest)(profileFixture)],
    ['crédito negativo', { ...profileFixture, free_trip_credits: -1 }],
    ['crédito no entero', { ...profileFixture, free_trip_credits: 1.5 }],
    ['plan inválido', { ...profileFixture, plan_id: 'gold' }],
    ['rol inválido', { ...profileFixture, role: 'root' }],
    ['campo extra', { ...profileFixture, extra: 'ignored' }],
    ['email mayúsculas ASCII', { ...profileFixture, email: 'User@Example.com' }],
    ['email mayúsculas Unicode', { ...profileFixture, email: 'Á@b.c' }],
    ['UUID inválido', { ...profileFixture, id: 'not-a-uuid' }],
    ['timestamp fecha sin hora', { ...profileFixture, created_at: '2026-10-21' }],
    ['avatar ftp', { ...profileFixture, avatar_url: 'ftp://example.com/a.png' }],
    ['avatar sin host', { ...profileFixture, avatar_url: 'https://' }],
    ['avatar con espacio', { ...profileFixture, avatar_url: 'http://exa mple.com/a.png' }],
    ['nombre demasiado largo', { ...profileFixture, full_name: 'x'.repeat(121) }],
    ['nombre emoji demasiado largo', { ...profileFixture, full_name: '😀'.repeat(121) }],
  ])('rechaza %s en schema y parser', (_label, value) => {
    expect(schemaErrors(value).length).toBeGreaterThan(0);
    expect(() => parseProfile(value)).toThrowError(
      expect.objectContaining({ code: 'INVALID_PROFILE' }),
    );
  });
});
