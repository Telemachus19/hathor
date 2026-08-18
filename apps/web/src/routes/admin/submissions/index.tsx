import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
  Send,
  CheckCircle,
  XCircle,
  Gamepad2,
  MoreVertical,
  Filter,
  ExternalLink,
  ChevronRight,
  Check,
} from 'lucide-react';
import { AdminStatsGrid, AdminStatItem } from '../components/common/AdminStatsCard';
import { AdminFilterBar } from '../components/common/AdminFilterBar';
import { GameStatusBadge } from '../components/common/AdminBadges';
import { PreviewModal } from '../../designer-page/components/modals/PreviewModal';
import { Device, DEFAULT_PAGE_SETTINGS } from '../../designer-page/types/designerTypes';
import { apiClient } from '../../../services/api/index';
import type { Game } from '@hathor/contracts';
import commonStyles from '../styles/adminCommon.module.css';

export const Route = createFileRoute('/admin/submissions/')({
  component: AdminSubmissions,
});

function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Game[]>([]);
  const [search, setSearch] = useState('');
  const [previewGame, setPreviewGame] = useState<Game | null>(null);
  const [previewDevice, setPreviewDevice] = useState<Device>('desktop');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadSubmissions = async () => {
    try {
      const { data } = await apiClient.GET('/admin/submissions');
      if (data?.items) {
        setSubmissions(data.items);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleStatusChange = async (gameId: string, status: 'published' | 'rejected') => {
    try {
      await apiClient.PATCH('/admin/games/{gameId}/status', {
        params: { path: { gameId } },
        body: { status, reason: 'Admin review completed' },
      });
      showToast(status === 'published' ? 'Submission approved & published' : 'Submission rejected');
      loadSubmissions();
    } catch (err) {
      console.error(err);
      showToast('Failed to update submission status');
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        s.title.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.genre?.name && s.genre.name.toLowerCase().includes(q));

      return matchSearch;
    });
  }, [submissions, search]);

  const stats: AdminStatItem[] = [
    {
      label: 'Pending Review',
      value: submissions.length,
      delta: 'Awaiting moderation decision',
      icon: Inbox,
      color: '#fd7014',
    },
    {
      label: 'Requires Action',
      value: submissions.length,
      delta: 'Creator submissions pending approval',
      icon: Send,
      color: '#f59e0b',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {toast && (
        <div className={commonStyles.toast}>
          <Check size={14} style={{ color: '#4caf80' }} />
          <span>{toast}</span>
        </div>
      )}

      {openMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpenMenu(null)} />}

      {previewGame && (
        <PreviewModal
          sections={(previewGame as any)?.pageTheme?.sections || (previewGame as any)?.theme?.sections || []}
          pageSettings={
            (previewGame as any)?.pageTheme?.pageSettings ||
            (previewGame as any)?.theme?.pageSettings ||
            DEFAULT_PAGE_SETTINGS
          }
          previewDevice={previewDevice}
          setPreviewDevice={setPreviewDevice}
          onClose={() => setPreviewGame(null)}
        />
      )}

      {/* Top Stats */}
      <AdminStatsGrid stats={stats} />

      {/* Search & Filters */}
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search submissions by title, creator, or genre..."
      />

      {/* Results Header */}
      <div className={commonStyles.resultsMeta}>
        <Filter size={12} />
        <span>
          Showing <strong>{filteredSubmissions.length}</strong> of {submissions.length} submissions
        </span>
      </div>

      {/* Data Table */}
      <div className={commonStyles.tableContainer}>
        <div
          className={commonStyles.tableHeader}
          style={{ gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1fr auto' }}
        >
          <span>Game</span>
          <span>Creator</span>
          <span>Genre</span>
          <span>Price (EGP)</span>
          <span>Status</span>
          <span style={{ width: 32 }} />
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className={commonStyles.emptyState}>
            <Inbox size={32} className={commonStyles.emptyIcon} />
            <p className={commonStyles.emptyTitle}>No submissions match your criteria</p>
            <p className={commonStyles.emptyDesc}>Try adjusting your search terms or filters</p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => {
            const submittedDate = (sub as any).createdAt
              ? new Date((sub as any).createdAt).toLocaleDateString()
              : 'Recent';

            return (
              <div
                key={sub.id}
                className={`${commonStyles.tableRow} ${commonStyles.tableRowClickable} ${openMenu === sub.id ? commonStyles.tableRowActive : ''}`}
                style={{ gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1fr auto' }}
                onClick={() => navigate({ to: '/admin/submissions/$submissionId', params: { submissionId: sub.id } })}
              >
                {/* Game */}
                <div className={commonStyles.userCell}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(253, 112, 20, 0.08)',
                      border: '1px solid rgba(253, 112, 20, 0.25)',
                      color: 'var(--accent-orange)',
                      flexShrink: 0,
                    }}
                  >
                    <Gamepad2 size={15} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p className={commonStyles.cellTitle}>{sub.title}</p>
                    <p className={commonStyles.cellSubtitle}>Submitted {submittedDate}</p>
                  </div>
                </div>

                {/* Creator */}
                <span className={commonStyles.monoText}>-</span>

                {/* Genre */}
                <span className={commonStyles.monoText}>{sub.genre?.name || 'Action'}</span>

                {/* Price */}
                <span className={commonStyles.priceText}>{Number(sub.priceEgp || 0).toFixed(2)}</span>

                {/* Status */}
                <div>
                  <GameStatusBadge status={sub.status} />
                </div>

                {/* Actions */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={commonStyles.actionBtn}
                    onClick={() => setOpenMenu(openMenu === sub.id ? null : sub.id)}
                  >
                    <MoreVertical size={14} />
                  </button>

                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />

                  {openMenu === sub.id && (
                    <div className={commonStyles.dropdownMenu}>
                      <button
                        type="button"
                        className={commonStyles.dropdownMenuItem}
                        onClick={() => navigate({ to: '/admin/submissions/$submissionId', params: { submissionId: sub.id } })}
                      >
                        Review Submission
                      </button>

                      <button
                        type="button"
                        className={commonStyles.dropdownMenuItem}
                        style={{ color: 'var(--accent-orange)' }}
                        onClick={() => {
                          setPreviewGame(sub);
                          setOpenMenu(null);
                        }}
                      >
                        <ExternalLink size={12} /> Preview Store Page
                      </button>

                      <button
                        type="button"
                        className={`${commonStyles.dropdownMenuItem} ${commonStyles.dropdownMenuItemSuccess}`}
                        onClick={() => {
                          handleStatusChange(sub.id, 'published');
                          setOpenMenu(null);
                        }}
                      >
                        <CheckCircle size={12} style={{ color: '#4caf80' }} /> Approve &amp; Publish
                      </button>

                      <button
                        type="button"
                        className={`${commonStyles.dropdownMenuItem} ${commonStyles.dropdownMenuItemDanger}`}
                        onClick={() => {
                          handleStatusChange(sub.id, 'rejected');
                          setOpenMenu(null);
                        }}
                      >
                        <XCircle size={12} style={{ color: '#e74c3c' }} /> Reject Submission
                      </button>
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
