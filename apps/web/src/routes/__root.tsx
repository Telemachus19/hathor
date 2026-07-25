import {
  createRootRoute,
  Outlet,
} from '@tanstack/react-router';
import { Header } from '../components/Header';

export const Route = createRootRoute({
  component: RootComponent,
  pendingComponent: LoadingScreen,
  errorComponent: ErrorScreen,
  pendingMs: 200,
  pendingMinMs: 300,
});

function RootComponent() {
  return (
    <>
      <Header />

      <main>
        <Outlet />
      </main>
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

      <button
        type="button"
        onClick={() => window.location.reload()}
      >
        Try Again
      </button>
    </main>
  );
}