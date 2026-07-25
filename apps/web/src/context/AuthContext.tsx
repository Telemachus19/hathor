import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

type AuthStatus =
    | 'idle'
    | 'loading'
    | 'authenticated'
    | 'unauthenticated';

export type AuthUser = {
    id: string;
    username: string;
    email: string;
    role: string;
};

type AuthContextValue = {
    accessToken: string | null;
    user: AuthUser | null;
    status: AuthStatus;
    isAuthenticated: boolean;

    login: (identifier: string, password: string) => Promise<void>;
    register: (
        username: string,
        email: string,
        password: string,
    ) => Promise<void>;
    refresh: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(
    undefined,
);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthContextProvider({
    children,
}: AuthProviderProps) {
    const [accessToken, setAccessToken] = useState<string | null>(
        null,
    );

    const [user, setUser] = useState<AuthUser | null>(null);

    const [status, setStatus] =
        useState<AuthStatus>('unauthenticated');

    const isAuthenticated =
        accessToken !== null && user !== null;

    const login = useCallback(
        async (identifier: string, password: string) => {
            // Temporary implementation.
            // Will be replaced by AuthService in the next steps.
            console.log('Login:', identifier, password);

            setStatus('loading');

            await Promise.resolve();

            setAccessToken('mock-access-token');

            setUser({
                id: 'mock-user-id',
                username: identifier,
                email: identifier,
                role: 'gamer',
            });

            setStatus('authenticated');
        },
        [],
    );

    const register = useCallback(
        async (
            username: string,
            email: string,
            password: string,
        ) => {
            // Temporary implementation.
            // Will be replaced by AuthService in the next steps.
            console.log('Register:', username, email, password);

            setStatus('loading');

            await Promise.resolve();

            setStatus('unauthenticated');
        },
        [],
    );

    const refresh = useCallback(async () => {
        // Temporary implementation.
        // Real refresh will use the HttpOnly refresh cookie.
        setStatus('loading');

        await Promise.resolve();

        setStatus('unauthenticated');
    }, []);

    const logout = useCallback(async () => {
        // Temporary implementation.
        // Real logout will call the backend.
        setAccessToken(null);
        setUser(null);
        setStatus('unauthenticated');
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            accessToken,
            user,
            status,
            isAuthenticated,
            login,
            register,
            refresh,
            logout,
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
        ],
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthContextProvider',
        );
    }

    return context;
}