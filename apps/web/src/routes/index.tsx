import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  loader: async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  },

  pendingComponent: LoadingScreen,

  component: HomePage,
});

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

function HomePage() {
  return <div>Home Page</div>;
}