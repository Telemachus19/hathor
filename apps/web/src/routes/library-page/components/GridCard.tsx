import React from 'react';
import { RefreshCw, Download, Star } from 'lucide-react';
import { LibraryGame } from '../types';
import { StatusPill } from './StatusPill';
import styles from '../styles/LibraryPage.module.css';

interface GridCardProps {
  game: LibraryGame;
}

export const GridCard: React.FC<GridCardProps> = ({ game }) => {
  return (
    <div className={styles.card}>
      {/* Update ribbon */}
      {game.status === 'update-available' && (
        <div className={styles.cardUpdateRibbon}>
          <span className={styles.ribbonBadge}>
            <RefreshCw size={7} />
            Update
          </span>
        </div>
      )}

      {/* Not-installed overlay */}
      {game.status === 'not-installed' && (
        <div className={styles.cardOverlayNotInstalled}>
          <div className={styles.notInstalledContent}>
            <Download size={18} style={{ color: '#888' }} />
            <span className={styles.notInstalledText}>Not Installed</span>
          </div>
        </div>
      )}

      {/* Cover image */}
      <div className={styles.coverWrap}>
        <img
          src={game.coverImage}
          alt={game.title}
          className={`${styles.coverImage} ${game.status === 'not-installed' ? styles.coverImageNotInstalled : ''}`}
        />
        <div className={styles.coverGradient} />
      </div>

      {/* Footer / Meta info */}
      <div className={styles.cardFooter}>
        <div className={styles.cardGenreRow}>
          <span className={styles.genreText}>{game.genre}</span>
          <div className={styles.ratingBox}>
            <Star size={9} className={styles.ratingStar} />
            <span className={styles.ratingValue}>{game.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className={styles.tagRow}>
          {game.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={styles.tagPill}>
              {tag}
            </span>
          ))}
        </div>

        <div style={{ marginTop: '0.125rem' }}>
          <StatusPill status={game.status} version={game.updateVersion} />
        </div>
      </div>
    </div>
  );
};

export default GridCard;
