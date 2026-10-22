import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ForgotPasswordForm,
  ResetPasswordForm,
} from '../../src/features/auth/components/password-reset-forms';
import { authErrorState, type AuthService, type AuthState } from '../../src/features/auth/auth-types';

const authenticatedState: AuthState = {
  status: 'authenticated',
  user: {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'user@example.com',
    email_verified: true,
    profile: null,
  },
};

function createFakeService(overrides: Partial<AuthService> = {}): AuthService {
  return {
    getSession: vi.fn(async () => ({ status: 'anonymous' as const })),
    onAuthStateChange: vi.fn(() => () => undefined),
    signUpWithPassword: vi.fn(async () => authenticatedState),
    signInWithPassword: vi.fn(async () => authenticatedState),
    signInWithGoogle: vi.fn(async () => undefined),
    signOut: vi.fn(async () => undefined),
    requestPasswordReset: vi.fn(async () => ({ accepted: true as const })),
    updatePassword: vi.fn(async () => authenticatedState),
    verifyEmail: vi.fn(async () => ({ verified: true as const })),
    refreshProfile: vi.fn(async () => {
      throw new Error('not used');
    }),
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
});

describe('ForgotPasswordForm', () => {
  it('envía el email normalizado y muestra respuesta neutra', async () => {
    const service = createFakeService();
    render(<ForgotPasswordForm service={service} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'USER@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(
      await screen.findByRole('heading', { name: 'Revisa tu correo' }),
    ).toBeVisible();
    expect(screen.getByText(/Si la cuenta existe/)).toBeInTheDocument();
    expect(service.requestPasswordReset).toHaveBeenCalledWith({
      email: 'user@example.com',
      redirectTo: `${window.location.origin}/reset-password`,
    });
  });

  it('no revela si el servicio falla', async () => {
    const service = createFakeService({
      requestPasswordReset: vi.fn(async () => {
        throw new Error('rate limited');
      }),
    });
    render(<ForgotPasswordForm service={service} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(
      await screen.findByRole('heading', { name: 'Revisa tu correo' }),
    ).toBeVisible();
    expect(screen.getByText(/Si la cuenta existe/)).toBeInTheDocument();
  });

  it('valida el email antes de llamar al servicio', async () => {
    const service = createFakeService();
    render(<ForgotPasswordForm service={service} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Revisa los datos ingresados',
    );
    expect(service.requestPasswordReset).not.toHaveBeenCalled();
  });
});

describe('ResetPasswordForm', () => {
  it('actualiza la contraseña y confirma el éxito', async () => {
    const service = createFakeService();
    render(<ResetPasswordForm service={service} />);

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'new-secret-password' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'new-secret-password' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Actualizar contraseña' }),
    );

    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contraseña actualizada' })).toBeVisible();
    expect(service.updatePassword).toHaveBeenCalledWith({
      password: 'new-secret-password',
    });
  });

  it('rechaza contraseñas distintas sin llamar al servicio', async () => {
    const service = createFakeService();
    render(<ResetPasswordForm service={service} />);

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'one-password' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'other-password' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Actualizar contraseña' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Las contraseñas no coinciden',
    );
    expect(service.updatePassword).not.toHaveBeenCalled();
  });

  it('muestra enlace inválido/expirado sin revelar detalles', async () => {
    const service = createFakeService({
      updatePassword: vi.fn(async () => authErrorState('SESSION_EXPIRED')),
    });
    render(<ResetPasswordForm service={service} />);

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'new-secret-password' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'new-secret-password' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Actualizar contraseña' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El enlace no es válido o expiró',
    );
    expect(
      screen.getByRole('link', { name: 'Solicitar otro enlace' }),
    ).toBeVisible();
  });

  it('maneja una excepción del servicio', async () => {
    const service = createFakeService({
      updatePassword: vi.fn(async () => {
        throw new TypeError('network');
      }),
    });
    render(<ResetPasswordForm service={service} />);

    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'new-secret-password' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'new-secret-password' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Actualizar contraseña' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ocurrió un error',
    );
    expect(
      screen.getByRole('button', { name: 'Actualizar contraseña' }),
    ).toBeEnabled();
  });
});
