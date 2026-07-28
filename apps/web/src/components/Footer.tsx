import React from 'react';
import { Link } from '@tanstack/react-router';
import styles from '../styles/Footer.module.css';
import { HathorLogo } from '../assets';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logoArea}>
          <HathorLogo width={36} height={30} className={styles.logoSvg} />
          <span className={styles.logoText}>HATHOR</span>
        </Link>

        <div className={styles.links}>
          <a href="#" className={styles.link}>
            PRIVACY POLICY
          </a>
          <a href="#" className={styles.link}>
            TERMS
          </a>
          <a href="#" className={styles.link}>
            SUPPORT
          </a>
        </div>

        <span className={styles.copy}>&copy; 2026 Hathor Game Emporium</span>
      </div>
    </footer>
  );
};

export default Footer;
