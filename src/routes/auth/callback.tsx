import { useEffect } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../features/auth/auth-provider';
import { AUTH_ERROR_MESSAGES } from '../../features/auth/auth-types';
import { sanitizeReturnTo } from '../../features/auth/auth-service';
import { toReturnToNavigation } from '../../features/auth/return-to';

export function getOAuthCallbackError(href: string): string | null {
  try {
    const params = new URL(href, window.location.origin).searchParams;
    const error = params.get('error');
    if (!error) {
      return null;
    }
    if (error === 'access_denied') {
      return AUTH_ERROR_MESSAGES.OAUTH_CANCELLED;
    }
    return AUTH_ERROR_MESSAGES.UNKNOWN;
  } catch {
    return AUTH_ERROR_MESSAGES.UNKNOWN;
  }
}

export function getOAuthReturnTo(href: string): string {
  try {
    return sanitizeReturnTo(
      new URL(href, window.location.origin).searchParams.get('returnTo'),
    );
  } catch {
    return '/dashboard';
  }
}

function CallbackMessage({
  tone,
  title,
  message,
  returnTo,
}: {
  tone: 'loading' | 'error';
  title: string;
  message: string;
  returnTo: string;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div
        role={tone === 'error' ? 'alert' : 'status'}
        className="rounded-3xl border border-border-default bg-surface-base p-6 text-center shadow-sm sm:p-8"
      >
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-ocean">
          DestinoSmart
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-brand-deep">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{message}</p>
        {tone === 'error' ? (
          <a
            href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
            className="mt-5 inline-flex rounded-xl bg-brand-ocean px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-deep"
          >
            Volver a iniciar sesión
          </a>
        ) : null}
      </div>
    </main>
  );
}

export function OAuthCallbackPage() {
  const { state } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryError = getOAuthCallbackError(location.href);
  const returnTo = getOAuthReturnTo(location.href);

  useEffect(() => {
    if (queryError || state.status !== 'authenticated') {
      return;
    }

    const target = toReturnToNavigation(returnTo);
    void navigate({
      to: target.to as never,
      search: target.search as never,
      hash: target.hash,
    });
  }, [navigate, queryError, returnTo, state.status]);

  if (queryError) {
    return (
      <CallbackMessage
        tone="error"
        title="No pudimos completar el acceso"
        message={queryError}
        returnTo={returnTo}
      />
    );
  }

  if (state.status === 'initializing' || state.status === 'authenticated') {
    return (
      <CallbackMessage
        tone="loading"
        title="Completando acceso…"
        message="Estamos validando tu sesión de Google."
        returnTo={returnTo}
      />
    );
  }

  if (state.status === 'error') {
    return (
      <CallbackMessage
        tone="error"
        title="No pudimos completar el acceso"
        message={state.message}
        returnTo={returnTo}
      />
    );
  }

  return (
    <CallbackMessage
      tone="error"
      title="No pudimos completar el acceso"
      message={AUTH_ERROR_MESSAGES.UNKNOWN}
      returnTo={returnTo}
    />
  );
}
