import React from 'react';
import styles from '../styles/Navbar.module.css';
import {
  SearchIcon,
  GlobeIcon,
  CartIcon,
  LoginIcon,
  FlameIcon,
  TrophyIcon,
  SparkleIcon,
  TrendingIcon,
  HeartIcon,
} from '../assets';
import logoSvg from '../assets/hathor-logo.svg';

export const Navbar: React.FC = () => {
  return (
    <nav>
      {/* Top Navbar (Black background) */}
      <div className={styles.navbarTopWrapper}>
        <div className={styles.navbarTop}>
          <a href="#" className={styles.logoArea}>
            <img src={logoSvg} alt="Hathor Logo" className={styles.logoPlaceholder} />
            <span className={styles.logoText}>HATHOR</span>
          </a>

          <div className={styles.navLinks}>
            <a href="#" className={`${styles.navLink} ${styles.navLinkActive}`}>
              STORE
            </a>
            <a href="#" className={styles.navLink}>
              LIBRARY
            </a>
            <a href="#" className={styles.navLink}>
              GUEST
            </a>
          </div>

          <div className={styles.navActions}>
            <button className={styles.iconBtn} aria-label="Language">
              <GlobeIcon />
            </button>
            <button className={styles.iconBtn} aria-label="Cart">
              <CartIcon />
            </button>
            <button className={styles.loginBtn}>
              <LoginIcon /> LOGIN
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Navbar (Slate Blue background) */}
      <div className={styles.navbarBottomWrapper}>
        <div className={styles.navbarBottom}>
          <div className={styles.filters}>
            <a href="#" className={`${styles.filterLink} ${styles.filterLinkActive}`}>
              <FlameIcon /> DEALS
            </a>
            <a href="#" className={styles.filterLink}>
              <TrophyIcon /> TOP RATED
            </a>
            <a href="#" className={styles.filterLink}>
              <SparkleIcon /> NEW ARRIVALS
            </a>
            <a href="#" className={styles.filterLink}>
              <TrendingIcon /> TRENDING
            </a>
          </div>

          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>
              <SearchIcon />
            </span>
            <input type="text" className={styles.searchInput} placeholder="Search games..." />
          </div>

          <a href="#" className={styles.wishlistLink}>
            <HeartIcon /> WISHLIST
          </a>
        </div>
      </div>
    </nav>
  );
};
