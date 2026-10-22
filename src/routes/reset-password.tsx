import { useAuth } from '../features/auth/auth-provider';
import { AuthCard } from '../features/auth/components/auth-forms';
import { ResetPasswordForm } from '../features/auth/components/password-reset-forms';

export function ResetPasswordPage() {
  const { service, state } = useAuth();

  if (state.status === 'initializing') {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
        <p role="status" className="text-sm font-semibold text-text-secondary">
          Validando enlace…
        </p>
      </main>
    );
  }

  if (state.status !== 'authenticated') {
    return (
      <AuthCard
        title="Enlace no válido"
        subtitle="El enlace expiró o ya fue utilizado. Solicita uno nuevo."
      >
        <a
          href="/forgot-password"
          className="inline-flex rounded-xl bg-brand-ocean px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-deep"
        >
          Solicitar otro enlace
        </a>
      </AuthCard>
    );
  }

  return <ResetPasswordForm service={service} />;
}
