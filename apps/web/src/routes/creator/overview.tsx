import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Gamepad2, Users, DollarSign, Star, TrendingUp, AlertCircle, FilePlus2, BookOpen, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../services/api/index';
import type { Game } from '@hathor/contracts';

export const Route = createFileRoute('/creator/overview')({
  component: CreatorOverview,
});

function CreatorOverview() {
  const [games, setGames] = useState<Game[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const navigate = useNavigate();

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

  const loadData = async () => {
    try {
      const [gamesRes, analyticsRes] = await Promise.all([
        apiClient.GET('/creator/games'),
        apiClient.GET('/creator/analytics' as any, {})
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

  const publishedGames = games.filter(g => g.status === 'published');
  const pendingGames = games.filter(g => g.status === 'pending_review');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <Card style={{ borderTop: '3px solid var(--accent-orange)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Published Titles</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '4px', color: 'var(--accent-orange)' }}>
                <Gamepad2 size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-orange)' }}>{publishedGames.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {games.length} total in portfolio
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-success)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Total Owners</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px', color: 'var(--status-success)' }}>
                <Users size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-success)' }}>
                {analytics?.totalOwners?.toLocaleString() || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                across all published titles
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-info)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Total Revenue</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '4px', color: 'var(--status-info)' }}>
                <DollarSign size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-info)' }}>
                EGP {analytics?.totalRevenueEgp || '0.00'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Gross all-time earnings
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--accent-gold)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Avg. Score</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '4px', color: 'var(--accent-gold)' }}>
                <Star size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                {analytics?.averageScore || '0.0'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Community rating average
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '70% 30%', gap: '2rem' }}>
        {/* Left Column: Portfolio */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Portfolio</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-orange)' }}>{games.length} titles</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {games.map(game => (
              <Card key={game.id}>
                <CardContent style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-orange)' }}>
                      <Gamepad2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '0.05em' }}>{game.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{game.genre?.name || 'Uncategorized'} - EGP {game.priceEgp}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                    <Badge variant={
                      game.status === 'published' ? 'success' : 
                      game.status === 'pending_review' ? 'warning' : 'default'
                    }>
                      {game.status.toUpperCase()}
                    </Badge>
                    
                    {game.status === 'published' ? (
                      <div style={{ display: 'flex', gap: '2rem', textAlign: 'right' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>0</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>owners</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>EGP 0</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>revenue</div>
                        </div>
                        <button className="hathor-btn" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }} onClick={() => navigate({ to: '/creator/analytics', search: { gameId: game.id } })}>
                          <TrendingUp size={14} /> Stats
                        </button>
                      </div>
                    ) : (
                      <div style={{ width: '200px', textAlign: 'right', color: 'var(--text-light)', fontSize: '0.875rem' }}>
                        -
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Top Performer & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Top Performer</h3>
            {publishedGames.length > 0 ? (
            <Card>
              <CardContent style={{ padding: '1.5rem' }}>
                <div style={{ fontWeight: 'bold', fontFamily: 'var(--font-heading)', fontSize: '1.25rem', letterSpacing: '0.05em', color: 'var(--accent-orange)', marginBottom: '1.5rem' }}>{publishedGames[0].title}</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OWNERS</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--status-success)' }}>0</span>
                  </div>
                  <div style={{ borderBottom: '1px solid var(--border-color)' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REVENUE</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--status-info)' }}>EGP 0.00</span>
                  </div>
                  <div style={{ borderBottom: '1px solid var(--border-color)' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RATING</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>0.0 / 10</span>
                  </div>
                  <div style={{ borderBottom: '1px solid var(--border-color)' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REVIEWS</span>
                    <span style={{ fontWeight: 'bold' }}>0</span>
                  </div>
                </div>

                <button onClick={() => navigate({ to: '/creator/analytics', search: { gameId: publishedGames[0].id } })} className="hathor-btn w-full flex items-center justify-center gap-2" style={{ marginTop: '2rem' }}>
                  <TrendingUp size={16} color="var(--accent-orange)" />
                  VIEW ANALYTICS
                </button>
              </CardContent>
            </Card>
            ) : (
            <Card>
              <CardContent style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No published games yet.
              </CardContent>
            </Card>
            )}
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Card onClick={handleNewGame} style={{ borderLeft: '3px solid var(--accent-orange)', cursor: 'pointer' }} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                <CardContent style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <FilePlus2 size={20} color="var(--accent-orange)" />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.875rem', textTransform: 'uppercase' }}>Publish New Game</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Submit a title for review.</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--accent-orange)" />
                </CardContent>
              </Card>

              <Card style={{ cursor: 'pointer' }} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                <CardContent style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <BookOpen size={20} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-light)' }}>Developer Docs</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Guidelines & API reference</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {pendingGames.length > 0 && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '1rem', backgroundColor: 'var(--status-warning-bg)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <AlertCircle size={16} color="var(--status-warning)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--status-warning)', textTransform: 'uppercase' }}>{pendingGames.length} Title{pendingGames.length > 1 ? 's' : ''} Pending Review</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Review typically takes 3-5 business days.</div>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
