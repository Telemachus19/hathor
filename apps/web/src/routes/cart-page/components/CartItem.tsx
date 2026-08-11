import React from 'react';
import { Star, X, Heart } from 'lucide-react';
import { CartGame } from '../types';
import styles from '../styles/CartPage.module.css';

interface CartItemProps {
  game: CartGame;
  onRemove: (id: string | number) => void;
  onWishlist: (id: string | number) => void;
}

export const CartItemComponent: React.FC<CartItemProps> = ({ game, onRemove, onWishlist }) => {
  return (
    <div className={styles.cartItemCard}>
      <div className={styles.hoverAccentBar} />

      {/* Thumbnail */}
      <div className={styles.thumbnailWrapper}>
        <img src={game.coverImage} alt={game.title || game.genre} className={styles.thumbnailImg} />
        <div className={styles.thumbnailOverlay} />
      </div>

      {/* Item info */}
      <div className={styles.itemContent}>
        <div className={styles.itemHeader}>
          <div className={styles.itemTitleGroup}>
            <div className={styles.itemTitleRow}>
              <span className={styles.genreBadge}>{game.genre}</span>
              {game.salePrice && <span className={styles.saleBadge}>Sale</span>}
            </div>
            <h3 className={styles.itemTitle}>{game.title || game.genre}</h3>
            <p className={styles.developerText}>{game.developer}</p>
          </div>
          <button
            onClick={() => onRemove(game.id)}
            className={styles.removeBtn}
            title="Remove from cart"
          >
            <X size={14} />
          </button>
        </div>

        <div className={styles.itemFooter}>
          <div className={styles.tagList}>
            {game.tags.slice(0, 3).map((tag, idx) => {
              const tagName = typeof tag === 'string' ? tag : (tag as any)?.name || 'Tag';
              return (
                <span key={`${tagName}-${idx}`} className={styles.tagItem}>
                  {tagName}
                </span>
              );
            })}
          </div>

          <div className={styles.itemPriceRating}>
            <div className={styles.ratingBox}>
              <Star size={11} fill="var(--primary-color, #f26b21)" />
              <span>{game.rating.toFixed(1)}</span>
            </div>

            <div className={styles.priceContainer}>
              {game.salePrice ? (
                <div className={styles.salePriceRow}>
                  <span className={styles.originalPrice}>
                    EGP {game.originalPrice.toLocaleString()}
                  </span>
                  <span className={styles.finalPrice}>EGP {game.salePrice.toLocaleString()}</span>
                </div>
              ) : (
                <span className={styles.normalPrice}>
                  EGP {game.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <button onClick={() => onWishlist(game.id)} className={styles.wishlistBtn}>
          <Heart size={11} /> Save to Wishlist
        </button>
      </div>
    </div>
  );
};

export default CartItemComponent;
