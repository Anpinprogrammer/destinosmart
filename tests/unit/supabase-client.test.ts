import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseClient } from '../../src/lib/supabase-client';

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

const anonJwt = [
  encodeBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' })),
  encodeBase64Url(JSON.stringify({ role: 'anon' })),
  'signature',
].join('.');

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createSupabaseClient', () => {
  it('crea un cliente PKCE sin hacer red', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const client = createSupabaseClient({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: anonJwt,
    });

    const auth = client.auth as unknown as {
      flowType?: string;
      persistSession?: boolean;
      autoRefreshToken?: boolean;
      detectSessionInUrl?: boolean;
    };

    expect(client.auth).toBeDefined();
    expect(client.auth.getSession).toBeTypeOf('function');
    expect(client.auth.signInWithOAuth).toBeTypeOf('function');
    expect(auth.flowType).toBe('pkce');
    expect(auth.persistSession).toBe(true);
    expect(auth.autoRefreshToken).toBe(true);
    expect(auth.detectSessionInUrl).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rechaza una service_role key aunque se llame a la factory', () => {
    const serviceRoleJwt = [
      encodeBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' })),
      encodeBase64Url(JSON.stringify({ role: 'service_role' })),
      'signature',
    ].join('.');

    expect(() =>
      createSupabaseClient({
        supabaseUrl: 'https://example.supabase.co',
        supabaseAnonKey: serviceRoleJwt,
      }),
    ).toThrow(/service_role/);
  });

  it('revalida la URL y rechaza credenciales embebidas', () => {
    expect(() =>
      createSupabaseClient({
        supabaseUrl: 'https://user:pass@example.supabase.co',
        supabaseAnonKey: anonJwt,
      }),
    ).toThrow(/usuario o contraseña/);
  });
});
