import { useState } from 'react';
import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { Home, Gamepad2, BarChart2, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { requireCreator } from '../utils/authGuard';
import styles from './creator/styles/creatorLayout.module.css';
import hathorLogo from '../assets/hathor-logo.svg';

export const Route = createFileRoute('/creator')({
  beforeLoad: ({ context, location }) => {
    requireCreator(context.auth, location.href);
  },
  component: CreatorLayout,
});

const NAV_ITEMS = [
  { to: '/creator/overview', label: 'Overview', icon: Home },
  { to: '/creator/my-games', label: 'My Games', icon: Gamepad2 },
  { to: '/creator/analytics', label: 'Analytics', icon: BarChart2 },
];

function CreatorLayout() {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  let pageTitle = 'Studio Overview';
  let breadcrumb = 'CREATOR / OVERVIEW';

  if (currentPath.includes('my-games')) {
    pageTitle = 'My Games';
    breadcrumb = 'CREATOR / MY GAMES';
  } else if (currentPath.includes('analytics')) {
    pageTitle = 'Analytics';
    breadcrumb = 'CREATOR / ANALYTICS';
  }

  const handleNewGame = () => {
    localStorage.removeItem('hathor_game_info_draft_current');
    navigate({ to: '/game-info-form' });
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarExpanded : styles.sidebarCollapsed
        }`}
      >
        {/* Logo */}
        <Link to="/" className={styles.logoSection} title="Back to Hathor Store">
          <img src={hathorLogo} alt="Hathor" className={styles.logoImg} />
          {sidebarOpen && <span className={styles.logoText}>HATHOR</span>}
        </Link>

        {/* Section Label */}
        {sidebarOpen && (
          <div className={styles.sectionLabel}>
            <p className={styles.sectionLabelText}>Creator Studio</p>
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPath === item.to ||
              (item.to === '/creator/overview' && currentPath === '/creator');

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                {isActive && <div className={styles.activeIndicator} />}
                <Icon size={16} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* New Game Button CTA */}
        <div className={styles.newGameWrapper}>
          <button
            type="button"
            className={`${styles.newGameBtn} ${!sidebarOpen ? styles.newGameBtnCollapsed : ''}`}
            onClick={handleNewGame}
            title="Publish New Game"
          >
            <Plus size={14} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>New Game</span>}
          </button>
        </div>

        {/* Collapse Sidebar Button */}
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={() => setSidebarOpen((v) => !v)}
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          <ChevronDown
            size={14}
            style={{
              transform: sidebarOpen ? 'rotate(90deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>
      </aside>

      {/* Main Content */}
      <div className={styles.mainWrapper}>
        <header className={styles.header}>
          <div>
            <p className={styles.breadcrumb}>{breadcrumb}</p>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.userBadge}>
              <div className={styles.userDot} />
              <span>{user?.displayName || 'Creator'}</span>
            </div>
          </div>
        </header>

        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
