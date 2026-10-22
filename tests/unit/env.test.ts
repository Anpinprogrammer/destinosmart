import { describe, expect, it } from 'vitest';
import { EnvValidationError, parseSupabaseEnv } from '../../src/lib/env';

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function makeJwt(payload: Record<string, unknown>): string {
  return [
    encodeBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' })),
    encodeBase64Url(JSON.stringify(payload)),
    'signature',
  ].join('.');
}

const anonJwt = makeJwt({ role: 'anon' });
const serviceRoleJwt = makeJwt({ role: 'service_role' });

const validEnv = {
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_SUPABASE_ANON_KEY: anonJwt,
};

describe('parseSupabaseEnv', () => {
  it('acepta una URL https y un JWT anon', () => {
    expect(parseSupabaseEnv(validEnv)).toEqual({
      supabaseUrl: validEnv.VITE_SUPABASE_URL,
      supabaseAnonKey: anonJwt,
    });
  });

  it('acepta una publishable key', () => {
    expect(
      parseSupabaseEnv({
        ...validEnv,
        VITE_SUPABASE_ANON_KEY: 'sb_publishable_example',
      }),
    ).toMatchObject({ supabaseAnonKey: 'sb_publishable_example' });
  });

  it('acepta http en localhost para desarrollo local', () => {
    expect(
      parseSupabaseEnv({
        ...validEnv,
        VITE_SUPABASE_URL: 'http://127.0.0.1:54321',
      }),
    ).toMatchObject({ supabaseUrl: 'http://127.0.0.1:54321' });
  });

  it('falla si falta la URL', () => {
    expect(() =>
      parseSupabaseEnv({ ...validEnv, VITE_SUPABASE_URL: undefined }),
    ).toThrow(EnvValidationError);
  });

  it('falla si falta la anon key', () => {
    expect(() =>
      parseSupabaseEnv({ ...validEnv, VITE_SUPABASE_ANON_KEY: '   ' }),
    ).toThrow(EnvValidationError);
  });

  it('rechaza http remoto', () => {
    expect(() =>
      parseSupabaseEnv({
        ...validEnv,
        VITE_SUPABASE_URL: 'http://example.supabase.co',
      }),
    ).toThrow(EnvValidationError);
  });

  it('rechaza una URL con credenciales embebidas', () => {
    expect(() =>
      parseSupabaseEnv({
        ...validEnv,
        VITE_SUPABASE_URL: 'https://user:pass@example.supabase.co',
      }),
    ).toThrow(EnvValidationError);
  });

  it('rechaza un JWT con rol service_role', () => {
    expect(() =>
      parseSupabaseEnv({
        ...validEnv,
        VITE_SUPABASE_ANON_KEY: serviceRoleJwt,
      }),
    ).toThrow(EnvValidationError);
  });

  it('rechaza una secret key sb_secret_', () => {
    expect(() =>
      parseSupabaseEnv({
        ...validEnv,
        VITE_SUPABASE_ANON_KEY: 'sb_secret_example',
      }),
    ).toThrow(EnvValidationError);
  });

  it('rechaza una clave con formato desconocido', () => {
    expect(() =>
      parseSupabaseEnv({
        ...validEnv,
        VITE_SUPABASE_ANON_KEY: 'your-anon-key',
      }),
    ).toThrow(EnvValidationError);
  });

  it('no incluye valores sensibles en el mensaje de error', () => {
    try {
      parseSupabaseEnv({
        ...validEnv,
        VITE_SUPABASE_ANON_KEY: serviceRoleJwt,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      expect((error as Error).message).not.toContain(serviceRoleJwt);
    }
  });
});
