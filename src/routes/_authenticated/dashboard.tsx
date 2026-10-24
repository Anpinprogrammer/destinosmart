import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader, LoaderProvider } from '../../components/Loader';
import { useAuth } from '../../features/auth/auth-provider';
import UserDashboard from '../../features/dashboard/components/UserDashboard';
import type {
  DashboardUser,
  SubscriptionPlan,
} from '../../features/dashboard/components/UserDashboard';

function planForDashboard(plan: string | undefined): SubscriptionPlan {
  if (plan === 'occasional' || plan === 'frequent') return plan;
  return 'free';
}

export function DashboardPage() {
  const { state, signOut } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  if (state.status !== 'authenticated') {
    return null;
  }

  const profile = state.user.profile;
  const email = profile?.email ?? state.user.email ?? '';
  const user: DashboardUser = {
    name: profile?.full_name?.trim() || email.split('@')[0] || 'Viajero',
    email,
    avatarUrl: profile?.avatar_url ?? undefined,
    plan: planForDashboard(profile?.plan_id),
    currency: 'USD',
    locale: 'es-CO',
    freeTripCredits: profile?.free_trip_credits,
    emailVerified: profile?.email_verified,
  };

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    // AUTH-ROUTE-001: salir primero de la zona privada evita que el guard
    // redirija a /login mientras el estado pasa a anónimo.
    try {
      await navigate({ to: '/', replace: true });
    } catch {
      // Si la navegación falla, se cierra sesión igualmente.
    }
    try {
      await signOut();
    } catch {
      // El estado local ya quedó limpio; no se expone el detalle del proveedor.
    }
    setLoggingOut(false);
  }

  return (
    // UI-LOADER-001: transición breve entre pestañas, sin splash ni precarga
    // de imágenes de portada.
    <LoaderProvider preload={false} minimumDuration={0} transitionDuration={350}>
      <UserDashboard user={user} actions={{ onLogout: handleLogout }} />
      {loggingOut && <Loader label="Cerrando sesión…" />}
    </LoaderProvider>
  );
}
