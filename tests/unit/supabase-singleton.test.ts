import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

const anonJwt = [
  encodeBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' })),
  encodeBase64Url(JSON.stringify({ role: 'anon' })),
  'signature',
].join('.');

describe('supabase singleton', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('falla al importar sin configuración', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    await expect(import('../../src/lib/supabase')).rejects.toThrow(
      /Configuración de entorno inválida/,
    );
  });

  it('crea el singleton con configuración válida', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', anonJwt);

    const module = await import('../../src/lib/supabase');

    expect(module.supabase).toBeDefined();
    expect(module.supabase.auth.getSession).toBeTypeOf('function');
  });
});
