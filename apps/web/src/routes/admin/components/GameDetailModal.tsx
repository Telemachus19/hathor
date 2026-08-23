import { X, Gamepad2 } from 'lucide-react';
import styles from '../styles/adminModals.module.css';
import { GameStatusBadge, ContentRatingBadge } from './common/AdminBadges';
import type { Game } from '@hathor/contracts';

interface GameDetailModalProps {
  game: Game;
  onClose: () => void;
}

export function GameDetailModal({ game, onClose }: GameDetailModalProps) {
  const tags: string[] = (game as any).tags || [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modalContainer} ${styles.modalContainerLg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.topStripe} />
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.modalSubtitle}>Game Details</p>
            <h3 className={styles.modalTitle}>{game.title}</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Header swatch */}
          <div
            style={{
              height: 70,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(253, 112, 20, 0.08)',
              border: '1px solid rgba(253, 112, 20, 0.2)',
            }}
          >
            <Gamepad2 size={24} style={{ color: 'var(--accent-orange)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <GameStatusBadge status={game.status} />
            <ContentRatingBadge rating={'T'} />
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <p className={styles.fieldLabel}>Game ID</p>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                {game.id}
              </p>
            </div>
            <div className={styles.infoItem}>
              <p className={styles.fieldLabel}>Genre</p>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700 }}>
                {game.genre?.name || 'Unassigned'}
              </p>
            </div>
            <div className={styles.infoItem}>
              <p className={styles.fieldLabel}>Price</p>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: 'var(--accent-orange)',
                }}
              >
                EGP {game.priceEgp || '0.00'}
              </p>
            </div>
            <div className={styles.infoItem}>
              <p className={styles.fieldLabel}>Created At</p>
              <p style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                {(game as any).createdAt
                  ? new Date((game as any).createdAt).toLocaleDateString()
                  : 'Unknown'}
              </p>
            </div>
          </div>

          {game.shortDescription && (
            <div>
              <p className={styles.fieldLabel}>Description</p>
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.75rem',
                  color: 'var(--text-white)',
                  lineHeight: 1.5,
                }}
              >
                {game.shortDescription}
              </div>
            </div>
          )}

          {tags.length > 0 && (
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
          )}
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
