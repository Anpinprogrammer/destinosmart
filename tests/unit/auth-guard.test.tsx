import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AuthenticatedGuard,
  getAuthGuardDecision,
} from '../../src/routes/_authenticated';
import type { AuthState } from '../../src/features/auth/auth-types';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

afterEach(() => {
  cleanup();
  navigateMock.mockClear();
});

describe('getAuthGuardDecision', () => {
  it('mantiene loading mientras inicializa', () => {
    expect(getAuthGuardDecision({ status: 'initializing' })).toBe('loading');
  });

  it('permite solo authenticated', () => {
    const state: AuthState = {
      status: 'authenticated',
      user: {
        id: '00000000-0000-4000-8000-000000000001',
        email: 'user@example.com',
        email_verified: false,
        profile: null,
      },
    };

    expect(getAuthGuardDecision(state)).toBe('allow');
  });

  it.each<AuthState>([
    { status: 'anonymous' },
    { status: 'error', code: 'NETWORK_ERROR', message: 'No hay conexión.' },
  ])('redirige para $status', (state) => {
    expect(getAuthGuardDecision(state)).toBe('redirect');
  });
});

describe('AuthenticatedGuard', () => {
  it('no renderiza contenido privado mientras inicializa', () => {
    render(
      <AuthenticatedGuard state={{ status: 'initializing' }} returnTo="/dashboard">
        <p>contenido privado</p>
      </AuthenticatedGuard>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Cargando sesión');
    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument();
  });

  it('renderiza el contenido privado con sesión autenticada', () => {
    render(
      <AuthenticatedGuard
        state={{
          status: 'authenticated',
          user: {
            id: '00000000-0000-4000-8000-000000000001',
            email: 'user@example.com',
            email_verified: false,
            profile: null,
          },
        }}
        returnTo="/dashboard"
      >
        <p>contenido privado</p>
      </AuthenticatedGuard>,
    );

    expect(screen.getByText('contenido privado')).toBeInTheDocument();
  });

  it('redirige a login sin renderizar contenido privado', async () => {
    render(
      <AuthenticatedGuard state={{ status: 'anonymous' }} returnTo="/dashboard">
        <p>contenido privado</p>
      </AuthenticatedGuard>,
    );

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith({
        to: '/login',
        search: { returnTo: '/dashboard' },
        replace: true,
      }),
    );
    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument();
  });
});
