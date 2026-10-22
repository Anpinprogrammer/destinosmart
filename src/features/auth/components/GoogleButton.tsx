import { useState } from 'react';
import { AUTH_ERROR_MESSAGES, AuthServiceError, type AuthService } from '../auth-types';
import { sanitizeReturnTo } from '../auth-service';

export interface GoogleButtonProps {
  service: AuthService;
  onError: (message: string) => void;
  returnTo?: string;
}

export function GoogleButton({ service, onError, returnTo }: GoogleButtonProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);
    try {
      const callback = new URL('/auth/callback', window.location.origin);
      if (returnTo) {
        callback.searchParams.set(
          'returnTo',
          sanitizeReturnTo(returnTo, '/dashboard'),
        );
      }

      await service.signInWithGoogle({ redirectTo: callback.toString() });
    } catch (error) {
      const code = error instanceof AuthServiceError ? error.code : 'UNKNOWN';
      onError(AUTH_ERROR_MESSAGES[code]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={submitting}
      className="mt-3 w-full rounded-xl border border-border-default bg-surface-base px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface-canvas disabled:cursor-not-allowed disabled:opacity-60"
    >
      {submitting ? 'Redirigiendo…' : 'Continuar con Google'}
    </button>
  );
}
