import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api/index';
import DesignerPage from '../designer-page/DesignerPage';
import GameInfoFormPage from '../game-info-form/GameInfoFormPage';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/creator/games/$gameId/edit')({
  component: CreatorGameEditWrapper,
});

function CreatorGameEditWrapper() {
  const { gameId } = Route.useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'design'>('info');
  const [game, setGame] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGame() {
      try {
        const { data } = await apiClient.GET('/creator/games');
        if (data) {
          const found = data.find((g: any) => g.id === gameId);
          if (found) {
            setGame(found);
            // Sync to local storage draft if needed
            localStorage.setItem('hathor_game_draft', JSON.stringify(found));
          } else {
            // Not found or not owned
            navigate({ to: '/creator/overview' });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchGame();
  }, [gameId, navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'var(--accent-orange)',
        }}
      >
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  if (!game) return null;

  // We could render GameInfoFormPage or DesignerPage based on activeTab.
  // Since both pages currently handle their own full-screen layouts, we'll conditionally render them.
  // DesignerPage needs to be updated to use the gameId parameter.

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Optional: Add a small floating tab switcher if you want to switch between Info and Design */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'var(--bg-card)',
          padding: '0.25rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          gap: '0.25rem',
        }}
      >
        <button
          onClick={() => setActiveTab('info')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'info' ? 'var(--bg-card-hover)' : 'transparent',
            color: activeTab === 'info' ? 'var(--text-white)' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'info' ? 600 : 400,
          }}
        >
          1. Game Info
        </button>
        <button
          onClick={() => setActiveTab('design')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'design' ? 'var(--bg-card-hover)' : 'transparent',
            color: activeTab === 'design' ? 'var(--text-white)' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'design' ? 600 : 400,
          }}
        >
          2. Store Designer
        </button>
      </div>

      {activeTab === 'info' ? (
        <GameInfoFormPage initialGame={game} />
      ) : (
        <DesignerPage initialGame={game} />
      )}
    </div>
  );
}
