import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

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
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
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
    [removeToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      removeToast,
    }),
    [showToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              minWidth: '260px',
              maxWidth: '480px',
              padding: '0.75rem 1.25rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(24, 28, 36, 0.95)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${
                toast.type === 'error'
                  ? 'rgba(239, 68, 68, 0.6)'
                  : toast.type === 'success'
                    ? 'rgba(56, 211, 159, 0.6)'
                    : 'rgba(242, 107, 33, 0.6)'
              }`,
              color: '#ffffff',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 12px rgba(242, 107, 33, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              fontFamily: "'Raleway', sans-serif",
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor:
                    toast.type === 'error'
                      ? '#ef4444'
                      : toast.type === 'success'
                        ? '#38d39f'
                        : '#f26b21',
                  boxShadow: `0 0 8px ${
                    toast.type === 'error'
                      ? '#ef4444'
                      : toast.type === 'success'
                        ? '#38d39f'
                        : '#f26b21'
                  }`,
                }}
              />
              <span style={{ fontWeight: 500 }}>{toast.message}</span>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8b93a2',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: '0.2rem 0.4rem',
                borderRadius: '3px',
              }}
            >
              ✕
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
