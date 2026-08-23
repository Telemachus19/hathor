import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import {
  Gamepad2,
  DollarSign,
  EyeOff,
  Trash2,
  Filter,
  MoreVertical,
  Tag,
  Package,
  Eye,
  Check,
  Star,
  BarChart2,
  LayoutGrid,
} from 'lucide-react';
import { AdminStatsGrid, AdminStatItem } from './components/common/AdminStatsCard';
import { AdminFilterBar } from './components/common/AdminFilterBar';
import { GameStatusBadge, ContentRatingBadge } from './components/common/AdminBadges';
import { TagEditorModal } from './components/TagEditorModal';
import { RemoveGameModal } from './components/RemoveGameModal';
import { GameDetailModal } from './components/GameDetailModal';
import { apiClient } from '../../services/api/index';
import type { Game } from '@hathor/contracts';
import commonStyles from './styles/adminCommon.module.css';

export const Route = createFileRoute('/admin/games')({
  component: AdminGames,
});

function AdminGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden' | 'removed'>(
    'all'
  );
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'title' | 'price'>('title');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [tagModal, setTagModal] = useState<Game | null>(null);
  const [removeModal, setRemoveModal] = useState<Game | null>(null);
  const [detailModal, setDetailModal] = useState<Game | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadGames = async () => {
    try {
      const { data } = await apiClient.GET('/admin/games');
      if (data?.items) {
        setGames(data.items);
      }
    } catch (err) {
      console.error('Failed to load games:', err);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleStatusChange = async (
    gameId: string,
    status: 'published' | 'rejected' | 'suspended'
  ) => {
    try {
      await apiClient.PATCH('/admin/games/{gameId}/status', {
        params: { path: { gameId } },
        body: { status, reason: 'Admin action' },
      });
      const msgs: Record<string, string> = {
        published: 'Game published to store',
        suspended: 'Game hidden from store',
        rejected: 'Game removed from store',
      };
      showToast(msgs[status] || 'Game status updated');
      loadGames();
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
      loadGames();
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
      const matchSearch =
        !search ||
        g.title.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q) ||
        (g.genre?.name && g.genre.name.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && g.status === 'published') ||
        (statusFilter === 'hidden' && (g.status === 'suspended' || g.status === 'draft')) ||
        (statusFilter === 'removed' && g.status === 'rejected');

      const matchGenre = genreFilter === 'all' || g.genre?.name === genreFilter;

      return matchSearch && matchStatus && matchGenre;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'price') return Number(b.priceEgp || 0) - Number(a.priceEgp || 0);
      return 0;
    });

    return result;
  }, [games, search, statusFilter, genreFilter, sortBy]);

  const publishedCount = games.filter((g) => g.status === 'published').length;
  const hiddenCount = games.filter((g) => g.status === 'suspended' || g.status === 'draft').length;
  const removedCount = games.filter((g) => g.status === 'rejected').length;

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
      value: 'EGP 0.00',
      delta: 'All-time platform gross',
      icon: DollarSign,
      color: '#4caf80',
    },
    {
      label: 'Hidden',
      value: hiddenCount.toString(),
      delta: 'Not visible to users',
      icon: EyeOff,
      color: '#f59e0b',
    },
    {
      label: 'Removed',
      value: removedCount.toString(),
      delta: 'Taken down from store',
      icon: Trash2,
      color: '#e74c3c',
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
      {removeModal && (
        <RemoveGameModal
          game={removeModal}
          onClose={() => setRemoveModal(null)}
          onConfirmRemove={(id) => handleStatusChange(id, 'rejected')}
        />
      )}
      {detailModal && <GameDetailModal game={detailModal} onClose={() => setDetailModal(null)} />}

      {/* Top Stats */}
      <AdminStatsGrid stats={stats} />

      {/* Search & Filters */}
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title, developer, genre, or tag..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={[
          { id: 'all', label: 'All Status', count: games.length },
          { id: 'published', label: 'Published', count: publishedCount },
          { id: 'hidden', label: 'Hidden', count: hiddenCount },
          { id: 'removed', label: 'Removed', count: removedCount },
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
            <option value="price">Sort: Price</option>
          </select>
        </div>
      </AdminFilterBar>

      {/* Results Header */}
      <div className={commonStyles.resultsMeta}>
        <Filter size={10} />
        <span>
          Showing <strong>{filteredGames.length}</strong> of {games.length} games
        </span>
      </div>

      {/* Data Table */}
      <div className={commonStyles.tableContainer}>
        <div
          className={commonStyles.tableHeader}
          style={{ gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr auto' }}
        >
          <span>Game</span>
          <span>Developer</span>
          <span>Genre</span>
          <span>Status</span>
          <span>Rating</span>
          <span>Owners</span>
          <span>Revenue</span>
          <span style={{ width: 28 }} />
        </div>

        {filteredGames.length === 0 ? (
          <div className={commonStyles.emptyState}>
            <Gamepad2 size={28} className={commonStyles.emptyIcon} />
            <p className={commonStyles.emptyTitle}>No games match your filters</p>
            <p className={commonStyles.emptyDesc}>Try adjusting search terms or filters</p>
          </div>
        ) : (
          filteredGames.map((game, idx) => {
            const releaseDate = (game as any).createdAt
              ? new Date((game as any).createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Mar 12, 2025';

            return (
              <div
                key={game.id}
                className={`${commonStyles.tableRow} ${idx % 2 === 1 ? commonStyles.tableRowAlt : ''} ${openMenu === game.id ? commonStyles.tableRowActive : ''}`}
                style={{ gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr auto' }}
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
                    {game.status === 'rejected' && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                        }}
                      >
                        <Trash2 size={9} style={{ color: '#e74c3c' }} />
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <p className={commonStyles.cellTitle}>{game.title}</p>
                      <Star size={8} style={{ color: '#fd7014', fill: '#fd7014', flexShrink: 0 }} />
                    </div>
                    <div className={commonStyles.cellSubtitle}>
                      <ContentRatingBadge rating="M" />
                      <span>{releaseDate}</span>
                    </div>
                  </div>
                </div>

                {/* Developer */}
                <div style={{ minWidth: 0, paddingRight: '0.75rem' }}>
                  <p className={commonStyles.monoText} style={{ margin: 0 }}>
                    Irongate Studios
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 8,
                      color: 'rgba(140, 154, 170, 0.5)',
                      fontFamily: 'monospace',
                    }}
                  >
                    pub: Obsidian Arc
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

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div
                    style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#4caf80' }}
                  />
                  <span
                    className={commonStyles.monoText}
                    style={{ color: '#4caf80', fontWeight: 700 }}
                  >
                    9.4
                  </span>
                  <span style={{ fontSize: 8, color: '#8c9aaa', fontFamily: 'monospace' }}>
                    (48k)
                  </span>
                </div>

                {/* Owners */}
                <span className={commonStyles.monoText}>284K</span>

                {/* Revenue */}
                <span className={commonStyles.priceText}>
                  EGP {Number(game.priceEgp || 0).toFixed(2)}
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
                        <Package size={12} style={{ color: '#3b9eda' }} /> View Details
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
                            handleStatusChange(game.id, 'suspended');
                            setOpenMenu(null);
                          }}
                        >
                          <EyeOff size={12} style={{ color: '#f59e0b' }} /> Hide from Store
                        </button>
                      )}

                      {game.status !== 'rejected' && (
                        <button
                          type="button"
                          className={`${commonStyles.dropdownMenuItem} ${commonStyles.dropdownMenuItemDanger}`}
                          onClick={() => {
                            setRemoveModal(game);
                            setOpenMenu(null);
                          }}
                        >
                          <Trash2 size={12} style={{ color: '#e74c3c' }} /> Remove Game
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
