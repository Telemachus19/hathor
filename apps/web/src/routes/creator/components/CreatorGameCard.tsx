import { Gamepad2, BarChart2, Edit3, Eye, EyeOff, X } from 'lucide-react';
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
  const isPublished = game.status === 'published';
  const isPending = game.status === 'pending_review';
  const isDraft = game.status === 'draft';

  const owners = analytics?.totalOwners || 0;
  const revenue = analytics?.grossRevenueEgp || 0;
  const rating = analytics?.averageRating || 0;
  const price = Number(game.priceEgp || 0);

  const stats = isPublished
    ? [
        { label: 'Owners', value: owners.toLocaleString(), color: '#4caf80' },
        { label: 'Revenue', value: `EGP ${revenue.toFixed(2)}`, color: '#3b9eda' },
        { label: 'Rating', value: rating > 0 ? `${rating.toFixed(1)} / 10` : '—', color: '#f59e0b' },
      ]
    : isPending
    ? [
        { label: 'Wishlists', value: (analytics?.wishlistCount || 0).toLocaleString(), color: '#f59e0b' },
        { label: 'Price', value: `EGP ${price.toFixed(2)}`, color: '#eeeeee' },
        { label: 'Status', value: 'Under Review', color: '#f59e0b' },
      ]
    : [
        { label: 'Price', value: `EGP ${price.toFixed(2)}`, color: '#eeeeee' },
        { label: 'Stage', value: 'Draft', color: '#8c9aaa' },
        { label: 'Visibility', value: 'Hidden', color: '#8c9aaa' },
      ];

  const tags = ((game as any).tags || []).slice(0, 5);

  return (
    <div className={styles.gameCard}>
      <div className={styles.gameTopStripe} style={{ backgroundColor: accent }} />

      {/* Header */}
      <div
        className={styles.cardHeader}
        style={{
          background: `linear-gradient(135deg, ${accent}15, #1c2028)`,
        }}
      >
        <div
          className={styles.gameIconBox}
          style={{
            borderColor: `${accent}40`,
            background: `${accent}15`,
          }}
        >
          <Gamepad2 size={16} style={{ color: accent }} />
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.titleRow}>
            <h3 className={styles.gameTitle}>{game.title}</h3>
            <GameStatusBadge status={game.status} />
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
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => onAnalytics(game.id)}
          >
            <BarChart2 size={11} /> Analytics
          </button>
        )}

        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => onEdit(game.id)}
        >
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
    </div>
  );
}
