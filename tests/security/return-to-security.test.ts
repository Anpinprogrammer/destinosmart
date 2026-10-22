import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import {
  SupabaseAuthService,
  sanitizeReturnTo,
} from '../../src/features/auth/auth-service';
import { toReturnToNavigation } from '../../src/features/auth/return-to';
import type { ProfileRepository } from '../../src/features/profile/types';

const INTERNAL_BASE = 'https://internal.destinosmart.invalid';
const ALLOWED_ORIGIN = 'https://app.example.com';

function assertInternal(value: string) {
  expect(value.startsWith('//')).toBe(false);
  expect(new URL(value, INTERNAL_BASE).origin).toBe(INTERNAL_BASE);
}

function makeService() {
  const auth = {
    signInWithOAuth: vi.fn(async () => ({ data: null, error: null })),
    resetPasswordForEmail: vi.fn(
      async (): Promise<{ data: null; error: unknown }> => ({
        data: null,
        error: null,
      }),
    ),
  };
  const repository: ProfileRepository = {
    getCurrent: vi.fn(async () => null),
    updateCurrent: vi.fn(async () => {
      throw new Error('not used');
    }),
  };
  const service = new SupabaseAuthService(
    { auth } as unknown as SupabaseClient,
    repository,
    { allowedRedirectOrigins: [ALLOWED_ORIGIN] },
  );

  return { service, auth };
}

describe('seguridad de returnTo', () => {
  it.each([
    ['URL absoluta externa', 'https://evil.example/dashboard'],
    ['protocol-relative', '//evil.example/dashboard'],
    ['triple slash', '///evil.example/dashboard'],
    ['backslash', '/\\evil.example/dashboard'],
    ['doble backslash', '/\\\\evil.example/dashboard'],
    ['javascript', 'javascript:alert(1)'],
    ['data URL', 'data:text/html,<script>alert(1)</script>'],
    ['normalización de path', '/.//evil.example/dashboard'],
    ['segmentos dot', '/%2e%2e//evil.example/dashboard'],
    ['URL absoluta al propio origen', `${ALLOWED_ORIGIN}/dashboard`],
    ['espacio inicial', ' /dashboard'],
    ['tab inicial', '\t/dashboard'],
    ['NUL', '/dashboard\u0000'],
    ['CRLF', '/dashboard\r\nLocation: https://evil.example'],
    ['slash codificado', '/%2F%2Fevil.example/dashboard'],
    ['backslash codificado', '/%5Cevil.example/dashboard'],
    ['NUL codificado', '/%00evil.example/dashboard'],
    ['blob URL', 'blob:https://internal.destinosmart.invalid/dashboard'],
    ['vacío', ''],
  ])('rechaza %s y usa fallback interno', (_label, value) => {
    const result = sanitizeReturnTo(value, '/login');

    expect(result).toBe('/login');
    assertInternal(result);
  });

  it('conserva rutas internas con query y hash', () => {
    const result = sanitizeReturnTo('/dashboard?tab=trips#top');

    expect(result).toBe('/dashboard?tab=trips#top');
    assertInternal(result);
  });

  it('toReturnToNavigation no acepta destinos externos ni normalizaciones peligrosas', () => {
    for (const value of [
      'https://evil.example/dashboard',
      '//evil.example/dashboard',
      '/\\evil.example/dashboard',
      '/.//evil.example/dashboard',
      '/%2e%2e//evil.example/dashboard',
      '/%2F%2Fevil.example/dashboard',
      '/%5Cevil.example/dashboard',
      'blob:https://internal.destinosmart.invalid/dashboard',
    ]) {
      expect(toReturnToNavigation(value)).toEqual({ to: '/dashboard' });
    }
  });

  it('toReturnToNavigation conserva path, query y hash internos', () => {
    expect(toReturnToNavigation('/dashboard?tab=trips#top')).toEqual({
      to: '/dashboard',
      search: { tab: 'trips' },
      hash: 'top',
    });
  });

  it('valida el redirect OAuth contra la allowlist y la ruta exacta', async () => {
    const { service, auth } = makeService();

    await service.signInWithGoogle({
      redirectTo: `${ALLOWED_ORIGIN}/auth/callback`,
    });
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: `${ALLOWED_ORIGIN}/auth/callback` },
    });

    auth.signInWithOAuth.mockClear();
    for (const redirectTo of [
      'https://evil.example/auth/callback',
      '//evil.example/auth/callback',
      'javascript:alert(1)',
      `${ALLOWED_ORIGIN}/dashboard`,
      `https://user:pass@${ALLOWED_ORIGIN.slice('https://'.length)}/auth/callback`,
      `${ALLOWED_ORIGIN}/auth/callback/../../evil`,
      'http://app.example.com/auth/callback',
    ]) {
      await expect(service.signInWithGoogle({ redirectTo })).rejects.toMatchObject({
        code: 'INVALID_INPUT',
      });
    }
    expect(auth.signInWithOAuth).not.toHaveBeenCalled();
  });

  it('valida el redirect de recuperación y mantiene respuesta neutra ante rate limit', async () => {
    const { service, auth } = makeService();

    await expect(
      service.requestPasswordReset({
        email: 'security@example.com',
        redirectTo: `${ALLOWED_ORIGIN}/reset-password`,
      }),
    ).resolves.toEqual({ accepted: true });

    await expect(
      service.requestPasswordReset({
        email: 'security@example.com',
        redirectTo: 'https://evil.example/reset-password',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });

    auth.resetPasswordForEmail.mockResolvedValueOnce({
      data: null,
      error: { code: 'over_email_send_rate_limit' },
    });
    const error = await service
      .requestPasswordReset({
        email: 'security@example.com',
        redirectTo: `${ALLOWED_ORIGIN}/reset-password`,
      })
      .catch((caught: unknown) => caught);

    expect(error).toMatchObject({ code: 'RATE_LIMITED' });
    expect(JSON.stringify(error)).not.toContain('security@example.com');
  });
});
