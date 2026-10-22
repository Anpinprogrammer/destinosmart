import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useAuth } from '../features/auth/auth-provider';
import { sanitizeReturnTo } from '../features/auth/auth-service';
import type { AuthState } from '../features/auth/auth-types';

export type AuthGuardDecision = 'loading' | 'allow' | 'redirect';

export function getAuthGuardDecision(state: AuthState): AuthGuardDecision {
  if (state.status === 'initializing') {
    return 'loading';
  }
  if (state.status === 'authenticated') {
    return 'allow';
  }
  return 'redirect';
}

export interface AuthenticatedGuardProps {
  state: AuthState;
  returnTo: string;
  children?: ReactNode;
}

/**
 * Guard de UX. No sustituye RLS ni la autorización server-side.
 */
export function AuthenticatedGuard({
  state,
  returnTo,
  children,
}: AuthenticatedGuardProps) {
  const decision = getAuthGuardDecision(state);

  if (decision === 'loading') {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
        <p role="status" className="text-sm font-semibold text-text-secondary">
          Cargando sesión…
        </p>
      </main>
    );
  }

  if (decision === 'allow') {
    return <>{children}</>;
  }

  return <RedirectToLogin returnTo={returnTo} />;
}

function RedirectToLogin({ returnTo }: { returnTo: string }) {
  const navigate = useNavigate();
  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) {
      return;
    }
    redirected.current = true;
    void Promise.resolve(
      navigate({
        to: '/login',
        search: { returnTo },
        replace: true,
      }),
    ).catch(() => undefined);
  }, [navigate, returnTo]);

  return null;
}

export function AuthenticatedLayout() {
  const { state } = useAuth();
  const location = useLocation();

  return (
    <AuthenticatedGuard state={state} returnTo={sanitizeReturnTo(location.href)}>
      <Outlet />
    </AuthenticatedGuard>
  );
}
