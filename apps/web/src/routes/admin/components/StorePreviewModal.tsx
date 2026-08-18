import { X, ExternalLink } from 'lucide-react';
import styles from '../styles/adminModals.module.css';
import type { Game } from '@hathor/contracts';

interface StorePreviewModalProps {
  game: Game;
  onClose: () => void;
}

export function StorePreviewModal({ game, onClose }: StorePreviewModalProps) {
  const tags: string[] = (game as any).tags || [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modalContainer} ${styles.modalContainerXl}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.topStripe} />
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.modalSubtitle}>Store Page Preview</p>
            <h3 className={styles.modalTitle}>{game.title}</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className={styles.modalBody} style={{ padding: 0 }}>
          {/* Faux Hero */}
          <div
            style={{
              padding: '2.5rem 2rem',
              background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d1a1a 100%)',
              textAlign: 'center',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '0.2rem 0.6rem',
                border: '1px solid rgba(253, 112, 20, 0.4)',
                backgroundColor: 'rgba(253, 112, 20, 0.1)',
                color: 'var(--accent-orange)',
                fontSize: '0.6rem',
                fontFamily: 'monospace',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              {game.genre?.name || 'Action'}
            </span>
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '1.75rem',
                color: '#ffffff',
                margin: 0,
              }}
            >
              {game.title}
            </h2>
          </div>

          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className={styles.warningBox} style={{ borderColor: 'rgba(253, 112, 20, 0.3)', backgroundColor: 'rgba(253, 112, 20, 0.05)', color: 'var(--accent-orange)' }}>
              <ExternalLink size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                This is a metadata preview for review. The full interactive storefront is styled and compiled via the Page Designer engine.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <p className={styles.fieldLabel}>About This Game</p>
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.75rem',
                      lineHeight: 1.5,
                      color: 'var(--text-white)',
                    }}
                  >
                    {game.shortDescription || 'No description provided.'}
                  </div>
                </div>

                <div>
                  <p className={styles.fieldLabel}>Tags</p>
                  <div className={styles.tagsContainer}>
                    {tags.map((t) => (
                      <span key={t} className={styles.tagPill}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <p className={styles.fieldLabel}>Listing Price</p>
                  <p
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      color: 'var(--accent-orange)',
                      margin: 0,
                    }}
                  >
                    EGP {game.priceEgp || '0.00'}
                  </p>
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: 'var(--accent-orange)',
                      color: '#222831',
                      textAlign: 'center',
                      fontFamily: "'Cinzel', serif",
                      fontWeight: 900,
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Store Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
