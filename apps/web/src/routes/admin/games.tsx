import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { MoreVertical, Search, Filter, Gamepad2, DollarSign, EyeOff, Trash2, ArrowUpRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../components/ui/Dropdown';
import { DataTable } from '../../components/ui/DataTable';
import { apiClient } from '../../services/api/index';
import type { Game } from '@hathor/contracts';

export const Route = createFileRoute('/admin/games')({
  component: AdminGames,
});

function AdminGames() {
  const [games, setGames] = useState<Game[]>([]);
  
  const loadGames = async () => {
    try {
      const { data } = await apiClient.GET('/admin/games');
      if (data?.items) {
        setGames(data.items);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleStatusChange = async (gameId: string, status: 'published' | 'rejected' | 'suspended') => {
    try {
      await apiClient.PATCH('/admin/games/{gameId}/status', {
        params: { path: { gameId } },
        body: { status, reason: 'Admin action' }
      });
      loadGames();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaxonomyChange = async (gameId: string) => {
    const genreIdStr = prompt('Enter new Genre ID (e.g. 1):');
    if (!genreIdStr) return;
    try {
      await apiClient.PATCH('/admin/games/{gameId}/taxonomy' as any, {
        params: { path: { gameId } },
        body: { genreId: parseInt(genreIdStr, 10), tags: [] }
      });
      loadGames();
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <Card style={{ borderTop: '3px solid var(--accent-orange)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Total Games</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '4px', color: 'var(--accent-orange)' }}>
                <Gamepad2 size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-orange)' }}>{games.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                <ArrowUpRight size={14} /> {games.filter(g => (g as any).createdAt && new Date((g as any).createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} added this month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-success)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Catalog Revenue</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px', color: 'var(--status-success)' }}>
                <DollarSign size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-success)' }}>EGP 0.00</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                All-time platform gross
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-info)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Hidden</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '4px', color: 'var(--status-info)' }}>
                <EyeOff size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-info)' }}>{games.filter(g => g.status === 'suspended').length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Needs review
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-danger)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Removed</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: 'var(--status-danger)' }}>
                <Trash2 size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-danger)' }}>{games.filter(g => g.status === 'rejected').length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Policy violations
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--bg-card)', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search games by title, ID or Developer..." 
            className="hathor-input w-full"
            style={{ paddingLeft: '2.5rem', backgroundColor: 'var(--bg-main)' }}
          />
        </div>

        <div className="flex items-center" style={{ gap: '2rem' }}>
          <div className="flex gap-2">
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--accent-orange)', color: 'var(--accent-orange)' }}>ALL ({games.length})</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>PUBLISHED</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>HIDDEN</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>REMOVED</button>
          </div>
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GENRES:</span>
            <div className="flex gap-2">
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--accent-orange)', color: 'var(--accent-orange)' }}>ALL</button>
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>ACTION</button>
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>RPG</button>
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>STRATEGY</button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Filter size={16} />
        Showing <strong style={{ color: 'var(--text-white)' }}>{games.length}</strong> games
      </div>

      {/* Data Table */}
      <DataTable columns={['Game', 'Developer', 'Genre', 'Status', 'Owners', 'Revenue', '']}>
        {games.map(game => (
          <tr key={game.id}>
            <td>
              <div className="flex items-center gap-4">
                <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-orange)' }}>
                  <Gamepad2 size={16} />
                </div>
                <div style={{ fontWeight: 'bold', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
                  {game.title}
                </div>
              </div>
            </td>
            <td style={{ color: 'var(--text-light)' }}>-</td>
            <td style={{ color: 'var(--text-light)' }}>{game.genre?.name || 'Action'}</td>
            <td>
              <Badge variant={
                game.status === 'published' ? 'success' : 
                game.status === 'pending_review' ? 'warning' : 
                game.status === 'suspended' ? 'danger' : 'default'
              }>
                {game.status.toUpperCase().replace('_', ' ')}
              </Badge>
            </td>
            <td style={{ color: 'var(--text-light)' }}>0</td>
            <td style={{ color: 'var(--text-light)' }}>EGP 0.00</td>
            <td style={{ textAlign: 'right' }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hathor-btn" style={{ padding: '0.25rem 0.5rem' }}>
                    <MoreVertical size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleTaxonomyChange(game.id)}>Edit Tags</DropdownMenuItem>
                  <DropdownMenuItem>Remove Featured</DropdownMenuItem>
                  {(game.status === 'pending_review' || game.status === 'suspended' || game.status === 'draft') && 
                    <DropdownMenuItem onSelect={() => handleStatusChange(game.id, 'published')}>Publish Game</DropdownMenuItem>
                  }
                  {(game.status === 'pending_review' || game.status === 'published') && 
                    <DropdownMenuItem variant="danger" onSelect={() => handleStatusChange(game.id, 'suspended')}>Hide from Store</DropdownMenuItem>
                  }
                  <DropdownMenuItem variant="danger">Remove game</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}
        {games.length === 0 && (
          <tr>
            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No games found.
            </td>
          </tr>
        )}
      </DataTable>
    </div>
  );
}
