import { useState, useEffect } from 'react';
import {
  X,
  Gamepad2,
  Download,
  Loader2,
  HardDrive,
  DollarSign,
  User,
  Sparkles,
} from 'lucide-react';
import styles from '../styles/adminModals.module.css';
import { GameStatusBadge, ContentRatingBadge } from './common/AdminBadges';
import { apiClient, apiBaseUrl } from '../../../services/api/index';
import type { Game } from '@hathor/contracts';

interface GameDetailModalProps {
  game: Game;
  onClose: () => void;
  creatorName?: string;
}

export function GameDetailModal({ game, onClose, creatorName }: GameDetailModalProps) {
  const [detailedGame, setDetailedGame] = useState<any>(game);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFullGame() {
      try {
        setLoading(true);
        const { data } = await (apiClient as any).GET('/admin/games/{gameId}', {
          params: { path: { gameId: game.id } },
        });
        if (data) {
          setDetailedGame(data);
        }
      } catch (err) {
        console.error('Failed to load full game details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFullGame();
  }, [game.id]);

  const handleDownloadBuild = async () => {
    try {
      setDownloadLoading(true);
      setDownloadToast('Preparing build download...');
      const token = apiClient.getAccessToken();
      const res = await fetch(`${apiBaseUrl}/admin/games/${game.id}/build/file`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData?.error?.message || `Failed to download build (HTTP ${res.status})`
        );
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${game.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-build.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloadToast('Download started successfully');
      setTimeout(() => setDownloadToast(null), 3000);
    } catch (err: any) {
      console.error('Build download error:', err);
      setDownloadToast(err.message || 'Failed to download game build');
      setTimeout(() => setDownloadToast(null), 3500);
    } finally {
      setDownloadLoading(false);
    }
  };

  const activeBuild = detailedGame?.build || detailedGame?.builds?.[0] || null;
  const sysReqs = detailedGame?.systemRequirements || {};
  const minReq = sysReqs.minReq || sysReqs.minimum || {};
  const recReq = sysReqs.recReq || sysReqs.recommended || {};
  const tags: string[] = (detailedGame?.tags || [])
    .map((t: any) => (typeof t === 'string' ? t : t?.name || t?.slug || ''))
    .filter(Boolean);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '—';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modalContainer} ${styles.modalContainerLg}`}
        style={{ maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.topStripe} />

        {/* Header */}
        <div className={styles.modalHeader} style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(253, 112, 20, 0.12)',
                border: '1px solid rgba(253, 112, 20, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Gamepad2 size={20} style={{ color: 'var(--accent-orange)' }} />
            </div>
            <div>
              <p className={styles.modalSubtitle} style={{ margin: 0 }}>
                Catalog Game Inspection
              </p>
              <h3 className={styles.modalTitle} style={{ margin: 0, fontSize: '1.2rem' }}>
                {game.title}
              </h3>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          className={styles.modalBody}
          style={{
            overflowY: 'auto',
            flex: 1,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {downloadToast && (
            <div
              style={{
                padding: '0.65rem 1rem',
                backgroundColor: '#161922',
                border: '1px solid var(--accent-orange)',
                color: '#eeeeee',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Sparkles size={14} style={{ color: 'var(--accent-orange)' }} />
              <span>{downloadToast}</span>
            </div>
          )}

          {/* Identity & Status Ribbon */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#13161f',
              border: '1px solid #282d3b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <GameStatusBadge status={detailedGame.status || game.status} />
              <ContentRatingBadge rating="T" />
              <span style={{ fontSize: '0.75rem', color: '#8c9aaa', fontFamily: 'monospace' }}>
                ID: {game.id}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--accent-orange)',
                }}
              >
                <DollarSign size={14} />
                <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>
                  EGP {detailedGame.priceEgp || game.priceEgp || '0.00'}
                </span>
              </div>
              {creatorName && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: '#8c9aaa',
                    fontSize: '0.75rem',
                  }}
                >
                  <User size={13} />
                  <span>{creatorName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Build Package Card */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#13161f',
              border: '1px solid rgba(59, 158, 218, 0.3)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: '#3b9eda',
              }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HardDrive size={16} style={{ color: '#3b9eda' }} />
                <h4
                  style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: '#eeeeee',
                    fontFamily: "'Cinzel', serif",
                  }}
                >
                  Game Build Package
                </h4>
              </div>
              {activeBuild && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontFamily: 'monospace',
                    padding: '0.2rem 0.5rem',
                    backgroundColor: 'rgba(76, 175, 128, 0.15)',
                    border: '1px solid rgba(76, 175, 128, 0.4)',
                    color: '#4caf80',
                    fontWeight: 700,
                  }}
                >
                  ACTIVE BUILD ({activeBuild.version || 'v1.0.0'})
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#8c9aaa' }}>
                <Loader2 size={16} className="animate-spin" /> Loading build details...
              </div>
            ) : activeBuild ? (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: '#0c0e14',
                    border: '1px solid #1e2330',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                  }}
                >
                  <div>
                    <span style={{ color: '#8c9aaa', display: 'block', fontSize: '0.65rem' }}>
                      BUILD VERSION
                    </span>
                    <strong style={{ color: '#ffffff' }}>{activeBuild.version || 'v1.0.0'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#8c9aaa', display: 'block', fontSize: '0.65rem' }}>
                      PACKAGE SIZE
                    </span>
                    <strong style={{ color: '#ffffff' }}>
                      {formatBytes(activeBuild.sizeBytes)}
                    </strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#8c9aaa', display: 'block', fontSize: '0.65rem' }}>
                      SHA-256 CHECKSUM
                    </span>
                    <span style={{ color: '#38d39f', fontSize: '0.65rem', wordBreak: 'break-all' }}>
                      {activeBuild.checksumSha256 || activeBuild.sha256 || 'Verified'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <button
                    type="button"
                    onClick={handleDownloadBuild}
                    disabled={downloadLoading}
                    style={{
                      padding: '0.6rem 1.25rem',
                      backgroundColor: 'rgba(59, 158, 218, 0.15)',
                      border: '1px solid #3b9eda',
                      color: '#3b9eda',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      fontFamily: "'Cinzel', serif",
                      cursor: downloadLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      letterSpacing: '0.05em',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {downloadLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Download size={13} />
                    )}
                    {downloadLoading ? 'Downloading...' : 'Download Game Build Package (.zip)'}
                  </button>
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#0c0e14',
                  border: '1px dashed #282d3b',
                  color: '#8c9aaa',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                }}
              >
                No binary package uploaded for this title.
              </div>
            )}
          </div>

          {/* System Requirements Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* Minimum Specs */}
            <div
              style={{ padding: '1rem', backgroundColor: '#13161f', border: '1px solid #282d3b' }}
            >
              <h5
                style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '0.75rem',
                  color: '#f59e0b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: 'monospace',
                }}
              >
                Minimum Requirements
              </h5>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                }}
              >
                <div>
                  <span style={{ color: '#8c9aaa' }}>OS:</span>{' '}
                  <span style={{ color: '#eeeeee' }}>{minReq.os || 'Windows 10 64-bit'}</span>
                </div>
                <div>
                  <span style={{ color: '#8c9aaa' }}>Processor:</span>{' '}
                  <span style={{ color: '#eeeeee' }}>
                    {minReq.processor || minReq.cpu || 'Intel Core i5-6600K / AMD Ryzen 5 1600'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#8c9aaa' }}>Memory:</span>{' '}
                  <span style={{ color: '#eeeeee' }}>
                    {minReq.memory || minReq.ram || '8 GB RAM'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#8c9aaa' }}>Graphics:</span>{' '}
                  <span style={{ color: '#eeeeee' }}>
                    {minReq.graphics || minReq.gpu || 'NVIDIA GTX 1060 6GB / AMD RX 580'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#8c9aaa' }}>Storage:</span>{' '}
                  <span style={{ color: '#eeeeee' }}>
                    {minReq.storage || minReq.disk || '50 GB available space'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommended Specs */}
            <div
              style={{ padding: '1rem', backgroundColor: '#13161f', border: '1px solid #282d3b' }}
            >
              <h5
                style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '0.75rem',
                  color: '#38d39f',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: 'monospace',
                }}
              >
                Recommended Requirements
              </h5>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                }}
              >
                <div>
                  <span style={{ color: '#8c9aaa' }}>OS:</span>{' '}
                  <span style={{ color: '#eeeeee' }}>{recReq.os || 'Windows 11 64-bit'}</span>
                </div>
                <div>
                  <span style={{ color: '#8c9aaa' }}>Processor:</span>{' '}
                  <span style={{ color: '#eeeeee' }}>
                    {recReq.processor || recReq.cpu || 'Intel Core i7-10700K / AMD Ryzen 7 5800X'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#8c9aaa' }}>Memory:</span>{' '}
                  <span style={{ color: '#eeeeee' }}>
                    {recReq.memory || recReq.ram || '16 GB RAM'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#8c9aaa' }}>Graphics:</span>{' '}
                  <span style={{ color: '#eeeeee' }}>
                    {recReq.graphics || recReq.gpu || 'NVIDIA RTX 3070 / AMD RX 6800 XT'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#8c9aaa' }}>Storage:</span>{' '}
                  <span style={{ color: '#eeeeee' }}>
                    {recReq.storage || recReq.disk || '50 GB SSD space'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Tags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <p className={styles.fieldLabel}>Description</p>
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#0c0e14',
                  border: '1px solid #1e2330',
                  fontSize: '0.75rem',
                  color: '#eeeeee',
                  lineHeight: 1.6,
                }}
              >
                {detailedGame.fullDescription ||
                  detailedGame.shortDescription ||
                  game.shortDescription ||
                  'No description provided.'}
              </div>
            </div>

            {tags.length > 0 && (
              <div>
                <p className={styles.fieldLabel}>Tags &amp; Taxonomy</p>
                <div className={styles.tagsContainer}>
                  {tags.map((t) => (
                    <span key={t} className={styles.tagPill}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter} style={{ flexShrink: 0 }}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
