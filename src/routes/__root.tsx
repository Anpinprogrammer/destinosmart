import { Outlet } from '@tanstack/react-router';
import { AuthProvider } from '../features/auth/auth-provider';
import { SupabaseAuthService } from '../features/auth/auth-service';
import { supabase } from '../lib/supabase';

const authService = new SupabaseAuthService(supabase);

export function RootLayout() {
  return (
    <AuthProvider service={authService}>
      <div className="min-h-screen bg-surface-canvas">
        <Outlet />
      </div>
    </AuthProvider>
  );
}
