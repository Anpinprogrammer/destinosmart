import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  AUTH_ERROR_MESSAGES,
  AuthServiceError,
  authErrorState,
  type AuthErrorCode,
  type AuthService,
  type AuthState,
} from '../../src/features/auth/auth-types';
import type { Profile } from '../../src/features/profile/types';

const USER_ID = '00000000-0000-4000-8000-000000000001';

const profileFixture: Profile = {
  id: USER_ID,
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

const EXPECTED_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_INPUT: 'Revisa los datos ingresados.',
  AUTH_FAILED: 'No pudimos iniciar sesión. Verifica tus datos.',
  EMAIL_ALREADY_EXISTS: 'Si la cuenta existe, enviamos instrucciones.',
  OAUTH_CANCELLED: 'Cancelaste el acceso con Google.',
  RATE_LIMITED: 'Demasiados intentos. Espera un momento.',
  NETWORK_ERROR: 'No hay conexión. Inténtalo de nuevo.',
  SESSION_EXPIRED: 'Tu sesión expiró. Inicia sesión de nuevo.',
  PROFILE_UNAVAILABLE: 'No pudimos cargar tu perfil. Reintenta.',
  VERIFICATION_INVALID: 'El enlace no es válido. Solicita otro.',
  VERIFICATION_EXPIRED: 'El enlace expiró. Solicita otro.',
  UNKNOWN: 'Ocurrió un error. Inténtalo más tarde.',
};

const ERROR_CODES = Object.keys(EXPECTED_MESSAGES) as AuthErrorCode[];

function describeState(state: AuthState): string {
  switch (state.status) {
    case 'initializing':
      return 'initializing';
    case 'anonymous':
      return 'anonymous';
    case 'authenticated':
      return `authenticated:${state.user.id}`;
    case 'error':
      return `error:${state.code}`;
  }
}

describe('AuthState contract', () => {
  it('fija el catálogo exacto de códigos y mensajes', () => {
    expect(AUTH_ERROR_MESSAGES).toEqual(EXPECTED_MESSAGES);
    expect(Object.keys(AUTH_ERROR_MESSAGES).sort()).toEqual(
      [...ERROR_CODES].sort(),
    );
  });

  it.each(ERROR_CODES)('authErrorState(%s) usa el mensaje contractual', (code) => {
    expect(authErrorState(code)).toEqual({
      status: 'error',
      code,
      message: EXPECTED_MESSAGES[code],
    });
  });

  it('la unión discriminada expone solo las cuatro formas del contrato', () => {
    const states: AuthState[] = [
      { status: 'initializing' },
      { status: 'anonymous' },
      {
        status: 'authenticated',
        user: {
          id: USER_ID,
          email: 'user@example.com',
          email_verified: false,
          profile: profileFixture,
        },
      },
      authErrorState('UNKNOWN'),
    ];

    expect(states.map(describeState)).toEqual([
      'initializing',
      'anonymous',
      `authenticated:${USER_ID}`,
      'error:UNKNOWN',
    ]);
  });

  it('AuthServiceError conserva solo el código estable', () => {
    const error = new AuthServiceError('VERIFICATION_EXPIRED');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AuthServiceError');
    expect(error.code).toBe('VERIFICATION_EXPIRED');
    expect(error.message).toBe('VERIFICATION_EXPIRED');
    expect(error.message).not.toContain('@');
  });

  it('fija las firmas críticas de AuthService', () => {
    expectTypeOf<AuthService['verifyEmail']>().toEqualTypeOf<
      (input: { token: string }) => Promise<{ verified: true }>
    >();
    expectTypeOf<AuthService['refreshProfile']>().toEqualTypeOf<
      () => Promise<Profile>
    >();
    expectTypeOf<AuthService['requestPasswordReset']>().toEqualTypeOf<
      (input: { email: string; redirectTo: string }) => Promise<{ accepted: true }>
    >();
  });
});
