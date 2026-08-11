import React from 'react';
import styles from '../styles/LibraryPage.module.css';

interface HieroDividerProps {
  className?: string;
}

export const HieroDivider: React.FC<HieroDividerProps> = ({ className }) => {
  return (
    <div className={`${styles.hieroDivider} ${className || ''}`}>
      <div className={styles.dividerLineLeft} />
      <span className={styles.dividerGlyph}>𓂀</span>
      <div className={styles.dividerLineRight} />
    </div>
  );
};

export default HieroDivider;
