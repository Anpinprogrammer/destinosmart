import { useState } from 'react';
import { AUTH_ERROR_MESSAGES, AuthServiceError, type AuthService } from '../auth-types';
import { sanitizeReturnTo } from '../auth-service';

export interface GoogleButtonProps {
  service: AuthService;
  onError: (message: string) => void;
  returnTo?: string;
  prototypeStyle?: boolean;
  disabled?: boolean;
  onPendingChange?: (pending: boolean) => void;
}

export function GoogleButton({ service, onError, returnTo, prototypeStyle = false, disabled = false, onPendingChange }: GoogleButtonProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    if (submitting || disabled) return;
    setSubmitting(true);
    onPendingChange?.(true);
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
      onPendingChange?.(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={submitting || disabled}
      className={prototypeStyle ? "mt-5 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:ring-brand-secondary disabled:cursor-not-allowed disabled:opacity-60" : "mt-3 w-full rounded-xl border border-border-default bg-surface-base px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface-canvas disabled:cursor-not-allowed disabled:opacity-60"}
    >
      {prototypeStyle && (<svg viewBox="0 0 48 48" className="size-5 shrink-0" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.87 46.98 24.55Z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.93 23.93 0 0 0 0 21.56l7.98-6.19Z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
          />
        </svg>)}
      {submitting ? 'Redirigiendo…' : 'Continuar con Google'}
    </button>
  );
}
