import React from 'react';
import styles from '../styles/LibraryPage.module.css';

interface GlyphAccentProps {
  char?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const GlyphAccent: React.FC<GlyphAccentProps> = ({ char = '𓃭', className, style }) => {
  return (
    <span className={`${styles.glyphAccent} ${className || ''}`} style={style}>
      {char}
    </span>
  );
};

export default GlyphAccent;
