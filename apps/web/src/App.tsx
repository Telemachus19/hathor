import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from './pages/landing-page/LandingPage';
import GameDetailsPage from './pages/game-details/GameDetailsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'details'>('details');

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ position: 'relative' }}>
        {/* Top-Right Page View Switcher (Landing Page vs Game Details) */}
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1.5rem',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(14, 17, 22, 0.95)',
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            border: '1px solid var(--accent-orange, #f26b21)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#e6ddcb', fontWeight: 800 }}>VIEW:</span>
          <button
            onClick={() => setCurrentView('landing')}
            style={{
              background: currentView === 'landing' ? 'var(--accent-orange, #f26b21)' : 'transparent',
              color: currentView === 'landing' ? '#0e1116' : '#ffffff',
              border: '1px solid var(--accent-orange, #f26b21)',
              padding: '0.3rem 0.7rem',
              borderRadius: '4px',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            Landing Page
          </button>
          <button
            onClick={() => setCurrentView('details')}
            style={{
              background: currentView === 'details' ? 'var(--accent-orange, #f26b21)' : 'transparent',
              color: currentView === 'details' ? '#0e1116' : '#ffffff',
              border: '1px solid var(--accent-orange, #f26b21)',
              padding: '0.3rem 0.7rem',
              borderRadius: '4px',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            Game Details
          </button>
        </div>

        {currentView === 'landing' ? <LandingPage /> : <GameDetailsPage />}
      </div>
    </QueryClientProvider>
  );
}

export default App;
