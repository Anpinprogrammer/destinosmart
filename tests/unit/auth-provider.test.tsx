import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../../src/features/auth/auth-provider';
import { authErrorState, type AuthService, type AuthState } from '../../src/features/auth/auth-types';
import type { Profile } from '../../src/features/profile/types';

const profileFixture: Profile = {
  id: '00000000-0000-4000-8000-000000000001',
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

function createFakeService() {
  let resolveSession!: (state: AuthState) => void;
  let eventCallback: ((state: AuthState) => void) | null = null;
  const unsubscribe = vi.fn();
  const getSession = vi.fn(
    () =>
      new Promise<AuthState>((resolve) => {
        resolveSession = resolve;
      }),
  );
  const onAuthStateChange = vi.fn((callback: (state: AuthState) => void) => {
    eventCallback = callback;
    return unsubscribe;
  });
  const signOut = vi.fn(async () => undefined);
  const refreshProfile = vi.fn(async () => profileFixture);

  const service: AuthService = {
    getSession,
    onAuthStateChange,
    signUpWithPassword: vi.fn(async () => authErrorState('UNKNOWN')),
    signInWithPassword: vi.fn(async () => authErrorState('UNKNOWN')),
    signInWithGoogle: vi.fn(async () => undefined),
    signOut,
    requestPasswordReset: vi.fn(async () => ({ accepted: true as const })),
    updatePassword: vi.fn(async () => authErrorState('UNKNOWN')),
    verifyEmail: vi.fn(async () => ({ verified: true as const })),
    refreshProfile,
  };

  return {
    service,
    getSession,
    onAuthStateChange,
    signOut,
    refreshProfile,
    unsubscribe,
    resolveSession: (state: AuthState) => resolveSession(state),
    emit: (state: AuthState) => eventCallback?.(state),
  };
}

afterEach(() => {
  cleanup();
});

function Probe() {
  const { state, applyAuthState, refreshProfile, signOut } = useAuth();

  return (
    <div>
      <span data-testid="status">{state.status}</span>
      {state.status === 'authenticated' ? (
        <>
          <span data-testid="email">{state.user.profile?.email}</span>
          <span data-testid="credits">{state.user.profile?.free_trip_credits}</span>
        </>
      ) : null}
      <button
        type="button"
        onClick={() =>
          applyAuthState({
            status: 'authenticated',
            user: {
              id: profileFixture.id,
              email: profileFixture.email,
              email_verified: false,
              profile: profileFixture,
            },
          })
        }
      >
        aplicar
      </button>
      <button
        type="button"
        onClick={() => {
          void refreshProfile().catch(() => undefined);
        }}
      >
        refrescar
      </button>
      <button type="button" onClick={() => void signOut()}>
        salir
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  it('inicia en initializing y no muestra datos privados', () => {
    const fake = createFakeService();
    render(
      <AuthProvider service={fake.service}>
        <Probe />
      </AuthProvider>,
    );

    expect(screen.getByTestId('status')).toHaveTextContent('initializing');
    expect(screen.queryByTestId('email')).not.toBeInTheDocument();
    expect(fake.onAuthStateChange).toHaveBeenCalled();
  });

  it('aplica la sesión autenticada sin flash de datos previos', async () => {
    const fake = createFakeService();
    render(
      <AuthProvider service={fake.service}>
        <Probe />
      </AuthProvider>,
    );

    act(() => {
      fake.resolveSession({
        status: 'authenticated',
        user: {
          id: profileFixture.id,
          email: profileFixture.email,
          email_verified: false,
          profile: profileFixture,
        },
      });
    });

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );
    expect(screen.getByTestId('email')).toHaveTextContent('user@example.com');
    expect(screen.getByTestId('credits')).toHaveTextContent('1');
  });

  it('applyAuthState no es sobrescrito por un getSession pendiente', async () => {
    const fake = createFakeService();
    render(
      <AuthProvider service={fake.service}>
        <Probe />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'aplicar' }));
    act(() => fake.resolveSession({ status: 'anonymous' }));

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );
    expect(screen.getByTestId('email')).toHaveTextContent('user@example.com');
  });

  it('pasa a anonymous al recibir el evento de logout', () => {
    const fake = createFakeService();
    render(
      <AuthProvider service={fake.service}>
        <Probe />
      </AuthProvider>,
    );

    act(() => fake.emit({ status: 'anonymous' }));

    expect(screen.getByTestId('status')).toHaveTextContent('anonymous');
    expect(screen.queryByTestId('email')).not.toBeInTheDocument();
  });

  it('applyAuthState actualiza el contexto tras un login', () => {
    const fake = createFakeService();
    render(
      <AuthProvider service={fake.service}>
        <Probe />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'aplicar' }));

    expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('email')).toHaveTextContent('user@example.com');
  });

  it('no revive una sesión si getSession resuelve después de SIGNED_OUT', async () => {
    const fake = createFakeService();
    render(
      <AuthProvider service={fake.service}>
        <Probe />
      </AuthProvider>,
    );

    act(() => fake.emit({ status: 'anonymous' }));
    act(() => {
      fake.resolveSession({
        status: 'authenticated',
        user: {
          id: profileFixture.id,
          email: profileFixture.email,
          email_verified: false,
          profile: profileFixture,
        },
      });
    });

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('anonymous'),
    );
    expect(screen.queryByTestId('email')).not.toBeInTheDocument();
  });

  it('expone error cuando getSession falla', async () => {
    const fake = createFakeService();
    fake.getSession.mockRejectedValueOnce(new Error('network'));
    render(
      <AuthProvider service={fake.service}>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'));
  });

  it('refresca el perfil sin perder identidad', async () => {
    const fake = createFakeService();
    render(
      <AuthProvider service={fake.service}>
        <Probe />
      </AuthProvider>,
    );

    act(() => {
      fake.resolveSession({
        status: 'authenticated',
        user: {
          id: profileFixture.id,
          email: profileFixture.email,
          email_verified: false,
          profile: profileFixture,
        },
      });
    });
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );

    fake.refreshProfile.mockResolvedValueOnce({
      ...profileFixture,
      full_name: 'Grace Hopper',
      free_trip_credits: 0,
    });
    fireEvent.click(screen.getByRole('button', { name: 'refrescar' }));

    await waitFor(() => expect(screen.getByTestId('credits')).toHaveTextContent('0'));
  });

  it('descarta un perfil refrescado de otra identidad', async () => {
    const fake = createFakeService();
    render(
      <AuthProvider service={fake.service}>
        <Probe />
      </AuthProvider>,
    );

    act(() => {
      fake.resolveSession({
        status: 'authenticated',
        user: {
          id: profileFixture.id,
          email: profileFixture.email,
          email_verified: false,
          profile: profileFixture,
        },
      });
    });
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );

    fake.refreshProfile.mockResolvedValueOnce({
      ...profileFixture,
      id: '00000000-0000-4000-8000-000000000002',
      email: 'otra@example.com',
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'refrescar' }));
      await Promise.resolve();
    });

    expect(screen.getByTestId('email')).toHaveTextContent('user@example.com');
    expect(screen.getByTestId('credits')).toHaveTextContent('1');
  });

  it('no aplica un error de refresco a una identidad posterior', async () => {
    const fake = createFakeService();
    render(
      <AuthProvider service={fake.service}>
        <Probe />
      </AuthProvider>,
    );

    act(() => {
      fake.resolveSession({
        status: 'authenticated',
        user: {
          id: profileFixture.id,
          email: profileFixture.email,
          email_verified: false,
          profile: profileFixture,
        },
      });
    });
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );

    let rejectRefresh!: (error: unknown) => void;
    fake.refreshProfile.mockImplementationOnce(
      () =>
        new Promise<Profile>((_resolve, reject) => {
          rejectRefresh = reject;
        }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'refrescar' }));

    act(() => {
      fake.emit({
        status: 'authenticated',
        user: {
          id: '00000000-0000-4000-8000-000000000002',
          email: 'otra@example.com',
          email_verified: false,
          profile: {
            ...profileFixture,
            id: '00000000-0000-4000-8000-000000000002',
            email: 'otra@example.com',
          },
        },
      });
    });
    await waitFor(() =>
      expect(screen.getByTestId('email')).toHaveTextContent('otra@example.com'),
    );

    await act(async () => {
      rejectRefresh(new Error('network'));
      await Promise.resolve();
    });

    expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('email')).toHaveTextContent('otra@example.com');
  });

  it('signOut limpia el estado y llama al servicio', async () => {
    const fake = createFakeService();
    render(
      <AuthProvider service={fake.service}>
        <Probe />
      </AuthProvider>,
    );

    act(() => {
      fake.resolveSession({
        status: 'authenticated',
        user: {
          id: profileFixture.id,
          email: profileFixture.email,
          email_verified: false,
          profile: profileFixture,
        },
      });
    });
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated'),
    );

    fireEvent.click(screen.getByRole('button', { name: 'salir' }));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anonymous'));
    expect(fake.signOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('email')).not.toBeInTheDocument();
  });

  it('desuscribe el listener al desmontar', () => {
    const fake = createFakeService();
    const view = render(
      <AuthProvider service={fake.service}>
        <Probe />
      </AuthProvider>,
    );

    view.unmount();
    expect(fake.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
