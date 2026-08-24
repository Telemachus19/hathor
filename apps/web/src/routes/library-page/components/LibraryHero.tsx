import React from 'react';
import { Gamepad2, Star, Eye, Download } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { DisplayGame } from '../types';
import { GlyphAccent } from './GlyphAccent';
import { useDownload } from '../../../context/DownloadContext';
import styles from '../styles/LibraryPage.module.css';

interface LibraryHeroProps {
  game: DisplayGame;
}

export const LibraryHero: React.FC<LibraryHeroProps> = ({ game }) => {
  const { startDownload } = useDownload();

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    startDownload(game.id, game.title);
  };

  return (
    <div className={styles.heroContainer}>
      <img src={game.heroImage} alt={game.title} className={styles.heroImage} />
      <div className={styles.heroGradientOverlay} />
      <div className={styles.heroTopBorder} />

      <GlyphAccent
        char="𓂀"
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '1.5rem',
          fontSize: '1.875rem',
        }}
      />
      <GlyphAccent
        char="𓃭"
        style={{
          position: 'absolute',
          bottom: '0.75rem',
          right: '3.5rem',
          fontSize: '1.5rem',
        }}
      />

      <div className={styles.heroContent}>
        <div>
          <div className={styles.headerBadge}>
            <Gamepad2 size={10} className={styles.badgeIcon} />
            <span className={styles.badgeText}>Spotlight · Your Collection</span>
          </div>

          <h2 className={styles.heroTitle}>{game.title}</h2>

          <div className={styles.heroMeta}>
            <span className={styles.heroMetaItem}>
              {typeof game.genre === 'string' ? game.genre : (game.genre as any)?.name || 'Action / Strategy'}
            </span>
            <span className={styles.metaDivider}>|</span>
            <span className={styles.heroMetaItem}>
              {typeof game.developer === 'string' ? game.developer : 'Hathor Studios'}
            </span>
            <span className={styles.metaDivider}>|</span>
            <div className={styles.ratingBox}>
              <Star size={10} className={styles.ratingStar} />
              <span className={styles.ratingValue}>{(game.rating || 4.8).toFixed(1)}</span>
            </div>
          </div>

          <div className={styles.heroStatusGroup}>
            <span className={styles.ownedTag}>✓ Owned since {game.purchaseDate}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', zIndex: 10 }}>
          <button
            type="button"
            onClick={handleDownload}
            className={styles.heroButton}
            style={{
              backgroundColor: '#fd7014',
              color: '#222831',
              borderColor: '#fd7014',
            }}
          >
            <Download size={12} />
            Download
          </button>

          <Link
            to="/store/games/$slug"
            params={{ slug: (game as any).slug || game.id }}
            className={styles.heroButton}
            style={{ textDecoration: 'none' }}
          >
            <Eye size={12} />
            View Game
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LibraryHero;
