import { useState } from 'react';
import { Gamepad2, BarChart2, Edit3, Eye, EyeOff, X, AlertTriangle } from 'lucide-react';
import { GameStatusBadge, ContentRatingBadge } from './CreatorBadges';
import type { Game } from '@hathor/contracts';
import styles from '../styles/creatorGames.module.css';

interface CreatorGameCardProps {
  game: Game;
  analytics?: {
    totalOwners?: number;
    grossRevenueEgp?: number;
    reviewCount?: number;
    averageRating?: number;
    wishlistCount?: number;
  };
  accent?: string;
  onAnalytics: (gameId: string) => void;
  onEdit: (gameId: string) => void;
  onStatusChange: (gameId: string, status: 'pending_review' | 'draft') => void;
}

export function CreatorGameCard({
  game,
  analytics,
  accent = '#fd7014',
  onAnalytics,
  onEdit,
  onStatusChange,
}: CreatorGameCardProps) {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const isPublished = game.status === 'published';
  const isPending = game.status === 'pending_review';
  const isRejected = game.status === 'rejected';
  const isDraft = game.status === 'draft';

  const cardAccent = isRejected ? '#e74c3c' : accent;

  const owners = analytics?.totalOwners || 0;
  const revenue = analytics?.grossRevenueEgp || 0;
  const rating = analytics?.averageRating || 0;
  const price = Number(game.priceEgp || 0);

  const stats = isPublished
    ? [
        { label: 'Owners', value: owners.toLocaleString(), color: '#4caf80' },
        { label: 'Revenue', value: `EGP ${revenue.toFixed(2)}`, color: '#3b9eda' },
        {
          label: 'Rating',
          value: rating > 0 ? `${rating.toFixed(1)} / 10` : '—',
          color: '#f59e0b',
        },
      ]
    : isPending
      ? [
          {
            label: 'Wishlists',
            value: (analytics?.wishlistCount || 0).toLocaleString(),
            color: '#f59e0b',
          },
          { label: 'Price', value: `EGP ${price.toFixed(2)}`, color: '#eeeeee' },
          { label: 'Status', value: 'Under Review', color: '#f59e0b' },
        ]
      : isRejected
        ? [
            { label: 'Price', value: `EGP ${price.toFixed(2)}`, color: '#eeeeee' },
            { label: 'Status', value: 'Rejected', color: '#e74c3c' },
            { label: 'Visibility', value: 'Hidden', color: '#8c9aaa' },
          ]
        : [
            { label: 'Price', value: `EGP ${price.toFixed(2)}`, color: '#eeeeee' },
            { label: 'Stage', value: 'Draft', color: '#8c9aaa' },
            { label: 'Visibility', value: 'Hidden', color: '#8c9aaa' },
          ];

  const tags = ((game as any).tags || []).slice(0, 5);

  return (
    <div
      className={styles.gameCard}
      style={isRejected ? { borderColor: 'rgba(231, 76, 60, 0.4)' } : undefined}
    >
      <div className={styles.gameTopStripe} style={{ backgroundColor: cardAccent }} />

      {/* Header */}
      <div
        className={styles.cardHeader}
        style={{
          background: `linear-gradient(135deg, ${cardAccent}15, #1c2028)`,
        }}
      >
        <div
          className={styles.gameIconBox}
          style={{
            borderColor: `${cardAccent}40`,
            background: `${cardAccent}15`,
          }}
        >
          <Gamepad2 size={16} style={{ color: cardAccent }} />
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.titleRow}>
            <h3 className={styles.gameTitle}>{game.title}</h3>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <GameStatusBadge status={game.status} />
              {isRejected && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReasonModal(true);
                  }}
                  title="View rejection reason"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.15rem 0.45rem',
                    fontSize: '0.5rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    backgroundColor: '#e74c3c',
                    border: '1px solid #c0392b',
                    cursor: 'pointer',
                    borderRadius: '2px',
                  }}
                >
                  <AlertTriangle size={8} />
                  Reason
                </button>
              )}
            </div>
          </div>
          <p className={styles.gameSubtitle}>
            {game.genre?.name || 'Standard'} · EGP {price.toFixed(2)}
          </p>
        </div>

        <ContentRatingBadge rating="T" />
      </div>

      {/* Description */}
      <div className={styles.descriptionBox}>
        <p className={styles.descriptionText}>
          {game.shortDescription || 'No description provided for this title.'}
        </p>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className={styles.tagsBox}>
          {tags.map((t: any, i: number) => (
            <span key={i} className={styles.tagPill}>
              {typeof t === 'string' ? t : t.name || t.tag?.name}
            </span>
          ))}
        </div>
      )}

      {/* Key Stats */}
      <div className={styles.statsGrid}>
        {stats.map(({ label, value, color }) => (
          <div key={label} className={styles.statCol}>
            <p className={styles.statColLabel}>{label}</p>
            <p className={styles.statColVal} style={{ color }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className={styles.actionsFooter}>
        {isPublished && (
          <button type="button" className={styles.actionBtn} onClick={() => onAnalytics(game.id)}>
            <BarChart2 size={11} /> Analytics
          </button>
        )}

        <button type="button" className={styles.actionBtn} onClick={() => onEdit(game.id)}>
          <Edit3 size={11} /> Edit
        </button>

        {isPublished && (
          <button
            type="button"
            className={styles.actionBtn}
            style={{ color: '#f59e0b' }}
            onClick={() => onStatusChange(game.id, 'draft')}
          >
            <EyeOff size={11} /> Unpublish
          </button>
        )}

        {isPending && (
          <button
            type="button"
            className={styles.actionBtn}
            style={{ color: '#e74c3c' }}
            onClick={() => onStatusChange(game.id, 'draft')}
          >
            <X size={11} /> Withdraw
          </button>
        )}

        {isRejected && (
          <button
            type="button"
            className={styles.actionBtn}
            style={{ color: '#4caf80' }}
            onClick={() => onStatusChange(game.id, 'pending_review')}
          >
            <Eye size={11} /> Resubmit
          </button>
        )}

        {isDraft && (
          <button
            type="button"
            className={styles.actionBtn}
            style={{ color: '#4caf80' }}
            onClick={() => onStatusChange(game.id, 'pending_review')}
          >
            <Eye size={11} /> Submit
          </button>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {showReasonModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowReasonModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#161922',
              border: '1px solid rgba(231, 76, 60, 0.4)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85), 0 0 24px rgba(231, 76, 60, 0.15)',
              width: '100%',
              maxWidth: '480px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: '#e74c3c',
              }}
            />

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#e74c3c',
                  marginBottom: '0.25rem',
                }}
              >
                <AlertTriangle size={18} />
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    color: '#eeeeee',
                    fontFamily: "'Cinzel', serif",
                  }}
                >
                  Submission Feedback
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Rejection feedback for <strong style={{ color: '#eeeeee' }}>{game.title}</strong>
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(231, 76, 60, 0.08)',
                border: '1px solid rgba(231, 76, 60, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#e74c3c',
                }}
              >
                Admin Reason
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#ffb4aa',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {(game as any).rejectionReason ||
                  'No specific reason provided by administration. Please review requirements and update your submission.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className={styles.actionBtn}
                style={{ padding: '0.5rem 1.25rem' }}
                onClick={() => setShowReasonModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className={styles.actionBtn}
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: 'var(--accent-orange)',
                  color: '#000',
                  fontWeight: 700,
                }}
                onClick={() => {
                  setShowReasonModal(false);
                  onEdit(game.id);
                }}
              >
                Edit Game Info
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
