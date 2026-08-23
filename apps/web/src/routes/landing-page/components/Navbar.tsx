import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../../context/AuthContext';
import styles from '../styles/Navbar.module.css';
import {
  SearchIcon,
  GlobeIcon,
  CartIcon,
  LoginIcon,
  TrophyIcon,
  SparkleIcon,
  TrendingIcon,
  HeartIcon,
} from '../assets';
import logoSvg from '../assets/hathor-logo.svg';

export const Navbar: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      void navigate({
        to: '/search',
        search: { q: searchQuery.trim() },
      });
    } else {
      void navigate({
        to: '/search',
      });
    }
  };

  return (
    <nav>
      {/* Top Navbar (Black background) */}
      <div className={styles.navbarTopWrapper}>
        <div className={styles.navbarTop}>
          <Link to="/" className={styles.logoArea}>
            <img src={logoSvg} alt="Hathor Logo" className={styles.logoPlaceholder} />
            <span className={styles.logoText}>HATHOR</span>
          </Link>

          <div className={styles.navLinks}>
            <Link to="/" className={`${styles.navLink} ${styles.navLinkActive}`}>
              STORE
            </Link>
            <Link to="/library" className={styles.navLink}>
              LIBRARY
            </Link>
            {isAuthenticated ? (
              <Link
                to={
                  Array.isArray(auth?.user?.roles) && auth?.user?.roles.includes('admin')
                    ? '/admin'
                    : Array.isArray(auth?.user?.roles) && auth?.user?.roles.includes('creator')
                      ? '/creator'
                      : '/profile'
                }
                className={styles.navLink}
              >
                {auth?.user?.displayName ? auth.user.displayName.toUpperCase() : 'PROFILE'}
              </Link>
            ) : (
              <Link to="/login" className={styles.navLink}>
                GUEST
              </Link>
            )}
          </div>

          <div className={styles.navActions}>
            <button className={styles.iconBtn} aria-label="Language">
              <GlobeIcon />
            </button>
            {isAuthenticated && (
              <Link to="/cart" className={styles.iconBtn} aria-label="Cart">
                <CartIcon />
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/login" className={styles.loginBtn}>
                <LoginIcon /> LOGIN
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sub-Navbar (Slate Blue background) */}
      <div className={styles.navbarBottomWrapper}>
        <div className={styles.navbarBottom}>
          <div className={styles.filters}>
            <Link to="/search" search={{ sort: 'top_rated' }} className={styles.filterLink}>
              <TrophyIcon /> TOP RATED
            </Link>
            <Link to="/search" search={{ sort: 'new_arrivals' }} className={styles.filterLink}>
              <SparkleIcon /> NEW ARRIVALS
            </Link>
            <Link to="/search" search={{ sort: 'trending' }} className={styles.filterLink}>
              <TrendingIcon /> TRENDING
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className={styles.searchWrap}>
            <span className={styles.searchIcon}>
              <SearchIcon />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              placeholder="Search games..."
            />
          </form>

          {isAuthenticated && (
            <Link to="/" className={styles.wishlistLink}>
              <HeartIcon /> WISHLIST
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
