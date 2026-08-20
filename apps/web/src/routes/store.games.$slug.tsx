import { createFileRoute, Link } from '@tanstack/react-router';
import GameDetailsPage from './game-details/GameDetailsPage';
import { useGameBySlug } from '../services/api/catalog';
import { AlertTriangle } from 'lucide-react';

export const Route = createFileRoute('/store/games/$slug')({
  component: GameDetailsRouteComponent,
});

function GameDetailsRouteComponent() {
  const { slug } = Route.useParams();
  const { data: fetchedGame, isLoading, isError } = useGameBySlug(slug);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0c10',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: '3px solid rgba(253, 112, 20, 0.2)',
            borderTopColor: '#fd7014',
            borderRadius: '50%',
            animation: 'hathorSpin 0.8s linear infinite',
          }}
        />
        <style>{`
          @keyframes hathorSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#94a3b8',
            fontSize: '0.9rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Loading Game Storefront...
        </span>
      </div>
    );
  }

  if (isError || !fetchedGame) {
    return (
      <div
        style={{
          minHeight: '80vh',
          backgroundColor: 'var(--bg-main, #0a0c10)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <AlertTriangle size={48} style={{ color: '#fd7014' }} />
        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            color: '#ffffff',
            fontSize: '1.75rem',
            margin: 0,
          }}
        >
          Game Unavailable
        </h2>
        <p
          style={{
            fontFamily: "'Raleway', sans-serif",
            color: '#94a3b8',
            maxWidth: 480,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          The requested game page could not be found or failed to load from the catalog.
        </p>
        <Link
          to="/"
          style={{
            marginTop: '0.5rem',
            backgroundColor: '#fd7014',
            color: '#ffffff',
            padding: '10px 24px',
            borderRadius: 4,
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '0.9rem',
            letterSpacing: '0.05em',
          }}
        >
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <GameDetailsPage
      slug={slug}
      gameId={fetchedGame.id}
      gameData={fetchedGame}
      themeConfig={fetchedGame.pageTheme}
    />
  );
}

