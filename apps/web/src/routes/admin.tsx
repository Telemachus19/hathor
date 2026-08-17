import { createFileRoute, Outlet, Link, redirect, useRouterState } from '@tanstack/react-router';
import { Users, Gamepad2, Tags, FileText, Activity, ShieldAlert, CircleUser } from 'lucide-react';
import '../components/ui/ui.css';
import { useAuth } from '../context/AuthContext';

export const Route = createFileRoute('/admin')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated || !context.auth.user?.roles.includes('admin')) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { user } = useAuth();

  let pageTitle = 'Dashboard';
  let breadcrumb = 'ADMIN / OVERVIEW';

  if (currentPath.includes('users')) { pageTitle = 'USER MANAGEMENT'; breadcrumb = 'ADMIN / USERS'; }
  else if (currentPath.includes('games')) { pageTitle = 'GAMES MODERATION'; breadcrumb = 'ADMIN / GAMES'; }
  else if (currentPath.includes('genres')) { pageTitle = 'GENRES & TAGS'; breadcrumb = 'ADMIN / GENRES'; }
  else if (currentPath.includes('submissions')) { pageTitle = 'SUBMISSIONS'; breadcrumb = 'ADMIN / SUBMISSIONS'; }
  else if (currentPath.includes('transactions')) { pageTitle = 'FINANCIAL AUDIT'; breadcrumb = 'ADMIN / TRANSACTIONS'; }
  else if (currentPath.includes('audit-log')) { pageTitle = 'SYSTEM AUDIT LOG'; breadcrumb = 'ADMIN / AUDIT LOG'; }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-white)' }}>
      {/* Sidebar */}
      <aside style={{ width: 'var(--sidebar-width)', backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 'var(--header-height)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.25rem', margin: 0, color: 'var(--accent-orange)' }}>HATHOR</h2>
        </div>
        
        <div style={{ padding: '1.5rem 0', flex: 1 }}>
          <div style={{ padding: '0 1.5rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>Admin Panel</div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <NavLink to="/admin/users" icon={<Users size={18} />} label="USERS" />
            <NavLink to="/admin/games" icon={<Gamepad2 size={18} />} label="GAMES" />
            <NavLink to="/admin/genres" icon={<Tags size={18} />} label="GENRES" />
            <NavLink to="/admin/submissions" icon={<FileText size={18} />} label="SUBMISSIONS" />
            <NavLink to="/admin/transactions" icon={<Activity size={18} />} label="TRANSACTIONS" />
            <NavLink to="/admin/audit-log" icon={<ShieldAlert size={18} />} label="AUDIT LOG" />
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ height: 'var(--header-height)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-topbar)' }}>
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>{breadcrumb}</div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>{pageTitle}</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-card)', padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }}></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin: {user?.displayName || 'Admin'}</span>
            </div>
            <CircleUser size={16} className="text-muted" />
          </div>
        </header>

        {/* Content Area */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      to={to} 
      style={{
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        padding: '0.75rem 1.5rem',
        color: 'var(--text-muted)',
        textDecoration: 'none',
        fontSize: '0.875rem',
        letterSpacing: '0.05em',
        transition: 'all 0.2s',
        borderLeft: '3px solid transparent'
      }}
      activeProps={{
        style: {
          color: 'var(--accent-orange)',
          backgroundColor: 'var(--bg-card-hover)',
          borderLeftColor: 'var(--accent-orange)',
          fontWeight: 600
        }
      }}
    >
      {icon}
      {label}
    </Link>
  );
}
