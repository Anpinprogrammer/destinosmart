import { useEffect, useRef, useState } from 'react';
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

function planLabel(plan: string | undefined): string {
  if (plan === 'occasional') return 'Viajero Ocasional';
  if (plan === 'frequent') return 'Viajero Frecuente';
  return 'Free';
}

function AuthenticatedHeader() {
  const { state, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const profile = state.status === 'authenticated' ? state.user.profile : null;
  const email = profile?.email ?? (state.status === 'authenticated' ? state.user.email : null);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      // El estado local ya quedó limpio; no se expone el detalle del proveedor.
    }
    void Promise.resolve(
      navigate({
        to: '/login',
        search: { returnTo: '/dashboard' },
        replace: true,
      }),
    ).catch(() => undefined);
  }

  return (
    <header className="border-b border-border-default bg-surface-base">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <a
            href="/dashboard"
            className="text-sm font-extrabold uppercase tracking-[0.18em] text-brand-ocean"
          >
            DestinoSmart
          </a>
          <p className="mt-1 text-xs text-text-secondary">
            {email ?? 'Sesión activa'}
          </p>
        </div>
        <nav aria-label="Cuenta" className="flex items-center gap-3">
          <span className="rounded-full border border-border-default px-3 py-1.5 text-xs font-semibold text-text-primary">
            {planLabel(profile?.plan_id)}
          </span>
          <span className="rounded-full border border-border-default px-3 py-1.5 text-xs font-semibold text-text-primary">
            {profile?.free_trip_credits ?? 0} crédito
            {profile?.free_trip_credits === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={signingOut}
            className="rounded-xl border border-border-default px-3 py-1.5 text-xs font-semibold text-text-primary transition hover:bg-surface-canvas disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? 'Saliendo…' : 'Cerrar sesión'}
          </button>
        </nav>
      </div>
    </header>
  );
}

export function AuthenticatedLayout() {
  const { state } = useAuth();
  const location = useLocation();

  return (
    <AuthenticatedGuard state={state} returnTo={sanitizeReturnTo(location.href)}>
      <div className="min-h-screen bg-surface-canvas">
        <AuthenticatedHeader />
        <main className="mx-auto max-w-5xl px-6 py-10">
          <Outlet />
        </main>
      </div>
    </AuthenticatedGuard>
  );
}
