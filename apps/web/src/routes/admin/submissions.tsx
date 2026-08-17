import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { MoreVertical, Search, Filter, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../components/ui/Dropdown';
import { DataTable } from '../../components/ui/DataTable';
import { apiClient } from '../../services/api/index';
import type { Game } from '@hathor/contracts';
import { PreviewModal } from '../designer-page/components/modals/PreviewModal';
import { Device } from '../designer-page/types/designerTypes';

export const Route = createFileRoute('/admin/submissions')({
  component: AdminSubmissions,
});

function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Game[]>([]);
  const [previewGame, setPreviewGame] = useState<Game | null>(null);
  const [previewDevice, setPreviewDevice] = useState<Device>('desktop');
  const navigate = useNavigate();

  const loadSubmissions = async () => {
    try {
      const { data } = await apiClient.GET('/admin/submissions');
      if (data?.items) {
        setSubmissions(data.items);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleStatusChange = async (gameId: string, status: 'published' | 'rejected') => {
    try {
      await apiClient.PATCH('/admin/games/{gameId}/status', {
        params: { path: { gameId } },
        body: { status, reason: 'Admin review completed' }
      });
      loadSubmissions();
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
              <span>Pending Reviews</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '4px', color: 'var(--accent-orange)' }}>
                <FileText size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-orange)' }}>{submissions.filter(s => s.status === 'pending_review').length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--status-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                0 high priority
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-success)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Average Time</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px', color: 'var(--status-success)' }}>
                <Clock size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-success)' }}>0 Days</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                No data available
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-info)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Approved Today</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '4px', color: 'var(--status-info)' }}>
                <CheckCircle size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-info)' }}>{submissions.filter(s => s.status === 'published').length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                -
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-danger)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Rejected Today</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: 'var(--status-danger)' }}>
                <XCircle size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-danger)' }}>{submissions.filter(s => s.status === 'rejected').length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                -
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
            placeholder="Search submissions by title or developer..." 
            className="hathor-input w-full"
            style={{ paddingLeft: '2.5rem', backgroundColor: 'var(--bg-main)' }}
          />
        </div>

        <div className="flex items-center" style={{ gap: '2rem' }}>
          <div className="flex gap-2">
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--accent-orange)', color: 'var(--accent-orange)' }}>ALL ({submissions.length})</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>PENDING ({submissions.filter(s => s.status === 'pending_review').length})</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>IN PROGRESS (0)</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>APPROVED</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>REJECTED</button>
          </div>
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TYPE:</span>
            <div className="flex gap-2">
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--accent-orange)', color: 'var(--accent-orange)' }}>ALL</button>
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>NEW GAME</button>
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>UPDATE</button>
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>STORE ASSETS</button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Filter size={16} />
        Showing <strong style={{ color: 'var(--text-white)' }}>{submissions.length}</strong> submissions
      </div>

      {/* Data Table */}
      <DataTable columns={['Submission', 'Developer', 'Type', 'Submitted', 'Status', 'Priority', '']}>
        {submissions.map(sub => (
          <tr key={sub.id} style={{ cursor: 'pointer' }} onClick={() => navigate({ to: `/admin/submissions/${sub.id}` })}>
            <td>
              <div className="flex items-center gap-4">
                <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-info)' }}>
                  <FileText size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>{sub.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {sub.id.substring(0, 8)}</div>
                </div>
              </div>
            </td>
            <td style={{ color: 'var(--text-light)' }}>-</td>
            <td>
              <Badge variant="info">
                NEW GAME
              </Badge>
            </td>
            <td style={{ color: 'var(--text-light)' }}>
              {(sub as any).createdAt ? new Date((sub as any).createdAt).toLocaleDateString() : '-'}
            </td>
            <td>
              <Badge variant={sub.status === 'pending_review' ? 'warning' : sub.status === 'published' ? 'success' : 'default'}>
                {sub.status.toUpperCase().replace('_', ' ')}
              </Badge>
            </td>
            <td>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', border: '1px solid var(--border-color)', padding: '0.1rem 0.5rem', borderRadius: '12px' }}>Normal</span>
            </td>
            <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hathor-btn" style={{ padding: '0.25rem 0.5rem' }}>
                    <MoreVertical size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => navigate({ to: `/admin/submissions/${sub.id}` })}>Review Submission</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setPreviewGame(sub)}>Preview Layout</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleStatusChange(sub.id, 'published')}>Approve</DropdownMenuItem>
                  <DropdownMenuItem variant="danger" onSelect={() => handleStatusChange(sub.id, 'rejected')}>Reject</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}
        {submissions.length === 0 && (
          <tr>
            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No submissions found.
            </td>
          </tr>
        )}
      </DataTable>

      {previewGame && (
        <PreviewModal
          sections={(previewGame.theme as any)?.sections || []}
          pageSettings={(previewGame.theme as any)?.pageSettings || {
            baseTheme: 'dark',
            primaryColor: '#F59E0B',
            secondaryColor: '#3B82F6',
            fontFamily: 'Inter',
            buttonStyle: 'rounded'
          }}
          previewDevice={previewDevice}
          setPreviewDevice={setPreviewDevice}
          onClose={() => setPreviewGame(null)}
        />
      )}
    </div>
  );
}
