import React from 'react';
import { Link } from '@tanstack/react-router';
import styles from '../styles/GameOwnershipBanner.module.css';
import { CheckIcon, LibraryIcon, DownloadIcon } from '../../landing-page/assets';

export interface GameOwnershipBannerProps {
  purchaseDate?: string;
}

/**
 * Green ownership notification card matching Hathor reference screenshot design.
 */
export const GameOwnershipBanner: React.FC<GameOwnershipBannerProps> = ({
  purchaseDate = 'Jun 10, 2025',
}) => {
  return (
    <div className={styles.bannerWrap}>
      <div className={styles.leftInfo}>
        <div className={styles.checkSquare}>
          <CheckIcon width={16} height={16} />
        </div>
        <div className={styles.textGroup}>
          <span className={styles.title}>YOU OWN THIS GAME</span>
          <span className={styles.subtitle}>
            Purchased {purchaseDate} • Available in your library
          </span>
        </div>
      </div>

      <div className={styles.actionGroup}>
        <Link to="/library" className={styles.libraryBtn}>
          <LibraryIcon width={14} height={14} />
          <span>GO TO LIBRARY</span>
        </Link>
        <button className={styles.downloadBtn}>
          <DownloadIcon width={14} height={14} />
          <span>DOWNLOAD</span>
        </button>
      </div>
    </div>
  );
};
