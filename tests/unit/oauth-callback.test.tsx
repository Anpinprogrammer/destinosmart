import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../src/features/auth/auth-provider';
import type { AuthService, AuthState } from '../../src/features/auth/auth-types';
import { OAuthCallbackPage } from '../../src/routes/auth/callback';

const { navigateMock, locationRef } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  locationRef: { href: '/auth/callback' },
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ href: locationRef.href }),
  };
});

afterEach(() => {
  cleanup();
  navigateMock.mockClear();
  locationRef.href = '/auth/callback';
});

const authenticatedState: AuthState = {
  status: 'authenticated',
  user: {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'user@example.com',
    email_verified: true,
    profile: null,
  },
};

function createFakeService(state: AuthState): AuthService {
  return {
    getSession: vi.fn(async () => state),
    onAuthStateChange: vi.fn(() => () => undefined),
    signUpWithPassword: vi.fn(async () => state),
    signInWithPassword: vi.fn(async () => state),
    signInWithGoogle: vi.fn(async () => undefined),
    signOut: vi.fn(async () => undefined),
    requestPasswordReset: vi.fn(async () => ({ accepted: true as const })),
    updatePassword: vi.fn(async () => state),
    verifyEmail: vi.fn(async () => ({ verified: true as const })),
    refreshProfile: vi.fn(async () => {
      throw new Error('not used');
    }),
  };
}

function renderCallback(state: AuthState) {
  return render(
    <AuthProvider service={createFakeService(state)}>
      <OAuthCallbackPage />
    </AuthProvider>,
  );
}

describe('OAuthCallbackPage', () => {
  it('navega al returnTo interno cuando la sesión está autenticada', async () => {
    locationRef.href = '/auth/callback?returnTo=%2Fdashboard%3Ftab%3Dtrips';
    renderCallback(authenticatedState);

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/dashboard',
          search: { tab: 'trips' },
        }),
      ),
    );
  });

  it('sanea returnTo externo y conserva hash interno', async () => {
    locationRef.href = '/auth/callback?returnTo=https%3A%2F%2Fevil.example';
    const external = renderCallback(authenticatedState);
    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith(
        expect.objectContaining({ to: '/dashboard' }),
      ),
    );
    external.unmount();
    navigateMock.mockClear();

    locationRef.href = '/auth/callback?returnTo=%2Fdashboard%23top';
    renderCallback(authenticatedState);
    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith(
        expect.objectContaining({ to: '/dashboard', hash: 'top' }),
      ),
    );
  });

  it('muestra state.error sin navegar', async () => {
    renderCallback({
      status: 'error',
      code: 'PROFILE_UNAVAILABLE',
      message: 'No pudimos cargar tu perfil. Reintenta.',
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos cargar tu perfil',
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('muestra error de cancelación sin navegar', async () => {
    locationRef.href = '/auth/callback?error=access_denied';
    renderCallback({ status: 'anonymous' });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cancelaste el acceso con Google',
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('muestra error si no se obtiene sesión', async () => {
    renderCallback({ status: 'anonymous' });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos completar el acceso',
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('muestra el estado de carga mientras inicializa', () => {
    renderCallback({ status: 'initializing' });

    expect(screen.getByRole('status')).toHaveTextContent('Completando acceso');
  });
});
