import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <main>
      <h1>Hathor Platform</h1>
      <p>Welcome to Hathor.</p>
    </main>
  );
}
