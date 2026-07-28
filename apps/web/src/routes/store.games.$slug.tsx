import { createFileRoute } from '@tanstack/react-router';
import GameDetailsPage from './game-details/GameDetailsPage';
import { useGameBySlug } from '../api/catalog';

export const Route = createFileRoute('/store/games/$slug')({
  component: GameDetailsRouteComponent,
});

function GameDetailsRouteComponent() {
  const { slug } = Route.useParams();
  const { data: fetchedGame } = useGameBySlug(slug);

  return <GameDetailsPage slug={slug} themeConfig={fetchedGame?.pageTheme} />;
}
