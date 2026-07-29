import React from 'react';
import styles from '../styles/MoreLikeThis.module.css';
import { GameCard } from '../../landing-page/components/GameCard';

export interface RecommendGameItem {
  slug: string;
  title: string;
  priceEgp: string;
  discountPercent?: number;
  bannerUrl?: string;
  tags?: Array<{ name: string; slug: string }>;
}

export interface MoreLikeThisProps {
  games: RecommendGameItem[];
}

/**
 * Bottom 4-column game card recommendations grid reusing GameCard component.
 */
export const MoreLikeThis: React.FC<MoreLikeThisProps> = ({ games }) => {
  return (
    <div className={styles.moreWrap}>
      <div className={styles.headerRow}>
        <h3 className={styles.sectionHeader}>MORE LIKE THIS</h3>
        <span className={styles.seeAllBtn}>SEE ALL &gt;</span>
      </div>

      <div className={styles.grid}>
        {games.map((game, idx) => (
          <GameCard
            key={`${game.slug}-${idx}`}
            slug={game.slug}
            title={game.title}
            tags={game.tags}
            priceEgp={game.priceEgp}
            discountPercent={game.discountPercent}
            imageUrl={game.bannerUrl}
            showAddButton={false}
          />
        ))}
      </div>
    </div>
  );
};
