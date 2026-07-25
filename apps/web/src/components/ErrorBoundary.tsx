import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <main
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: '#0b0c10',
            color: '#eeeeee',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1 style={{ color: '#ff5500', fontFamily: 'Cinzel Decorative, serif' }}>
            Something went wrong.
          </h1>
          <p style={{ color: '#8e98a8', maxWidth: '500px', margin: '1rem 0 2rem' }}>
            {this.state.error?.message || 'An unexpected application error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '0.65rem 1.5rem',
              backgroundColor: '#ff5500',
              color: '#0e1116',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reload Application
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
