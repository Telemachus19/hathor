import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';

export const HathorLogo: React.FC<{
    className?: string;
}> = ({ className = '' }) => {
    return (
        <svg
            viewBox="0 0 950 780"
            className={`hathor-logo ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Hathor Logo"
            role="img"
        >
            {/* Horns */}
            <g className="logo-horns">
                {/* Left Horn */}
                <path d="M 230 220 Q 150 70 120 0 Q 210 50 270 240 Z" />

                {/* Right Horn */}
                <path d="M 760 220 Q 840 70 870 0 Q 780 50 720 240 Z" />
            </g>

            {/* Main Cartouche Yellow Outer Frame & Body */}
            <g className="logo-yellow-frame">
                <path
                    d="
            M 260 185
            C 450 150 750 150 860 185
            C 970 230 985 390 945 540
            C 915 670 855 745 780 755
            C 710 765 675 690 635 625
            L 485 545
            C 320 545 220 645 190 715
            C 150 795 60 765 25 665
            C -5 565 15 365 110 225
            C 165 145 235 180 260 185 Z
          "
                />
            </g>

            {/* Red Cartouche Oval */}
            <rect
                className="logo-red-cartouche"
                x="270"
                y="195"
                width="600"
                height="350"
                rx="175"
                ry="175"
            />

            {/* Ankh Symbol */}
            <g className="logo-ankh">
                {/* Top Oval Loop */}
                <path
                    d="
            M 435 275
            C 400 275 375 305 375 340
            C 375 375 400 410 435 435
            C 470 410 495 375 495 340
            C 495 305 470 275 435 275 Z

            M 435 308
            C 452 308 465 325 465 340
            C 465 362 448 392 435 407
            C 422 392 405 362 405 340
            C 405 325 418 308 435 308 Z
          "
                />

                {/* Horizontal Bar */}
                <rect
                    x="360"
                    y="435"
                    width="150"
                    height="26"
                    rx="6"
                />

                {/* Vertical Stem */}
                <path d="M 418 458 L 410 535 L 460 535 L 452 458 Z" />
            </g>

            {/* White Horizontal Pill Bar */}
            <rect
                className="logo-white-pill"
                x="615"
                y="350"
                width="180"
                height="52"
                rx="26"
            />

            {/* Cobra Head & Hood Details */}
            <g className="logo-cobra">
                {/* Outer Green Trim */}
                <path
                    className="cobra-green"
                    d="
            M 5 200
            C 50 170 150 190 230 280
            C 175 220 65 200 25 230 Z
          "
                />

                {/* Snake Head Tip */}
                <path
                    className="cobra-green"
                    d="
            M 0 200
            C 20 185 55 185 75 205
            C 55 212 35 212 10 210 Z
          "
                />

                {/* Eye */}
                <ellipse
                    className="cobra-eye"
                    cx="50"
                    cy="198"
                    rx="8"
                    ry="6"
                />

                {/* Pupil */}
                <circle
                    className="cobra-pupil"
                    cx="48"
                    cy="198"
                    r="3"
                />

                {/* Top Blue Section */}
                <path
                    className="cobra-blue"
                    d="
            M 45 235
            C 75 235 105 250 125 280
            L 75 330
            C 60 300 50 270 45 235 Z
          "
                />

                <path
                    className="cobra-blue-light"
                    d="
            M 125 280
            C 155 310 175 350 190 390
            L 125 390
            C 115 360 100 330 75 330 Z
          "
                />

                {/* Middle Red/Brown Section */}
                <path
                    className="cobra-red"
                    d="
            M 30 350
            C 45 350 75 360 105 390
            L 65 460
            C 45 430 35 390 30 350 Z
          "
                />

                <path
                    className="cobra-red"
                    d="
            M 105 390
            C 135 420 160 460 175 500
            L 115 500
            C 100 470 85 430 65 460 Z
          "
                />

                {/* Bottom Green Section */}
                <path
                    className="cobra-green"
                    d="
            M 20 470
            C 35 470 55 490 70 530
            L 35 590
            C 25 550 20 510 20 470 Z
          "
                />

                <path
                    className="cobra-green"
                    d="
            M 70 530
            C 90 570 105 620 110 660
            L 65 660
            C 60 620 50 570 35 590 Z
          "
                />
            </g>
        </svg>
    );
};

export const Header: React.FC<{
    initialCartCount?: number;
}> = ({ initialCartCount = 2 }) => {
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('EN');
    const [cartCount] = useState(initialCartCount);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    return (
        <header className="site-header">
            <div className="header-container">

                {/* Brand */}
                <div className="header-brand-section">
                    <Link
                        to="/"
                        className="header-brand"
                        onClick={closeMobileMenu}
                    >
                        <HathorLogo />

                        <span className="brand-title">
                            HATHOR
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav">
                        <Link
                            to="/"
                            className={`nav-link ${isActive('/') ? 'active' : ''
                                }`}
                        >
                            STORE
                        </Link>

                        <Link
                            to="/library"
                            className={`nav-link ${isActive('/library') ? 'active' : ''
                                }`}
                        >
                            LIBRARY
                        </Link>
                    </nav>
                </div>

                {/* Desktop Actions */}
                <div className="desktop-actions">

                    {/* Language Selector */}
                    <div className="language-selector">
                        <button
                            className={`language-button ${langMenuOpen ? 'active' : ''
                                }`}
                            onClick={() =>
                                setLangMenuOpen(!langMenuOpen)
                            }
                            aria-label="Select Language"
                            aria-expanded={langMenuOpen}
                            type="button"
                        >
                            {/* Globe Icon */}
                            <svg
                                className="globe-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                />

                                <line
                                    x1="2"
                                    y1="12"
                                    x2="22"
                                    y2="12"
                                />

                                <path
                                    d="
                    M12 2
                    a15.3 15.3 0 0 1 4 10
                    a15.3 15.3 0 0 1-4 10
                    a15.3 15.3 0 0 1-4-10
                    a15.3 15.3 0 0 1 4-10z
                  "
                                />
                            </svg>

                            <span>{currentLang}</span>
                        </button>

                        {/* Desktop Language Dropdown */}
                        {langMenuOpen && (
                            <div className="language-dropdown">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        className={`language-option ${currentLang === lang.code
                                            ? 'selected'
                                            : ''
                                            }`}
                                        onClick={() =>
                                            handleLanguageChange(lang.code)
                                        }
                                        type="button"
                                    >
                                        <span>{lang.name}</span>

                                        {currentLang === lang.code && (
                                            <span className="language-check">
                                                ✓
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart */}
                    <Link
                        to="/"
                        className="cart-link"
                        aria-label="Shopping Cart"
                    >
                        <svg
                            className="cart-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <circle
                                cx="9"
                                cy="21"
                                r="1"
                            />

                            <circle
                                cx="20"
                                cy="21"
                                r="1"
                            />

                            <path
                                d="
                  M1 1h4
                  l2.68 13.39
                  a2 2 0 0 0 2 1.61
                  h9.72
                  a2 2 0 0 0 2-1.61
                  L23 6H6
                "
                            />
                        </svg>

                        {cartCount > 0 && (
                            <span className="cart-badge">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Sign In */}
                    <Link
                        to="/login"
                        className={`sign-in-link ${isActive('/login') ? 'active' : ''
                            }`}
                    >
                        SIGN IN
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-button"
                    onClick={() =>
                        setMobileMenuOpen(!mobileMenuOpen)
                    }
                    aria-label="Toggle Navigation Menu"
                    aria-expanded={mobileMenuOpen}
                    type="button"
                >
                    <svg
                        className="menu-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d={
                                mobileMenuOpen
                                    ? 'M6 18L18 6M6 6l12 12'
                                    : 'M4 6h16M4 12h16M4 18h16'
                            }
                        />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="mobile-menu">

                    {/* Mobile Navigation */}
                    <nav className="mobile-nav">
                        <Link
                            to="/"
                            onClick={closeMobileMenu}
                            className={`mobile-nav-link ${isActive('/') ? 'active' : ''
                                }`}
                        >
                            STORE
                        </Link>

                        <Link
                            to="/library"
                            onClick={closeMobileMenu}
                            className={`mobile-nav-link ${isActive('/library') ? 'active' : ''
                                }`}
                        >
                            LIBRARY
                        </Link>
                    </nav>

                    {/* Mobile Actions */}
                    <div className="mobile-actions">

                        {/* Mobile Language */}
                        <div className="mobile-language-wrapper">
                            <button
                                className={`mobile-action-button ${langMenuOpen ? 'active' : ''
                                    }`}
                                onClick={() =>
                                    setLangMenuOpen(!langMenuOpen)
                                }
                                type="button"
                            >
                                <span className="mobile-action-content">
                                    <svg
                                        className="mobile-action-icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                        />

                                        <line
                                            x1="2"
                                            y1="12"
                                            x2="22"
                                            y2="12"
                                        />

                                        <path
                                            d="
                        M12 2
                        a15.3 15.3 0 0 1 4 10
                        a15.3 15.3 0 0 1-4 10
                        a15.3 15.3 0 0 1-4-10
                        a15.3 15.3 0 0 1 4-10z
                      "
                                        />
                                    </svg>

                                    <span>LANGUAGE</span>
                                </span>

                                <span>{currentLang}</span>
                            </button>

                            {/* Mobile Language Dropdown */}
                            {langMenuOpen && (
                                <div className="mobile-language-dropdown">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            className={`language-option ${currentLang === lang.code
                                                ? 'selected'
                                                : ''
                                                }`}
                                            onClick={() =>
                                                handleLanguageChange(lang.code)
                                            }
                                            type="button"
                                        >
                                            <span>{lang.name}</span>

                                            {currentLang === lang.code && (
                                                <span className="language-check">
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mobile Cart */}
                        <Link
                            to="/"
                            onClick={closeMobileMenu}
                            className="mobile-action-button"
                        >
                            <span className="mobile-action-content">
                                <svg
                                    className="mobile-action-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="9"
                                        cy="21"
                                        r="1"
                                    />

                                    <circle
                                        cx="20"
                                        cy="21"
                                        r="1"
                                    />

                                    <path
                                        d="
                      M1 1h4
                      l2.68 13.39
                      a2 2 0 0 0 2 1.61
                      h9.72
                      a2 2 0 0 0 2-1.61
                      L23 6H6
                    "
                                    />
                                </svg>

                                <span>CART</span>
                            </span>

                            {cartCount > 0 && (
                                <span className="mobile-cart-count">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Mobile Sign In */}
                        <Link
                            to="/login"
                            onClick={closeMobileMenu}
                            className={`mobile-sign-in ${isActive('/login') ? 'active' : ''
                                }`}
                        >
                            SIGN IN
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};
