import { useNavigate } from '@tanstack/react-router';
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

  return <UserDashboard user={user} actions={{ onLogout: handleLogout }} />;
}
