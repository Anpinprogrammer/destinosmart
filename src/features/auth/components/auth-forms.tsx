import { useState, type FormEvent, type ReactNode } from 'react';
import {
  AUTH_ERROR_MESSAGES,
  type AuthService,
  type AuthState,
} from '../auth-types';
import { GoogleButton } from './GoogleButton';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FULL_NAME_LENGTH = 120;

export interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-border-default bg-surface-base p-6 shadow-sm sm:p-8">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-ocean">
          DestinoSmart
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-deep">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

export function FormField({
  id,
  label,
  type,
  value,
  autoComplete,
  onChange,
  error,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  autoComplete: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-text-primary"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-xl border border-border-default bg-surface-canvas px-3.5 py-2.5 text-sm text-text-primary focus:border-brand-ocean focus:ring-2 focus:ring-brand-ocean/20"
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
      {message}
    </p>
  );
}

function errorMessageFor(state: AuthState): string {
  if (state.status === 'error') {
    return state.message;
  }
  return AUTH_ERROR_MESSAGES.UNKNOWN;
}

export interface LoginFormProps {
  service: AuthService;
  returnTo: string;
  onSuccess: (path: string, state: AuthState) => void;
}

export function LoginForm({ service, returnTo, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!EMAIL_PATTERN.test(email.trim().toLowerCase()) || password.length === 0) {
      setError(AUTH_ERROR_MESSAGES.INVALID_INPUT);
      return;
    }

    setSubmitting(true);
    let state: AuthState;
    try {
      state = await service.signInWithPassword({ email, password });
    } catch {
      setError(AUTH_ERROR_MESSAGES.UNKNOWN);
      return;
    } finally {
      setSubmitting(false);
    }

    if (state.status === 'authenticated') {
      onSuccess(returnTo, state);
      return;
    }
    setError(errorMessageFor(state));
  }

  return (
    <AuthCard
      title="Entrar"
      subtitle="Accede a tus viajes, presupuestos e itinerarios."
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={setEmail}
        />
        <FormField
          id="login-password"
          label="Contraseña"
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={setPassword}
        />
        <FormError message={error} />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-brand-ocean px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <GoogleButton service={service} onError={setError} returnTo={returnTo} />
    </AuthCard>
  );
}

export interface RegisterFormProps {
  service: AuthService;
  returnTo: string;
  onSuccess: (path: string, state: AuthState) => void;
}

export function RegisterForm({
  service,
  returnTo,
  onSuccess,
}: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (
      !EMAIL_PATTERN.test(normalizedEmail) ||
      password.length === 0 ||
      fullName.trim().length > MAX_FULL_NAME_LENGTH
    ) {
      setError(AUTH_ERROR_MESSAGES.INVALID_INPUT);
      return;
    }

    setSubmitting(true);
    let state: AuthState;
    try {
      state = await service.signUpWithPassword({
        email: normalizedEmail,
        password,
        ...(fullName.trim() ? { fullName: fullName.trim() } : {}),
      });
    } catch {
      setError(AUTH_ERROR_MESSAGES.UNKNOWN);
      return;
    } finally {
      setSubmitting(false);
    }

    if (state.status === 'authenticated') {
      onSuccess(returnTo, state);
      return;
    }
    setError(errorMessageFor(state));
  }

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Tu primer viaje incluye acceso Pro durante 30 días."
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField
          id="register-full-name"
          label="Nombre (opcional)"
          type="text"
          value={fullName}
          autoComplete="name"
          onChange={setFullName}
        />
        <FormField
          id="register-email"
          label="Email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={setEmail}
        />
        <FormField
          id="register-password"
          label="Contraseña"
          type="password"
          value={password}
          autoComplete="new-password"
          onChange={setPassword}
        />
        <FormError message={error} />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-brand-ocean px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
      <GoogleButton service={service} onError={setError} returnTo={returnTo} />
    </AuthCard>
  );
}
