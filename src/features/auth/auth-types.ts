import type { Profile } from '../profile/types';

export type AuthStatus = 'initializing' | 'anonymous' | 'authenticated' | 'error';

export type AuthErrorCode =
  | 'INVALID_INPUT'
  | 'AUTH_FAILED'
  | 'EMAIL_ALREADY_EXISTS'
  | 'OAUTH_CANCELLED'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'SESSION_EXPIRED'
  | 'PROFILE_UNAVAILABLE'
  | 'VERIFICATION_INVALID'
  | 'VERIFICATION_EXPIRED'
  | 'UNKNOWN';

export interface AuthUser {
  id: string;
  email: string | null;
  email_verified: boolean;
  profile: Profile | null;
}

export type AuthState =
  | { status: 'initializing' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'error'; code: AuthErrorCode; message: string };

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_INPUT: 'Revisa los datos ingresados.',
  AUTH_FAILED: 'No pudimos iniciar sesión. Verifica tus datos.',
  EMAIL_ALREADY_EXISTS: 'Si la cuenta existe, enviamos instrucciones.',
  OAUTH_CANCELLED: 'Cancelaste el acceso con Google.',
  RATE_LIMITED: 'Demasiados intentos. Espera un momento.',
  NETWORK_ERROR: 'No hay conexión. Inténtalo de nuevo.',
  SESSION_EXPIRED: 'Tu sesión expiró. Inicia sesión de nuevo.',
  PROFILE_UNAVAILABLE: 'No pudimos cargar tu perfil. Reintenta.',
  VERIFICATION_INVALID: 'El enlace no es válido. Solicita otro.',
  VERIFICATION_EXPIRED: 'El enlace expiró. Solicita otro.',
  UNKNOWN: 'Ocurrió un error. Inténtalo más tarde.',
};

export function authErrorState(code: AuthErrorCode): AuthState {
  return { status: 'error', code, message: AUTH_ERROR_MESSAGES[code] };
}

export class AuthServiceError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(code);
    this.name = 'AuthServiceError';
  }
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthServiceOptions {
  /** Orígenes permitidos para redirects OAuth/reset. Por defecto, window.location.origin. */
  allowedRedirectOrigins?: string[];
}

/**
 * Núcleo de autenticación. `verifyEmail` se implementó en TASK-017;
 * `requestEmailVerification` es un contrato de Edge Function, no un método cliente.
 */
export interface AuthService {
  getSession(): Promise<AuthState>;
  onAuthStateChange(callback: (state: AuthState) => void): () => void;

  signUpWithPassword(input: SignUpInput): Promise<AuthState>;
  signInWithPassword(input: SignInInput): Promise<AuthState>;
  signInWithGoogle(input: { redirectTo: string }): Promise<void>;
  signOut(): Promise<void>;

  requestPasswordReset(input: {
    email: string;
    redirectTo: string;
  }): Promise<{ accepted: true }>;
  updatePassword(input: { password: string }): Promise<AuthState>;

  verifyEmail(input: { token: string }): Promise<{ verified: true }>;

  refreshProfile(): Promise<Profile>;
}
