import { createFileRoute, Outlet, Link, redirect, useRouterState, useNavigate } from '@tanstack/react-router';
import { Home, Gamepad2, BarChart2, FilePlus2 } from 'lucide-react';
import '../components/ui/ui.css';
import { apiClient } from '../services/api/index';
import { useAuth } from '../context/AuthContext';

export const Route = createFileRoute('/creator')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated || !context.auth.user?.roles.includes('creator')) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: CreatorLayout,
});

function CreatorLayout() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  let pageTitle = 'STUDIO OVERVIEW';
  let breadcrumb = 'CREATOR / OVERVIEW';

  if (currentPath.includes('my-games')) { pageTitle = 'MY GAMES'; breadcrumb = 'CREATOR / GAMES'; }
  else if (currentPath.includes('analytics')) { pageTitle = 'ANALYTICS'; breadcrumb = 'CREATOR / ANALYTICS'; }

  const { user } = useAuth();
  const navigate = useNavigate();
  const handleNewGame = async () => {
    try {
      const { data } = await apiClient.POST('/creator/games', { 
        body: { 
          title: 'New Game', 
          slug: `draft-${Date.now()}`, 
          shortDescription: '', 
          priceEgp: '0.00' 
        } 
      });
      if (data && data.id) {
        navigate({ to: '/creator/games/$gameId/edit', params: { gameId: data.id } });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-white)' }}>
      {/* Sidebar */}
      <aside style={{ width: 'var(--sidebar-width)', backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 'var(--header-height)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <Gamepad2 color="var(--accent-orange)" size={24} />
          <h2 style={{ fontFamily: 'var(--font-logo)', fontSize: '1.25rem', margin: 0, color: 'var(--accent-orange)' }}>HATHOR</h2>
        </div>
        
        <div style={{ padding: '1.5rem 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0 1.5rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-orange)', marginBottom: '1rem' }}>Creator Studio</div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            <NavLink to="/creator/overview" icon={<Home size={18} />} label="OVERVIEW" />
            <NavLink to="/creator/my-games" icon={<Gamepad2 size={18} />} label="MY GAMES" />
            <NavLink to="/creator/analytics" icon={<BarChart2 size={18} />} label="ANALYTICS" />
          </nav>

          <div style={{ padding: '0 1.5rem', marginTop: 'auto' }}>
            <button onClick={handleNewGame} className="hathor-btn hathor-btn-primary w-full flex items-center justify-center gap-2" style={{ padding: '0.75rem' }}>
              <FilePlus2 size={18} />
              NEW GAME
            </button>
          </div>
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.displayName || 'Creator'}</span>
            </div>
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
