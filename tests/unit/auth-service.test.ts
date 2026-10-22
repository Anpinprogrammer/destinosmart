import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { SupabaseAuthService, sanitizeReturnTo } from '../../src/features/auth/auth-service';
import { AuthServiceError } from '../../src/features/auth/auth-types';
import type {
  AuthServiceOptions,
  AuthState,
} from '../../src/features/auth/auth-types';
import type { Profile, ProfileRepository } from '../../src/features/profile/types';

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

type SessionUser = { id: string; email: string };
type Session = { user: SessionUser; access_token: string; refresh_token: string };

type FakeOptions = {
  session?: Session | null;
  sessionError?: unknown;
  sessionReject?: unknown;
  signUpSession?: Session | null;
  signUpError?: unknown;
  signUpReject?: unknown;
  signInSession?: Session | null;
  signInError?: unknown;
  signInReject?: unknown;
  oauthError?: unknown;
  oauthReject?: unknown;
  signOutError?: unknown;
  signOutReject?: unknown;
  resetError?: unknown;
  resetReject?: unknown;
  updatedUser?: SessionUser | null;
  updateError?: unknown;
  updateReject?: unknown;
  verifyError?: unknown;
  verifyReject?: unknown;
  profile?: Profile | null;
  profileError?: unknown;
};

function createFakeClient(options: FakeOptions = {}) {
  let authCallback: ((event: string, session: Session | null) => void) | null = null;
  const unsubscribe = vi.fn();
  const user = { id: USER_ID, email: 'user@example.com' };
  const session = options.session ?? {
    user,
    access_token: 'secret-access-token',
    refresh_token: 'secret-refresh-token',
  };

  const auth = {
    getSession: vi.fn(async () => {
      if (options.sessionReject) {
        throw options.sessionReject;
      }
      return {
        data: { session: options.session === undefined ? session : options.session },
        error: options.sessionError ?? null,
      };
    }),
    signUp: vi.fn(async () => {
      if (options.signUpReject) {
        throw options.signUpReject;
      }
      return {
        data: {
          session:
            options.signUpSession === undefined ? session : options.signUpSession,
          user,
        },
        error: options.signUpError ?? null,
      };
    }),
    signInWithPassword: vi.fn(async () => {
      if (options.signInReject) {
        throw options.signInReject;
      }
      return {
        data: {
          session:
            options.signInSession === undefined ? session : options.signInSession,
          user,
        },
        error: options.signInError ?? null,
      };
    }),
    signInWithOAuth: vi.fn(async () => {
      if (options.oauthReject) {
        throw options.oauthReject;
      }
      return {
        data: { provider: 'google', url: 'https://accounts.google.com/o/oauth2' },
        error: options.oauthError ?? null,
      };
    }),
    signOut: vi.fn(async () => {
      if (options.signOutReject) {
        throw options.signOutReject;
      }
      return { error: options.signOutError ?? null };
    }),
    resetPasswordForEmail: vi.fn(async () => {
      if (options.resetReject) {
        throw options.resetReject;
      }
      return {
        data: {},
        error: options.resetError ?? null,
      };
    }),
    updateUser: vi.fn(async () => {
      if (options.updateReject) {
        throw options.updateReject;
      }
      return {
        data: { user: options.updatedUser === undefined ? user : options.updatedUser },
        error: options.updateError ?? null,
      };
    }),
    onAuthStateChange: vi.fn((callback: (event: string, session: Session | null) => void) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe } } };
    }),
  };

  const functions = {
    invoke: vi.fn(async () => {
      if (options.verifyReject) {
        throw options.verifyReject;
      }
      return {
        data: { verified: true },
        error: options.verifyError ?? null,
      };
    }),
  };

  const client = { auth, functions } as unknown as SupabaseClient;

  return {
    client,
    auth,
    functions,
    unsubscribe,
    emitAuth: (event: string, nextSession: Session | null) => {
      authCallback?.(event, nextSession);
    },
  };
}

function createRepository(options: FakeOptions = {}) {
  const repository: ProfileRepository = {
    getCurrent: vi.fn(async () => {
      if (options.profileError) {
        throw options.profileError;
      }
      return options.profile === undefined ? profileFixture : options.profile;
    }),
    updateCurrent: vi.fn(async () => profileFixture),
  };

  return repository;
}

function createService(
  options: FakeOptions = {},
  serviceOptions: AuthServiceOptions = {
    allowedRedirectOrigins: ['https://app.example.com'],
  },
) {
  const fake = createFakeClient(options);
  const repository = createRepository(options);
  const service = new SupabaseAuthService(
    fake.client,
    repository,
    serviceOptions,
  );
  return { ...fake, repository, service };
}

function expectAuthenticated(state: AuthState) {
  expect(state.status).toBe('authenticated');
  if (state.status !== 'authenticated') {
    throw new Error(`expected authenticated, got ${state.status}`);
  }
  return state;
}

describe('sanitizeReturnTo', () => {
  it('acepta rutas internas y conserva query/hash', () => {
    expect(sanitizeReturnTo('/dashboard?tab=trips#top')).toBe(
      '/dashboard?tab=trips#top',
    );
  });

  it.each([
    ['URL absoluta', 'https://evil.example/path'],
    ['protocol-relative', '//evil.example/path'],
    ['path normalization', '/.//evil.example/path'],
    ['dot segments', '/%2e%2e//evil.example/path'],
    ['backslash', '/\\evil.example/path'],
    ['javascript', 'javascript:alert(1)'],
    ['vacío', ''],
    ['control', '/dashboard\u0000'],
  ])('rechaza %s y usa fallback', (_label, value) => {
    expect(sanitizeReturnTo(value, '/login')).toBe('/login');
  });
});

describe('SupabaseAuthService', () => {
  it('getSession devuelve anonymous sin sesión', async () => {
    const { service } = createService({ session: null });

    await expect(service.getSession()).resolves.toEqual({ status: 'anonymous' });
  });

  it('getSession devuelve perfil autenticado sin exponer tokens', async () => {
    const { service } = createService();
    const state = expectAuthenticated(await service.getSession());

    expect(state.user.profile).toEqual(profileFixture);
    expect(state.user.email_verified).toBe(false);
    expect(JSON.stringify(state)).not.toContain('secret-access-token');
    expect(JSON.stringify(state)).not.toContain('secret-refresh-token');
  });

  it('getSession falla si el perfil no existe', async () => {
    const { service } = createService({ profile: null });

    await expect(service.getSession()).resolves.toMatchObject({
      status: 'error',
      code: 'PROFILE_UNAVAILABLE',
    });
  });

  it('getSession mapea sesión expirada', async () => {
    const { service } = createService({
      sessionError: { code: 'session_not_found', name: 'AuthApiError' },
    });

    await expect(service.getSession()).resolves.toMatchObject({
      status: 'error',
      code: 'SESSION_EXPIRED',
    });
  });

  it('getSession mapea una excepción de red', async () => {
    const { service } = createService({
      sessionReject: new TypeError('fetch failed'),
    });

    await expect(service.getSession()).resolves.toMatchObject({
      status: 'error',
      code: 'NETWORK_ERROR',
    });
  });

  it('signUp normaliza email, envía full_name y devuelve perfil', async () => {
    const { service, auth } = createService();
    const state = expectAuthenticated(
      await service.signUpWithPassword({
        email: 'USER@Example.com',
        password: 'secret-password',
        fullName: ' Ada Lovelace ',
      }),
    );

    expect(auth.signUp).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret-password',
      options: { data: { full_name: 'Ada Lovelace' } },
    });
    expect(state.user.profile?.free_trip_credits).toBe(1);
  });

  it('signUp mapea email existente sin revelar detalles', async () => {
    const { service } = createService({
      signUpError: { code: 'user_already_exists', name: 'AuthApiError' },
    });

    await expect(
      service.signUpWithPassword({
        email: 'user@example.com',
        password: 'secret-password',
      }),
    ).resolves.toMatchObject({ status: 'error', code: 'EMAIL_ALREADY_EXISTS' });
  });

  it('signUp rechaza input inválido sin llamar a Supabase', async () => {
    const { service, auth } = createService();

    await expect(
      service.signUpWithPassword({ email: 'not-an-email', password: '' }),
    ).resolves.toMatchObject({ status: 'error', code: 'INVALID_INPUT' });
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('signUp mapea una excepción de red', async () => {
    const { service } = createService({
      signUpReject: new TypeError('fetch failed'),
    });

    await expect(
      service.signUpWithPassword({
        email: 'user@example.com',
        password: 'secret-password',
      }),
    ).resolves.toMatchObject({ status: 'error', code: 'NETWORK_ERROR' });
  });

  it('signIn mapea credenciales inválidas', async () => {
    const { service } = createService({
      signInError: { code: 'invalid_credentials', name: 'AuthApiError' },
    });

    await expect(
      service.signInWithPassword({
        email: 'user@example.com',
        password: 'wrong-password',
      }),
    ).resolves.toMatchObject({ status: 'error', code: 'AUTH_FAILED' });
  });

  it('signIn devuelve authenticated con perfil', async () => {
    const { service } = createService();
    const state = expectAuthenticated(
      await service.signInWithPassword({
        email: 'user@example.com',
        password: 'secret-password',
      }),
    );

    expect(state.user.profile).toEqual(profileFixture);
  });

  it('signIn mapea una excepción de red', async () => {
    const { service } = createService({
      signInReject: new TypeError('fetch failed'),
    });

    await expect(
      service.signInWithPassword({
        email: 'user@example.com',
        password: 'secret-password',
      }),
    ).resolves.toMatchObject({ status: 'error', code: 'NETWORK_ERROR' });
  });

  it('signInWithGoogle valida redirect y llama al proveedor', async () => {
    const { service, auth } = createService();

    await service.signInWithGoogle({
      redirectTo: 'https://app.example.com/auth/callback',
    });

    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'https://app.example.com/auth/callback' },
    });
  });

  it('signInWithGoogle rechaza redirect inseguro', async () => {
    const { service, auth } = createService();

    await expect(
      service.signInWithGoogle({ redirectTo: 'javascript:alert(1)' }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(
      service.signInWithGoogle({
        redirectTo: 'https://evil.example/auth/callback',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    expect(auth.signInWithOAuth).not.toHaveBeenCalled();
  });

  it('signInWithGoogle mapea cancelación', async () => {
    const { service } = createService({
      oauthError: { code: 'access_denied', name: 'AuthApiError' },
    });

    await expect(
      service.signInWithGoogle({ redirectTo: 'https://app.example.com/auth/callback' }),
    ).rejects.toMatchObject({ code: 'OAUTH_CANCELLED' });
  });

  it('signInWithGoogle mapea una excepción de red', async () => {
    const { service } = createService({
      oauthReject: new TypeError('fetch failed'),
    });

    await expect(
      service.signInWithGoogle({ redirectTo: 'https://app.example.com/auth/callback' }),
    ).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('signOut propaga un error estable', async () => {
    const { service } = createService({
      signOutError: { code: 'session_not_found', name: 'AuthApiError' },
    });

    await expect(service.signOut()).rejects.toMatchObject({
      code: 'SESSION_EXPIRED',
    });
  });

  it('signOut mapea una excepción de red', async () => {
    const { service } = createService({
      signOutReject: new TypeError('fetch failed'),
    });

    await expect(service.signOut()).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    });
  });

  it('requestPasswordReset devuelve accepted y valida redirect', async () => {
    const { service, auth } = createService();

    await expect(
      service.requestPasswordReset({
        email: 'USER@example.com',
        redirectTo: 'https://app.example.com/reset-password',
      }),
    ).resolves.toEqual({ accepted: true });

    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
      redirectTo: 'https://app.example.com/reset-password',
    });
  });

  it('requestPasswordReset rechaza email/redirect inválidos', async () => {
    const { service, auth } = createService();

    await expect(
      service.requestPasswordReset({
        email: 'not-an-email',
        redirectTo: 'https://app.example.com/reset-password',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(
      service.requestPasswordReset({
        email: 'user@example.com',
        redirectTo: '//evil.example',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(
      service.requestPasswordReset({
        email: 'user@example.com',
        redirectTo: 'https://evil.example/reset-password',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    expect(auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('requestPasswordReset es neutro ante user_not_found', async () => {
    const { service } = createService({
      resetError: { code: 'user_not_found', name: 'AuthApiError' },
    });

    await expect(
      service.requestPasswordReset({
        email: 'missing@example.com',
        redirectTo: 'https://app.example.com/reset-password',
      }),
    ).resolves.toEqual({ accepted: true });
  });

  it('requestPasswordReset mapea rate limit', async () => {
    const { service } = createService({
      resetError: { code: 'over_email_send_rate_limit', name: 'AuthApiError' },
    });

    await expect(
      service.requestPasswordReset({
        email: 'user@example.com',
        redirectTo: 'https://app.example.com/reset-password',
      }),
    ).rejects.toMatchObject({ code: 'RATE_LIMITED' });
  });

  it('requestPasswordReset mapea una excepción de red', async () => {
    const { service } = createService({
      resetReject: new TypeError('fetch failed'),
    });

    await expect(
      service.requestPasswordReset({
        email: 'user@example.com',
        redirectTo: 'https://app.example.com/reset-password',
      }),
    ).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('updatePassword devuelve authenticated', async () => {
    const { service } = createService();
    const state = expectAuthenticated(
      await service.updatePassword({ password: 'new-secret-password' }),
    );

    expect(state.user.profile).toEqual(profileFixture);
  });

  it('updatePassword mapea same_password', async () => {
    const { service } = createService({
      updateError: { code: 'same_password', name: 'AuthApiError' },
    });

    await expect(
      service.updatePassword({ password: 'same-password' }),
    ).resolves.toMatchObject({ status: 'error', code: 'INVALID_INPUT' });
  });

  it('updatePassword mapea una excepción de red', async () => {
    const { service } = createService({
      updateReject: new TypeError('fetch failed'),
    });

    await expect(
      service.updatePassword({ password: 'new-secret-password' }),
    ).resolves.toMatchObject({ status: 'error', code: 'NETWORK_ERROR' });
  });

  it('refreshProfile devuelve el perfil y falla si no existe', async () => {
    const { service } = createService();
    await expect(service.refreshProfile()).resolves.toEqual(profileFixture);

    const missing = createService({ profile: null });
    await expect(missing.service.refreshProfile()).rejects.toMatchObject({
      code: 'PROFILE_UNAVAILABLE',
    });
  });

  it('onAuthStateChange emite authenticated, anonymous y permite unsubscribe', async () => {
    const { service, emitAuth, unsubscribe } = createService();
    const callback = vi.fn();

    const stop = service.onAuthStateChange(callback);

    emitAuth('SIGNED_IN', {
      user: { id: USER_ID, email: 'user@example.com' },
      access_token: 'secret-access-token',
      refresh_token: 'secret-refresh-token',
    });
    await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
    expect(callback.mock.calls[0]?.[0]).toMatchObject({
      status: 'authenticated',
    });

    emitAuth('SIGNED_OUT', null);
    expect(callback).toHaveBeenLastCalledWith({ status: 'anonymous' });

    stop();
    expect(unsubscribe).toHaveBeenCalledTimes(1);

    emitAuth('SIGNED_IN', null);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('onAuthStateChange no emite authenticated después de SIGNED_OUT', async () => {
    const fake = createFakeClient();
    let resolveProfile!: (profile: Profile) => void;
    const pendingProfile = new Promise<Profile>((resolve) => {
      resolveProfile = resolve;
    });
    const repository: ProfileRepository = {
      getCurrent: vi.fn(() => pendingProfile),
      updateCurrent: vi.fn(async () => profileFixture),
    };
    const service = new SupabaseAuthService(fake.client, repository, {
      allowedRedirectOrigins: ['https://app.example.com'],
    });
    const callback = vi.fn();

    service.onAuthStateChange(callback);
    fake.emitAuth('SIGNED_IN', {
      user: { id: USER_ID, email: 'user@example.com' },
      access_token: 'secret-access-token',
      refresh_token: 'secret-refresh-token',
    });
    fake.emitAuth('SIGNED_OUT', null);

    resolveProfile(profileFixture);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ status: 'anonymous' });
  });

  it('auth-service conserva códigos estables en errores no AuthState', async () => {
    const error = new AuthServiceError('NETWORK_ERROR');

    expect(error.message).toBe('NETWORK_ERROR');
    expect(error.name).toBe('AuthServiceError');
  });
});

describe('SupabaseAuthService.verifyEmail', () => {
  const TOKEN = 'a'.repeat(64);

  it('invoca la función verify-email con el token', async () => {
    const { service, functions } = createService();
    await expect(service.verifyEmail({ token: TOKEN })).resolves.toEqual({
      verified: true,
    });
    expect(functions.invoke).toHaveBeenCalledWith('verify-email', {
      body: { token: TOKEN },
    });
  });

  it('mapea 410 a VERIFICATION_EXPIRED', async () => {
    const { service } = createService({
      verifyError: { context: { status: 410 } },
    });
    await expect(service.verifyEmail({ token: TOKEN })).rejects.toMatchObject({
      code: 'VERIFICATION_EXPIRED',
    });
  });

  it('mapea 400 a VERIFICATION_INVALID', async () => {
    const { service } = createService({
      verifyError: { context: { status: 400 } },
    });
    await expect(service.verifyEmail({ token: TOKEN })).rejects.toMatchObject({
      code: 'VERIFICATION_INVALID',
    });
  });

  it('mapea 429 a RATE_LIMITED', async () => {
    const { service } = createService({
      verifyError: { context: { status: 429 } },
    });
    await expect(service.verifyEmail({ token: TOKEN })).rejects.toMatchObject({
      code: 'RATE_LIMITED',
    });
  });

  it('rechaza token mal formado sin invocar la función', async () => {
    const { service, functions } = createService();
    await expect(service.verifyEmail({ token: 'short' })).rejects.toMatchObject({
      code: 'VERIFICATION_INVALID',
    });
    expect(functions.invoke).not.toHaveBeenCalled();
  });

  it('mapea una excepción de red', async () => {
    const { service } = createService({
      verifyReject: new TypeError('fetch failed'),
    });
    await expect(service.verifyEmail({ token: TOKEN })).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    });
  });

  it('AuthServiceError conserva el código', () => {
    const error = new AuthServiceError('VERIFICATION_INVALID');
    expect(error.message).toBe('VERIFICATION_INVALID');
  });
});

describe('SupabaseAuthService.onAuthStateChange — cambio de identidad', () => {
  it('emite initializing antes de hidratar un usuario distinto', async () => {
    const fake = createFakeClient();
    let resolveSecond!: (profile: Profile) => void;
    const secondProfile = new Promise<Profile>((resolve) => {
      resolveSecond = resolve;
    });
    let calls = 0;
    const repository: ProfileRepository = {
      getCurrent: vi.fn(() => {
        calls += 1;
        if (calls === 1) {
          return Promise.resolve(profileFixture);
        }
        return secondProfile;
      }),
      updateCurrent: vi.fn(async () => profileFixture),
    };
    const service = new SupabaseAuthService(fake.client, repository, {
      allowedRedirectOrigins: ['https://app.example.com'],
    });
    const callback = vi.fn();

    service.onAuthStateChange(callback);
    fake.emitAuth('SIGNED_IN', {
      user: { id: USER_ID, email: 'user@example.com' },
      access_token: 'secret-access-token',
      refresh_token: 'secret-refresh-token',
    });
    await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));

    fake.emitAuth('SIGNED_IN', {
      user: { id: '00000000-0000-4000-8000-000000000002', email: 'otra@example.com' },
      access_token: 'secret-access-token-2',
      refresh_token: 'secret-refresh-token-2',
    });

    expect(callback).toHaveBeenLastCalledWith({ status: 'initializing' });

    resolveSecond({
      ...profileFixture,
      id: '00000000-0000-4000-8000-000000000002',
      email: 'otra@example.com',
    });

    await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(3));
    expect(callback.mock.calls[2]?.[0]).toMatchObject({
      status: 'authenticated',
      user: {
        id: '00000000-0000-4000-8000-000000000002',
        email: 'otra@example.com',
      },
    });
  });
});

describe('SupabaseAuthService — identidad establecida antes de eventos', () => {
  it('emite initializing si getSession estableció A y llega un evento de B', async () => {
    const { service, emitAuth } = createService();
    const callback = vi.fn();

    service.onAuthStateChange(callback);
    await service.getSession();
    emitAuth('SIGNED_IN', {
      user: { id: '00000000-0000-4000-8000-000000000002', email: 'otra@example.com' },
      access_token: 'secret-access-token-2',
      refresh_token: 'secret-refresh-token-2',
    });

    expect(callback).toHaveBeenCalledWith({ status: 'initializing' });
  });

  it('rechaza un perfil cuyo id no coincide con el usuario', async () => {
    const { service } = createService({
      profile: {
        ...profileFixture,
        id: '00000000-0000-4000-8000-000000000002',
      },
    });

    await expect(service.getSession()).resolves.toMatchObject({
      status: 'error',
      code: 'PROFILE_UNAVAILABLE',
    });
  });
});
