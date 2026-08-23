import { useState } from 'react';
import { X, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import styles from '../styles/adminModals.module.css';
import type { Game } from '@hathor/contracts';

interface SuspendGameModalProps {
  game: Game;
  onClose: () => void;
  onConfirmSuspend: (gameId: string) => Promise<void> | void;
}

export function SuspendGameModal({ game, onClose, onConfirmSuspend }: SuspendGameModalProps) {
  const [typed, setTyped] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const confirmed = typed.trim().toLowerCase() === game.title.trim().toLowerCase();

  const handleSuspend = async () => {
    if (confirmed && !isSubmitting) {
      try {
        setIsSubmitting(true);
        await onConfirmSuspend(game.id);
        onClose();
      } catch (err) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.topStripe} style={{ backgroundColor: '#f59e0b' }} />
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                color: '#f59e0b',
              }}
            >
              <EyeOff size={16} />
            </div>
            <div>
              <p className={styles.modalSubtitle} style={{ color: '#f59e0b' }}>
                Store Catalog Moderation
              </p>
              <h3 className={styles.modalTitle}>Suspend Game from Store</h3>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              fontSize: '0.75rem',
              color: '#d1d5db',
              lineHeight: 1.5,
            }}
          >
            <AlertCircle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
            <div>
              Suspending <strong style={{ color: '#ffffff' }}>{game.title}</strong> will immediately
              delist it from the store catalog so new users cannot purchase it. Existing license
              owners will continue to have full access in their library.
            </div>
          </div>

          <div>
            <label className={styles.fieldLabel}>
              Type <strong style={{ color: '#ffffff' }}>{game.title}</strong> to confirm suspension:
            </label>
            <input
              type="text"
              className={styles.inputField}
              placeholder={game.title}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnWarning || styles.btnDanger}
            style={{
              backgroundColor: confirmed ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)',
              color: '#0e1116',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: confirmed && !isSubmitting ? 'pointer' : 'not-allowed',
            }}
            disabled={!confirmed || isSubmitting}
            onClick={handleSuspend}
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <EyeOff size={13} />}
            {isSubmitting ? 'Suspending...' : 'Suspend Game'}
          </button>
        </div>
      </div>
    </div>
  );
}
