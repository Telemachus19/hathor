import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import styles from '../styles/Navbar.module.css';
import {
  HathorLogo,
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
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const user = auth?.user;

  const handleLogout = async () => {
    if (auth) {
      await auth.logout();
    }
    void navigate({ to: '/' });
  };

  return (
    <nav className={styles.navbarWrapper}>
      {/* Top Navbar (Black background) */}
      <div className={styles.navbarTopWrapper}>
        <div className={styles.navbarTop}>
          <Link to="/" className={styles.logoArea}>
            <HathorLogo width={36} height={30} />
            <span className={styles.logoText}>HATHOR</span>
          </Link>

          <div className={styles.navLinks}>
            <Link
              to="/"
              className={styles.navLink}
              activeProps={{ className: styles.navLinkActive }}
              activeOptions={{ exact: true }}
            >
              STORE
            </Link>

            <Link
              to="/library"
              className={styles.navLink}
              activeProps={{ className: styles.navLinkActive }}
            >
              LIBRARY
            </Link>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className={styles.navLink}
                activeProps={{ className: styles.navLinkActive }}
              >
                {user?.displayName ? user.displayName.toUpperCase() : 'PROFILE'}
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
            <button className={styles.iconBtn} aria-label="Cart">
              <CartIcon />
            </button>

            {isAuthenticated ? (
              <button className={styles.loginBtn} onClick={handleLogout}>
                LOGOUT
              </button>
            ) : (
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
            <Link to="/" className={`${styles.filterLink} ${styles.filterLinkActive}`}>
              <FlameIcon /> DEALS
            </Link>
            <Link to="/" className={styles.filterLink}>
              <TrophyIcon /> TOP RATED
            </Link>
            <Link to="/" className={styles.filterLink}>
              <SparkleIcon /> NEW ARRIVALS
            </Link>
            <Link to="/" className={styles.filterLink}>
              <TrendingIcon /> TRENDING
            </Link>
          </div>

          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>
              <SearchIcon />
            </span>
            <input type="text" className={styles.searchInput} placeholder="Search games..." />
          </div>

          <Link to="/" className={styles.wishlistLink}>
            <HeartIcon /> WISHLIST
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
