import React from 'react';
import styles from '../styles/GameCard.module.css';
import { StarIcon, CartIcon } from '../assets';

interface GameCardProps {
  title: string;
  category: string;
  rating: number;
  price?: number;
  oldPrice?: number;
  free?: boolean;
  imageUrl: string;
  tag?: string;
  discountTag?: string;
  showAddButton?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  category,
  rating,
  price,
  oldPrice,
  free = false,
  imageUrl,
  tag,
  discountTag,
  showAddButton = false,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <img className={styles.image} src={imageUrl} alt={title} loading="lazy" />
        {tag && (
          <div className={styles.tagsLeft}>
            <span className={styles.tag}>{tag}</span>
          </div>
        )}
        {discountTag && (
          <div className={styles.tagsRight}>
            <span className={`${styles.tag} ${styles.tagDiscount}`}>{discountTag}</span>
          </div>
        )}
      </div>

      <div className={styles.contentBar}>
        {/* Genre and Rating on the Left */}
        <div className={styles.leftGroup}>
          <span className={styles.category}>{category}</span>
          <span className={styles.rating}>
            <StarIcon className={styles.starIcon} width={11} height={11} /> {rating.toFixed(1)}
          </span>
        </div>

        {/* Price and Optional ADD Button on the Right */}
        <div className={styles.rightGroup}>
          <div className={styles.priceWrap}>
            {free ? (
              <span className={styles.priceFree}>FREE</span>
            ) : (
              <>
                <span className={styles.price}>${price?.toFixed(2)}</span>
                {oldPrice != null && (
                  <span className={styles.priceOld}>${oldPrice.toFixed(2)}</span>
                )}
              </>
            )}
          </div>
          {showAddButton && !free && (
            <button className={styles.addBtn}>
              <CartIcon width={11} height={11} /> ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
