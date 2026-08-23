import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Gamepad2,
  Monitor,
  Cpu,
  HardDrive,
  MemoryStick,
  Film,
  Eye,
} from 'lucide-react';
import { GameStatusBadge } from '../components/common/AdminBadges';
import { PreviewModal } from '../../designer-page/components/modals/PreviewModal';
import { Device, DEFAULT_PAGE_SETTINGS } from '../../designer-page/types/designerTypes';
import { apiClient } from '../../../services/api/index';
import type { Game } from '@hathor/contracts';
import styles from '../styles/adminSubmissions.module.css';
import modalStyles from '../styles/adminModals.module.css';

export const Route = createFileRoute('/admin/submissions/$submissionId')({
  component: AdminSubmissionDetail,
});

function AdminSubmissionDetail() {
  const { submissionId } = Route.useParams() as { submissionId: string };
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [specTab, setSpecTab] = useState<'min' | 'rec'>('min');
  const [previewDevice, setPreviewDevice] = useState<Device | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadSubmission = async () => {
    setLoading(true);
    try {
      // First try single game endpoint
      const gameRes = (await apiClient.GET('/admin/games/{gameId}' as any, {
        params: { path: { gameId: submissionId } },
      })) as any;

      if (gameRes.data) {
        setSubmission(gameRes.data);
        return;
      }

      // Fallback to submissions list
      const { data } = await apiClient.GET('/admin/submissions');
      if (data?.items) {
        const found = data.items.find((s: Game) => s.id === submissionId);
        if (found) setSubmission(found);
      }
    } catch (err) {
      console.error('Failed to load submission:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const handleStatusChange = async (status: 'published' | 'rejected') => {
    if (status === 'rejected' && !rejectReason.trim()) {
      alert('Please provide a reason for rejecting this submission.');
      return;
    }

    setActionLoading(true);
    try {
      await apiClient.PATCH('/admin/games/{gameId}/status', {
        params: { path: { gameId: submissionId } },
        body: {
          status,
          reason: status === 'rejected' ? rejectReason.trim() : 'Admin review approved',
        },
      });
      showToast(
        status === 'published' ? 'Game approved and published to catalog!' : 'Submission rejected.'
      );
      setTimeout(() => {
        navigate({ to: '/admin/submissions' });
      }, 800);
    } catch (err) {
      console.error('Failed to update submission status:', err);
      alert('Failed to update submission status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '3rem',
          color: 'var(--text-muted)',
          fontFamily: 'monospace',
          textAlign: 'center',
        }}
      >
        Loading submission details...
      </div>
    );
  }

  if (!submission) {
    return (
      <div
        style={{ padding: '3rem', color: '#e74c3c', fontFamily: 'monospace', textAlign: 'center' }}
      >
        <p>Submission not found: {submissionId}</p>
        <Link
          to="/admin/submissions"
          className={styles.backBtn}
          style={{ marginTop: '1rem', display: 'inline-flex' }}
        >
          <ArrowLeft size={13} /> Back to Submissions
        </Link>
      </div>
    );
  }

  const tags: string[] = (submission as any).tags
    ? (submission as any).tags.map((t: any) => (typeof t === 'string' ? t : t.name || t.slug || ''))
    : [];

  const themeObj = (submission as any).pageTheme || (submission as any).theme || {};
  const sections = themeObj.sections || (Array.isArray(themeObj) ? themeObj : []);
  const pageSettings = themeObj.pageSettings || DEFAULT_PAGE_SETTINGS;

  const sysReqs = (submission as any).systemRequirements || {};
  const minReq = sysReqs.minReq || {};
  const recReq = sysReqs.recReq || {};

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: 1280,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 999999,
            background: '#141820',
            border: '1px solid #4caf80',
            color: '#4caf80',
            padding: '12px 20px',
            borderRadius: 6,
            fontFamily: 'monospace',
            fontSize: 13,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {toast}
        </div>
      )}

      {/* Live Responsive Theme Preview Modal */}
      {previewDevice && (
        <PreviewModal
          sections={sections}
          pageSettings={pageSettings}
          previewDevice={previewDevice}
          setPreviewDevice={setPreviewDevice}
          onClose={() => setPreviewDevice(null)}
        />
      )}

      {/* Back Bar & Quick Actions */}
      <div className={styles.backBar}>
        <Link to="/admin/submissions" className={styles.backBtn}>
          <ArrowLeft size={13} /> Back to Submissions
        </Link>

        <div className={styles.actionButtonGroup}>
          <button
            type="button"
            className={modalStyles.btnSecondary}
            onClick={() => setPreviewDevice('desktop')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--accent-orange)',
            }}
          >
            <Eye size={13} /> Preview Live Page
          </button>

          {submission.status !== 'published' && (
            <>
              <button
                type="button"
                className={modalStyles.btnSuccess}
                onClick={() => handleStatusChange('published')}
                disabled={actionLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <CheckCircle size={13} /> Approve &amp; Publish
              </button>
              <button
                type="button"
                className={modalStyles.btnDanger}
                onClick={() => {
                  if (!rejectReason.trim()) {
                    const reasonInput = prompt('Enter rejection reason for the creator:');
                    if (reasonInput) {
                      setRejectReason(reasonInput);
                      setTimeout(() => handleStatusChange('rejected'), 100);
                    }
                  } else {
                    handleStatusChange('rejected');
                  }
                }}
                disabled={actionLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <XCircle size={13} /> Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Identity Banner */}
      <div className={styles.submissionBanner}>
        <div className={styles.bannerTopGradient} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerIconBox}>
            <Gamepad2 size={24} />
          </div>

          <div className={styles.bannerInfo}>
            <p className={styles.bannerSuperTitle}>Creator Submission Review</p>
            <h2 className={styles.bannerTitle}>{submission.title}</h2>
            <div className={styles.bannerMetaRow}>
              <span>ID: {submission.id.substring(0, 8)}...</span>
              <span>•</span>
              <span>
                {(submission as any).createdAt
                  ? new Date((submission as any).createdAt).toLocaleDateString()
                  : 'Recent'}
              </span>
              <span>•</span>
              <GameStatusBadge status={submission.status} />
            </div>
          </div>

          <div className={styles.bannerPrice}>
            <p className={styles.bannerPriceLabel}>Listing Price</p>
            <p className={styles.bannerPriceValue}>{Number(submission.priceEgp || 0).toFixed(2)}</p>
            <p
              style={{
                margin: 0,
                fontSize: '0.65rem',
                fontFamily: 'monospace',
                color: 'var(--text-muted)',
              }}
            >
              EGP
            </p>
          </div>
        </div>
      </div>

      {/* 3-Column Review Layout */}
      <div className={styles.detailGrid}>
        {/* Col 1: Basic Details & Classification */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className={styles.detailCard}>
            <div className={styles.detailCardHeader}>
              <div className={styles.headerAccent} />
              <h3 className={styles.cardHeaderTitle}>Game Information</h3>
            </div>
            <div className={styles.detailCardBody}>
              <div>
                <p className={modalStyles.fieldLabel}>Short Description</p>
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.75rem',
                    color: 'var(--text-white)',
                    lineHeight: 1.5,
                  }}
                >
                  {submission.shortDescription || 'No description provided.'}
                </div>
              </div>

              {(submission as any).bannerUrl && (
                <div>
                  <p className={modalStyles.fieldLabel}>Banner Image</p>
                  <img
                    src={(submission as any).bannerUrl}
                    alt="Banner"
                    style={{
                      width: '100%',
                      height: 110,
                      objectFit: 'cover',
                      borderRadius: 4,
                      border: '1px solid var(--border-color)',
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.detailCardHeader}>
              <div className={styles.headerAccent} />
              <h3 className={styles.cardHeaderTitle}>Classification &amp; Tags</h3>
            </div>
            <div className={styles.detailCardBody}>
              <div>
                <p className={modalStyles.fieldLabel}>Primary Genre</p>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.35rem 0.75rem',
                    border: '1px solid rgba(253, 112, 20, 0.4)',
                    backgroundColor: 'rgba(253, 112, 20, 0.1)',
                    color: 'var(--accent-orange)',
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {submission.genre?.name || 'Action'}
                </span>
              </div>

              <div>
                <p className={modalStyles.fieldLabel}>Style Tags</p>
                <div className={modalStyles.tagsContainer}>
                  {tags.length === 0 && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      No tags specified
                    </span>
                  )}
                  {tags.map((t) => (
                    <span key={t} className={modalStyles.tagPill}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: System Specifications */}
        <div>
          <div className={styles.detailCard} style={{ height: '100%' }}>
            <div className={styles.detailCardHeader}>
              <div className={styles.headerAccent} />
              <h3 className={styles.cardHeaderTitle}>System Requirements</h3>
            </div>

            <div className={styles.specTabGroup}>
              <button
                type="button"
                className={`${styles.specTab} ${specTab === 'min' ? styles.specTabActive : ''}`}
                onClick={() => setSpecTab('min')}
              >
                Minimum
              </button>
              <button
                type="button"
                className={`${styles.specTab} ${specTab === 'rec' ? styles.specTabActive : ''}`}
                onClick={() => setSpecTab('rec')}
              >
                Recommended
              </button>
            </div>

            <div className={styles.detailCardBody}>
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    marginBottom: '0.35rem',
                  }}
                >
                  <Monitor size={12} style={{ color: 'var(--text-muted)' }} />
                  <p className={modalStyles.fieldLabel} style={{ margin: 0 }}>
                    Supported OS
                  </p>
                </div>
                <div className={styles.hardwareBox}>
                  {specTab === 'min'
                    ? minReq.os || 'Windows 10 (64-bit)'
                    : recReq.os || 'Windows 11 (64-bit)'}
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    marginBottom: '0.35rem',
                  }}
                >
                  <Cpu size={12} style={{ color: 'var(--text-muted)' }} />
                  <p className={modalStyles.fieldLabel} style={{ margin: 0 }}>
                    Processor (CPU)
                  </p>
                </div>
                <div className={styles.hardwareBox}>
                  {specTab === 'min'
                    ? minReq.cpu || 'Intel Core i5 / AMD Ryzen 5'
                    : recReq.cpu || 'Intel Core i7 / AMD Ryzen 7'}
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    marginBottom: '0.35rem',
                  }}
                >
                  <Monitor size={12} style={{ color: 'var(--text-muted)' }} />
                  <p className={modalStyles.fieldLabel} style={{ margin: 0 }}>
                    Graphics Card (GPU)
                  </p>
                </div>
                <div className={styles.hardwareBox}>
                  {specTab === 'min'
                    ? minReq.gpu || 'NVIDIA GTX 1060 / AMD RX 580'
                    : recReq.gpu || 'NVIDIA RTX 3070 / AMD RX 6700 XT'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <MemoryStick size={12} style={{ color: 'var(--text-muted)' }} />
                    <p className={modalStyles.fieldLabel} style={{ margin: 0 }}>
                      RAM
                    </p>
                  </div>
                  <div className={styles.specItemRow}>
                    <span className={styles.specItemValue}>
                      {specTab === 'min' ? minReq.ram || '8 GB' : recReq.ram || '16 GB'}
                    </span>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <HardDrive size={12} style={{ color: 'var(--text-muted)' }} />
                    <p className={modalStyles.fieldLabel} style={{ margin: 0 }}>
                      Storage
                    </p>
                  </div>
                  <div className={styles.specItemRow}>
                    <span className={styles.specItemValue}>
                      {specTab === 'min' ? minReq.storage || '50 GB' : recReq.storage || '50 GB'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Col 3: Interactive Theme Preview & Decision */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className={styles.detailCard}>
            <div className={styles.detailCardHeader}>
              <div className={styles.headerAccent} />
              <h3 className={styles.cardHeaderTitle}>Storefront Theme</h3>
            </div>
            <div className={styles.detailCardBody}>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                This game has a customized designer page layout with {sections.length} active
                sections.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                }}
              >
                <button
                  type="button"
                  className={modalStyles.btnSecondary}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent-orange)',
                  }}
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor size={14} /> Interactive Desktop Theme
                </button>
                <button
                  type="button"
                  className={modalStyles.btnSecondary}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Film size={14} /> Interactive Mobile Theme
                </button>
              </div>
            </div>
          </div>

          {/* Decision Panel */}
          <div className={styles.detailCard}>
            <div className={styles.detailCardHeader}>
              <div className={styles.headerAccent} />
              <h3 className={styles.cardHeaderTitle}>Review Decision</h3>
            </div>
            <div className={styles.detailCardBody}>
              {submission.status !== 'published' ? (
                <>
                  <div>
                    <label className={modalStyles.fieldLabel}>
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      className={modalStyles.textareaField}
                      placeholder="Explain what needs to be resolved before listing..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className={modalStyles.btnSuccess}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      }}
                      onClick={() => handleStatusChange('published')}
                      disabled={actionLoading}
                    >
                      <CheckCircle size={16} /> Approve &amp; Publish
                    </button>
                    <button
                      type="button"
                      className={modalStyles.btnDanger}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      }}
                      onClick={() => handleStatusChange('rejected')}
                      disabled={actionLoading}
                    >
                      <XCircle size={16} /> Reject Submission
                    </button>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    padding: '1rem',
                    background: 'rgba(76, 175, 128, 0.1)',
                    border: '1px solid rgba(76, 175, 128, 0.3)',
                    color: '#4caf80',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                  }}
                >
                  ✓ This game is currently Published and active in the catalog.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
