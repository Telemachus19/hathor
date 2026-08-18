import { useState } from 'react';
import { X, AlertTriangle, UserCheck } from 'lucide-react';
import styles from '../styles/adminModals.module.css';
import { UserStatusBadge, RoleBadge } from './common/AdminBadges';
import type { User } from '@hathor/contracts';

export type UserModalAction = 'view' | 'temp_ban' | 'perma_ban' | 'activate';

interface UserActionModalProps {
  user: User;
  action: UserModalAction;
  onClose: () => void;
  onConfirmStatus: (userId: string, status: 'active' | 'suspended' | 'banned', reason?: string, days?: number) => void;
}

export function UserActionModal({ user, action, onClose, onConfirmStatus }: UserActionModalProps) {
  const [reason, setReason] = useState('');
  const [days, setDays] = useState(7);

  const isDestructive = action === 'perma_ban' || action === 'temp_ban';
  const roleDisplay = user.roles.includes('admin') ? 'admin' : user.roles.includes('creator') ? 'creator' : 'user';

  if (action === 'view') {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.topStripe} />
          <div className={styles.modalHeader}>
            <div>
              <p className={styles.modalSubtitle}>User Details</p>
              <h3 className={styles.modalTitle}>{user.displayName}</h3>
            </div>
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              <X size={14} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.userHighlightCard}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--accent-orange)',
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 900,
                  fontSize: '0.9rem',
                }}
              >
                {user.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '0.9rem' }}>
                  {user.displayName}
                </p>
                <p style={{ margin: '0.15rem 0 0.35rem 0', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {user.email}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <UserStatusBadge status={user.status} />
                  <RoleBadge role={roleDisplay} />
                </div>
              </div>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <p className={styles.fieldLabel}>User ID</p>
                <p style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{user.id}</p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.fieldLabel}>Joined Date</p>
                <p style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.fieldLabel}>Last Active</p>
                <p style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.fieldLabel}>Roles Assigned</p>
                <p style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  {user.roles.join(', ') || 'user'}
                </p>
              </div>
            </div>
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

  const titles: Record<string, string> = {
    temp_ban: 'Temporary Ban',
    perma_ban: 'Permanent Ban',
    activate: 'Restore Account',
  };

  const descriptions: Record<string, string> = {
    temp_ban: `Temporarily suspend ${user.displayName}'s account and revoke access.`,
    perma_ban: `Permanently ban ${user.displayName}. This blocks authentication completely.`,
    activate: `Restore ${user.displayName}'s account access and lift all suspensions.`,
  };

  const handleConfirm = () => {
    if (action === 'temp_ban') {
      onConfirmStatus(user.id, 'suspended', reason, days);
    } else if (action === 'perma_ban') {
      onConfirmStatus(user.id, 'banned', reason);
    } else if (action === 'activate') {
      onConfirmStatus(user.id, 'active');
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        style={{ borderColor: isDestructive ? 'rgba(231, 76, 60, 0.4)' : 'rgba(76, 175, 128, 0.4)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={styles.topStripe}
          style={{ backgroundColor: isDestructive ? '#e74c3c' : '#4caf80' }}
        />
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDestructive ? 'rgba(231, 76, 60, 0.1)' : 'rgba(76, 175, 128, 0.1)',
                border: `1px solid ${isDestructive ? 'rgba(231, 76, 60, 0.3)' : 'rgba(76, 175, 128, 0.3)'}`,
                color: isDestructive ? '#e74c3c' : '#4caf80',
              }}
            >
              {isDestructive ? <AlertTriangle size={15} /> : <UserCheck size={15} />}
            </div>
            <div>
              <p className={styles.modalSubtitle}>User Moderation</p>
              <h3 className={styles.modalTitle}>{titles[action]}</h3>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {descriptions[action]}
          </p>

          <div className={styles.userHighlightCard}>
            <div
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)',
                color: 'var(--accent-orange)',
                fontFamily: "'Cinzel', serif",
                fontWeight: 900,
                fontSize: '0.75rem',
              }}
            >
              {user.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '0.8rem' }}>
                {user.displayName}
              </p>
              <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {user.email}
              </p>
            </div>
          </div>

          {action === 'temp_ban' && (
            <div>
              <label className={styles.fieldLabel}>Duration (days)</label>
              <div className={styles.durationGrid}>
                {[1, 3, 7, 14, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`${styles.durationBtn} ${days === d ? styles.durationBtnActive : ''}`}
                    onClick={() => setDays(d)}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          )}

          {isDestructive && (
            <div>
              <label className={styles.fieldLabel}>Reason for moderation</label>
              <textarea
                className={styles.textareaField}
                placeholder="Explain the reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={isDestructive ? styles.btnDanger : styles.btnSuccess}
            onClick={handleConfirm}
          >
            {action === 'temp_ban' ? `Suspend for ${days}d` : action === 'perma_ban' ? 'Perma Ban' : 'Restore Access'}
          </button>
        </div>
      </div>
    </div>
  );
}
