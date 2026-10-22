import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '../profile/types';
import { ProfileRepositoryError, SupabaseProfileRepository } from '../profile/profile-repository';
import type { ProfileRepository } from '../profile/types';
import {
  AuthServiceError,
  authErrorState,
  type AuthErrorCode,
  type AuthService,
  type AuthServiceOptions,
  type AuthState,
  type SignInInput,
  type SignUpInput,
} from './auth-types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FULL_NAME_LENGTH = 120;
const DEFAULT_RETURN_TO = '/dashboard';

type AuthUserLike = {
  id: string;
  email?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeEmail(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  return EMAIL_PATTERN.test(normalized) ? normalized : null;
}

function mapAuthError(error: unknown): AuthErrorCode {
  if (error instanceof AuthServiceError) {
    return error.code;
  }

  if (!isRecord(error)) {
    return 'UNKNOWN';
  }

  const code = typeof error.code === 'string' ? error.code.toLowerCase() : '';
  const name = typeof error.name === 'string' ? error.name : '';
  const status = typeof error.status === 'number' ? error.status : undefined;

  if (name === 'AuthRetryableFetchError' || name === 'TypeError') {
    return 'NETWORK_ERROR';
  }
  if (status === 429 || code.includes('rate_limit') || code.includes('over_email_send')) {
    return 'RATE_LIMITED';
  }
  if (code.includes('email_exists') || code.includes('user_already_exists')) {
    return 'EMAIL_ALREADY_EXISTS';
  }
  if (code.includes('access_denied') || code.includes('provider_access_denied')) {
    return 'OAUTH_CANCELLED';
  }
  if (
    code.includes('session_not_found') ||
    code.includes('session_expired') ||
    code.includes('refresh_token_not_found')
  ) {
    return 'SESSION_EXPIRED';
  }
  if (
    code.includes('invalid_credentials') ||
    code.includes('invalid_grant') ||
    code.includes('user_not_found')
  ) {
    return 'AUTH_FAILED';
  }
  if (
    code.includes('weak_password') ||
    code.includes('same_password') ||
    code.includes('validation') ||
    code.includes('invalid_email')
  ) {
    return 'INVALID_INPUT';
  }

  return 'UNKNOWN';
}

function mapProfileError(error: unknown): AuthErrorCode {
  if (error instanceof ProfileRepositoryError) {
    if (error.code === 'UNAUTHENTICATED') {
      return 'SESSION_EXPIRED';
    }
    if (error.code === 'PROFILE_UNAVAILABLE' || error.code === 'INVALID_PROFILE') {
      return 'PROFILE_UNAVAILABLE';
    }
  }
  return 'UNKNOWN';
}

function rethrowAuthError(error: unknown): never {
  if (error instanceof AuthServiceError) {
    throw error;
  }
  throw new AuthServiceError(mapAuthError(error));
}

function functionStatus(error: unknown): number | undefined {
  if (isRecord(error) && isRecord(error.context)) {
    const status = error.context.status;
    if (typeof status === 'number') {
      return status;
    }
  }
  return undefined;
}

function assertSafeRedirectUrl(
  value: string,
  allowedOrigins: readonly string[],
  expectedPath: string,
): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AuthServiceError('INVALID_INPUT');
  }

  if (
    (url.protocol !== 'https:' && url.protocol !== 'http:') ||
    url.username.length > 0 ||
    url.password.length > 0 ||
    !allowedOrigins.includes(url.origin) ||
    url.pathname !== expectedPath
  ) {
    throw new AuthServiceError('INVALID_INPUT');
  }

  return url.toString();
}

/**
 * Solo permite rutas internas. Rechaza URLs absolutas, protocol-relative,
 * backslashes y caracteres de control; conserva query y hash.
 */
export function sanitizeReturnTo(
  value: string | null | undefined,
  fallback = DEFAULT_RETURN_TO,
): string {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return fallback;
  }

  try {
    const url = new URL(value, 'https://internal.destinosmart.invalid');
    if (
      url.protocol !== 'https:' ||
      url.origin !== 'https://internal.destinosmart.invalid' ||
      url.pathname.startsWith('//') ||
      /%2f|%5c|%00/i.test(url.pathname)
    ) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export class SupabaseAuthService implements AuthService {
  private readonly profileRepository: ProfileRepository;
  private readonly allowedRedirectOrigins: readonly string[];
  private lastKnownUserId: string | null = null;

  constructor(
    private readonly client: SupabaseClient,
    profileRepository?: ProfileRepository,
    options: AuthServiceOptions = {},
  ) {
    this.profileRepository =
      profileRepository ?? new SupabaseProfileRepository(client);
    const defaultOrigin =
      typeof window !== 'undefined' ? window.location.origin : undefined;
    const origins =
      options.allowedRedirectOrigins ??
      (defaultOrigin ? [defaultOrigin] : []);

    this.allowedRedirectOrigins = origins.map((origin) => {
      try {
        const url = new URL(origin);
        if (url.username.length > 0 || url.password.length > 0) {
          throw new Error('credentials');
        }
        return url.origin;
      } catch {
        throw new AuthServiceError('INVALID_INPUT');
      }
    });
  }

  async getSession(): Promise<AuthState> {
    try {
      const { data, error } = await this.client.auth.getSession();

      if (error) {
        return authErrorState(mapAuthError(error));
      }
      if (!data.session?.user) {
        this.lastKnownUserId = null;
        return { status: 'anonymous' };
      }

      return this.loadAuthenticatedState(data.session.user);
    } catch (error) {
      return authErrorState(mapAuthError(error));
    }
  }

  onAuthStateChange(callback: (state: AuthState) => void): () => void {
    let active = true;
    let sequence = 0;
    const { data } = this.client.auth.onAuthStateChange((event, session) => {
      if (!active) {
        return;
      }

      if (event === 'SIGNED_OUT' || !session?.user) {
        sequence += 1;
        this.lastKnownUserId = null;
        callback({ status: 'anonymous' });
        return;
      }

      const userId = session.user.id;
      if (this.lastKnownUserId !== null && this.lastKnownUserId !== userId) {
        // Evita mostrar la identidad anterior mientras se hidrata la nueva.
        callback({ status: 'initializing' });
      }
      this.lastKnownUserId = userId;

      const current = ++sequence;
      void this.loadAuthenticatedState(session.user)
        .then((state) => {
          if (active && current === sequence) {
            callback(state);
          }
        })
        .catch(() => {
          if (active && current === sequence) {
            callback(authErrorState('UNKNOWN'));
          }
        });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }

  async signUpWithPassword(input: SignUpInput): Promise<AuthState> {
    const email = normalizeEmail(input.email);
    const password = input.password;
    const fullName = input.fullName?.trim();

    if (
      !email ||
      password.length === 0 ||
      (fullName !== undefined && fullName.length > MAX_FULL_NAME_LENGTH)
    ) {
      return authErrorState('INVALID_INPUT');
    }

    const options =
      fullName === undefined || fullName.length === 0
        ? undefined
        : { data: { full_name: fullName } };

    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        ...(options ? { options } : {}),
      });

      if (error) {
        return authErrorState(mapAuthError(error));
      }
      if (!data.session?.user) {
        return authErrorState('AUTH_FAILED');
      }

      return this.loadAuthenticatedState(data.session.user);
    } catch (error) {
      return authErrorState(mapAuthError(error));
    }
  }

  async signInWithPassword(input: SignInInput): Promise<AuthState> {
    const email = normalizeEmail(input.email);

    if (!email || input.password.length === 0) {
      return authErrorState('INVALID_INPUT');
    }

    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password: input.password,
      });

      if (error) {
        return authErrorState(mapAuthError(error));
      }
      if (!data.session?.user) {
        return authErrorState('AUTH_FAILED');
      }

      return this.loadAuthenticatedState(data.session.user);
    } catch (error) {
      return authErrorState(mapAuthError(error));
    }
  }

  async signInWithGoogle(input: { redirectTo: string }): Promise<void> {
    const redirectTo = assertSafeRedirectUrl(
      input.redirectTo,
      this.allowedRedirectOrigins,
      '/auth/callback',
    );

    try {
      const { error } = await this.client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });

      if (error) {
        rethrowAuthError(error);
      }
    } catch (error) {
      rethrowAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) {
        rethrowAuthError(error);
      }
      this.lastKnownUserId = null;
    } catch (error) {
      rethrowAuthError(error);
    }
  }

  async requestPasswordReset(input: {
    email: string;
    redirectTo: string;
  }): Promise<{ accepted: true }> {
    const email = normalizeEmail(input.email);
    if (!email) {
      throw new AuthServiceError('INVALID_INPUT');
    }
    const redirectTo = assertSafeRedirectUrl(
      input.redirectTo,
      this.allowedRedirectOrigins,
      '/reset-password',
    );

    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        const code = mapAuthError(error);
        // Reset debe ser neutro: no revelar existencia de cuenta.
        if (code === 'RATE_LIMITED' || code === 'NETWORK_ERROR') {
          throw new AuthServiceError(code);
        }
        return { accepted: true };
      }
    } catch (error) {
      const code = error instanceof AuthServiceError ? error.code : mapAuthError(error);
      if (code === 'RATE_LIMITED' || code === 'NETWORK_ERROR') {
        throw new AuthServiceError(code);
      }
      return { accepted: true };
    }

    return { accepted: true };
  }

  async updatePassword(input: { password: string }): Promise<AuthState> {
    if (input.password.length === 0) {
      return authErrorState('INVALID_INPUT');
    }

    try {
      const { data, error } = await this.client.auth.updateUser({
        password: input.password,
      });

      if (error) {
        return authErrorState(mapAuthError(error));
      }
      if (!data.user) {
        return authErrorState('AUTH_FAILED');
      }

      return this.loadAuthenticatedState(data.user);
    } catch (error) {
      return authErrorState(mapAuthError(error));
    }
  }

  async verifyEmail(input: { token: string }): Promise<{ verified: true }> {
    if (!/^[0-9a-f]{64}$/.test(input.token)) {
      throw new AuthServiceError('VERIFICATION_INVALID');
    }

    try {
      const { error } = await this.client.functions.invoke('verify-email', {
        body: { token: input.token },
      });

      if (error) {
        const status = functionStatus(error);
        if (status === 410) {
          throw new AuthServiceError('VERIFICATION_EXPIRED');
        }
        if (status === 400) {
          throw new AuthServiceError('VERIFICATION_INVALID');
        }
        if (status === 429) {
          throw new AuthServiceError('RATE_LIMITED');
        }
        throw new AuthServiceError(mapAuthError(error));
      }

      return { verified: true };
    } catch (error) {
      rethrowAuthError(error);
    }
  }

  async refreshProfile(): Promise<Profile> {
    try {
      const profile = await this.profileRepository.getCurrent();
      if (!profile) {
        throw new AuthServiceError('PROFILE_UNAVAILABLE');
      }
      return profile;
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error;
      }
      throw new AuthServiceError(mapProfileError(error));
    }
  }

  private async loadAuthenticatedState(user: AuthUserLike): Promise<AuthState> {
    try {
      const profile = await this.profileRepository.getCurrent();
      if (!profile || profile.id !== user.id) {
        return authErrorState('PROFILE_UNAVAILABLE');
      }

      this.lastKnownUserId = user.id;
      return {
        status: 'authenticated',
        user: {
          id: user.id,
          email: user.email ?? null,
          email_verified: profile.email_verified,
          profile,
        },
      };
    } catch (error) {
      return authErrorState(mapProfileError(error));
    }
  }
}
