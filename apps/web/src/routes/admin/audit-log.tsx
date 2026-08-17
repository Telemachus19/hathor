import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { MoreVertical, Search, Filter, ShieldAlert, AlertTriangle, Users, ServerCrash, Activity } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../components/ui/Dropdown';
import { DataTable } from '../../components/ui/DataTable';
import { apiClient } from '../../services/api/index';
import type { CatalogAuditLog } from '@hathor/contracts';

export const Route = createFileRoute('/admin/audit-log')({
  component: AdminAuditLog,
});

function AdminAuditLog() {
  const [logs, setLogs] = useState<CatalogAuditLog[]>([]);

  const loadLogs = async () => {
    try {
      // @ts-ignore - The schema AuditLogPage expects items matching CatalogAuditLog.
      const { data } = await apiClient.GET('/admin/audit-logs', { params: { query: { limit: 100 } } });
      if (data?.items) {
        setLogs(data.items as CatalogAuditLog[]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <Card style={{ borderTop: '3px solid var(--accent-orange)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Total Events</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '4px', color: 'var(--accent-orange)' }}>
                <ShieldAlert size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-orange)' }}>{logs.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {logs.filter(l => l.timestamp && new Date(l.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length} today
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-danger)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Security Alerts</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: 'var(--status-danger)' }}>
                <AlertTriangle size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-danger)' }}>{logs.filter(l => l.action.includes('BAN') || l.action.includes('DELETE')).length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Needs review
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-info)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Admin Actions</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '4px', color: 'var(--status-info)' }}>
                <Users size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-info)' }}>{logs.filter(l => !l.actorId).length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                System actions
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-warning)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>System Errors</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '4px', color: 'var(--status-warning)' }}>
                <ServerCrash size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-warning)' }}>{logs.filter(l => l.action.includes('ERROR')).length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Under investigation
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
            placeholder="Search logs by actor, action, or target..." 
            className="hathor-input w-full"
            style={{ paddingLeft: '2.5rem', backgroundColor: 'var(--bg-main)' }}
          />
        </div>

        <div className="flex items-center" style={{ gap: '2rem' }}>
          <div className="flex gap-2">
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--accent-orange)', color: 'var(--accent-orange)' }}>ALL EVENTS</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>USER ACTIONS</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>SYSTEM</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>SECURITY</button>
          </div>
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SEVERITY:</span>
            <div className="flex gap-2">
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--accent-orange)', color: 'var(--accent-orange)' }}>ALL</button>
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>HIGH</button>
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>MEDIUM</button>
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>LOW</button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Filter size={16} />
        Showing <strong style={{ color: 'var(--text-white)' }}>{logs.length}</strong> events
      </div>

      {/* Data Table */}
      <DataTable columns={['Event', 'Actor', 'Target', 'Details', 'Severity', 'Timestamp', '']}>
        {logs.map(log => (
          <tr key={log.id}>
            <td>
              <div className="flex items-center gap-4">
                <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-orange)' }}>
                  <Activity size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>{log.action}</div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{log.id.substring(0, 8)}</div>
                </div>
              </div>
            </td>
            <td style={{ fontWeight: 'bold' }}>{log.actorId ? `${log.actorId.substring(0, 8)}...` : 'System'}</td>
            <td style={{ color: 'var(--text-light)' }}>
              {log.targetType}: {log.targetId ? log.targetId.substring(0, 8) + '...' : 'Global'}
            </td>
            <td style={{ color: 'var(--text-muted)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {JSON.stringify(log.details)}
            </td>
            <td>
              <Badge variant={
                log.action.includes('BAN') || log.action.includes('DELETE') ? 'danger' : 
                log.action.includes('UPDATE') || log.action.includes('CHANGE') ? 'warning' : 'info'
              }>
                {log.action.includes('BAN') || log.action.includes('DELETE') ? 'HIGH' : 
                 log.action.includes('UPDATE') || log.action.includes('CHANGE') ? 'MEDIUM' : 'LOW'}
              </Badge>
            </td>
            <td style={{ color: 'var(--text-light)' }}>
              {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown'}
            </td>
            <td style={{ textAlign: 'right' }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hathor-btn" style={{ padding: '0.25rem 0.5rem' }}>
                    <MoreVertical size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>View Full JSON</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}
        {logs.length === 0 && (
          <tr>
            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No audit logs found.
            </td>
          </tr>
        )}
      </DataTable>
    </div>
  );
}
