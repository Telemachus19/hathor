import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '../utils/authGuard';

export const Route = createFileRoute('/library')({
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.href);
  },
  component: LibraryPage,
});

function LibraryPage() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Your Library</h1>
      <p>Welcome to your Library.</p>
    </main>
  );
}
