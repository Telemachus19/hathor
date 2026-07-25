import { createFileRoute } from '@tanstack/react-router';
import { useToast } from '../context/ToastContext.tsx';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const { showToast } = useToast();

  return (
    <main>
      <h1>Login</h1>

      <p>Login page coming soon.</p>

      <button
        type="button"
        onClick={() => showToast('success', 'Toast system is working!')}
      >
        Test Success Toast
      </button>

      <button
        type="button"
        onClick={() => showToast('error', 'This is an error toast')}
      >
        Test Error Toast
      </button>
    </main>
  );
}