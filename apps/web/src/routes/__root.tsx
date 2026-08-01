import { createRootRouteWithContext, Outlet, useLocation } from '@tanstack/react-router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import type { AuthContextValue } from '../context/AuthContext';

export interface RouterContext {
  auth: AuthContextValue;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  pendingComponent: LoadingScreen,
  errorComponent: ErrorScreen,
  // pendingMs: 200,
  pendingMinMs: 300,
});

function RootComponent() {
  const location = useLocation();
  const isStandalonePage = location.pathname.startsWith('/designer') || location.pathname.startsWith('/game-info-form');

  if (isStandalonePage) {
    return <Outlet />;
  }

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '80vh' }}>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

function LoadingScreen() {
  return (
    <main
      style={{
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1>Loading...</h1>
      <p>Please wait.</p>
    </main>
  );
}

function ErrorScreen({ error }: { error: Error }) {
  return (
    <main
      style={{
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1>Something went wrong.</h1>

      <p>{error.message}</p>

      <button type="button" onClick={() => window.location.reload()}>
        Try Again
      </button>
    </main>
  );
}
