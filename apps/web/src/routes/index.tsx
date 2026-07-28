import { createFileRoute } from '@tanstack/react-router';
import LandingPage from './landing-page/LandingPage';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  return <LandingPage />;
}
