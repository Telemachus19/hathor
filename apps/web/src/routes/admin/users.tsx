import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { MoreVertical, Search, Filter, Zap, ArrowUpRight, UserX, Users as UsersIcon } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../components/ui/Dropdown';
import { DataTable } from '../../components/ui/DataTable';
import { apiClient } from '../../services/api/index';
import type { User } from '@hathor/contracts';

export const Route = createFileRoute('/admin/users')({
  component: AdminUsers,
});

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  
  const loadUsers = async () => {
    try {
      const { data } = await apiClient.GET('/admin/users');
      if (data?.items) {
        setUsers(data.items);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleStatusChange = async (userId: string, status: 'active' | 'suspended' | 'banned') => {
    try {
      await apiClient.PATCH('/admin/users/{userId}/status', {
        params: { path: { userId } },
        body: { status }
      });
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (userId: string, role: 'creator' | 'admin', action: 'grant' | 'revoke') => {
    try {
      await apiClient.POST('/admin/users/{userId}/roles', {
        params: { path: { userId } },
        body: { role, action }
      });
      loadUsers();
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
              <span>Total Users</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '4px', color: 'var(--accent-orange)' }}>
                <UsersIcon size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-orange)' }}>{users.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                <ArrowUpRight size={14} /> {users.filter(u => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} this week
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-success)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Active Today</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px', color: 'var(--status-success)' }}>
                <Zap size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-success)' }}>{users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Active last 24h
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-info)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>New This Month</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '4px', color: 'var(--status-info)' }}>
                <UsersIcon size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-info)' }}>{users.filter(u => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                Active accounts
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-danger)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Banned Users</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: 'var(--status-danger)' }}>
                <UserX size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-danger)' }}>{users.filter(u => u.status === 'banned').length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                0 appeals pending
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
            placeholder="Search by username, email or ID..." 
            className="hathor-input w-full"
            style={{ paddingLeft: '2.5rem', backgroundColor: 'var(--bg-main)' }}
          />
        </div>

        <div className="flex items-center" style={{ gap: '2rem' }}>
          <div className="flex gap-2">
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--accent-orange)', color: 'var(--accent-orange)' }}>ALL ({users.length})</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>ACTIVE</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>TEMP BAN</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>PERMA BAN</button>
          </div>
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>
          <div className="flex gap-2">
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--accent-orange)', color: 'var(--accent-orange)' }}>ALL ROLES</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>USER</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>DEVELOPER</button>
            <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>MODERATOR</button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Filter size={16} />
        Showing <strong style={{ color: 'var(--text-white)' }}>{users.length}</strong> users
      </div>

      {/* Data Table */}
      <DataTable columns={['User', 'Email', 'Role', 'Status', 'Joined', 'Last Seen', 'Spent', '']}>
        {users.map(user => {
          const displayRole = user.roles.includes('admin') ? 'ADMIN' : user.roles.includes('creator') ? 'DEV' : 'USER';
          const displayDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';
          const lastSeen = user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never';
          
          return (
          <tr key={user.id}>
            <td>
              <div className="flex items-center gap-4">
                <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent-orange)', fontSize: '0.75rem' }}>
                  {user.displayName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>{user.displayName}</div>
                </div>
              </div>
            </td>
            <td style={{ color: 'var(--text-light)' }}>{user.email}</td>
            <td>
              <Badge variant={displayRole === 'DEV' ? 'info' : displayRole === 'ADMIN' ? 'warning' : 'default'}>
                {displayRole}
              </Badge>
            </td>
            <td>
              <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                {user.status.toUpperCase()}
              </Badge>
            </td>
            <td style={{ color: 'var(--text-light)' }}>{displayDate}</td>
            <td style={{ color: 'var(--text-light)' }}>{lastSeen}</td>
            <td style={{ fontWeight: 'bold' }}>0.00</td>
            <td style={{ textAlign: 'right' }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hathor-btn" style={{ padding: '0.25rem 0.5rem' }}>
                    <MoreVertical size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  
                  {/* Role Management */}
                  {!user.roles.includes('creator') && <DropdownMenuItem onSelect={() => handleRoleChange(user.id, 'creator', 'grant')}>Make Creator</DropdownMenuItem>}
                  {user.roles.includes('creator') && <DropdownMenuItem variant="danger" onSelect={() => handleRoleChange(user.id, 'creator', 'revoke')}>Remove Creator</DropdownMenuItem>}
                  {!user.roles.includes('admin') && <DropdownMenuItem onSelect={() => handleRoleChange(user.id, 'admin', 'grant')}>Make Admin</DropdownMenuItem>}
                  {user.roles.includes('admin') && <DropdownMenuItem variant="danger" onSelect={() => handleRoleChange(user.id, 'admin', 'revoke')}>Remove Admin</DropdownMenuItem>}

                  <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }}></div>

                  {user.status !== 'suspended' && <DropdownMenuItem variant="danger" onSelect={() => handleStatusChange(user.id, 'suspended')}>Suspend User</DropdownMenuItem>}
                  {user.status !== 'banned' && <DropdownMenuItem variant="danger" onSelect={() => handleStatusChange(user.id, 'banned')}>Perma Ban</DropdownMenuItem>}
                  {user.status !== 'active' && <DropdownMenuItem onSelect={() => handleStatusChange(user.id, 'active')}>Restore Access</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        )})}
      </DataTable>

    </div>
  );
}

