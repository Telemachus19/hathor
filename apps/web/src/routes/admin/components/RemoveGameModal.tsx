import { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import styles from '../styles/adminModals.module.css';
import type { Game } from '@hathor/contracts';

interface RemoveGameModalProps {
  game: Game;
  onClose: () => void;
  onConfirmRemove: (gameId: string) => void;
}

export function RemoveGameModal({ game, onClose, onConfirmRemove }: RemoveGameModalProps) {
  const [typed, setTyped] = useState('');
  const confirmed = typed === game.title;

  const handleRemove = () => {
    if (confirmed) {
      onConfirmRemove(game.id);
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        style={{ borderColor: 'rgba(231, 76, 60, 0.4)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.topStripe} style={{ backgroundColor: '#e74c3c' }} />
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                border: '1px solid rgba(231, 76, 60, 0.3)',
                color: '#e74c3c',
              }}
            >
              <Trash2 size={15} />
            </div>
            <div>
              <p className={styles.modalSubtitle}>Critical Action</p>
              <h3 className={styles.modalTitle}>Remove Game from Store</h3>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.warningBox}>
            <AlertTriangle size={16} style={{ color: '#e74c3c', flexShrink: 0, marginTop: 2 }} />
            <div>
              Removing <strong style={{ color: '#ffffff' }}>{game.title}</strong> will immediately
              delist it from the store catalog. Existing owners will retain access in their library.
            </div>
          </div>

          <div>
            <label className={styles.fieldLabel}>
              Type <strong style={{ color: '#ffffff' }}>{game.title}</strong> to confirm
            </label>
            <input
              type="text"
              className={styles.inputField}
              placeholder={game.title}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnDanger}
            disabled={!confirmed}
            onClick={handleRemove}
          >
            Confirm Removal
          </button>
        </div>
      </div>
    </div>
  );
}
