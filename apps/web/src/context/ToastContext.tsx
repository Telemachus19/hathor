import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type Toast = {
    id: number;
    type: ToastType;
    message: string;
};

type ToastContextValue = {
    showToast: (type: ToastType, message: string) => void;
    removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

type ToastProviderProps = {
    children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts((currentToasts) =>
            currentToasts.filter((toast) => toast.id !== id),
        );
    }, []);

    const showToast = useCallback(
        (type: ToastType, message: string) => {
            const id = Date.now();

            setToasts((currentToasts) => [
                ...currentToasts,
                {
                    id,
                    type,
                    message,
                },
            ]);

            setTimeout(() => {
                removeToast(id);
            }, 4000);
        },
        [removeToast],
    );

    const value = useMemo(
        () => ({
            showToast,
            removeToast,
        }),
        [showToast, removeToast],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div
                style={{
                    position: 'fixed',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                }}
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        style={{
                            minWidth: '280px',
                            padding: '1rem',
                            borderRadius: '8px',
                            backgroundColor: '#393E46',
                            border: '1px solid #FD7014',
                            color: '#EEEEEE',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        <strong
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                textTransform: 'capitalize',
                            }}
                        >
                            {toast.type}
                        </strong>

                        <span>{toast.message}</span>

                        <button
                            type="button"
                            onClick={() => removeToast(toast.id)}
                            style={{
                                marginTop: '0.75rem',
                                cursor: 'pointer',
                            }}
                        >
                            Close
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used inside ToastProvider');
    }

    return context;
}