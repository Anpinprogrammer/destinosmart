import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Profile } from '../profile/types';
import {
  AuthServiceError,
  authErrorState,
  type AuthService,
  type AuthState,
} from './auth-types';

export interface AuthContextValue {
  state: AuthState;
  service: AuthService;
  applyAuthState: (state: AuthState) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  service: AuthService;
  children: ReactNode;
}

export function AuthProvider({ service, children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({ status: 'initializing' });
  const initialInvalidated = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);
  currentUserIdRef.current =
    state.status === 'authenticated' ? state.user.id : null;

  useEffect(() => {
    let active = true;
    let eventReceived = false;
    initialInvalidated.current = false;
    const applyEvent = (next: AuthState) => {
      if (active) {
        eventReceived = true;
        initialInvalidated.current = true;
        setState(next);
      }
    };
    const applyInitial = (next: AuthState) => {
      if (active && !eventReceived && !initialInvalidated.current) {
        setState(next);
      }
    };

    const unsubscribe = service.onAuthStateChange(applyEvent);

    void service
      .getSession()
      .then(applyInitial)
      .catch(() => applyInitial(authErrorState('UNKNOWN')));

    return () => {
      active = false;
      unsubscribe();
    };
  }, [service]);

  const applyAuthState = useCallback((next: AuthState) => {
    initialInvalidated.current = true;
    setState(next);
  }, []);

  const refreshProfile = useCallback(async () => {
    const requestedUserId = currentUserIdRef.current;
    try {
      const profile = await service.refreshProfile();
      setState((previous) => {
        if (
          previous.status !== 'authenticated' ||
          previous.user.id !== profile.id
        ) {
          return previous;
        }
        return {
          ...previous,
          user: {
            ...previous.user,
            profile,
            email_verified: profile.email_verified,
          },
        };
      });
    } catch (error) {
      const code = error instanceof AuthServiceError ? error.code : 'UNKNOWN';
      setState((previous) => {
        if (
          previous.status !== 'authenticated' ||
          previous.user.id !== requestedUserId
        ) {
          return previous;
        }
        return authErrorState(code);
      });
      throw error;
    }
  }, [service]);

  const signOut = useCallback(async () => {
    initialInvalidated.current = true;
    setState({ status: 'anonymous' });
    await service.signOut();
  }, [service]);

  const value = useMemo<AuthContextValue>(
    () => ({ state, service, applyAuthState, refreshProfile, signOut }),
    [state, service, applyAuthState, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthenticatedProfile(): Profile | null {
  const { state } = useAuth();
  return state.status === 'authenticated' ? state.user.profile : null;
}
