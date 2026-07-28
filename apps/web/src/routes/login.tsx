import { createFileRoute } from '@tanstack/react-router';
import { AuthCard } from '../components/AuthCard';
import { requireGuest } from '../utils/authGuard';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    requireGuest(context.auth);
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <main>
      <AuthCard mode="login" />
    </main>
  );
}
