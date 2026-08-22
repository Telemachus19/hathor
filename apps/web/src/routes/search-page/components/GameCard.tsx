import React from 'react';
import { Link } from '@tanstack/react-router';
import { Star } from 'lucide-react';
import type { CatalogGameItem } from '../../../services/api/catalog';
import styles from '../styles/GameCard.module.css';

interface GameCardProps {
  game: CatalogGameItem;
}

const FALLBACK_BANNER = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop';

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const banner = game.bannerUrl || (game.screenshots && game.screenshots[0]) || FALLBACK_BANNER;

  // Resolve genre name safely
  const rawGenre: any = game.genre;
  let genreTitle = 'Game';
  if (rawGenre && typeof rawGenre === 'object' && rawGenre.name) {
    genreTitle = rawGenre.name;
  } else if (typeof rawGenre === 'string' && rawGenre.trim()) {
    genreTitle = rawGenre.trim();
  } else if (game.category && typeof game.category === 'string') {
    genreTitle = game.category.trim();
  } else if (game.tags && game.tags.length > 0) {
    const knownGenreTag = game.tags.find((t) =>
      ['rpg', 'action', 'adventure', 'strategy', 'simulation', 'puzzle', 'racing', 'horror', 'indie', 'sports', 'sci-fi'].includes(
        (t.slug || t.name).toLowerCase()
      )
    );
    genreTitle = knownGenreTag ? knownGenreTag.name : game.tags[0].name;
  }

  const hasDiscount = !!(game.discountPercent && game.discountPercent > 0);

  return (
    <Link
      to="/store/games/$slug"
      params={{ slug: game.slug }}
      className={styles.card}
    >
      <div className={styles.imageWrapper}>
        <img
          src={banner}
          alt={game.title}
          className={styles.bannerImage}
          loading="lazy"
        />
      </div>

      <div className={styles.accentBar} />

      <div className={styles.cardBody}>
        <div className={styles.genreBadgeWrapper}>
          <span className={styles.genreBadge}>{genreTitle}</span>
        </div>

        <h3 className={styles.title} title={game.title}>
          {game.title}
        </h3>

        {game.tags && game.tags.length > 0 && (
          <div className={styles.tagsRow}>
            {game.tags.slice(0, 2).map((tag) => (
              <span key={tag.slug || tag.name} className={styles.tagChip}>
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className={styles.cardFooter}>
          <div className={styles.ratingContainer}>
            <Star size={12} fill="#fd7014" color="#fd7014" />
            <span className={styles.ratingScore}>4.8</span>
          </div>

          <div className={styles.priceContainer}>
            {hasDiscount && (
              <span className={styles.discountBadge}>-{game.discountPercent}%</span>
            )}
            <span className={styles.priceText}>
              {game.priceEgp === '0.00' || game.priceEgp === '0'
                ? 'FREE'
                : `${game.priceEgp} EGP`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
