import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

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

const TOAST_THEMES: Record<ToastType, { color: string; bg: string; border: string; label: string; icon: typeof CheckCircle2 }> = {
  success: {
    color: '#4caf80',
    bg: 'rgba(76, 175, 128, 0.12)',
    border: 'rgba(76, 175, 128, 0.35)',
    label: 'SUCCESS',
    icon: CheckCircle2,
  },
  error: {
    color: '#e74c3c',
    bg: 'rgba(231, 76, 60, 0.12)',
    border: 'rgba(231, 76, 60, 0.35)',
    label: 'ERROR',
    icon: AlertCircle,
  },
  warning: {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
    label: 'WARNING',
    icon: AlertTriangle,
  },
  info: {
    color: '#fd7014',
    bg: 'rgba(253, 112, 20, 0.12)',
    border: 'rgba(253, 112, 20, 0.35)',
    label: 'NOTICE',
    icon: Info,
  },
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
      }, 5000);
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
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          pointerEvents: 'none',
          maxWidth: '420px',
          width: 'calc(100vw - 2.5rem)',
        }}
      >
        {toasts.map((toast) => {
          const theme = TOAST_THEMES[toast.type] || TOAST_THEMES.info;
          const Icon = theme.icon;

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                padding: '1rem 1.15rem',
                backgroundColor: 'rgba(28, 32, 40, 0.96)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${theme.border}`,
                borderLeft: `4px solid ${theme.color}`,
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.1)',
                animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Icon Container */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.bg,
                  border: `1px solid ${theme.border}`,
                  color: theme.color,
                  flexShrink: 0,
                  marginTop: '0.1rem',
                }}
              >
                <Icon size={17} />
              </div>

              {/* Message Content */}
              <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: theme.color,
                    }}
                  >
                    {theme.label}
                  </span>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.82rem',
                    color: '#eeeeee',
                    lineHeight: 1.45,
                    fontWeight: 500,
                    wordBreak: 'break-word',
                  }}
                >
                  {toast.message}
                </p>
              </div>

              {/* Top-right Close (X) button */}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8c9aaa',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#8c9aaa';
                }}
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
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
