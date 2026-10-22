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

afterEach(() => {
  cleanup();
  navigateMock.mockClear();
  locationRef.href = '/dashboard';
});

describe('AuthenticatedLayout', () => {
  it('muestra el perfil propio y el shell privado', async () => {
    renderLayout(authenticatedState);

    expect(await screen.findByText('user@example.com')).toBeVisible();
    expect(screen.getByText('Free')).toBeVisible();
    expect(screen.getByText('1 crédito')).toBeVisible();
    expect(screen.getByTestId('outlet')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
  });

  it('hace logout, llama al servicio y navega a login', async () => {
    const service = createFakeService(authenticatedState);
    renderLayout(authenticatedState, service);

    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/login',
        search: { returnTo: '/dashboard' },
        replace: true,
      }),
    );
    expect(service.signOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
  });

  it('completa el logout local aunque el proveedor falle', async () => {
    const service = {
      ...createFakeService(authenticatedState),
      signOut: vi.fn(async () => {
        throw new Error('network');
      }),
    };
    renderLayout(authenticatedState, service);

    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/login',
        search: { returnTo: '/dashboard' },
        replace: true,
      }),
    );
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
    expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
  });

  it('restaura la sesión y actualiza al cambiar de cuenta', async () => {
    let emit: ((next: AuthState) => void) | undefined;
    const service = createFakeService(authenticatedState, (callback) => {
      emit = callback;
    });
    renderLayout(authenticatedState, service);

    expect(await screen.findByText('user@example.com')).toBeVisible();
    await act(async () => {
      emit?.({ status: 'initializing' });
    });
    expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();

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

    expect(await screen.findByText('otra@example.com')).toBeVisible();
    expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('al expirar la sesión retira el shell y redirige', async () => {
    let emit: ((next: AuthState) => void) | undefined;
    const service = createFakeService(authenticatedState, (callback) => {
      emit = callback;
    });
    renderLayout(authenticatedState, service);

    expect(await screen.findByText('user@example.com')).toBeVisible();
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
    expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
  });
});

describe('DashboardPage', () => {
  it('muestra nombre, plan, crédito y verificación', async () => {
    render(
      <AuthProvider service={createFakeService(authenticatedState)}>
        <DashboardPage />
      </AuthProvider>,
    );

    expect(
      await screen.findByRole('heading', { name: 'Hola, Ada Lovelace' }),
    ).toBeVisible();
    expect(screen.getByText('Free')).toBeVisible();
    expect(screen.getByText('1 viaje')).toBeVisible();
    expect(screen.getByText('Verificado')).toBeVisible();
  });
});
