import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { SuggestedGame } from '../types';
import styles from '../styles/CartPage.module.css';

interface SuggestedCardProps {
  game: SuggestedGame;
  onAdd?: (game: SuggestedGame) => void;
}

export const SuggestedCard: React.FC<SuggestedCardProps> = ({ game, onAdd }) => {
  return (
    <div className={styles.suggestedCard}>
      <div className={styles.suggestedCover}>
        <img src={game.coverImage} alt={game.title || game.genre} className={styles.suggestedImg} />
      </div>

      <div className={styles.suggestedInfo}>
        <div>
          <span className={styles.suggestedGenre}>{game.genre}</span>
          <h4 className={styles.suggestedTitleText}>{game.title || game.genre}</h4>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div className={styles.suggestedPrice}>EGP {game.price.toLocaleString()}</div>
          {onAdd && (
            <button onClick={() => onAdd(game)} className={styles.addBtn}>
              <ShoppingCart size={10} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestedCard;
