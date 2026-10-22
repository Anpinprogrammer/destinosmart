import { useState, type FormEvent } from 'react';
import {
  AUTH_ERROR_MESSAGES,
  type AuthService,
  type AuthState,
} from '../auth-types';
import { AuthCard, FormError, FormField } from './auth-forms';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function authCardLink(path: string, label: string) {
  return (
    <a
      href={path}
      className="mt-5 inline-flex rounded-xl bg-brand-ocean px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-deep"
    >
      {label}
    </a>
  );
}

export function ForgotPasswordForm({ service }: { service: AuthService }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalized = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      setError(AUTH_ERROR_MESSAGES.INVALID_INPUT);
      return;
    }

    setSubmitting(true);
    try {
      await service.requestPasswordReset({
        email: normalized,
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch {
      // Respuesta neutra: no revelar si la cuenta existe ni el estado del proveedor.
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  }

  if (sent) {
    return (
      <AuthCard
        title="Revisa tu correo"
        subtitle="Si la cuenta existe, enviamos un enlace para restablecer tu contraseña."
      >
        <div role="status" className="space-y-3">
          <p className="text-sm leading-6 text-text-secondary">
            El enlace es de un solo uso y expira. Si no lo recibes, puedes
            solicitar otro más tarde.
          </p>
          {authCardLink('/login', 'Volver a iniciar sesión')}
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para establecer una nueva contraseña."
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField
          id="forgot-email"
          label="Email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={setEmail}
        />
        <FormError message={error} />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-brand-ocean px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>
    </AuthCard>
  );
}

function resetError(state: AuthState): string {
  if (state.status !== 'error') {
    return AUTH_ERROR_MESSAGES.UNKNOWN;
  }
  if (state.code === 'SESSION_EXPIRED' || state.code === 'AUTH_FAILED') {
    return 'El enlace no es válido o expiró. Solicita uno nuevo.';
  }
  return state.message;
}

export function ResetPasswordForm({ service }: { service: AuthService }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showRequestNewLink, setShowRequestNewLink] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setShowRequestNewLink(false);

    if (password.length === 0 || password !== confirmation) {
      setError('Las contraseñas no coinciden o están vacías.');
      return;
    }

    setSubmitting(true);
    try {
      const state = await service.updatePassword({ password });
      if (state.status === 'authenticated') {
        setSuccess(true);
        return;
      }
      setError(resetError(state));
      setShowRequestNewLink(
        state.status === 'error' &&
          (state.code === 'SESSION_EXPIRED' || state.code === 'AUTH_FAILED'),
      );
    } catch {
      setError(AUTH_ERROR_MESSAGES.UNKNOWN);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <AuthCard
        title="Contraseña actualizada"
        subtitle="Ya puedes iniciar sesión con tu nueva contraseña."
      >
        <div role="status">{authCardLink('/login', 'Iniciar sesión')}</div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Nueva contraseña"
      subtitle="Introduce y confirma tu nueva contraseña."
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField
          id="new-password"
          label="Nueva contraseña"
          type="password"
          value={password}
          autoComplete="new-password"
          onChange={setPassword}
        />
        <FormField
          id="confirm-password"
          label="Confirmar contraseña"
          type="password"
          value={confirmation}
          autoComplete="new-password"
          onChange={setConfirmation}
        />
        <FormError message={error} />
        {showRequestNewLink ? (
          <a
            href="/forgot-password"
            className="inline-flex text-sm font-semibold text-brand-ocean underline-offset-4 hover:underline"
          >
            Solicitar otro enlace
          </a>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-brand-ocean px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Actualizando…' : 'Actualizar contraseña'}
        </button>
      </form>
    </AuthCard>
  );
}
