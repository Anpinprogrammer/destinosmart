import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Eye, EyeOff, LogIn, X } from 'lucide-react';
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
  embedded?: boolean;
  onClose?: () => void;
  service: AuthService;
  returnTo: string;
  onSuccess: (path: string, state: AuthState) => void;
}

export function LoginForm({ service, returnTo, onSuccess, embedded = false, onClose }: LoginFormProps) {
  const id = useId();
  const emailInput = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  useEffect(() => { if (embedded) emailInput.current?.focus({ preventScroll: true }); }, [embedded]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || googlePending) return;
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

  const panel = (
    <section aria-labelledby={`${id}-title`} className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 text-brand-primary shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        {embedded ? <h2 id={`${id}-title`} className="text-xl font-bold">Inicia sesión</h2>
          : <h1 id={`${id}-title`} className="text-xl font-bold">Inicia sesión</h1>}
        {onClose && <button type="button" onClick={onClose} aria-label="Cerrar inicio de sesión" className="flex size-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"><X size={18} /></button>}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">Accede a tus viajes e itinerarios de DestinoSmart.</p>
      <GoogleButton service={service} onError={setError} returnTo={returnTo} prototypeStyle disabled={submitting} onPendingChange={setGooglePending} />
      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200" /><span className="text-xs text-slate-400">o con tu correo</span><span className="h-px flex-1 bg-slate-200" />
      </div>
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-semibold" htmlFor={`${id}-email`}>Correo electrónico
        <input ref={emailInput} id={`${id}-email`} name="email" type="email" autoComplete="username" placeholder="tu@email.com"
          value={email} onChange={event => setEmail(event.target.value)} disabled={submitting || googlePending}
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-brand-primary focus:border-brand-secondary" /></label>
        <div>
          <label htmlFor={`${id}-password`} className="text-sm font-semibold">Contraseña</label>
          <div className="mt-2 flex items-center rounded-xl border border-slate-300 focus-within:border-brand-secondary">
            <input id={`${id}-password`} name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" placeholder="Tu contraseña"
              value={password} onChange={event => setPassword(event.target.value)} disabled={submitting || googlePending}
              className="min-h-12 min-w-0 flex-1 rounded-xl bg-white px-3 text-base" />
            <button type="button" aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={visible} onClick={() => setVisible(value => !value)} className="mr-1 flex size-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <FormError message={error} />
        <button type="submit" disabled={submitting || googlePending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3 text-sm font-bold text-white hover:bg-[#ed8e00] disabled:cursor-not-allowed disabled:opacity-60">
          <LogIn size={18} aria-hidden="true" />{submitting ? 'Entrando…' : 'Iniciar sesión'}
        </button>
        <div className="flex flex-wrap justify-between gap-3 text-xs font-semibold text-brand-primary">
          <a href={`/forgot-password?returnTo=${encodeURIComponent(returnTo)}`} className="underline">Recuperar contraseña</a>
          <a href={`/register?returnTo=${encodeURIComponent(returnTo)}`} className="underline">Crear cuenta</a>
        </div>
      </form>
    </section>
  );
  return embedded ? panel : <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 py-4">{panel}</main>;
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
