import React from 'react';
import {
  X,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileArchive,
  RefreshCw,
} from 'lucide-react';
import { useDownload } from '../context/DownloadContext';
import styles from '../styles/DownloadDrawer.module.css';

export const DownloadDrawer: React.FC = () => {
  const {
    gameId,
    gameTitle,
    status,
    progress,
    error,
    computedSha256,
    expectedSha256,
    isOpen,
    fileName,
    fileSize,
    startDownload,
    closeDrawer,
    resetDownload,
  } = useDownload();

  if (!isOpen) return null;

  const isIdle = status === 'idle';
  const isAuthorizing = status === 'authorizing';
  const isDownloading = status === 'downloading';
  const isVerifying = status === 'verifying';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const handleOverlayClick = () => {
    // Prevent closing if downloading or verifying
    if (isDownloading || isVerifying || isAuthorizing) return;
    closeDrawer();
  };

  const handleRetry = () => {
    if (gameId && gameTitle) {
      startDownload(gameId, gameTitle);
    }
  };

  const handleClose = () => {
    closeDrawer();
    if (isSuccess || isError) {
      resetDownload();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.headerTitle}>
            <ShieldCheck size={18} style={{ color: 'var(--accent-cyan, #00d2c4)' }} />
            Vault Download
          </h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isDownloading || isVerifying || isAuthorizing}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Game File Information */}
          <div className={styles.gameInfo}>
            <span className={styles.titleLabel}>Target Title</span>
            <h4 className={styles.gameTitle}>{gameTitle}</h4>
            <div className={styles.fileMeta}>
              {fileName && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <FileArchive size={11} /> {fileName}
                </span>
              )}
              {fileSize && <span>· Size: {fileSize}</span>}
            </div>
          </div>

          {/* Status Display */}
          <div className={styles.statusContainer}>
            {/* Authorizing State */}
            {isAuthorizing && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '1.5rem 0',
                  gap: '1rem',
                }}
              >
                <Loader2 className="animate-spin" size={32} style={{ color: '#f26b21' }} />
                <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  Verifying Entitlements &<br />Generating Signed R2 Token...
                </div>
              </div>
            )}

            {/* Downloading State */}
            {isDownloading && (
              <>
                <div className={styles.statusHeader}>
                  <span className={styles.statusText} style={{ color: '#f26b21' }}>
                    <Loader2 className="animate-spin" size={12} />
                    Downloading Build...
                  </span>
                  <span className={styles.progressPercent}>{progress}%</span>
                </div>
                <div className={styles.progressBarTrack}>
                  <div
                    className={`${styles.progressBarFill} ${styles.progressPulse}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            )}

            {/* Verifying State */}
            {isVerifying && (
              <>
                <div className={styles.statusHeader}>
                  <span className={styles.statusText} style={{ color: '#00d2c4' }}>
                    <RefreshCw className="animate-spin" size={12} />
                    Verifying SHA-256 Checksum...
                  </span>
                  <span className={styles.progressPercent} style={{ color: '#00d2c4' }}>
                    100%
                  </span>
                </div>
                <div className={styles.progressBarTrack}>
                  <div
                    className={styles.progressBarFill}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(90deg, #00d2c4, #00fff0)',
                      boxShadow: '0 0 8px rgba(0, 210, 196, 0.5)',
                    }}
                  />
                </div>
              </>
            )}

            {/* Success State */}
            {isSuccess && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0',
                }}
              >
                <CheckCircle2 size={36} style={{ color: '#38d39f' }} />
                <span
                  style={{
                    color: '#38d39f',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                  }}
                >
                  INTEGRITY VERIFIED ✓
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted, #8b93a2)',
                    textAlign: 'center',
                  }}
                >
                  SHA-256 verification succeeded. Game package downloaded successfully.
                </span>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className={styles.errorBox}>
                <div className={styles.errorTitle}>
                  <AlertTriangle size={14} />
                  Download Failed
                </div>
                <div className={styles.errorMsg}>{error}</div>
              </div>
            )}
          </div>

          {/* SHA-256 Checksum Information */}
          {(expectedSha256 || computedSha256) && (
            <div className={styles.verificationSection}>
              {expectedSha256 && (
                <div className={styles.checksumGroup}>
                  <span className={styles.hashLabel}>Expected Build SHA-256</span>
                  <span className={styles.hashValue}>{expectedSha256}</span>
                </div>
              )}

              {computedSha256 && (
                <div className={styles.checksumGroup}>
                  <span className={styles.hashLabel}>Calculated Download SHA-256</span>
                  <span
                    className={`${styles.hashValue} ${isSuccess ? styles.hashSuccess : ''}`}
                  >
                    {computedSha256}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {isSuccess && (
            <button type="button" className={`${styles.actionButton} ${styles.btnPrimary}`} onClick={handleClose}>
              Done
            </button>
          )}

          {isError && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className={`${styles.actionButton} ${styles.btnSecondary}`}
                style={{ flex: 1 }}
                onClick={handleClose}
              >
                Close
              </button>
              <button
                type="button"
                className={`${styles.actionButton} ${styles.btnPrimary}`}
                style={{ flex: 1 }}
                onClick={handleRetry}
              >
                Retry
              </button>
            </div>
          )}

          {(isAuthorizing || isDownloading || isVerifying) && (
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.65rem',
                color: 'var(--text-subtle, #565e6d)',
                textAlign: 'center',
              }}
            >
              Please keep this tab open during the download process.
            </span>
          )}

          {isIdle && (
            <button type="button" className={`${styles.actionButton} ${styles.btnSecondary}`} onClick={handleClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadDrawer;
