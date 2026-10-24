import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Loader } from '../components/Loader';
import { useAuth } from '../features/auth/auth-provider';
import { RegisterForm } from '../features/auth/components/auth-forms';
import { sanitizeReturnTo } from '../features/auth/auth-service';
import { toReturnToNavigation } from '../features/auth/return-to';
import { safeAuthenticatedTarget } from './login';

function getReturnTo(href: string): string {
  try {
    return sanitizeReturnTo(new URL(href, window.location.origin).searchParams.get('returnTo'));
  } catch {
    return '/dashboard';
  }
}

export function RegisterPage() {
  const { service, applyAuthState, state } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = getReturnTo(location.href);
  const redirected = useRef(false);

  // AUTH-ROUTE-001: una sesión válida nunca debe quedar atrapada en el registro.
  useEffect(() => {
    if (state.status !== 'authenticated') {
      redirected.current = false;
      return;
    }
    if (redirected.current) return;
    redirected.current = true;
    const target = toReturnToNavigation(safeAuthenticatedTarget(returnTo));
    void Promise.resolve(
      navigate({
        to: target.to as never,
        search: target.search as never,
        hash: target.hash,
        replace: true,
      }),
    ).catch(() => undefined);
  }, [state.status, navigate, returnTo]);

  if (state.status === 'authenticated') {
    // UI-LOADER-001: mientras se resuelve la redirección no se muestra un
    // formulario que ya no tiene efecto.
    return <Loader label="Entrando…" />;
  }

  return (
    <RegisterForm
      service={service}
      returnTo={returnTo}
      onSuccess={(path, authenticatedState) => {
        flushSync(() => applyAuthState(authenticatedState));
        const target = toReturnToNavigation(safeAuthenticatedTarget(path));
        void navigate({
          to: target.to as never,
          search: target.search as never,
          hash: target.hash,
        }).catch(() => undefined);
      }}
    />
  );
}
