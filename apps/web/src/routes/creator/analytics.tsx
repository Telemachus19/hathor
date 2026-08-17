import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Users, DollarSign, Star, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { apiClient } from '../../services/api/index';
import type { Game } from '@hathor/contracts';

export const Route = createFileRoute('/creator/analytics')({
  component: CreatorAnalytics,
});



function CreatorAnalytics() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [analyticsMap, setAnalyticsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: gamesData } = await apiClient.GET('/creator/games');
        if (gamesData) {
          setGames(gamesData);
          if (gamesData.length > 0) {
            setSelectedGameId(gamesData[0].id);
          }
          
          const aMap: Record<string, any> = {};
          await Promise.all(
            gamesData.map(async (game) => {
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--accent-orange)' }}>
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  const selectedAnalytics = selectedGameId ? analyticsMap[selectedGameId] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Game Selector Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)' }}>
        {games.map(game => {
          const isSelected = game.id === selectedGameId;
          return (
            <button 
              key={game.id}
              onClick={() => setSelectedGameId(game.id)}
              style={{ 
                padding: '0.75rem 0', 
                color: isSelected ? 'var(--text-white)' : 'var(--text-muted)', 
                borderBottom: isSelected ? '2px solid var(--accent-orange)' : '2px solid transparent', 
                fontSize: '0.875rem', 
                fontWeight: 'bold', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isSelected ? 'var(--accent-orange)' : 'var(--text-muted)' }}></div>
              {game.title}
            </button>
          );
        })}
      </div>

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
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
                {selectedAnalytics?.totalOwners?.toLocaleString() || '0'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Lifetime purchases
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
                EGP {selectedAnalytics?.totalRevenueEgp || '0.00'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                All-time gross
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--accent-gold)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Community Score</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '4px', color: 'var(--accent-gold)' }}>
                <Star size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                {selectedAnalytics?.averageScore || '0.0'} / 10
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Based on reviews
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--accent-orange)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Rev / Owner</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '4px', color: 'var(--accent-orange)' }}>
                <TrendingUp size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-orange)' }}>
                EGP {
                  (selectedAnalytics?.totalRevenueEgp && selectedAnalytics?.totalOwners) 
                    ? (parseFloat(selectedAnalytics.totalRevenueEgp) / selectedAnalytics.totalOwners).toFixed(2) 
                    : '0.00'
                }
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Before platform cut
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Charts 50/50 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <Card>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '350px' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>NEW OWNERS PER MONTH</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>New purchases each month since launch</div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 1rem', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No historical data available.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '350px' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>CUMULATIVE OWNERS</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Total ownership growth over time</div>
            </div>
            <div style={{ flex: 1, position: 'relative', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', height: '100%' }}>
                No historical data available.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Revenue Chart */}
      <Card>
        <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '250px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>MONTHLY REVENUE</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Gross revenue per month since launch</div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 2rem', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No historical data available.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 4: Portfolio Comparison */}
      <Card>
        <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>PORTFOLIO COMPARISON - OWNER COUNT</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {games.map((game, i) => {
              const a = analyticsMap[game.id];
              const owners = a?.totalOwners || 0;
              const maxOwners = Math.max(...games.map(g => analyticsMap[g.id]?.totalOwners || 1000));
              const pct = Math.max((owners / maxOwners) * 100, 2); // At least 2% to show the bar
              const colors = ['var(--accent-orange)', '#a855f7', 'var(--status-info)', '#ec4899'];
              const color = colors[i % colors.length];

              return (
                <div key={game.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }}></div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{game.title}</span>
                      <div style={{ backgroundColor: 'var(--bg-topbar)', border: '1px solid var(--border-color)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        • {game.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{owners.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--bg-topbar)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
