import React from 'react';
import { Link } from '@tanstack/react-router';
import styles from '../styles/GameCard.module.css';
import { StarIcon, CartIcon } from '../assets';

/**
 * Component props for rendering an individual game storefront card.
 */
export interface GameCardProps {
  slug?: string;
  title: string;
  category?: string;
  tags?: Array<{ name: string; slug: string }>;
  rating?: number;
  priceEgp?: string | number;
  discountPercent?: number;
  imageUrl?: string;
  tag?: string;
  discountTag?: string;
  showAddButton?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Presentational GameCard component handling EGP pricing, discounts, ratings, and navigation.
 */
export const GameCard: React.FC<GameCardProps> = ({
  slug,
  title,
  category,
  tags,
  rating = 4.8,
  priceEgp,
  discountPercent = 0,
  imageUrl,
  tag,
  discountTag,
  showAddButton = false,
  onClick,
}) => {
  const numericPrice = typeof priceEgp === 'number' ? priceEgp : parseFloat(priceEgp || '0');
  const isFree = numericPrice === 0;

  let originalPrice: number | null = null;
  if (discountPercent > 0 && numericPrice > 0) {
    originalPrice = numericPrice / (1 - discountPercent / 100);
  }

  const computedDiscountTag =
    discountTag || (discountPercent > 0 ? `-${discountPercent}%` : undefined);
  const fallbackImage = 'https://placehold.co/600x350/1c1917/a4b0be?text=Game+Placeholder';

  const primaryCategory =
    tags && tags.length > 0
      ? tags[0].name.toUpperCase()
      : category
        ? category.toUpperCase()
        : 'GAME';

  const cardInner = (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageWrap}>
        <img className={styles.image} src={imageUrl || fallbackImage} alt={title} loading="lazy" />
        {tag && (
          <div className={styles.tagsLeft}>
            <span className={styles.tag}>{tag}</span>
          </div>
        )}
        {computedDiscountTag && (
          <div className={styles.tagsRight}>
            <span className={`${styles.tag} ${styles.tagDiscount}`}>{computedDiscountTag}</span>
          </div>
        )}
      </div>

      <div className={styles.contentBar}>
        <div className={styles.leftGroup}>
          <span className={styles.category}>{primaryCategory}</span>

          <span className={styles.rating}>
            <StarIcon className={styles.starIcon} width={11} height={11} /> {rating.toFixed(1)}
          </span>
        </div>

        <div className={styles.rightGroup}>
          <div className={styles.priceWrap}>
            {isFree ? (
              <span className={styles.priceFree}>FREE</span>
            ) : (
              <>
                <span className={styles.price}>{numericPrice.toFixed(2)} EGP</span>
                {originalPrice != null && (
                  <span className={styles.priceOld}>{originalPrice.toFixed(2)} EGP</span>
                )}
              </>
            )}
          </div>
          {showAddButton && !isFree && (
            <button
              className={styles.addBtn}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <CartIcon width={11} height={11} /> ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (slug) {
    return (
      <Link to="/store/games/$slug" params={{ slug }} className={styles.cardLink}>
        {cardInner}
      </Link>
    );
  }

  return cardInner;
};
