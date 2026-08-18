import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Plus, Gamepad2, Check } from 'lucide-react';
import { CreatorGameCard } from './components/CreatorGameCard';
import { apiClient } from '../../services/api/index';
import type { Game } from '@hathor/contracts';
import commonStyles from './styles/creatorCommon.module.css';
import gamesStyles from './styles/creatorGames.module.css';

export const Route = createFileRoute('/creator/my-games')({
  component: CreatorMyGames,
});

const ACCENTS = ['#e07c2a', '#7c5ce0', '#3b9eda', '#8e44ad', '#4caf80', '#fd7014'];

function CreatorMyGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [analyticsMap, setAnalyticsMap] = useState<Record<string, any>>({});
  const [filter, setFilter] = useState<'all' | 'published' | 'pending_review' | 'draft'>('all');
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadData = async () => {
    try {
      const { data } = await apiClient.GET('/creator/games');
      if (data) {
        setGames(data);
        const aMap: Record<string, any> = {};
        await Promise.all(
          data.map(async (game) => {
            try {
              const res = await apiClient.GET('/creator/games/{gameId}/analytics', {
                params: { path: { gameId: game.id } },
              });
              if (res.data) {
                aMap[game.id] = res.data;
              }
            } catch (err) {}
          })
        );
        setAnalyticsMap(aMap);
      }
    } catch (err) {
      console.error('Failed to load games:', err);
    }
  };

  const handleStatusChange = async (gameId: string, status: 'pending_review' | 'draft') => {
    try {
      await apiClient.PATCH('/creator/games/{gameId}/status', {
        params: { path: { gameId } },
        body: { status: status as any },
      });
      if (status === 'pending_review') {
        showToast('Game submitted for review. Review takes 3-5 business days.');
      } else {
        showToast('Game status updated.');
      }
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to update game status');
    }
  };

  const handleNewGame = () => {
    localStorage.removeItem('hathor_game_info_draft_current');
    navigate({ to: '/game-info-form' });
  };

  const handleAnalytics = (_gameId: string) => {
    navigate({ to: '/creator/analytics' });
  };

  const handleEdit = (gameId: string) => {
    navigate({ to: '/game-info-form', search: { gameId } });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredGames = games.filter((g) => {
    if (filter === 'all') return true;
    return g.status === filter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast */}
      {toast && (
        <div className={commonStyles.toastContainer}>
          <Check size={13} style={{ color: '#4caf80' }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Filter and Actions Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div className={commonStyles.filterTabs}>
          {(
            [
              { id: 'all', label: `ALL (${games.length})` },
              {
                id: 'published',
                label: `PUBLISHED (${games.filter((g) => g.status === 'published').length})`,
              },
              {
                id: 'pending_review',
                label: `IN REVIEW (${games.filter((g) => g.status === 'pending_review').length})`,
              },
              {
                id: 'draft',
                label: `DRAFT (${games.filter((g) => g.status === 'draft').length})`,
              },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${commonStyles.filterTabBtn} ${
                filter === t.id ? commonStyles.filterTabBtnActive : ''
              }`}
              onClick={() => setFilter(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleNewGame}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#fd7014',
            color: '#222831',
            border: 'none',
            fontSize: '0.65rem',
            fontWeight: 900,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontFamily: "'Cinzel', serif",
            cursor: 'pointer',
            transition: 'opacity 0.15s ease',
          }}
        >
          <Plus size={13} />
          <span>New Game</span>
        </button>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className={gamesStyles.emptyState}>
          <Gamepad2 size={28} style={{ color: '#fd7014', opacity: 0.3 }} />
          <p className={gamesStyles.emptyTitle}>No games match this category</p>
        </div>
      ) : (
        <div className={gamesStyles.gamesGrid}>
          {filteredGames.map((game, i) => (
            <CreatorGameCard
              key={game.id}
              game={game}
              analytics={analyticsMap[game.id]}
              accent={ACCENTS[i % ACCENTS.length]}
              onAnalytics={handleAnalytics}
              onEdit={handleEdit}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
