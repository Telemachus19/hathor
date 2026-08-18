import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthContextProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { authService } from './services/auth/index';
import { routeTree } from './routeTree.gen.js';
import { LogoSolidSmallIcon } from './routes/landing-page/assets';

import './index.css';

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

function AppWithRouter() {
  const auth = useAuth();
  const isFirstLoad = auth.status === 'idle' || (auth.status === 'loading' && !auth.user && !auth.accessToken);

  if (isFirstLoad) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#151921',
          gap: '1rem',
          color: '#fd7014',
          animation: 'hathorLoaderFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        <div style={{ animation: 'pulseLogo 1.4s ease-in-out infinite alternate' }}>
          <LogoSolidSmallIcon width={72} height={54} />
        </div>
        <span
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#fd7014',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Loading Hathor...
        </span>
        <style>{`
          @keyframes hathorLoaderFadeIn {
            from {
              opacity: 0;
              transform: scale(0.96);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes pulseLogo {
            0% {
              transform: scale(0.92);
              opacity: 0.55;
            }
            100% {
              transform: scale(1.08);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  return <RouterProvider router={router} context={{ auth }} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthContextProvider authService={authService}>
            <AppWithRouter />
          </AuthContextProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
