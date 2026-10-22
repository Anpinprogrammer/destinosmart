import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../src/features/auth/auth-provider';
import {
  AuthServiceError,
  type AuthService,
  type AuthState,
} from '../../src/features/auth/auth-types';
import { VerifyEmailPage } from '../../src/routes/verify-email';

const TOKEN = 'a'.repeat(64);
const authenticatedState: AuthState = {
  status: 'authenticated',
  user: {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'user@example.com',
    email_verified: false,
    profile: null,
  },
};

function createFakeService(overrides: Partial<AuthService> = {}): AuthService {
  return {
    getSession: vi.fn(async () => authenticatedState),
    onAuthStateChange: vi.fn(() => () => undefined),
    signUpWithPassword: vi.fn(async () => authenticatedState),
    signInWithPassword: vi.fn(async () => authenticatedState),
    signInWithGoogle: vi.fn(async () => undefined),
    signOut: vi.fn(async () => undefined),
    requestPasswordReset: vi.fn(async () => ({ accepted: true as const })),
    updatePassword: vi.fn(async () => authenticatedState),
    verifyEmail: vi.fn(async () => ({ verified: true as const })),
    refreshProfile: vi.fn(async () => ({
      id: '00000000-0000-4000-8000-000000000001',
      email: 'user@example.com',
      email_verified: true,
      full_name: null,
      avatar_url: null,
      plan_id: 'free' as const,
      role: 'user' as const,
      free_trip_credits: 1,
      created_at: '2026-10-21T00:00:00.000Z',
      updated_at: '2026-10-21T00:00:00.000Z',
    })),
    ...overrides,
  };
}

function renderPage(service: AuthService, state: AuthState = authenticatedState) {
  return render(
    <AuthProvider service={{ ...service, getSession: vi.fn(async () => state) }}>
      <VerifyEmailPage />
    </AuthProvider>,
  );
}

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
});

describe('VerifyEmailPage', () => {
  it('verifica el token, refresca el perfil y limpia la URL', async () => {
    window.history.replaceState({}, '', `/verify-email?token=${TOKEN}`);
    const service = createFakeService();
    renderPage(service);

    expect(
      await screen.findByRole('heading', { name: 'Correo verificado' }),
    ).toBeVisible();
    expect(service.verifyEmail).toHaveBeenCalledWith({ token: TOKEN });
    await waitFor(() => expect(service.refreshProfile).toHaveBeenCalled());
    expect(window.location.search).toBe('');
  });

  it('muestra enlace inválido sin token', async () => {
    window.history.replaceState({}, '', '/verify-email');
    const service = createFakeService();
    renderPage(service);

    expect(
      await screen.findByRole('heading', { name: 'Enlace no válido' }),
    ).toBeVisible();
    expect(service.verifyEmail).not.toHaveBeenCalled();
  });

  it('no refresca el perfil si la verificación es anónima', async () => {
    window.history.replaceState({}, '', `/verify-email?token=${TOKEN}`);
    const service = createFakeService();
    renderPage(service, { status: 'anonymous' });

    expect(
      await screen.findByRole('heading', { name: 'Correo verificado' }),
    ).toBeVisible();
    expect(service.refreshProfile).not.toHaveBeenCalled();
  });

  it('muestra enlace inválido del servicio', async () => {
    window.history.replaceState({}, '', `/verify-email?token=${TOKEN}`);
    const service = createFakeService({
      verifyEmail: vi.fn(async () => {
        throw new AuthServiceError('VERIFICATION_INVALID');
      }),
    });
    renderPage(service);

    expect(
      await screen.findByRole('heading', { name: 'Enlace no válido' }),
    ).toBeVisible();
  });

  it('muestra enlace expirado', async () => {
    window.history.replaceState({}, '', `/verify-email?token=${TOKEN}`);
    const service = createFakeService({
      verifyEmail: vi.fn(async () => {
        throw new AuthServiceError('VERIFICATION_EXPIRED');
      }),
    });
    renderPage(service);

    expect(
      await screen.findByRole('heading', { name: 'El enlace expiró' }),
    ).toBeVisible();
  });

  it('muestra error recuperable ante fallo de servicio', async () => {
    window.history.replaceState({}, '', `/verify-email?token=${TOKEN}`);
    const service = createFakeService({
      verifyEmail: vi.fn(async () => {
        throw new Error('network');
      }),
    });
    renderPage(service);

    expect(
      await screen.findByRole('heading', {
        name: 'No pudimos verificar tu correo',
      }),
    ).toBeVisible();
  });
});
