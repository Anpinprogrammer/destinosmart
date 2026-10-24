import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  LoginForm,
  RegisterForm,
} from '../../src/features/auth/components/auth-forms';
import { GoogleButton } from '../../src/features/auth/components/GoogleButton';
import {
  AuthServiceError,
  authErrorState,
  type AuthService,
  type AuthState,
} from '../../src/features/auth/auth-types';

afterEach(() => {
  cleanup();
});

const USER_ID = '00000000-0000-4000-8000-000000000001';

const authenticatedState: AuthState = {
  status: 'authenticated',
  user: {
    id: USER_ID,
    email: 'user@example.com',
    email_verified: false,
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

describe('LoginForm', () => {
  it('valida email/password antes de llamar al servicio', async () => {
    const service = createFakeService();
    const onSuccess = vi.fn();
    render(<LoginForm service={service} returnTo="/dashboard" onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Revisa los datos ingresados',
    );
    expect(service.signInWithPassword).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('inicia sesión y navega al returnTo interno', async () => {
    const service = createFakeService();
    const onSuccess = vi.fn();
    render(<LoginForm service={service} returnTo="/dashboard" onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'USER@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'secret-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith(
        '/dashboard',
        expect.objectContaining({ status: 'authenticated' }),
      ),
    );
    expect(service.signInWithPassword).toHaveBeenCalledWith({
      email: 'USER@example.com',
      password: 'secret-password',
    });
  });

  it('muestra error estable del servicio', async () => {
    const service = createFakeService({
      signInWithPassword: vi.fn(async () => authErrorState('AUTH_FAILED')),
    });
    render(<LoginForm service={service} returnTo="/dashboard" onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos iniciar sesión',
    );
  });

  it('maneja una excepción del servicio y libera el estado de envío', async () => {
    const service = createFakeService({
      signInWithPassword: vi.fn(async () => {
        throw new TypeError('network');
      }),
    });
    render(<LoginForm service={service} returnTo="/dashboard" onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'secret-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ocurrió un error',
    );
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();
  });
});

describe('TASK-026 prototype login states', () => {
  it('shows Google before email, toggles password and locks both actions while password login is pending', async () => {
    let complete!: (state: AuthState) => void;
    const service = createFakeService({ signInWithPassword: vi.fn(() => new Promise<AuthState>(resolve => { complete = resolve; })) });
    const success = vi.fn();
    render(<LoginForm service={service} returnTo="/dashboard" onSuccess={success} />);
    const email = screen.getByLabelText('Correo electrónico');
    const google = screen.getByRole('button', { name: 'Continuar con Google' });
    expect(google.compareDocumentPosition(email) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const password = screen.getByLabelText('Contraseña');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(password).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.change(email, { target: { value: 'login.audit@example.com' } });
    fireEvent.change(password, { target: { value: 'synthetic-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(google).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Entrando…' })).toBeDisabled();
    fireEvent.submit(email.closest('form')!);
    expect(service.signInWithPassword).toHaveBeenCalledTimes(1);
    complete(authenticatedState);
    await waitFor(() => expect(success).toHaveBeenCalledWith('/dashboard', authenticatedState));
  });

  it('locks password submit while Google is pending and displays catalog errors on failure', async () => {
    let reject!: (error: unknown) => void;
    const service = createFakeService({ signInWithGoogle: vi.fn(() => new Promise<void>((_, fail) => { reject = fail; })) });
    render(<LoginForm service={service} returnTo="/dashboard" onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }));
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled();
    expect(screen.getByLabelText('Correo electrónico')).toBeDisabled();
    expect(service.signInWithGoogle).toHaveBeenCalledWith({ redirectTo: expect.stringContaining('/auth/callback?returnTo=%2Fdashboard') });
    reject(new AuthServiceError('UNKNOWN'));
    await waitFor(() => expect(screen.getByRole('alert')).toBeVisible());
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();
  });
});

describe('RegisterForm', () => {
  it('registra con full_name y navega al returnTo', async () => {
    const service = createFakeService();
    const onSuccess = vi.fn();
    render(
      <RegisterForm service={service} returnTo="/dashboard" onSuccess={onSuccess} />,
    );

    fireEvent.change(screen.getByLabelText('Nombre (opcional)'), {
      target: { value: 'Ada Lovelace' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'USER@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'secret-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith(
        '/dashboard',
        expect.objectContaining({ status: 'authenticated' }),
      ),
    );
    expect(service.signUpWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret-password',
      fullName: 'Ada Lovelace',
    });
  });
});

describe('GoogleButton', () => {
  it('inicia Google OAuth con el callback de la app', async () => {
    const service = createFakeService();
    render(<GoogleButton service={service} onError={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }));

    await waitFor(() =>
      expect(service.signInWithGoogle).toHaveBeenCalledWith({
        redirectTo: `${window.location.origin}/auth/callback`,
      }),
    );
  });

  it('incluye returnTo interno en el callback', async () => {
    const service = createFakeService();
    render(
      <GoogleButton
        service={service}
        onError={vi.fn()}
        returnTo="/dashboard?tab=trips"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }));

    await waitFor(() => expect(service.signInWithGoogle).toHaveBeenCalled());
    const call = vi.mocked(service.signInWithGoogle).mock.calls[0]?.[0];
    const url = new URL(call.redirectTo);
    expect(url.origin).toBe(window.location.origin);
    expect(url.pathname).toBe('/auth/callback');
    expect(url.searchParams.get('returnTo')).toBe('/dashboard?tab=trips');
  });

  it('muestra un mensaje estable si OAuth falla', async () => {
    const service = createFakeService({
      signInWithGoogle: vi.fn(async () => {
        throw new AuthServiceError('OAUTH_CANCELLED');
      }),
    });
    const onError = vi.fn();
    render(<GoogleButton service={service} onError={onError} />);

    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }));

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith('Cancelaste el acceso con Google.'),
    );
  });
});
