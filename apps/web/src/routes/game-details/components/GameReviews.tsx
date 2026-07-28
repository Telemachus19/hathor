import React from 'react';
import styles from '../styles/GameReviews.module.css';
import { ThumbsUpIcon } from '../../landing-page/assets';

export interface UserReviewItem {
  id: string;
  userName: string;
  userAvatarInitials?: string;
  ratingScore: number;
  date: string;
  comment: string;
  helpfulCount: number;
  recommended?: boolean;
}

export interface GameReviewsProps {
  score: number;
  totalReviews?: string;
  reviews: UserReviewItem[];
}

/**
 * User Reviews section with dark review cards and SVG icons.
 */
export const GameReviews: React.FC<GameReviewsProps> = ({
  score,
  totalReviews = '48.2k total',
  reviews,
}) => {
  return (
    <div className={styles.reviewsWrap}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h3 className={styles.sectionHeader}>USER REVIEWS</h3>
          <span className={styles.totalBadge}>{totalReviews}</span>
        </div>

        <div className={styles.scoreBadge}>
          <span className={styles.stars}>★★★★★</span>
          <span className={styles.scoreNum}>{score.toFixed(1)}</span>
          <span className={styles.scoreMax}>/ 10</span>
        </div>
      </div>

      <div className={styles.reviewsList}>
        {reviews.map((rev) => (
          <div key={rev.id} className={styles.reviewCard}>
            <div className={styles.cardTopRow}>
              <div className={styles.userInfo}>
                <div className={styles.squareAvatar}>
                  {rev.userAvatarInitials || rev.userName.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.userTextStack}>
                  <span className={styles.userName}>{rev.userName}</span>
                  <div className={styles.ratingSubRow}>
                    <span className={styles.cardStars}>★★★★★</span>
                    <span className={styles.cardScore}>{rev.ratingScore.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.rightMeta}>
                <div className={styles.recommendedPill}>
                  <ThumbsUpIcon width={12} height={12} />
                  <span>Recommended</span>
                </div>
                <span className={styles.date}>{rev.date}</span>
              </div>
            </div>

            <p className={styles.reviewBody}>{rev.comment}</p>

            <div className={styles.helpfulFooter}>
              <ThumbsUpIcon width={13} height={13} />
              <span>{rev.helpfulCount} people found this helpful</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
