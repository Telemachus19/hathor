import { createFileRoute } from '@tanstack/react-router';
import { AuthCard } from '../components/AuthCard';
import { requireGuest } from '../utils/authGuard';

export const Route = createFileRoute('/register')({
  beforeLoad: ({ context }) => {
    requireGuest(context.auth);
  },
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <main>
      <AuthCard mode="register" />
    </main>
  );
}
