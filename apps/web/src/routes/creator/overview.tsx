import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Gamepad2,
  Users,
  DollarSign,
  Star,
  Plus,
  BarChart2,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { CreatorStatsGrid, CreatorStatItem } from './components/CreatorStatsCard';
import { GameStatusBadge } from './components/CreatorBadges';
import { apiClient } from '../../services/api/index';
import type { Game } from '@hathor/contracts';
import commonStyles from './styles/creatorCommon.module.css';

export const Route = createFileRoute('/creator/overview')({
  component: CreatorOverview,
});

const ACCENTS = ['#e07c2a', '#7c5ce0', '#3b9eda', '#8e44ad', '#4caf80', '#fd7014'];

function CreatorOverview() {
  const [games, setGames] = useState<Game[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const navigate = useNavigate();

  const handleNewGame = () => {
    localStorage.removeItem('hathor_game_info_draft_current');
    navigate({ to: '/game-info-form' });
  };

  const loadData = async () => {
    try {
      const [gamesRes, analyticsRes] = await Promise.all([
        apiClient.GET('/creator/games'),
        apiClient.GET('/creator/analytics' as any, {}),
      ]);

      if (gamesRes.data) {
        setGames(gamesRes.data);
      }
      if (analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const publishedGames = games.filter((g) => g.status === 'published');
  const pendingGames = games.filter((g) => g.status === 'pending_review');

  const totalOwners = analytics?.totalOwners || 0;
  const totalRevenue = analytics?.grossRevenueEgp || 0;
  const avgRating = analytics?.averageRating || 0;

  const topGame = publishedGames[0] || games[0];

  const stats: CreatorStatItem[] = [
    {
      label: 'Published Titles',
      value: publishedGames.length.toString(),
      delta: `${games.length} total in portfolio`,
      icon: Gamepad2,
      color: '#fd7014',
    },
    {
      label: 'Total Owners',
      value: totalOwners.toLocaleString(),
      delta: 'Across all published titles',
      icon: Users,
      color: '#4caf80',
    },
    {
      label: 'Total Revenue',
      value: `EGP ${totalRevenue.toFixed(2)}`,
      delta: 'Gross all-time earnings',
      icon: DollarSign,
      color: '#3b9eda',
    },
    {
      label: 'Avg. Score',
      value: avgRating > 0 ? avgRating.toFixed(1) : '—',
      delta: 'Community rating average',
      icon: Star,
      color: '#f59e0b',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Stat Cards */}
      <CreatorStatsGrid stats={stats} />

      {/* Two Column Section */}
      <div className={commonStyles.twoColGrid}>
        {/* Left Column: Portfolio list */}
        <div className={commonStyles.panelCard}>
          <div className={commonStyles.panelHeader}>
            <span className={commonStyles.panelHeaderTitle}>Your Portfolio</span>
            <span className={commonStyles.panelHeaderMeta}>{games.length} titles</span>
          </div>

          {games.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#8c9aaa' }}>
              <Gamepad2 size={24} style={{ opacity: 0.3, marginBottom: '0.5rem', color: '#fd7014' }} />
              <p style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                No games created yet. Click "New Game" to get started!
              </p>
            </div>
          ) : (
            games.map((game, i) => {
              const accent = ACCENTS[i % ACCENTS.length];
              const price = Number(game.priceEgp || 0);

              return (
                <div key={game.id} className={commonStyles.portfolioItem}>
                  <div
                    className={commonStyles.portfolioIconBox}
                    style={{
                      background: `linear-gradient(135deg, ${accent}25, #222831)`,
                      borderColor: `${accent}40`,
                    }}
                  >
                    <Gamepad2 size={14} style={{ color: accent }} />
                  </div>

                  <div className={commonStyles.portfolioInfo}>
                    <p className={commonStyles.portfolioTitle}>{game.title}</p>
                    <p className={commonStyles.portfolioSubtitle}>
                      {game.genre?.name || 'General'} · EGP {price.toFixed(2)}
                    </p>
                  </div>

                  <div className={commonStyles.portfolioStatusCol}>
                    <GameStatusBadge status={game.status} />
                  </div>

                  <div className={commonStyles.portfolioActionsCol}>
                    {game.status === 'published' && (
                      <button
                        type="button"
                        className={commonStyles.statsBtn}
                        onClick={() => navigate({ to: '/creator/analytics' })}
                      >
                        <BarChart2 size={10} /> Stats
                      </button>
                    )}
                    <button
                      type="button"
                      className={commonStyles.statsBtn}
                      style={{ borderColor: '#393e46', color: '#8c9aaa' }}
                      onClick={() => navigate({ to: '/game-info-form', search: { gameId: game.id } })}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Top Performer */}
          {topGame && (
            <div className={commonStyles.topPerformerCard}>
              <div className={commonStyles.topPerformerStripe} />
              <div className={commonStyles.topPerformerHeader}>
                <p className={commonStyles.topPerformerOverline}>Top Performer</p>
                <h3 className={commonStyles.topPerformerTitle}>{topGame.title}</h3>
              </div>
              <div style={{ padding: '0.75rem 1rem' }}>
                <div className={commonStyles.metricRow}>
                  <span className={commonStyles.metricLabel}>Status</span>
                  <GameStatusBadge status={topGame.status} />
                </div>
                <div className={commonStyles.metricRow}>
                  <span className={commonStyles.metricLabel}>Price</span>
                  <span className={commonStyles.metricVal} style={{ color: '#3b9eda' }}>
                    EGP {Number(topGame.priceEgp || 0).toFixed(2)}
                  </span>
                </div>
                <div className={commonStyles.metricRow}>
                  <span className={commonStyles.metricLabel}>Genre</span>
                  <span className={commonStyles.metricVal} style={{ color: '#eeeeee' }}>
                    {topGame.genre?.name || 'General'}
                  </span>
                </div>

                <button
                  type="button"
                  className={commonStyles.viewAnalyticsBtn}
                  onClick={() => navigate({ to: '/creator/analytics' })}
                >
                  <BarChart2 size={12} /> View Analytics
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className={commonStyles.panelCard}>
            <div className={commonStyles.panelHeader}>
              <span className={commonStyles.panelHeaderTitle}>Quick Actions</span>
            </div>
            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                className={commonStyles.quickActionBtn}
                onClick={handleNewGame}
              >
                <div className={commonStyles.quickActionIcon}>
                  <Plus size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className={commonStyles.quickActionTitle}>Publish New Game</p>
                  <p className={commonStyles.quickActionDesc}>Submit a title for review</p>
                </div>
                <ChevronRight size={14} style={{ color: '#fd7014' }} />
              </button>

              <div
                className={commonStyles.quickActionBtn}
                style={{ opacity: 0.45, cursor: 'not-allowed', borderColor: '#393e46' }}
              >
                <div className={commonStyles.quickActionIcon} style={{ borderColor: '#393e46', color: '#8c9aaa' }}>
                  <FileText size={14} />
                </div>
                <div>
                  <p className={commonStyles.quickActionTitle} style={{ color: '#8c9aaa' }}>
                    Developer Docs
                  </p>
                  <p className={commonStyles.quickActionDesc}>Guidelines & API reference</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Review Alert */}
          {pendingGames.length > 0 && (
            <div
              style={{
                border: '1px solid rgba(245, 158, 11, 0.3)',
                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b',
                  marginTop: '0.35rem',
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  style={{
                    margin: '0 0 0.2rem 0',
                    fontSize: '0.55rem',
                    fontWeight: 900,
                    color: '#f59e0b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontFamily: 'monospace',
                  }}
                >
                  {pendingGames.length} title(s) pending review
                </p>
                <p style={{ margin: 0, fontSize: '0.55rem', color: '#8c9aaa', fontFamily: 'monospace' }}>
                  Review typically takes 3–5 business days.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
