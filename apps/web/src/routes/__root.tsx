import { createRootRouteWithContext, Outlet, useLocation } from '@tanstack/react-router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { HathorChatAssistant } from '../components/ChatAssistant';
import type { AuthContextValue } from '../context/AuthContext';

export interface RouterContext {
  auth: AuthContextValue;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: ErrorScreen,
});

function RootComponent() {
  const location = useLocation();

  const isStandalonePage =
    location.pathname.startsWith('/designer') ||
    location.pathname.startsWith('/game-info-form') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/creator');

  if (isStandalonePage) {
    return <Outlet />;
  }

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />

      <main style={{ minHeight: '80vh', flex: 1, width: '100%', overflowX: 'hidden' }}>
        <Outlet />
      </main>

      <HathorChatAssistant />

      <Footer />
    </div>
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
