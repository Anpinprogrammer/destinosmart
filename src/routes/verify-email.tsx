import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../features/auth/auth-provider';
import { AuthCard } from '../features/auth/components/auth-forms';
import { AuthServiceError } from '../features/auth/auth-types';

type VerificationState =
  | 'validating'
  | 'verified'
  | 'invalid'
  | 'expired'
  | 'error';

function CallbackLink({ authStatus }: { authStatus: 'authenticated' | 'anonymous' | 'initializing' | 'error' }) {
  const path = authStatus === 'authenticated' ? '/dashboard' : '/login';
  const label = authStatus === 'authenticated' ? 'Ir al dashboard' : 'Iniciar sesión';
  return (
    <a
      href={path}
      className="inline-flex rounded-xl bg-brand-ocean px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-deep"
    >
      {label}
    </a>
  );
}

export function VerifyEmailPage() {
  const { service, refreshProfile, state } = useAuth();
  const [verification, setVerification] = useState<VerificationState>('validating');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    // Limpiar el token de la URL antes de cualquier espera.
    if (window.location.search || window.location.hash) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (!token || !/^[0-9a-f]{64}$/.test(token)) {
      setVerification('invalid');
      return;
    }

    void service
      .verifyEmail({ token })
      .then(() => {
        setVerification('verified');
      })
      .catch((error: unknown) => {
        if (error instanceof AuthServiceError) {
          if (error.code === 'VERIFICATION_EXPIRED') {
            setVerification('expired');
            return;
          }
          if (error.code === 'VERIFICATION_INVALID') {
            setVerification('invalid');
            return;
          }
        }
        setVerification('error');
      });
  }, [refreshProfile, service]);

  useEffect(() => {
    if (verification !== 'verified' || state.status !== 'authenticated') {
      return;
    }
    void refreshProfile().catch(() => undefined);
  }, [refreshProfile, state.status, verification]);

  if (verification === 'validating') {
    return (
      <AuthCard title="Verificando correo…" subtitle="Estamos validando tu enlace.">
        <p role="status" className="text-sm text-text-secondary">
          Esto puede tardar unos segundos.
        </p>
      </AuthCard>
    );
  }

  if (verification === 'verified') {
    return (
      <AuthCard
        title="Correo verificado"
        subtitle="Tu dirección de correo quedó confirmada."
      >
        <div role="status">
          <CallbackLink authStatus={state.status} />
        </div>
      </AuthCard>
    );
  }

  if (verification === 'expired') {
    return (
      <AuthCard
        title="El enlace expiró"
        subtitle="Solicita un nuevo correo de verificación desde tu cuenta."
      >
        <div role="alert">
          <CallbackLink authStatus={state.status} />
        </div>
      </AuthCard>
    );
  }

  if (verification === 'invalid') {
    return (
      <AuthCard
        title="Enlace no válido"
        subtitle="El enlace no existe, ya fue utilizado o está incompleto."
      >
        <div role="alert">
          <CallbackLink authStatus={state.status} />
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="No pudimos verificar tu correo"
      subtitle="Inténtalo de nuevo más tarde."
    >
      <div role="alert">
        <CallbackLink authStatus={state.status} />
      </div>
    </AuthCard>
  );
}
