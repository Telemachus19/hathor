import { useState } from 'react';
import { createFileRoute, Outlet, Link, useRouterState } from '@tanstack/react-router';
import {
  Users,
  Gamepad2,
  LayoutGrid,
  Inbox,
  Activity,
  ScrollText,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { requireAdmin } from '../utils/authGuard';
import styles from './admin/styles/adminLayout.module.css';
import hathorLogo from '../assets/hathor-logo.svg';

export const Route = createFileRoute('/admin')({
  beforeLoad: ({ context, location }) => {
    requireAdmin(context.auth, location.href);
  },
  component: AdminLayout,
});

const NAV_ITEMS = [
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/games', label: 'Games', icon: Gamepad2 },
  { to: '/admin/genres', label: 'Genres', icon: LayoutGrid },
  { to: '/admin/submissions', label: 'Submissions', icon: Inbox },
  { to: '/admin/transactions', label: 'Transactions', icon: Activity },
  { to: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
];

function AdminLayout() {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  let pageTitle = 'Dashboard';
  let breadcrumb = 'ADMIN / OVERVIEW';

  if (currentPath.includes('users')) {
    pageTitle = 'USER MANAGEMENT';
    breadcrumb = 'ADMIN / USERS';
  } else if (currentPath.includes('games')) {
    pageTitle = 'GAME MANAGEMENT';
    breadcrumb = 'ADMIN / GAMES';
  } else if (currentPath.includes('genres')) {
    pageTitle = 'GENRES & TAGS';
    breadcrumb = 'ADMIN / GENRES';
  } else if (currentPath.includes('submissions')) {
    pageTitle = 'CREATOR SUBMISSIONS';
    breadcrumb = 'ADMIN / SUBMISSIONS';
  } else if (currentPath.includes('transactions')) {
    pageTitle = 'FINANCIAL AUDIT';
    breadcrumb = 'ADMIN / TRANSACTIONS';
  } else if (currentPath.includes('audit-log')) {
    pageTitle = 'SYSTEM AUDIT LOG';
    breadcrumb = 'ADMIN / AUDIT LOG';
  }

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarExpanded : styles.sidebarCollapsed}`}>
        <Link to="/" className={styles.logoSection} style={{ textDecoration: 'none' }} title="Back to Hathor Home">
          <img src={hathorLogo} alt="Hathor" className={styles.logoImg} />
          {sidebarOpen && <span className={styles.logoText}>HATHOR</span>}
        </Link>

        {sidebarOpen && (
          <div className={styles.panelBadgeSection}>
            <p className={styles.panelBadgeText}>Admin Panel</p>
          </div>
        )}

        <nav className={styles.navigation}>
          {NAV_ITEMS.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPath.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <div className={styles.navIcon}>
                  <IconComponent size={16} />
                </div>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className={styles.collapseToggle}
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

      {/* Main Area */}
      <div className={styles.mainWrapper}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div>
            <div className={styles.breadcrumb}>{breadcrumb}</div>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.adminBadge}>
              <div className={styles.statusIndicator} />
              <span>Admin: {user?.displayName || 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
