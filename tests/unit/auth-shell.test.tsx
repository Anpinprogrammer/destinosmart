import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../src/features/auth/auth-provider';
import type { AuthService, AuthState } from '../../src/features/auth/auth-types';
import type { Profile } from '../../src/features/profile/types';
import { AuthenticatedLayout } from '../../src/routes/_authenticated';
import { DashboardPage } from '../../src/routes/_authenticated/dashboard';

const { navigateMock, locationRef } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  locationRef: { href: '/dashboard' },
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Contenido privado</div>,
    useLocation: () => ({ href: locationRef.href }),
    useNavigate: () => navigateMock,
  };
});

const profileFixture: Profile = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'user@example.com',
  email_verified: true,
  full_name: 'Ada Lovelace',
  avatar_url: null,
  plan_id: 'free',
  role: 'user',
  free_trip_credits: 1,
  created_at: '2026-10-21T00:00:00.000Z',
  updated_at: '2026-10-21T00:00:00.000Z',
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

function createFakeService(
  state: AuthState,
  onStateChange?: (callback: (next: AuthState) => void) => void,
): AuthService {
  return {
    getSession: vi.fn(async () => state),
    onAuthStateChange: vi.fn((callback: (next: AuthState) => void) => {
      onStateChange?.(callback);
      return () => undefined;
    }),
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

function renderLayout(
  state: AuthState,
  service: AuthService = createFakeService(state),
) {
  return render(
    <AuthProvider service={service}>
      <AuthenticatedLayout />
    </AuthProvider>,
  );
}

function renderDashboard(service: AuthService = createFakeService(authenticatedState)) {
  return render(
    <AuthProvider service={service}>
      <DashboardPage />
    </AuthProvider>,
  );
}

afterEach(() => {
  cleanup();
  navigateMock.mockClear();
  locationRef.href = '/dashboard';
});

describe('AuthenticatedLayout', () => {
  it('muestra el contenido privado con sesión activa', async () => {
    renderLayout(authenticatedState);

    expect(await screen.findByTestId('outlet')).toBeVisible();
    expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
  });

  it('no muestra datos privados sin sesión', async () => {
    renderLayout({ status: 'anonymous' });

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/login',
        search: { returnTo: '/dashboard' },
        replace: true,
      }),
    );
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  it('restaura la sesión y reacciona al cambio de cuenta', async () => {
    let emit: ((next: AuthState) => void) | undefined;
    const service = createFakeService(authenticatedState, (callback) => {
      emit = callback;
    });
    renderLayout(authenticatedState, service);

    expect(await screen.findByTestId('outlet')).toBeVisible();
    await act(async () => {
      emit?.({ status: 'initializing' });
    });
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();

    await act(async () => {
      emit?.({
        status: 'authenticated',
        user: {
          id: '00000000-0000-4000-8000-000000000002',
          email: 'otra@example.com',
          email_verified: false,
          profile: null,
        },
      });
    });

    expect(await screen.findByTestId('outlet')).toBeVisible();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('al expirar la sesión retira el contenido y redirige', async () => {
    let emit: ((next: AuthState) => void) | undefined;
    const service = createFakeService(authenticatedState, (callback) => {
      emit = callback;
    });
    renderLayout(authenticatedState, service);

    expect(await screen.findByTestId('outlet')).toBeVisible();
    await act(async () => {
      emit?.({ status: 'anonymous' });
    });

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/login',
        search: { returnTo: '/dashboard' },
        replace: true,
      }),
    );
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });
});

describe('DashboardPage', () => {
  it('muestra el perfil real en el dashboard', async () => {
    renderDashboard();

    expect(
      await screen.findByRole('heading', { name: /Hola, Ada Lovelace/ }),
    ).toHaveTextContent(/Hola, Ada Lovelace/);
    expect(screen.getByText(/Free · 1 crédito/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
  });

  it('hace logout, llama al servicio y navega a login', async () => {
    const service = createFakeService(authenticatedState);
    renderDashboard(service);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Cerrar sesión' }),
    );

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/login',
        search: { returnTo: '/dashboard' },
        replace: true,
      }),
    );
    expect(service.signOut).toHaveBeenCalledTimes(1);
  });

  it('completa el logout local aunque el proveedor falle', async () => {
    const service = {
      ...createFakeService(authenticatedState),
      signOut: vi.fn(async () => {
        throw new Error('network');
      }),
    };
    renderDashboard(service);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Cerrar sesión' }),
    );

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/login',
        search: { returnTo: '/dashboard' },
        replace: true,
      }),
    );
  });
});
