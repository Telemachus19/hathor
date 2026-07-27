import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AuthService } from '../services/auth/AuthService';

type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  roles: ('gamer' | 'creator' | 'admin')[];
};

export type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;

  login: (
    identifier: string,
    password: string,
  ) => Promise<void>;

  register: (
    displayName: string,
    email: string,
    password: string,
  ) => Promise<void>;

  refresh: () => Promise<void>;

  logout: () => Promise<void>;

  requestPasswordReset: (email: string) => Promise<void>;

  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;

  getGoogleOAuthUrl: () => string;
};

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

type AuthProviderProps = {
  children: ReactNode;
  authService: AuthService;
};

export function AuthContextProvider({
  children,
  authService,
}: AuthProviderProps) {
  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [status, setStatus] =
    useState<AuthStatus>('idle');

  const isAuthenticated =
    accessToken !== null && user !== null;

  // Boot refresh check
  useEffect(() => {
    let isMounted = true;
    setStatus('loading');

    authService
      .refresh()
      .then((result) => {
        if (isMounted) {
          setAccessToken(result.accessToken);
          setUser(result.user);
          setStatus('authenticated');
        }
      })
      .catch(() => {
        if (isMounted) {
          setAccessToken(null);
          setUser(null);
          setStatus('unauthenticated');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authService]);

  const login = useCallback(
    async (
      identifier: string,
      password: string,
    ) => {
      setStatus('loading');

      try {
        const result =
          await authService.login(
            identifier,
            password,
          );

        setAccessToken(
          result.accessToken,
        );

        setUser(result.user);

        setStatus('authenticated');
      } catch (error) {
        setAccessToken(null);
        setUser(null);
        setStatus('unauthenticated');

        throw error;
      }
    },
    [authService],
  );

  const register = useCallback(
    async (
      displayName: string,
      email: string,
      password: string,
    ) => {
      setStatus('loading');

      try {
        await authService.register({
          displayName,
          email,
          password,
        });

        setStatus('unauthenticated');
      } catch (error) {
        setStatus('unauthenticated');

        throw error;
      }
    },
    [authService],
  );

  const refresh = useCallback(
    async () => {
      setStatus('loading');

      try {
        const result =
          await authService.refresh();

        setAccessToken(
          result.accessToken,
        );

        setUser(result.user);

        setStatus('authenticated');
      } catch (error) {
        setAccessToken(null);
        setUser(null);
        setStatus('unauthenticated');

        throw error;
      }
    },
    [authService],
  );

  const logout = useCallback(
    async () => {
      try {
        await authService.logout();
      } finally {
        setAccessToken(null);
        setUser(null);
        setStatus('unauthenticated');
      }
    },
    [authService],
  );

  const requestPasswordReset = useCallback(
    async (email: string) => {
      await authService.requestPasswordReset(email);
    },
    [authService],
  );

  const confirmPasswordReset = useCallback(
    async (token: string, newPassword: string) => {
      await authService.confirmPasswordReset(token, newPassword);
    },
    [authService],
  );

  const getGoogleOAuthUrl = useCallback(
    () => authService.getGoogleOAuthUrl(),
    [authService],
  );

  const value =
    useMemo<AuthContextValue>(
      () => ({
        accessToken,
        user,
        status,
        isAuthenticated,
        login,
        register,
        refresh,
        logout,
        requestPasswordReset,
        confirmPasswordReset,
        getGoogleOAuthUrl,
      }),
      [
        accessToken,
        user,
        status,
        isAuthenticated,
        login,
        register,
        refresh,
        logout,
        requestPasswordReset,
        confirmPasswordReset,
        getGoogleOAuthUrl,
      ],
    );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthContextProvider',
    );
  }

  return context;
}