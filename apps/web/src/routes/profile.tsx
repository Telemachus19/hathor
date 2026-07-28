import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '../utils/authGuard';

export const Route = createFileRoute('/profile')({
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.href);
  },
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Profile</h1>
      <p>Your profile information will appear here.</p>
    </main>
  );
}
