import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Gamepad2,
  DollarSign,
  EyeOff,
  Filter,
  MoreVertical,
  Tag,
  Package,
  Eye,
  Check,
  Star,
  BarChart2,
  LayoutGrid,
  Loader2,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react';
import { AdminStatsGrid, AdminStatItem } from './components/common/AdminStatsCard';
import { AdminFilterBar } from './components/common/AdminFilterBar';
import { GameStatusBadge, ContentRatingBadge } from './components/common/AdminBadges';
import { TagEditorModal } from './components/TagEditorModal';
import { SuspendGameModal } from './components/SuspendGameModal';
import { GameDetailModal } from './components/GameDetailModal';
import { apiClient } from '../../services/api/index';
import type { Game } from '@hathor/contracts';
import commonStyles from './styles/adminCommon.module.css';

export const Route = createFileRoute('/admin/games')({
  component: AdminGames,
});

const PAGE_SIZE = 15;

interface RevenueSummaryData {
  totalRevenueEgp: string;
  paidOrdersCount: number;
  byGame: Record<string, { grossRevenueEgp: string; unitsSold: number }>;
}

function AdminGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummaryData>({
    totalRevenueEgp: '0.00',
    paidOrdersCount: 0,
    byGame: {},
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'published' | 'suspended' | 'draft' | 'rejected'
  >('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'revenue' | 'owners'>('title');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [tagModal, setTagModal] = useState<Game | null>(null);
  const [suspendModal, setSuspendModal] = useState<Game | null>(null);
  const [detailModal, setDetailModal] = useState<Game | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Pagination / Infinite Scroll states
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadRevenueAndUsers = async () => {
    try {
      const [{ data: revData }, { data: usersData }] = await Promise.all([
        (apiClient as any).GET('/admin/transactions/summary', {}).catch(() => ({
          data: { totalRevenueEgp: '0.00', paidOrdersCount: 0, byGame: {} },
        })),
        (apiClient as any).GET('/admin/users', {}).catch(() => ({ data: { items: [] } })),
      ]);

      if (revData) {
        setRevenueSummary(revData);
      }

      if (usersData?.items) {
        const mapping: Record<string, string> = {};
        for (const u of usersData.items as any[]) {
          if (u.id) {
            mapping[u.id] = u.displayName || u.email?.split('@')[0] || u.id.substring(0, 8);
          }
        }
        setUsersMap(mapping);
      }
    } catch (err) {
      console.error('Failed to load auxiliary admin data:', err);
    }
  };

  const loadInitialGames = async () => {
    try {
      setInitialLoading(true);
      const { data } = await apiClient.GET('/admin/games', {
        params: { query: { limit: PAGE_SIZE, cursor: '0' } } as any,
      });

      if (data?.items) {
        setGames(data.items);
        setCursor(data.nextCursor || null);
        setHasMore(Boolean(data.nextCursor));
      }
    } catch (err) {
      console.error('Failed to load games:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadMoreGames = useCallback(async () => {
    if (loadingMore || !hasMore || !cursor) return;

    try {
      setLoadingMore(true);
      const { data } = await apiClient.GET('/admin/games', {
        params: { query: { limit: PAGE_SIZE, cursor } } as any,
      });

      if (data?.items && data.items.length > 0) {
        setGames((prev) => {
          const existingIds = new Set(prev.map((g) => g.id));
          const newItems = data.items.filter((g) => !existingIds.has(g.id));
          return [...prev, ...newItems];
        });
        setCursor(data.nextCursor || null);
        setHasMore(Boolean(data.nextCursor));
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more games:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, hasMore, loadingMore]);

  useEffect(() => {
    loadRevenueAndUsers();
    loadInitialGames();
  }, []);

  // Infinite scroll intersection observer
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !initialLoading) {
          loadMoreGames();
        }
      },
      { rootMargin: '120px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, initialLoading, loadMoreGames]);

  const handleStatusChange = async (
    gameId: string,
    status: 'published' | 'rejected' | 'suspended'
  ) => {
    try {
      await apiClient.PATCH('/admin/games/{gameId}/status', {
        params: { path: { gameId } },
        body: {
          status,
          reason: status === 'suspended' ? 'Administrative suspension' : 'Admin action',
        },
      });
      const msgs: Record<string, string> = {
        published: 'Game published to store catalog',
        suspended: 'Game suspended and delisted from store',
        rejected: 'Game marked as rejected',
      };
      showToast(msgs[status] || 'Game status updated');
      loadInitialGames();
    } catch (err) {
      console.error(err);
      showToast('Failed to update game status');
    }
  };

  const handleSaveTags = async (gameId: string, tags: string[]) => {
    const game = games.find((g) => g.id === gameId);
    const genreId = game?.genre?.id || 1;
    try {
      await apiClient.PATCH('/admin/games/{gameId}/taxonomy' as any, {
        params: { path: { gameId } },
        body: { genreId, tags },
      });
      showToast('Tags updated successfully');
      loadInitialGames();
    } catch (err) {
      console.error(err);
      showToast('Failed to update tags');
    }
  };

  // Genres available
  const genres = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => {
      if (g.genre?.name) set.add(g.genre.name);
    });
    return ['all', ...Array.from(set).sort()];
  }, [games]);

  // Filtered games
  const filteredGames = useMemo(() => {
    let result = games.filter((g) => {
      const q = search.toLowerCase();
      const creatorId = (g as any).creatorId || '';
      const creatorName = (creatorId ? usersMap[creatorId] : '')?.toLowerCase() || '';
      const matchSearch =
        !search ||
        g.title.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q) ||
        creatorName.includes(q) ||
        (g.genre?.name && g.genre.name.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && g.status === 'published') ||
        (statusFilter === 'suspended' && g.status === 'suspended') ||
        (statusFilter === 'draft' && g.status === 'draft') ||
        (statusFilter === 'rejected' && g.status === 'rejected');

      const matchGenre = genreFilter === 'all' || g.genre?.name === genreFilter;

      return matchSearch && matchStatus && matchGenre;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'price') return Number(b.priceEgp || 0) - Number(a.priceEgp || 0);
      if (sortBy === 'revenue') {
        const revA = Number(revenueSummary.byGame[a.id]?.grossRevenueEgp || 0);
        const revB = Number(revenueSummary.byGame[b.id]?.grossRevenueEgp || 0);
        return revB - revA;
      }
      if (sortBy === 'owners') {
        const unitsA = revenueSummary.byGame[a.id]?.unitsSold || 0;
        const unitsB = revenueSummary.byGame[b.id]?.unitsSold || 0;
        return unitsB - unitsA;
      }
      return 0;
    });

    return result;
  }, [games, search, statusFilter, genreFilter, sortBy, usersMap, revenueSummary]);

  const publishedCount = games.filter((g) => g.status === 'published').length;
  const suspendedCount = games.filter((g) => g.status === 'suspended').length;
  const draftCount = games.filter((g) => g.status === 'draft').length;
  const rejectedCount = games.filter((g) => g.status === 'rejected').length;

  const stats: AdminStatItem[] = [
    {
      label: 'Total Games',
      value: games.length.toString(),
      delta: `${publishedCount} published in catalog`,
      icon: Gamepad2,
      color: '#fd7014',
    },
    {
      label: 'Catalog Revenue',
      value: `EGP ${Number(revenueSummary.totalRevenueEgp || 0).toFixed(2)}`,
      delta: `${revenueSummary.paidOrdersCount} completed orders`,
      icon: DollarSign,
      color: '#4caf80',
    },
    {
      label: 'Suspended',
      value: suspendedCount.toString(),
      delta: 'Hidden / delisted from store',
      icon: EyeOff,
      color: '#f59e0b',
    },
    {
      label: 'Drafts / In Review',
      value: (draftCount + rejectedCount).toString(),
      delta: 'Unpublished titles',
      icon: AlertTriangle,
      color: '#a78bfa',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {toast && (
        <div className={commonStyles.toast}>
          <Check size={11} style={{ color: '#4caf80' }} />
          <span>{toast}</span>
        </div>
      )}

      {openMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10 }}
          onClick={() => setOpenMenu(null)}
        />
      )}

      {tagModal && (
        <TagEditorModal
          game={tagModal}
          onClose={() => setTagModal(null)}
          onSaveTags={handleSaveTags}
        />
      )}
      {suspendModal && (
        <SuspendGameModal
          game={suspendModal}
          onClose={() => setSuspendModal(null)}
          onConfirmSuspend={(id) => handleStatusChange(id, 'suspended')}
        />
      )}
      {detailModal && (
        <GameDetailModal
          game={detailModal}
          creatorName={
            (detailModal as any).creatorId ? usersMap[(detailModal as any).creatorId] : undefined
          }
          onClose={() => setDetailModal(null)}
        />
      )}

      {/* Top Stats */}
      <AdminStatsGrid stats={stats} />

      {/* Search & Filters */}
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title, creator, genre, or ID..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter as any}
        statusOptions={[
          { id: 'all', label: 'All Status', count: games.length },
          { id: 'published', label: 'Published', count: publishedCount },
          { id: 'suspended', label: 'Suspended', count: suspendedCount },
          { id: 'draft', label: 'Draft', count: draftCount },
          { id: 'rejected', label: 'Rejected', count: rejectedCount },
        ]}
      >
        <div className={commonStyles.selectWrapper}>
          <LayoutGrid size={10} style={{ color: '#8c9aaa' }} />
          <select
            className={commonStyles.selectInput}
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                {g === 'all' ? 'All Genres' : g}
              </option>
            ))}
          </select>
        </div>

        <div className={commonStyles.selectWrapper}>
          <BarChart2 size={11} style={{ color: '#8c9aaa' }} />
          <select
            className={commonStyles.selectInput}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="title">Sort: Title</option>
            <option value="revenue">Sort: Highest Revenue</option>
            <option value="owners">Sort: Most Owners</option>
            <option value="price">Sort: Price</option>
          </select>
        </div>
      </AdminFilterBar>

      {/* Results Header */}
      <div className={commonStyles.resultsMeta}>
        <Filter size={10} />
        <span>
          Showing <strong>{filteredGames.length}</strong> games
          {hasMore && ' (Scroll down for more)'}
        </span>
      </div>

      {/* Data Table */}
      <div className={commonStyles.tableContainer}>
        <div
          className={commonStyles.tableHeader}
          style={{ gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1fr 1fr 1.2fr auto' }}
        >
          <span>Game</span>
          <span>Creator</span>
          <span>Genre</span>
          <span>Status</span>
          <span>Price</span>
          <span>Owners</span>
          <span>Gross Revenue</span>
          <span style={{ width: 28 }} />
        </div>

        {initialLoading ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#8c9aaa' }}>
            <Loader2
              size={24}
              className="animate-spin"
              style={{ margin: '0 auto 0.5rem', color: 'var(--accent-orange)' }}
            />
            <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace' }}>
              Loading catalog games...
            </p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className={commonStyles.emptyState}>
            <Gamepad2 size={28} className={commonStyles.emptyIcon} />
            <p className={commonStyles.emptyTitle}>No games match your filters</p>
            <p className={commonStyles.emptyDesc}>Try adjusting search terms or filters</p>
          </div>
        ) : (
          <>
            {filteredGames.map((game, idx) => {
              const releaseDate = (game as any).createdAt
                ? new Date((game as any).createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent';

              const creatorId = (game as any).creatorId;
              const creatorDisplayName =
                (creatorId && usersMap[creatorId]) ||
                (creatorId ? `Creator (${creatorId.slice(0, 8)})` : 'Hathor Creator');
              const gameStats = revenueSummary.byGame[game.id];
              const grossRevenue = Number(gameStats?.grossRevenueEgp || 0);
              const unitsSold = gameStats?.unitsSold || 0;

              return (
                <div
                  key={game.id}
                  className={`${commonStyles.tableRow} ${idx % 2 === 1 ? commonStyles.tableRowAlt : ''} ${openMenu === game.id ? commonStyles.tableRowActive : ''}`}
                  style={{ gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1fr 1fr 1.2fr auto' }}
                >
                  {/* Game Title & Swatch */}
                  <div className={commonStyles.userCell}>
                    <div className={commonStyles.gameSwatch}>
                      <Gamepad2 size={12} style={{ color: '#fd7014', opacity: 0.75 }} />
                      {game.status === 'suspended' && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                          }}
                        >
                          <EyeOff size={9} style={{ color: '#f59e0b' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <p className={commonStyles.cellTitle}>{game.title}</p>
                        <Star
                          size={8}
                          style={{ color: '#fd7014', fill: '#fd7014', flexShrink: 0 }}
                        />
                      </div>
                      <div className={commonStyles.cellSubtitle}>
                        <ContentRatingBadge rating="T" />
                        <span>{releaseDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Creator */}
                  <div style={{ minWidth: 0, paddingRight: '0.75rem' }}>
                    <p
                      className={commonStyles.monoText}
                      style={{ margin: 0, fontWeight: 700, color: '#eeeeee' }}
                    >
                      {creatorDisplayName}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 8,
                        color: 'rgba(140, 154, 170, 0.5)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {creatorId ? `ID: ${creatorId.slice(0, 8)}...` : '—'}
                    </p>
                  </div>

                  {/* Genre */}
                  <span className={commonStyles.monoText} style={{ fontSize: 9 }}>
                    {game.genre?.name || '—'}
                  </span>

                  {/* Status */}
                  <div>
                    <GameStatusBadge status={game.status} />
                  </div>

                  {/* Price */}
                  <span className={commonStyles.monoText} style={{ fontSize: 9, color: '#8c9aaa' }}>
                    EGP {Number(game.priceEgp || 0).toFixed(2)}
                  </span>

                  {/* Owners (Units Sold) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShoppingBag
                      size={11}
                      style={{ color: unitsSold > 0 ? '#4caf80' : '#8c9aaa' }}
                    />
                    <span
                      className={commonStyles.monoText}
                      style={{
                        color: unitsSold > 0 ? '#4caf80' : '#8c9aaa',
                        fontWeight: unitsSold > 0 ? 700 : 400,
                      }}
                    >
                      {unitsSold.toLocaleString()}
                    </span>
                  </div>

                  {/* Revenue */}
                  <span
                    className={commonStyles.priceText}
                    style={{ color: grossRevenue > 0 ? '#38d39f' : 'var(--text-muted)' }}
                  >
                    EGP {grossRevenue.toFixed(2)}
                  </span>

                  {/* Actions */}
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className={commonStyles.actionBtn}
                      onClick={() => setOpenMenu(openMenu === game.id ? null : game.id)}
                    >
                      <MoreVertical size={13} />
                    </button>

                    {openMenu === game.id && (
                      <div className={commonStyles.dropdownMenu}>
                        <button
                          type="button"
                          className={commonStyles.dropdownMenuItem}
                          onClick={() => {
                            setDetailModal(game);
                            setOpenMenu(null);
                          }}
                        >
                          <Package size={12} style={{ color: '#3b9eda' }} /> View Details &amp;
                          Build
                        </button>

                        <button
                          type="button"
                          className={commonStyles.dropdownMenuItem}
                          onClick={() => {
                            setTagModal(game);
                            setOpenMenu(null);
                          }}
                        >
                          <Tag size={12} style={{ color: '#a78bfa' }} /> Edit Tags
                        </button>

                        {game.status !== 'published' ? (
                          <button
                            type="button"
                            className={`${commonStyles.dropdownMenuItem} ${commonStyles.dropdownMenuItemSuccess}`}
                            onClick={() => {
                              handleStatusChange(game.id, 'published');
                              setOpenMenu(null);
                            }}
                          >
                            <Eye size={12} style={{ color: '#4caf80' }} /> Publish Game
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`${commonStyles.dropdownMenuItem} ${commonStyles.dropdownMenuItemWarning}`}
                            onClick={() => {
                              setSuspendModal(game);
                              setOpenMenu(null);
                            }}
                          >
                            <EyeOff size={12} style={{ color: '#f59e0b' }} /> Suspend Game
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Infinite Scroll Sentinel */}
            <div
              ref={observerTarget}
              style={{
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {loadingMore && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#8c9aaa',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                  }}
                >
                  <Loader2
                    size={13}
                    className="animate-spin"
                    style={{ color: 'var(--accent-orange)' }}
                  />
                  <span>Loading more games...</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
