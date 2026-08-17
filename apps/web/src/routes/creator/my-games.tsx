import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Search, Gamepad2, BarChart2, Edit3, Send } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { apiClient } from '../../services/api/index';
import type { Game } from '@hathor/contracts';

export const Route = createFileRoute('/creator/my-games')({
  component: CreatorMyGames,
});

const BORDER_COLORS = ['var(--accent-orange)', 'var(--status-info)', '#a855f7', '#ec4899'];

function CreatorMyGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [analyticsMap, setAnalyticsMap] = useState<Record<string, any>>({});
  const [filter, setFilter] = useState<'all' | 'published' | 'pending_review' | 'draft'>('all');
  const navigate = useNavigate();

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
                params: { path: { gameId: game.id } }
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
        body: { status: status as any }
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewGame = async () => {
    try {
      const { data } = await apiClient.POST('/creator/games', { 
        body: { 
          title: 'New Game', 
          slug: `draft-${Date.now()}`, 
          shortDescription: '', 
          priceEgp: '0.00' 
        } 
      });
      if (data && data.id) {
        navigate({ to: '/creator/games/$gameId/edit', params: { gameId: data.id } });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredGames = games.filter(g => filter === 'all' ? true : g.status === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Filter Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setFilter('all')}
          style={{ padding: '0.5rem 0', color: filter === 'all' ? 'var(--text-white)' : 'var(--text-muted)', borderBottom: filter === 'all' ? '2px solid var(--accent-orange)' : '2px solid transparent', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          ALL ({games.length})
        </button>
        <button 
          onClick={() => setFilter('published')}
          style={{ padding: '0.5rem 0', color: filter === 'published' ? 'var(--text-white)' : 'var(--text-muted)', borderBottom: filter === 'published' ? '2px solid var(--accent-orange)' : '2px solid transparent', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          PUBLISHED ({games.filter(g => g.status === 'published').length})
        </button>
        <button 
          onClick={() => setFilter('pending_review')}
          style={{ padding: '0.5rem 0', color: filter === 'pending_review' ? 'var(--text-white)' : 'var(--text-muted)', borderBottom: filter === 'pending_review' ? '2px solid var(--accent-orange)' : '2px solid transparent', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          IN REVIEW ({games.filter(g => g.status === 'pending_review').length})
        </button>
        <button 
          onClick={() => setFilter('draft')}
          style={{ padding: '0.5rem 0', color: filter === 'draft' ? 'var(--text-white)' : 'var(--text-muted)', borderBottom: filter === 'draft' ? '2px solid var(--accent-orange)' : '2px solid transparent', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          DRAFT ({games.filter(g => g.status === 'draft').length})
        </button>
      </div>

      <div className="flex justify-between items-center" style={{ gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search games..." 
            className="hathor-input w-full"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <button onClick={handleNewGame} className="hathor-btn hathor-btn-primary flex items-center gap-2">
          + NEW GAME
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredGames.map((game, i) => {
          const borderColor = BORDER_COLORS[i % BORDER_COLORS.length];
          const analytics = analyticsMap[game.id];
          
          return (
            <Card key={game.id} style={{ borderTop: `4px solid ${borderColor}` }}>
              <CardContent style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: borderColor }}>
                    <Gamepad2 size={32} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>{game.title}</h3>
                      <Badge variant={
                        game.status === 'published' ? 'success' : 
                        game.status === 'pending_review' ? 'warning' : 'default'
                      }>
                        {game.status.toUpperCase().replace('_', ' ')}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span>{game.genre?.name || 'Uncategorized'}</span>
                      <span style={{ color: 'var(--border-color)' }}>|</span>
                      <span>EGP {game.priceEgp}</span>
                      <span style={{ color: 'var(--border-color)' }}>|</span>
                      <span>Last updated: Just now</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', minWidth: '350px' }}>
                  {game.status === 'published' ? (
                    <div style={{ display: 'flex', gap: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-main)', padding: '0.75rem 1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--status-success)', fontSize: '1.1rem' }}>{analytics?.totalOwners || 0}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owners</div>
                      </div>
                      <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }}></div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--status-info)', fontSize: '1.1rem' }}>EGP {analytics?.totalRevenueEgp || '0.00'}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gross Rev</div>
                      </div>
                      <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }}></div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--accent-gold)', fontSize: '1.1rem' }}>{analytics?.averageScore || '0.0'}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ flex: 1 }}></div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    {game.status === 'published' && (
                      <button onClick={() => navigate({ to: '/creator/analytics', search: { gameId: game.id } })} className="hathor-btn flex items-center gap-2" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                        <BarChart2 size={14} /> ANALYTICS
                      </button>
                    )}
                    <button onClick={() => navigate({ to: '/creator/games/$gameId/edit', params: { gameId: game.id } })} className="hathor-btn flex items-center gap-2" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                      <Edit3 size={14} /> EDIT
                    </button>
                    {game.status === 'draft' && (
                      <button onClick={() => handleStatusChange(game.id, 'pending_review')} className="hathor-btn hathor-btn-primary flex items-center gap-2" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                        <Send size={14} /> SUBMIT
                      </button>
                    )}
                    {game.status === 'pending_review' && (
                      <button onClick={() => handleStatusChange(game.id, 'draft')} className="hathor-btn flex items-center gap-2" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--status-warning)' }}>
                        RETRACT
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredGames.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No games found in this category.
          </div>
        )}
      </div>
    </div>
  );
}

