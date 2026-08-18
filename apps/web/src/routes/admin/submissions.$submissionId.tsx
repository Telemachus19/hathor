import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  ExternalLink,
  Gamepad2,
  Monitor,
  Cpu,
  HardDrive,
  MemoryStick,
  Film,
} from 'lucide-react';
import { GameStatusBadge } from './components/common/AdminBadges';
import { StorePreviewModal } from './components/StorePreviewModal';
import { PreviewModal } from '../designer-page/components/modals/PreviewModal';
import { Device } from '../designer-page/types/designerTypes';
import { apiClient } from '../../services/api/index';
import type { Game } from '@hathor/contracts';
import styles from './styles/adminSubmissions.module.css';
import modalStyles from './styles/adminModals.module.css';

export const Route = createFileRoute('/admin/submissions/$submissionId')({
  component: AdminSubmissionDetail,
});

function AdminSubmissionDetail() {
  const { submissionId } = Route.useParams() as { submissionId: string };
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [specTab, setSpecTab] = useState<'min' | 'rec'>('min');
  const [showStorePreview, setShowStorePreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<Device | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadSubmission = async () => {
    try {
      const { data } = await apiClient.GET('/admin/submissions');
      if (data?.items) {
        const found = data.items.find((s: Game) => s.id === submissionId);
        if (found) setSubmission(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const handleStatusChange = async (status: 'published' | 'rejected') => {
    if (status === 'rejected' && !rejectReason) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      await apiClient.PATCH('/admin/games/{gameId}/status', {
        params: { path: { gameId: submissionId } },
        body: { status, reason: status === 'rejected' ? rejectReason : 'Admin review completed' },
      });
      navigate({ to: '/admin/submissions' });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
        Loading submission details...
      </div>
    );
  }

  if (!submission) {
    return (
      <div style={{ padding: '3rem', color: '#e74c3c', fontFamily: 'monospace' }}>
        Submission not found.
      </div>
    );
  }

  const tags: string[] = (submission as any).tags || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
      {showStorePreview && (
        <StorePreviewModal game={submission} onClose={() => setShowStorePreview(false)} />
      )}

      {previewDevice && (
        <PreviewModal
          sections={(submission.theme as any)?.sections || []}
          pageSettings={
            (submission.theme as any)?.pageSettings || {
              baseTheme: 'dark',
              primaryColor: '#FD7014',
              secondaryColor: '#3B82F6',
              fontFamily: 'Inter',
              buttonStyle: 'rounded',
            }
          }
          previewDevice={previewDevice}
          setPreviewDevice={setPreviewDevice}
          onClose={() => setPreviewDevice(null)}
        />
      )}

      {/* Back Bar */}
      <div className={styles.backBar}>
        <Link to="/admin/submissions" className={styles.backBtn}>
          <ArrowLeft size={13} /> Back to Submissions
        </Link>

        <div className={styles.actionButtonGroup}>
          {submission.status !== 'published' && (
            <>
              <button
                type="button"
                className={modalStyles.btnDanger}
                onClick={() => handleStatusChange('rejected')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <XCircle size={13} /> Reject
              </button>
              <button
                type="button"
                className={modalStyles.btnSuccess}
                onClick={() => handleStatusChange('published')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <CheckCircle size={13} /> Approve &amp; List
              </button>
            </>
          )}
          <button
            type="button"
            className={modalStyles.btnSecondary}
            onClick={() => setShowStorePreview(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-orange)' }}
          >
            <ExternalLink size={13} /> Preview Store Page
          </button>
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
              <span>{(submission as any).createdAt ? new Date((submission as any).createdAt).toLocaleDateString() : 'Recent'}</span>
              <span>•</span>
              <GameStatusBadge status={submission.status} />
            </div>
          </div>

          <div className={styles.bannerPrice}>
            <p className={styles.bannerPriceLabel}>Listing Price</p>
            <p className={styles.bannerPriceValue}>{Number(submission.priceEgp || 0).toFixed(2)}</p>
            <p style={{ margin: 0, fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>EGP</p>
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className={styles.detailGrid}>
        {/* Col 1: Basic Details & Tags */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className={styles.detailCard}>
            <div className={styles.detailCardHeader}>
              <div className={styles.headerAccent} />
              <h3 className={styles.cardHeaderTitle}>Basic Details</h3>
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
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
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

        {/* Col 2: System Specs */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                  <Monitor size={12} style={{ color: 'var(--text-muted)' }} />
                  <p className={modalStyles.fieldLabel} style={{ margin: 0 }}>Supported OS</p>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {['Windows 10', 'Windows 11', 'Ubuntu 22.04'].map((os) => (
                    <span key={os} className={modalStyles.tagPill} style={{ color: 'var(--text-white)' }}>
                      {os}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                  <Cpu size={12} style={{ color: 'var(--text-muted)' }} />
                  <p className={modalStyles.fieldLabel} style={{ margin: 0 }}>Processor (CPU)</p>
                </div>
                <div className={styles.hardwareBox}>
                  {specTab === 'min' ? 'Intel Core i5-8400 / AMD Ryzen 5 2600' : 'Intel Core i7-10700K / AMD Ryzen 7 3700X'}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                  <Monitor size={12} style={{ color: 'var(--text-muted)' }} />
                  <p className={modalStyles.fieldLabel} style={{ margin: 0 }}>Graphics Card (GPU)</p>
                </div>
                <div className={styles.hardwareBox}>
                  {specTab === 'min' ? 'NVIDIA GTX 1060 (6GB) / AMD Radeon RX 580' : 'NVIDIA RTX 3070 (8GB) / AMD Radeon RX 6700 XT'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                    <MemoryStick size={12} style={{ color: 'var(--text-muted)' }} />
                    <p className={modalStyles.fieldLabel} style={{ margin: 0 }}>RAM</p>
                  </div>
                  <div className={styles.specItemRow}>
                    <span className={styles.specItemValue}>{specTab === 'min' ? '8' : '16'}</span>
                    <span className={styles.specItemUnit}>GB</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                    <HardDrive size={12} style={{ color: 'var(--text-muted)' }} />
                    <p className={modalStyles.fieldLabel} style={{ margin: 0 }}>Storage</p>
                  </div>
                  <div className={styles.specItemRow}>
                    <span className={styles.specItemValue}>{specTab === 'min' ? '40' : '60'}</span>
                    <span className={styles.specItemUnit}>GB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Col 3: Media & Decision */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className={styles.detailCard}>
            <div className={styles.detailCardHeader}>
              <div className={styles.headerAccent} />
              <h3 className={styles.cardHeaderTitle}>Store Assets &amp; Media</h3>
            </div>
            <div className={styles.detailCardBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={modalStyles.btnSecondary}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor size={14} /> Interactive Desktop Theme
                </button>
                <button
                  type="button"
                  className={modalStyles.btnSecondary}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
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
              <div>
                <label className={modalStyles.fieldLabel}>Rejection Reason (if rejecting)</label>
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
                  style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={() => handleStatusChange('published')}
                >
                  <CheckCircle size={16} /> Approve &amp; Publish
                </button>
                <button
                  type="button"
                  className={modalStyles.btnDanger}
                  style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={() => handleStatusChange('rejected')}
                >
                  <XCircle size={16} /> Reject Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
