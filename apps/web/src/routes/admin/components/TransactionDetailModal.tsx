import { useState } from 'react';
import { X, DollarSign, Copy, Check, User as UserIcon, Calendar, Hash, Shield } from 'lucide-react';
import styles from '../styles/adminModals.module.css';
import commonStyles from '../styles/adminCommon.module.css';
import type { Order, User } from '@hathor/contracts';

interface TransactionDetailModalProps {
  transaction: Order;
  user?: User | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export function TransactionDetailModal({
  transaction,
  user,
  onClose,
  onShowToast,
}: TransactionDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    onShowToast(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const dateStr = (transaction as any).createdAt
    ? new Date((transaction as any).createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Unknown';

  let statusBadgeClass = commonStyles.badgeSuccess;
  if (transaction.status === 'payment_pending') statusBadgeClass = commonStyles.badgeWarning;
  else if (transaction.status === 'payment_failed') statusBadgeClass = commonStyles.badgeDanger;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modalContainer} ${styles.modalContainerLg}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.topStripe} style={{ backgroundColor: '#4caf80' }} />

        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.modalSubtitle}>TRANSACTION DETAILS</p>
            <h3 className={styles.modalTitle}>Order #{transaction.id.substring(0, 8)}</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className={styles.modalBody} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Swatch & Amount Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              backgroundColor: '#1c2028',
              border: '1px solid #393e46',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(76, 175, 128, 0.12)',
                  border: '1px solid rgba(76, 175, 128, 0.3)',
                  color: '#4caf80',
                }}
              >
                <DollarSign size={22} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#8c9aaa', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
                  TOTAL AMOUNT
                </p>
                <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#4caf80', fontFamily: 'monospace' }}>
                  EGP {Number(transaction.totalAmountEgp || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <span className={`${commonStyles.badge} ${statusBadgeClass}`} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                <span className={commonStyles.badgeDot} />
                {transaction.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Identification & UUIDs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p className={styles.fieldLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Hash size={12} style={{ color: '#fd7014' }} /> SYSTEM IDENTIFIERS
            </p>

            <div className={styles.infoGrid} style={{ gridTemplateColumns: '1fr' }}>
              {/* Transaction ID */}
              <div className={styles.infoItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className={styles.fieldLabel}>Transaction ID</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace', color: '#eeeeee', wordBreak: 'break-all' }}>
                    {transaction.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(transaction.id, 'Transaction ID')}
                  className={commonStyles.actionBtn}
                  style={{ marginLeft: '0.75rem', flexShrink: 0 }}
                  title="Copy Transaction ID"
                >
                  {copiedField === 'Transaction ID' ? <Check size={13} style={{ color: '#4caf80' }} /> : <Copy size={13} />}
                </button>
              </div>

              {/* User ID */}
              <div className={styles.infoItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className={styles.fieldLabel}>User / Customer ID</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace', color: '#eeeeee', wordBreak: 'break-all' }}>
                    {(transaction as any).userId || 'Anonymous / Unassigned'}
                  </p>
                </div>
                {(transaction as any).userId && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard((transaction as any).userId, 'User ID')}
                    className={commonStyles.actionBtn}
                    style={{ marginLeft: '0.75rem', flexShrink: 0 }}
                    title="Copy User ID"
                  >
                    {copiedField === 'User ID' ? <Check size={13} style={{ color: '#4caf80' }} /> : <Copy size={13} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p className={styles.fieldLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <UserIcon size={12} style={{ color: '#fd7014' }} /> CUSTOMER PROFILE
            </p>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <p className={styles.fieldLabel}>Customer Name</p>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#eeeeee' }}>
                  {user?.displayName || 'Unregistered Customer'}
                </p>
              </div>

              <div className={styles.infoItem}>
                <p className={styles.fieldLabel}>Email Address</p>
                <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace', color: '#eeeeee' }}>
                  {user?.email || 'N/A'}
                </p>
              </div>

              <div className={styles.infoItem}>
                <p className={styles.fieldLabel}>User Roles</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#fd7014', fontWeight: 700 }}>
                  {user?.roles?.length ? user.roles.join(', ').toUpperCase() : 'GAMER'}
                </p>
              </div>

              <div className={styles.infoItem}>
                <p className={styles.fieldLabel}>Account Status</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: user?.status === 'banned' ? '#e74c3c' : '#4caf80', fontWeight: 700 }}>
                  {user?.status ? user.status.toUpperCase() : 'ACTIVE'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment & Audit Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p className={styles.fieldLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield size={12} style={{ color: '#fd7014' }} /> SETTLEMENT & TIMING
            </p>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <p className={styles.fieldLabel}>Payment Method</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#eeeeee', textTransform: 'capitalize' }}>
                  {(transaction as any).paymentMethod || 'Credit / Debit Card'}
                </p>
              </div>

              <div className={styles.infoItem}>
                <p className={styles.fieldLabel}>Payment Reference</p>
                <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace', color: '#eeeeee' }}>
                  {(transaction as any).paymentReference || 'N/A'}
                </p>
              </div>

              <div className={styles.infoItem}>
                <p className={styles.fieldLabel}>Currency</p>
                <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace', color: '#eeeeee' }}>
                  {(transaction as any).currency || 'EGP'}
                </p>
              </div>

              <div className={styles.infoItem}>
                <p className={styles.fieldLabel}>Timestamp</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={11} style={{ color: '#8c9aaa' }} />
                  <p style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace', color: '#eeeeee' }}>
                    {dateStr}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => {
              const summary = `Order ID: ${transaction.id}\nUser ID: ${(transaction as any).userId || 'N/A'}\nCustomer: ${user?.displayName || user?.email || 'N/A'}\nAmount: EGP ${Number(transaction.totalAmountEgp || 0).toFixed(2)}\nStatus: ${transaction.status}\nDate: ${dateStr}`;
              copyToClipboard(summary, 'Transaction Summary');
            }}
          >
            Copy Summary
          </button>
        </div>
      </div>
    </div>
  );
}
