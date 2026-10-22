import { useAuth } from '../features/auth/auth-provider';
import { ForgotPasswordForm } from '../features/auth/components/password-reset-forms';

export function ForgotPasswordPage() {
  const { service } = useAuth();
  return <ForgotPasswordForm service={service} />;
}
