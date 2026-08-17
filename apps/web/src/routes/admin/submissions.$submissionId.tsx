import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Monitor, Smartphone } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../services/api/index';
import type { Game } from '@hathor/contracts';
import { PreviewModal } from '../designer-page/components/modals/PreviewModal';
import { Device } from '../designer-page/types/designerTypes';

export const Route = createFileRoute('/admin/submissions/$submissionId')({
  component: AdminSubmissionDetail,
});

function AdminSubmissionDetail() {
  const { submissionId } = Route.useParams() as { submissionId: string };
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [previewDevice, setPreviewDevice] = useState<Device | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadSubmission = async () => {
    try {
      const { data } = await apiClient.GET('/admin/submissions');
      if (data?.items) {
        const found = data.items.find((s: Game) => s.id === submissionId);
        if (found) setSubmission(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const handleStatusChange = async (status: 'published' | 'rejected') => {
    if (status === 'rejected' && !rejectReason) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      await apiClient.PATCH('/admin/games/{gameId}/status', {
        params: { path: { gameId: submissionId } },
        body: { status, reason: status === 'rejected' ? rejectReason : 'Admin review completed' }
      });
      navigate({ to: '/admin/submissions' });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading submission details...</div>;
  if (!submission) return <div style={{ padding: '2rem', color: 'var(--status-danger)' }}>Submission not found.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <Link to="/admin/submissions" className="hathor-btn" style={{ padding: '0.5rem', backgroundColor: 'var(--bg-card)' }}>
          <ArrowLeft size={16} />
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>{submission.title}</h1>
            <Badge variant="warning">PENDING REVIEW</Badge>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            ID: {submission.id} • Submitted by IronGatesDev
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Details & Assets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <Card style={{ borderTop: '3px solid var(--status-info)' }}>
            <CardHeader>
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Store Page Preview</h3>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button onClick={() => setPreviewDevice('desktop')} className="hathor-btn hathor-btn-primary flex items-center gap-2">
                  <Monitor size={16} /> Preview Desktop
                </button>
                <button onClick={() => setPreviewDevice('mobile')} className="hathor-btn flex items-center gap-2">
                  <Smartphone size={16} /> Preview Mobile
                </button>
              </div>
              
              <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Game Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Short Desc:</div>
                  <div>{submission.shortDescription || 'No description provided.'}</div>
                  
                  <div style={{ color: 'var(--text-muted)' }}>Price:</div>
                  <div>EGP {submission.priceEgp}</div>
                  
                  <div style={{ color: 'var(--text-muted)' }}>Genre:</div>
                  <div>{submission.genre?.name || 'Uncategorized'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Content Checklist</h3>
            </CardHeader>
            <CardContent>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <CheckCircle size={20} color="var(--status-success)" />
                  <span>Store Assets (Capsule, Background, Screenshots) provided</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <CheckCircle size={20} color="var(--status-success)" />
                  <span>Valid Build uploaded</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <CheckCircle size={20} color="var(--status-success)" />
                  <span>Theme configurations match schema</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--border-color)' }}></div>
                  <span>Content Guidelines Review (Manual)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Review Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <Card style={{ position: 'sticky', top: '2rem' }}>
            <CardHeader>
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Review Decision</h3>
            </CardHeader>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Rejection Reason (if rejecting)</label>
                <textarea 
                  className="hathor-input" 
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Explain what needs to be fixed..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button 
                  onClick={() => handleStatusChange('published')}
                  className="hathor-btn hathor-btn-primary flex items-center justify-center gap-2"
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem', backgroundColor: 'var(--status-success)', color: '#fff', border: 'none' }}
                >
                  <CheckCircle size={20} /> APPROVE & PUBLISH
                </button>
                <button 
                  onClick={() => handleStatusChange('rejected')}
                  className="hathor-btn flex items-center justify-center gap-2"
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                >
                  <XCircle size={20} /> REJECT SUBMISSION
                </button>
              </div>

            </CardContent>
          </Card>

        </div>
      </div>

      {previewDevice && (
        <PreviewModal
          sections={(submission.theme as any)?.sections || []}
          pageSettings={(submission.theme as any)?.pageSettings || {
            baseTheme: 'dark',
            primaryColor: '#F59E0B',
            secondaryColor: '#3B82F6',
            fontFamily: 'Inter',
            buttonStyle: 'rounded'
          }}
          previewDevice={previewDevice}
          setPreviewDevice={setPreviewDevice}
          onClose={() => setPreviewDevice(null)}
        />
      )}
    </div>
  );
}
