import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import styles from '../styles/Navbar.module.css';
import {
  HathorLogo,
  SearchIcon,
  GlobeIcon,
  CartIcon,
  LoginIcon,
  TrophyIcon,
  SparkleIcon,
  TrendingIcon,
  HeartIcon,
} from '../assets';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const user = auth?.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isSearchPage = location.pathname.startsWith('/search');

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    if (auth) {
      await auth.logout();
    }
    void navigate({ to: '/' });
  };

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

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className={styles.navbarWrapper}>
      {/* Top Navbar (Black background) */}
      <div className={styles.navbarTopWrapper}>
        <div className={styles.navbarTop}>
          <Link to="/" className={styles.logoArea} onClick={closeMenu}>
            <HathorLogo width={36} height={30} />
            <span className={styles.logoText}>HATHOR</span>
          </Link>

          {/* Desktop Nav Links */}
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

          {/* Desktop Nav Actions */}
          <div className={styles.navActions}>
            <button className={styles.iconBtn} aria-label="Language">
              <GlobeIcon />
            </button>
            {isAuthenticated && (
              <Link to="/cart" className={styles.iconBtn} aria-label="Cart">
                <CartIcon />
              </Link>
            )}

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

          {/* Mobile Right Action Area (Cart + Hamburger) */}
          <div className={styles.mobileActions}>
            {isAuthenticated && (
              <Link to="/cart" className={styles.iconBtn} aria-label="Cart" onClick={closeMenu}>
                <CartIcon />
              </Link>
            )}
            <button
              type="button"
              className={styles.mobileMenuToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className={styles.mobileDrawer}>
            <div className={styles.mobileNavLinks}>
              <Link to="/" className={styles.mobileNavLink} onClick={closeMenu}>
                STORE
              </Link>
              <Link to="/library" className={styles.mobileNavLink} onClick={closeMenu}>
                LIBRARY
              </Link>
              {isAuthenticated ? (
                <Link to="/profile" className={styles.mobileNavLink} onClick={closeMenu}>
                  {user?.displayName ? user.displayName.toUpperCase() : 'PROFILE'}
                </Link>
              ) : (
                <Link to="/login" className={styles.mobileNavLink} onClick={closeMenu}>
                  GUEST
                </Link>
              )}
            </div>

            <div className={styles.mobileNavActions}>
              {isAuthenticated ? (
                <button className={styles.mobileLoginBtn} onClick={handleLogout}>
                  LOGOUT
                </button>
              ) : (
                <Link to="/login" className={styles.mobileLoginBtn} onClick={closeMenu}>
                  <LoginIcon /> LOGIN
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sub-Navbar (Slate Blue background) - Hidden on /search page */}
      {!isSearchPage && (
        <div className={styles.navbarBottomWrapper}>
          <div className={styles.navbarBottom}>
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

            <div className={styles.filtersScroll}>
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

              {isAuthenticated && (
                <Link to="/" className={styles.wishlistLink}>
                  <HeartIcon /> WISHLIST
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
