import { useLocation, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../features/auth/auth-provider';
import { LoginForm } from '../features/auth/components/auth-forms';
import { sanitizeReturnTo } from '../features/auth/auth-service';
import { toReturnToNavigation } from '../features/auth/return-to';

function getReturnTo(href: string): string {
  try {
    return sanitizeReturnTo(new URL(href, window.location.origin).searchParams.get('returnTo'));
  } catch {
    return '/dashboard';
  }
}

export function LoginPage() {
  const { service, applyAuthState } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = getReturnTo(location.href);

  return (
    <LoginForm
      service={service}
      returnTo={returnTo}
      onSuccess={(path, state) => {
        applyAuthState(state);
        const target = toReturnToNavigation(path);
        void navigate({
          to: target.to as never,
          search: target.search as never,
          hash: target.hash,
        });
      }}
    />
  );
}
