import { useAuth } from '../../features/auth/auth-provider';

export function DashboardPage() {
  const { state } = useAuth();

  if (state.status !== 'authenticated') {
    return null;
  }

  const profile = state.user.profile;
  const name = profile?.full_name?.trim() || 'viajero';
  const plan =
    profile?.plan_id === 'occasional'
      ? 'Viajero Ocasional'
      : profile?.plan_id === 'frequent'
        ? 'Viajero Frecuente'
        : 'Free';

  return (
    <section aria-labelledby="dashboard-title">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-ocean">
        Área privada
      </p>
      <h1
        id="dashboard-title"
        className="mt-2 text-3xl font-extrabold tracking-tight text-brand-deep"
      >
        Hola, {name}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
        Tu sesión está activa. Desde aquí podrás gestionar tu cuenta y, en las
        siguientes fases, tus viajes.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-border-default bg-surface-base p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary">
            Plan
          </h2>
          <p className="mt-2 text-lg font-extrabold text-text-primary">{plan}</p>
        </article>
        <article className="rounded-2xl border border-border-default bg-surface-base p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary">
            Crédito Free
          </h2>
          <p className="mt-2 text-lg font-extrabold text-text-primary">
            {profile?.free_trip_credits ?? 0} viaje
            {profile?.free_trip_credits === 1 ? '' : 's'}
          </p>
        </article>
        <article className="rounded-2xl border border-border-default bg-surface-base p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-text-secondary">
            Email
          </h2>
          <p className="mt-2 text-sm font-semibold text-text-primary">
            {profile?.email_verified ? 'Verificado' : 'Pendiente de verificar'}
          </p>
        </article>
      </div>
    </section>
  );
}
