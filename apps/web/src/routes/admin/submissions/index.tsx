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
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [previewGame, setPreviewGame] = useState<Game | null>(null);
  const [previewDevice, setPreviewDevice] = useState<Device>('desktop');
  const [rejectingGame, setRejectingGame] = useState<Game | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadSubmissions = async () => {
    try {
      const [{ data: subsData }, { data: usersData }] = await Promise.all([
        apiClient.GET('/admin/submissions'),
        (apiClient as any).GET('/admin/users', {}).catch(() => ({ data: { items: [] } })),
      ]);

      if (usersData?.items) {
        const mapping: Record<string, string> = {};
        for (const u of usersData.items as any[]) {
          if (u.id) {
            mapping[u.id] = u.displayName || u.email?.split('@')[0] || u.id.substring(0, 8);
          }
        }
        setUsersMap(mapping);
      }

      if (subsData?.items) {
        setSubmissions(subsData.items);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleStatusChange = async (
    gameId: string,
    status: 'published' | 'rejected',
    customReason?: string
  ) => {
    try {
      const reasonToSend =
        status === 'rejected'
          ? (customReason !== undefined ? customReason : rejectReason).trim() ||
            'Submission rejected during administrative review. Please review requirements and update your submission.'
          : 'Admin review completed';

      await apiClient.PATCH('/admin/games/{gameId}/status', {
        params: { path: { gameId } },
        body: { status, reason: reasonToSend },
      });
      setRejectingGame(null);
      setRejectReason('');
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
      const creatorId = (s as any).creatorId;
      const creatorName = (creatorId ? usersMap[creatorId] : '') || '';
      const matchSearch =
        !search ||
        s.title.toLowerCase().includes(q) ||
        creatorName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.genre?.name && s.genre.name.toLowerCase().includes(q));

      return matchSearch;
    });
  }, [submissions, usersMap, search]);

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

      {openMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10 }}
          onClick={() => setOpenMenu(null)}
        />
      )}

      {previewGame && (
        <PreviewModal
          sections={
            (previewGame as any)?.pageTheme?.sections || (previewGame as any)?.theme?.sections || []
          }
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
            const creatorId = (sub as any).creatorId;
            const creatorDisplayName =
              (creatorId ? usersMap[creatorId] : null) ||
              (sub as any).creatorName ||
              'Unknown Creator';

            return (
              <div
                key={sub.id}
                className={`${commonStyles.tableRow} ${commonStyles.tableRowClickable} ${openMenu === sub.id ? commonStyles.tableRowActive : ''}`}
                style={{ gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1fr auto' }}
                onClick={() =>
                  navigate({
                    to: '/admin/submissions/$submissionId',
                    params: { submissionId: sub.id },
                  })
                }
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

                {/* Creator Name */}
                <span
                  className={commonStyles.monoText}
                  style={{ color: '#eeeeee', fontWeight: 600 }}
                >
                  {creatorDisplayName}
                </span>

                {/* Genre */}
                <span className={commonStyles.monoText}>{sub.genre?.name || 'Action'}</span>

                {/* Price */}
                <span className={commonStyles.priceText}>
                  {Number(sub.priceEgp || 0).toFixed(2)}
                </span>

                {/* Status */}
                <div>
                  <GameStatusBadge status={sub.status} />
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    position: 'relative',
                  }}
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
                        onClick={() =>
                          navigate({
                            to: '/admin/submissions/$submissionId',
                            params: { submissionId: sub.id },
                          })
                        }
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
                          setRejectingGame(sub);
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

      {/* In-App Rejection Modal */}
      {rejectingGame && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#161922',
              border: '1px solid rgba(231, 76, 60, 0.4)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 24px rgba(231, 76, 60, 0.15)',
              width: '100%',
              maxWidth: '520px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: '#e74c3c',
              }}
            />

            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  color: '#eeeeee',
                  fontFamily: "'Cinzel', serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <XCircle size={18} style={{ color: '#e74c3c' }} />
                Reject Game Submission
              </h3>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Provide feedback for{' '}
                <strong style={{ color: '#eeeeee' }}>{rejectingGame.title}</strong>. This feedback
                will be displayed directly on the creator&apos;s dashboard card.
              </p>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#8c9aaa',
                  marginBottom: '0.5rem',
                }}
              >
                Reason for Rejection (Visible to Creator)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Build package missing executable, system requirements incomplete, or title needs revision..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f1117',
                  border: '1px solid #282d3b',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className={commonStyles.actionBtn}
                style={{ padding: '0.5rem 1rem' }}
                onClick={() => setRejectingGame(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e74c3c',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
                onClick={() => handleStatusChange(rejectingGame.id, 'rejected')}
              >
                <XCircle size={14} />
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
