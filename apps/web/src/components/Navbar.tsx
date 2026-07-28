import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import styles from '../styles/Navbar.module.css';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GlobeIcon, CartIcon, LoginIcon, UserIcon, HathorLogo } from '../assets';

export const Navbar: React.FC<{ initialCartCount?: number }> = ({ initialCartCount = 2 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');
  const [cartCount] = useState(initialCartCount);

  const { isAuthenticated, user, logout } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'AR', name: 'العربية' },
    { code: 'FR', name: 'Français' },
    { code: 'DE', name: 'Deutsch' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setLangMenuOpen(false);
  };

  const handleLanguageChange = (code: string) => {
    setCurrentLang(code);
    setLangMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('info', 'Logged out successfully.');
      closeMobileMenu();
    } catch (err) {
      console.error('[Logout Error]', err);
    }
  };

  return (
    <nav className={styles.navbarWrapper}>
      {/* Main Top Navbar */}
      <div className={styles.navbarTopWrapper}>
        <div className={styles.navbarTop}>
          {/* Brand Logo & Title */}
          <Link to="/" className={styles.logoArea} onClick={closeMobileMenu}>
            <HathorLogo width={42} height={36} className={styles.logoSvg} />
            <span className={styles.logoText}>HATHOR</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className={styles.navLinks}>
            <Link
              to="/"
              className={`${styles.navLink} ${isActive('/') ? styles.navLinkActive : ''}`}
            >
              STORE
            </Link>
            <Link
              to="/library"
              className={`${styles.navLink} ${isActive('/library') ? styles.navLinkActive : ''}`}
            >
              LIBRARY
            </Link>

            {isAuthenticated && (
              <Link
                to="/profile"
                className={`${styles.navLink} ${isActive('/profile') ? styles.navLinkActive : ''}`}
              >
                PROFILE
              </Link>
            )}
          </div>

          {/* Desktop Right Actions */}
          <div className={styles.navActions}>
            {/* Language Dropdown Selector */}
            <div className={styles.langSelectorWrap}>
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.langBtn}`}
                onClick={() => setLangMenuOpen((prev) => !prev)}
                aria-label="Language Selector"
              >
                <GlobeIcon />
                <span className={styles.langText}>{currentLang}</span>
              </button>

              {langMenuOpen && (
                <div className={styles.langDropdown}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`${styles.langOption} ${currentLang === lang.code ? styles.langSelected : ''}`}
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      <span>{lang.name}</span>
                      {currentLang === lang.code && <span className={styles.langCheck}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Icon Link */}
            <Link to="/" className={styles.cartBtn} aria-label="Shopping Cart">
              <CartIcon />
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </Link>

            {/* Dynamic Auth Section: User Profile & Logout vs Login */}
            <div className={styles.userAuthWrap}>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className={`${styles.userProfileBtn} ${isActive('/profile') ? styles.userProfileActive : ''}`}
                  >
                    <UserIcon /> {user?.displayName ? user.displayName.toUpperCase() : 'PROFILE'}
                  </Link>

                  <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className={`${styles.loginBtn} ${isActive('/login') ? styles.loginBtnActive : ''}`}
                >
                  <LoginIcon /> LOGIN
                </Link>
              )}
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              className={styles.hamburgerBtn}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu"
            >
              <span
                className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.lineTopOpen : ''}`}
              />
              <span
                className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.lineMidOpen : ''}`}
              />
              <span
                className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.lineBotOpen : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileNavLinks}>
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`${styles.mobileNavLink} ${isActive('/') ? styles.mobileNavLinkActive : ''}`}
            >
              STORE
            </Link>
            <Link
              to="/library"
              onClick={closeMobileMenu}
              className={`${styles.mobileNavLink} ${isActive('/library') ? styles.mobileNavLinkActive : ''}`}
            >
              LIBRARY
            </Link>

            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className={`${styles.mobileNavLink} ${isActive('/profile') ? styles.mobileNavLinkActive : ''}`}
              >
                PROFILE
              </Link>
            )}
          </div>

          <div className={styles.mobileDivider} />

          <div className={styles.mobileActions}>
            <div className={styles.mobileLangRow}>
              <button
                type="button"
                className={styles.mobileLangToggle}
                onClick={() => setLangMenuOpen((prev) => !prev)}
              >
                <div className={styles.mobileLangLeft}>
                  <GlobeIcon />
                  <span>LANGUAGE</span>
                </div>
                <span className={styles.mobileLangCurrent}>{currentLang}</span>
              </button>

              {langMenuOpen && (
                <div className={styles.mobileLangDropdown}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`${styles.langOption} ${currentLang === lang.code ? styles.langSelected : ''}`}
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      <span>{lang.name}</span>
                      {currentLang === lang.code && <span className={styles.langCheck}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Mobile Auth Controls */}
            {isAuthenticated ? (
              <div className={styles.mobileUserRow}>
                <Link to="/profile" onClick={closeMobileMenu} className={styles.mobileUserBtn}>
                  <UserIcon /> {user?.displayName || 'PROFILE'}
                </Link>
                <button type="button" onClick={handleLogout} className={styles.mobileLogoutBtn}>
                  LOGOUT
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className={`${styles.mobileLoginBtn} ${isActive('/login') ? styles.mobileLoginActive : ''}`}
              >
                <LoginIcon /> LOGIN
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
