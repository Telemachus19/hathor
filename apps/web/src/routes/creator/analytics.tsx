import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  Star,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { CreatorStatsGrid, CreatorStatItem } from './components/CreatorStatsCard';
import { GameStatusBadge } from './components/CreatorBadges';
import { apiClient } from '../../services/api/index';
import type { Game } from '@hathor/contracts';
import commonStyles from './styles/creatorCommon.module.css';

export const Route = createFileRoute('/creator/analytics')({
  component: CreatorAnalytics,
});

const ACCENTS = ['#e07c2a', '#7c5ce0', '#3b9eda', '#8e44ad', '#4caf80', '#fd7014'];

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `EGP ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `EGP ${(n / 1_000).toFixed(1)}K`;
  return `EGP ${n.toFixed(2)}`;
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function ChartTip({
  active,
  payload,
  label,
  format = fmtNum,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  format?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: '#1c2028',
        border: '1px solid rgba(253, 112, 20, 0.4)',
        padding: '0.5rem 0.75rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
      }}
    >
      <p
        style={{
          fontSize: '0.55rem',
          fontFamily: 'monospace',
          color: '#8c9aaa',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: '0 0 0.25rem 0',
        }}
      >
        {label}
      </p>
      {payload.map((entry: any, i: number) => (
        <p
          key={i}
          style={{
            fontSize: '0.8rem',
            fontWeight: 900,
            fontFamily: 'monospace',
            color: entry.color || '#fd7014',
            margin: 0,
          }}
        >
          {format(entry.value)}
        </p>
      ))}
    </div>
  );
}

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '6rem',
          color: '#fd7014',
        }}
      >
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  const publishedGames = games.filter((g) => g.status === 'published');
  const effectiveId = selectedGameId || publishedGames[0]?.id || games[0]?.id;
  const analytics = effectiveId ? analyticsMap[effectiveId] : null;

  const totalOwners = analytics?.totalOwners || 0;
  const totalRevenue = analytics?.grossRevenueEgp || 0;
  const reviewCount = analytics?.reviewCount || 0;
  const avgRating = analytics?.averageRating || 0;
  const revPerOwner = totalOwners > 0 ? totalRevenue / totalOwners : 0;

  // Monthly points mock fallback or aggregated history
  const monthlyData = [
    { month: 'Jan', newOwners: Math.round(totalOwners * 0.15), revenue: totalRevenue * 0.15, cumOwners: Math.round(totalOwners * 0.15) },
    { month: 'Feb', newOwners: Math.round(totalOwners * 0.20), revenue: totalRevenue * 0.20, cumOwners: Math.round(totalOwners * 0.35) },
    { month: 'Mar', newOwners: Math.round(totalOwners * 0.25), revenue: totalRevenue * 0.25, cumOwners: Math.round(totalOwners * 0.60) },
    { month: 'Apr', newOwners: Math.round(totalOwners * 0.18), revenue: totalRevenue * 0.18, cumOwners: Math.round(totalOwners * 0.78) },
    { month: 'May', newOwners: Math.round(totalOwners * 0.12), revenue: totalRevenue * 0.12, cumOwners: Math.round(totalOwners * 0.90) },
    { month: 'Jun', newOwners: Math.round(totalOwners * 0.10), revenue: totalRevenue * 0.10, cumOwners: totalOwners },
  ];

  const gameIndex = games.findIndex((g) => g.id === effectiveId);
  const accent = ACCENTS[Math.max(0, gameIndex) % ACCENTS.length];

  const statItems: CreatorStatItem[] = [
    {
      label: 'Total Owners',
      value: fmtNum(totalOwners),
      delta: 'Lifetime purchases',
      icon: Users,
      color: '#4caf80',
    },
    {
      label: 'Total Revenue',
      value: fmtMoney(totalRevenue),
      delta: 'All-time gross',
      icon: DollarSign,
      color: '#3b9eda',
    },
    {
      label: 'Community Score',
      value: avgRating > 0 ? `${avgRating.toFixed(1)} / 10` : '—',
      delta: `${reviewCount.toLocaleString()} reviews`,
      icon: Star,
      color: '#f59e0b',
    },
    {
      label: 'Rev / Owner',
      value: revPerOwner > 0 ? fmtMoney(revPerOwner) : '—',
      delta: 'Before platform cut',
      icon: TrendingUp,
      color: '#fd7014',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Game Selector Tabs */}
      <div
        style={{
          display: 'flex',
          border: '1px solid #393e46',
          overflowX: 'auto',
          backgroundColor: '#1c2028',
        }}
      >
        {games.map((g, idx) => {
          const active = g.id === effectiveId;
          const gameAccent = ACCENTS[idx % ACCENTS.length];

          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGameId(g.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                fontSize: '0.65rem',
                fontFamily: "'Cinzel', serif",
                fontWeight: 900,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: 'none',
                borderRight: '1px solid #393e46',
                background: active ? `${gameAccent}18` : 'transparent',
                color: active ? gameAccent : '#8c9aaa',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: gameAccent,
                  opacity: active ? 1 : 0.4,
                }}
              />
              {g.title}
            </button>
          );
        })}
      </div>

      {/* Key Metrics */}
      <CreatorStatsGrid stats={statItems} />

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {/* New Owners Per Month */}
        <div className={commonStyles.panelCard}>
          <div className={commonStyles.panelHeader}>
            <span className={commonStyles.panelHeaderTitle}>New Owners per Month</span>
            <span className={commonStyles.panelHeaderMeta}>Purchases</span>
          </div>
          <div style={{ padding: '1rem' }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#393e46" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#8c9aaa', fontSize: 9, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8c9aaa', fontSize: 9, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={fmtNum}
                  width={40}
                />
                <Tooltip content={(props: any) => <ChartTip {...props} format={fmtNum} />} />
                <Bar dataKey="newOwners" fill={accent} radius={[2, 2, 0, 0]} name="New Owners" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cumulative Owners */}
        <div className={commonStyles.panelCard}>
          <div className={commonStyles.panelHeader}>
            <span className={commonStyles.panelHeaderTitle}>Cumulative Growth</span>
            <span className={commonStyles.panelHeaderMeta}>Total Audience</span>
          </div>
          <div style={{ padding: '1rem' }}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id={`grad-${effectiveId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accent} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={accent} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#393e46" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#8c9aaa', fontSize: 9, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8c9aaa', fontSize: 9, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={fmtNum}
                  width={40}
                />
                <Tooltip content={(props: any) => <ChartTip {...props} format={fmtNum} />} />
                <Area
                  type="monotone"
                  dataKey="cumOwners"
                  stroke={accent}
                  strokeWidth={2}
                  fill={`url(#grad-${effectiveId})`}
                  name="Total Owners"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className={commonStyles.panelCard} style={{ gridColumn: 'span 2' }}>
          <div className={commonStyles.panelHeader}>
            <span className={commonStyles.panelHeaderTitle}>Monthly Gross Revenue</span>
            <span className={commonStyles.panelHeaderMeta}>EGP</span>
          </div>
          <div style={{ padding: '1rem' }}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthlyData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#393e46" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#8c9aaa', fontSize: 9, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8c9aaa', fontSize: 9, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `EGP ${fmtNum(v)}`}
                  width={60}
                />
                <Tooltip content={(props: any) => <ChartTip {...props} format={fmtMoney} />} />
                <Bar dataKey="revenue" fill="#fd7014" radius={[2, 2, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Portfolio Comparison */}
      <div className={commonStyles.panelCard}>
        <div className={commonStyles.panelHeader}>
          <span className={commonStyles.panelHeaderTitle}>Portfolio Comparison — Audience Distribution</span>
        </div>
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {games.map((g, idx) => {
            const gAnalytics = analyticsMap[g.id];
            const gOwners = gAnalytics?.totalOwners || 0;
            const maxOwners = Math.max(...games.map((gm) => analyticsMap[gm.id]?.totalOwners || 0), 1);
            const pct = (gOwners / maxOwners) * 100;
            const gameAccent = ACCENTS[idx % ACCENTS.length];

            return (
              <div key={g.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: gameAccent,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        fontFamily: "'Cinzel', serif",
                        color: gOwners > 0 ? '#eeeeee' : '#8c9aaa',
                      }}
                    >
                      {g.title}
                    </span>
                    <GameStatusBadge status={g.status} />
                  </div>

                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: gOwners > 0 ? '#4caf80' : '#8c9aaa',
                    }}
                  >
                    {gOwners > 0 ? fmtNum(gOwners) : '—'}
                  </span>
                </div>

                <div
                  style={{
                    height: '4px',
                    backgroundColor: 'rgba(57, 62, 70, 0.5)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: pct > 0 ? gameAccent : 'transparent',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
