import React from 'react';
import { Link } from '@tanstack/react-router';
import styles from '../styles/GameDetailsSidebar.module.css';
import {
  DownloadIcon,
  LibraryIcon,
  UserIcon,
  ThumbsUpIcon,
  CartIcon,
} from '../../landing-page/assets';

export interface GameDetailsSidebarProps {
  isAuthenticated?: boolean;
  priceEgp?: string | number;
  discountPercent?: number;
  developer: string;
  publisher: string;
  releaseDate: string;
  genre?: string;
  platforms: string[];
  ratingsBreakdown: Array<{ stars: number; percent: number }>;
  communityStats: {
    playersCount: string;
    positiveRatingPct: string;
  };
}

/**
 * Right-hand sidebar matching the Hathor reference design.
 */
export const GameDetailsSidebar: React.FC<GameDetailsSidebarProps> = ({
  isAuthenticated = false,
  priceEgp = '299.99',
  discountPercent = 0,
  developer,
  publisher,
  releaseDate,
  genre = 'Action RPG',
  platforms,
  ratingsBreakdown,
  communityStats,
}) => {
  const numericPrice = typeof priceEgp === 'number' ? priceEgp : parseFloat(priceEgp || '0');
  const isFree = numericPrice === 0;

  let originalPrice: number | null = null;
  if (discountPercent > 0 && numericPrice > 0) {
    originalPrice = numericPrice / (1 - discountPercent / 100);
  }

  return (
    <div className={styles.sidebarWrap}>
      {/* 1. CTA Card: OWNED when authenticated, BUY when unauthenticated */}
      {isAuthenticated ? (
        <div className={`${styles.card} ${styles.ownedCard}`}>
          <h4 className={styles.ownedTitle}>OWNED</h4>
          <span className={styles.ownedSub}>In your library</span>
          <button className={styles.downloadBtn}>
            <DownloadIcon width={14} height={14} />
            <span>DOWNLOAD NOW</span>
          </button>
          <Link to="/library" className={styles.viewLibraryBtn}>
            <LibraryIcon width={14} height={14} />
            <span>VIEW IN LIBRARY</span>
          </Link>
        </div>
      ) : (
        <div className={`${styles.card} ${styles.buyCard}`}>
          <div className={styles.priceContainer}>
            {isFree ? (
              <span className={styles.priceFree}>FREE</span>
            ) : (
              <>
                <span className={styles.priceVal}>{numericPrice.toFixed(2)} EGP</span>
                {originalPrice != null && (
                  <span className={styles.priceOld}>{originalPrice.toFixed(2)} EGP</span>
                )}
              </>
            )}
            {discountPercent > 0 && (
              <span className={styles.discountBadge}>-{discountPercent}%</span>
            )}
          </div>
          <button
            className={styles.addToCartBtn}
            onClick={() => alert('Cart feature coming soon!')}
          >
            <CartIcon width={14} height={14} />
            <span>ADD TO CART</span>
          </button>
        </div>
      )}

      {/* 2. GAME DETAILS Card */}
      <div className={styles.card}>
        <h4 className={styles.cardHeading}>GAME DETAILS</h4>
        <div className={styles.detailsList}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Developer</span>
            <span className={styles.detailValue}>{developer}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Publisher</span>
            <span className={styles.detailValue}>{publisher}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Release Date</span>
            <span className={styles.detailValue}>{releaseDate}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Genre</span>
            <span className={styles.detailValue}>{genre}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Platforms</span>
            <span className={styles.detailValue}>{platforms.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* 3. RATING BREAKDOWN Card */}
      <div className={styles.card}>
        <h4 className={styles.cardHeading}>RATING BREAKDOWN</h4>
        {ratingsBreakdown.map((item) => (
          <div key={item.stars} className={styles.ratingBarRow}>
            <span className={styles.starLabel}>{item.stars} Star</span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${item.percent}%` }} />
            </div>
            <span className={styles.pctVal}>{item.percent}%</span>
          </div>
        ))}
      </div>

      {/* 4. COMMUNITY STATS Card */}
      <div className={styles.card}>
        <h4 className={styles.cardHeading}>COMMUNITY</h4>
        <div className={styles.communityList}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>
              <UserIcon width={13} height={13} className={styles.statIcon} />
              <span>Players</span>
            </span>
            <span className={styles.statVal}>{communityStats.playersCount}</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>
              <ThumbsUpIcon width={13} height={13} className={styles.statIcon} />
              <span>Positive Rating</span>
            </span>
            <span className={styles.statVal}>{communityStats.positiveRatingPct}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
