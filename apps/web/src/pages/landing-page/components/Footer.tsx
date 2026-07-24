import React from 'react';
import styles from '../styles/Footer.module.css';
import logoSvg from '../assets/hathor-logo.svg';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <a href="#" className={styles.logoArea}>
          <img src={logoSvg} alt="Hathor Logo" className={styles.logoPlaceholder} />
          <span className={styles.logoText}>HATHOR</span>
        </a>

        <div className={styles.links}>
          <a href="#" className={styles.link}>PRIVACY POLICY</a>
          <a href="#" className={styles.link}>TERMS</a>
          <a href="#" className={styles.link}>SUPPORT</a>
        </div>

        <span className={styles.copy}>&copy; 2026 Hathor Game Emporium</span>
      </div>
    </footer>
  );
};
