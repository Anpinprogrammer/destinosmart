import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../src/features/auth/auth-provider';
import type { AuthService, AuthState } from '../../src/features/auth/auth-types';
import type { Profile } from '../../src/features/profile/types';
import { LoginPage } from '../../src/routes/login';
import { RegisterPage } from '../../src/routes/register';

const { navigateMock, locationRef } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  locationRef: { href: '/login' },
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useLocation: () => ({ href: locationRef.href }),
    useNavigate: () => navigateMock,
  };
});

const profileFixture: Profile = {
  id: '00000000-0000-4000-8000-000000000010',
  email: 'user@example.com',
  email_verified: true,
  full_name: 'Ada Lovelace',
  avatar_url: null,
  plan_id: 'free',
  role: 'user',
  free_trip_credits: 1,
  created_at: '2026-10-24T00:00:00.000Z',
  updated_at: '2026-10-24T00:00:00.000Z',
};

const authenticatedState: AuthState = {
  status: 'authenticated',
  user: {
    id: profileFixture.id,
    email: profileFixture.email,
    email_verified: true,
    profile: profileFixture,
  },
};

function createService(state: AuthState): AuthService {
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
    refreshProfile: vi.fn(async () => profileFixture),
  };
}

function renderRoute(page: 'login' | 'register', state: AuthState) {
  const Service = createService(state);
  return render(
    <AuthProvider service={Service}>
      {page === 'login' ? <LoginPage /> : <RegisterPage />}
    </AuthProvider>,
  );
}

afterEach(() => {
  cleanup();
  navigateMock.mockClear();
  locationRef.href = '/login';
});

describe('AUTH-ROUTE-001 — destino al entrar con sesión activa', () => {
  it('redirige /login autenticado al dashboard con replace', async () => {
    locationRef.href = '/login';
    renderRoute('login', authenticatedState);

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/dashboard',
        search: undefined,
        hash: undefined,
        replace: true,
      }),
    );
  });

  it('respeta un returnTo interno saneado', async () => {
    locationRef.href = '/login?returnTo=%2Fdashboard';
    renderRoute('login', authenticatedState);

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/dashboard',
        search: undefined,
        hash: undefined,
        replace: true,
      }),
    );
  });

  it('no deja un bucle cuando el returnTo apunta al propio login', async () => {
    locationRef.href = '/login?returnTo=%2Flogin';
    renderRoute('login', authenticatedState);

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/dashboard',
        search: undefined,
        hash: undefined,
        replace: true,
      }),
    );
    expect(navigateMock).toHaveBeenCalledTimes(1);
  });

  it('redirige /register autenticado al dashboard', async () => {
    locationRef.href = '/register';
    renderRoute('register', authenticatedState);

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/dashboard',
        search: undefined,
        hash: undefined,
        replace: true,
      }),
    );
  });

  it('no navega cuando la sesión es anónima', async () => {
    locationRef.href = '/login';
    renderRoute('login', { status: 'anonymous' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('muestra el loader de entrada en lugar del formulario', async () => {
    locationRef.href = '/login';
    renderRoute('login', authenticatedState);

    expect(await screen.findByRole('status')).toHaveTextContent('Entrando');
    expect(document.querySelector('input[name="email"]')).toBeNull();
  });

  it('muestra el loader de entrada en registro con sesión activa', async () => {
    locationRef.href = '/register';
    renderRoute('register', authenticatedState);

    expect(await screen.findByRole('status')).toHaveTextContent('Entrando');
    expect(document.querySelector('input[name="email"]')).toBeNull();
  });
});
