import { useState } from 'react';
import {
  X,
  ShieldAlert,
  Copy,
  Check,
  Calendar,
  Hash,
  FileText,
  Code,
  User,
  Tag as TagIcon,
  Gamepad2,
  Layers,
} from 'lucide-react';
import styles from '../styles/adminModals.module.css';
import commonStyles from '../styles/adminCommon.module.css';
import type { CatalogAuditLog } from '@hathor/contracts';

interface AuditDetailModalProps {
  log: CatalogAuditLog;
  actorName?: string;
  targetName?: string;
  actionColor: string;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export function generateAuditHeadline(log: CatalogAuditLog, targetName?: string): string {
  const details = log.details as any;
  const action = log.action.toLowerCase();
  const rawName = details?.name || details?.title || details?.gameTitle;
  const name = rawName || (targetName ? targetName.replace(/^[A-Z]+:\s*/i, '') : '');

  if (details?.change) return String(details.change);

  if (action === 'create_genre')
    return `Genre "${name || 'New Genre'}" was created${details?.slug ? ` with slug /${details.slug}` : ''}.`;
  if (action === 'update_genre')
    return `Genre "${name || 'Genre'}" was updated${details?.slug ? ` (slug: /${details.slug})` : ''}.`;
  if (action === 'delete_genre') return `Genre "${name || 'Genre'}" was permanently deleted.`;

  if (action === 'create_tag')
    return `Tag "${name || 'New Tag'}" was created${details?.slug ? ` with slug #${details.slug}` : ''}.`;
  if (action === 'update_tag')
    return `Tag "${name || 'Tag'}" was updated${details?.slug ? ` (slug: #${details.slug})` : ''}.`;
  if (action === 'delete_tag') return `Tag "${name || 'Tag'}" was permanently deleted.`;

  if (action === 'update_game_status' || action === 'game_status_change') {
    return `Game "${name || 'Game'}" status changed to ${details?.status || 'updated'}${details?.reason ? ` (Reason: ${details.reason})` : ''}.`;
  }
  if (action === 'create_game') return `Game "${name || 'New Game'}" was registered.`;
  if (action === 'delete_game') return `Game "${name || 'Game'}" was removed from the catalog.`;

  if (action === 'role_change') return `User roles updated: ${details?.change || 'Role updated'}.`;
  if (action === 'status_change')
    return `User account status changed to ${details?.status || 'updated'}.`;

  if (details?.status) return `Status changed to: ${details.status}`;
  if (details?.reason) return `Action performed with reason: ${details.reason}`;

  return `Action ${log.action} performed on ${log.targetType || 'entity'}.`;
}

function getEntityIcon(type?: string) {
  const t = (type || '').toLowerCase();
  if (t === 'user') return <User size={20} />;
  if (t === 'game' || t === 'submission') return <Gamepad2 size={20} />;
  if (t === 'genre') return <Layers size={20} />;
  if (t === 'tag') return <TagIcon size={20} />;
  return <ShieldAlert size={20} />;
}

export function AuditDetailModal({
  log,
  actorName,
  targetName,
  actionColor,
  onClose,
  onShowToast,
}: AuditDetailModalProps) {
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    onShowToast(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedField('json');
    onShowToast('Raw JSON copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const tsStr = log.timestamp
    ? new Date(log.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Unknown';

  const detailsObj = typeof log.details === 'object' && log.details !== null ? log.details : null;
  const headline = generateAuditHeadline(log, targetName);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modalContainer} ${styles.modalContainerLg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.topStripe} style={{ backgroundColor: actionColor }} />

        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.modalSubtitle}>AUDIT EVENT DETAILS</p>
            <h3
              className={styles.modalTitle}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.65rem',
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: actionColor,
                  backgroundColor: `${actionColor}15`,
                  border: `1px solid ${actionColor}40`,
                }}
              >
                {log.action}
              </span>
              <span style={{ fontSize: '0.9rem', color: '#8c9aaa', fontFamily: 'monospace' }}>
                #{log.id}
              </span>
            </h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div
          className={styles.modalBody}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {/* Target & Actor Header Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* Target Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                backgroundColor: '#1c2028',
                border: '1px solid #393e46',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${actionColor}15`,
                    border: `1px solid ${actionColor}30`,
                    color: actionColor,
                    flexShrink: 0,
                  }}
                >
                  {getEntityIcon(log.targetType)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.65rem',
                      color: '#8c9aaa',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontFamily: 'monospace',
                    }}
                  >
                    TARGET ({log.targetType?.toUpperCase() || 'ENTITY'})
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#eeeeee',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {targetName ? targetName.replace(/^[A-Z]+:\s*/i, '') : log.targetId || 'Global'}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.7rem',
                      color: '#8c9aaa',
                      fontFamily: 'monospace',
                    }}
                  >
                    ID: {log.targetId || 'N/A'}
                  </p>
                </div>
              </div>

              {log.targetId && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(log.targetId!, 'Target ID')}
                  className={commonStyles.actionBtn}
                  style={{ marginLeft: '0.5rem', flexShrink: 0 }}
                  title="Copy Target ID"
                >
                  {copiedField === 'Target ID' ? (
                    <Check size={12} style={{ color: '#4caf80' }} />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              )}
            </div>

            {/* Actor Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                backgroundColor: '#1c2028',
                border: '1px solid #393e46',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(253, 112, 20, 0.12)',
                    border: '1px solid rgba(253, 112, 20, 0.3)',
                    color: '#fd7014',
                    flexShrink: 0,
                  }}
                >
                  <User size={20} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.65rem',
                      color: '#8c9aaa',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontFamily: 'monospace',
                    }}
                  >
                    PERFORMED BY (ACTOR)
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#fd7014',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {actorName ||
                      (log.actorId ? `Actor ${log.actorId.substring(0, 8)}` : 'System Automated')}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.7rem',
                      color: '#8c9aaa',
                      fontFamily: 'monospace',
                    }}
                  >
                    ID: {log.actorId || 'System'}
                  </p>
                </div>
              </div>

              {log.actorId && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(log.actorId!, 'Actor ID')}
                  className={commonStyles.actionBtn}
                  style={{ marginLeft: '0.5rem', flexShrink: 0 }}
                  title="Copy Actor ID"
                >
                  {copiedField === 'Actor ID' ? (
                    <Check size={12} style={{ color: '#4caf80' }} />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Action Details Summary Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p
              className={styles.fieldLabel}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <FileText size={12} style={{ color: '#fd7014' }} /> ACTION DETAILS
            </p>

            <div
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: '#1c2028',
                border: '1px solid #393e46',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#eeeeee',
                  lineHeight: 1.5,
                }}
              >
                {headline}
              </p>

              {detailsObj && Object.keys(detailsObj).length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.65rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(57, 62, 70, 0.6)',
                  }}
                >
                  {Object.entries(detailsObj).map(([key, value]) => {
                    const displayVal =
                      typeof value === 'object' ? JSON.stringify(value) : String(value);
                    return (
                      <div
                        key={key}
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}
                      >
                        <span
                          style={{
                            fontSize: '0.65rem',
                            color: '#8c9aaa',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                          }}
                        >
                          {key}
                        </span>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: '#eeeeee',
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                            fontWeight: 600,
                          }}
                        >
                          {displayVal}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Timing & Event Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p
              className={styles.fieldLabel}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Hash size={12} style={{ color: '#fd7014' }} /> EVENT TIMESTAMP
            </p>

            <div className={styles.infoGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className={styles.infoItem}>
                <p className={styles.fieldLabel}>Date & Time</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={12} style={{ color: '#8c9aaa' }} />
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      color: '#eeeeee',
                    }}
                  >
                    {tsStr}
                  </p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <p className={styles.fieldLabel}>Log Reference</p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                    color: '#eeeeee',
                  }}
                >
                  Event #{log.id}
                </p>
              </div>
            </div>
          </div>

          {/* Raw JSON Accordion Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'none',
                border: 'none',
                color: '#fd7014',
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                cursor: 'pointer',
                padding: '0.25rem 0',
                width: 'fit-content',
              }}
            >
              <Code size={13} /> {showRawJson ? 'Hide Raw JSON' : 'Show Raw JSON'}
            </button>

            {showRawJson && (
              <div
                style={{
                  backgroundColor: '#151921',
                  border: '1px solid #393e46',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* JSON Header Bar with Clean Copy Button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.85rem',
                    backgroundColor: '#1c2028',
                    borderBottom: '1px solid #393e46',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: '#8c9aaa',
                      fontFamily: 'monospace',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    RAW EVENT PAYLOAD
                  </span>

                  <button
                    type="button"
                    onClick={copyJson}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: 'rgba(253, 112, 20, 0.1)',
                      border: '1px solid rgba(253, 112, 20, 0.3)',
                      color: '#fd7014',
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.7rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {copiedField === 'json' ? (
                      <Check size={12} style={{ color: '#4caf80' }} />
                    ) : (
                      <Copy size={12} />
                    )}
                    <span>{copiedField === 'json' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>

                <pre
                  style={{
                    margin: 0,
                    padding: '1rem',
                    color: '#4caf80',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    overflowX: 'auto',
                    lineHeight: 1.5,
                    maxHeight: '220px',
                  }}
                >
                  {JSON.stringify(log, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
