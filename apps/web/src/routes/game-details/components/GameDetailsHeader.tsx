import React from 'react';
import styles from '../styles/GameDetailsHeader.module.css';

export interface GameDetailsHeaderProps {
  category?: string;
  title: string;
  subtitle?: string;
  ratingScore: number;
  reviewCount: string;
  developer: string;
  releaseDate: string;
  tags: Array<{ name: string; slug: string }> | string[];
  description: string;
}

/**
 * Game detail page header section displaying title, category, ratings, studio metadata and tag pills.
 */
export const GameDetailsHeader: React.FC<GameDetailsHeaderProps> = ({
  category = 'ACTION RPG',
  title,
  subtitle = 'SHATTERED LANDS EDITION',
  ratingScore,
  reviewCount,
  developer,
  releaseDate,
  tags,
  description,
}) => {
  return (
    <div className={styles.headerWrap}>
      <div className={styles.categoryLine}>{category}</div>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}

      <div className={styles.ratingRow}>
        <span className={styles.stars}>★★★★★</span>
        <span className={styles.scoreValue}>{ratingScore.toFixed(1)}</span>
        <span className={styles.reviewCount}>({reviewCount})</span>
        <span className={styles.dividerDot}>•</span>
        <span className={styles.metaItem}>{developer}</span>
        <span className={styles.dividerDot}>•</span>
        <span className={styles.metaItem}>{releaseDate}</span>
      </div>

      <div className={styles.tagPills}>
        {tags.map((tag, idx) => (
          <span key={idx} className={styles.tagPill}>
            {typeof tag === 'string' ? tag : tag.name}
          </span>
        ))}
      </div>

      <p className={styles.description}>{description}</p>
    </div>
  );
};
