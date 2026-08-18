import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import {
  Users as UsersIcon,
  Activity,
  UserPlus,
  UserX,
  MoreVertical,
  Calendar,
  Clock,
  Shield,
  Ban,
  ShieldOff,
  ShieldCheck,
  Check,
  Filter,
  Globe,
} from 'lucide-react';
import { AdminStatsGrid, AdminStatItem } from './components/common/AdminStatsCard';
import { AdminFilterBar } from './components/common/AdminFilterBar';
import { UserStatusBadge, RoleBadge } from './components/common/AdminBadges';
import { UserActionModal, UserModalAction } from './components/UserActionModal';
import { apiClient } from '../../services/api/index';
import type { User, Order } from '@hathor/contracts';
import commonStyles from './styles/adminCommon.module.css';

export const Route = createFileRoute('/admin/users')({
  component: AdminUsers,
});

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'temp_banned' | 'perma_banned'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'creator' | 'admin'>('all');
  const [modal, setModal] = useState<{ user: User; action: UserModalAction } | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadData = async () => {
    try {
      const [{ data: usersData }, { data: trxData }] = await Promise.all([
        apiClient.GET('/admin/users'),
        apiClient.GET('/admin/transactions'),
      ]);

      if (usersData?.items) {
        setUsers(usersData.items);
      }
      if (trxData?.items) {
        setTransactions(trxData.items);
      }
    } catch (err) {
      console.error('Failed to load users or transactions:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const userSpentMap = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((trx) => {
      const userId = (trx as any).userId;
      if (userId && trx.status === 'fulfilled') {
        const current = map.get(userId) || 0;
        map.set(userId, current + Number(trx.totalAmountEgp || 0));
      }
    });
    return map;
  }, [transactions]);

  const handleStatusChange = async (userId: string, status: 'active' | 'suspended' | 'banned') => {
    try {
      await apiClient.PATCH('/admin/users/{userId}/status', {
        params: { path: { userId } },
        body: { status },
      });
      showToast(`User status updated to ${status}`);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to update user status');
    }
  };

  const handleRoleChange = async (userId: string, role: 'creator' | 'admin', action: 'grant' | 'revoke') => {
    try {
      await apiClient.POST('/admin/users/{userId}/roles', {
        params: { path: { userId } },
        body: { role, action },
      });
      showToast(`Role ${role} ${action === 'grant' ? 'granted' : 'revoked'}`);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to change user role');
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.status === 'active') ||
        (statusFilter === 'temp_banned' && u.status === 'suspended') ||
        (statusFilter === 'perma_banned' && u.status === 'banned');

      const matchRole =
        roleFilter === 'all' ||
        (roleFilter === 'admin' && u.roles.includes('admin')) ||
        (roleFilter === 'creator' && u.roles.includes('creator')) ||
        (roleFilter === 'user' && !u.roles.includes('admin') && !u.roles.includes('creator'));

      return matchSearch && matchStatus && matchRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  // Top Stats
  const stats: AdminStatItem[] = [
    {
      label: 'Total Users',
      value: users.length.toString(),
      delta: `+${users.filter((u) => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} this week`,
      icon: UsersIcon,
      color: '#fd7014',
    },
    {
      label: 'Active Today',
      value: users.filter((u) => u.lastLoginAt && new Date(u.lastLoginAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length.toString(),
      delta: 'Active last 24h',
      icon: Activity,
      color: '#4caf80',
    },
    {
      label: 'New This Month',
      value: users.filter((u) => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length.toString(),
      delta: 'New accounts created',
      icon: UserPlus,
      color: '#3b9eda',
    },
    {
      label: 'Banned Users',
      value: users.filter((u) => u.status === 'banned' || u.status === 'suspended').length.toString(),
      delta: `${users.filter((u) => u.status === 'suspended').length} temp · ${users.filter((u) => u.status === 'banned').length} perma`,
      icon: UserX,
      color: '#e74c3c',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {toast && (
        <div className={commonStyles.toast}>
          <Check size={11} style={{ color: '#4caf80' }} />
          <span>{toast}</span>
        </div>
      )}

      {openMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpenMenu(null)} />}

      {modal && (
        <UserActionModal
          user={modal.user}
          action={modal.action}
          spent={modal?.user ? userSpentMap.get(modal.user.id) || 0 : 0}
          onClose={() => setModal(null)}
          onConfirmStatus={(userId, status) => handleStatusChange(userId, status)}
        />
      )}

      {/* Top Stats */}
      <AdminStatsGrid stats={stats} />

      {/* Search & Filters */}
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by username, email, or country..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={[
          { id: 'all', label: 'All', count: users.length },
          { id: 'active', label: 'Active', count: users.filter((u) => u.status === 'active').length },
          { id: 'temp_banned', label: 'Temp Ban', count: users.filter((u) => u.status === 'suspended').length },
          { id: 'perma_banned', label: 'Perma Ban', count: users.filter((u) => u.status === 'banned').length },
        ]}
        secondaryFilter={roleFilter}
        onSecondaryFilterChange={setRoleFilter}
        secondaryOptions={[
          { id: 'all', label: 'All Roles' },
          { id: 'user', label: 'User' },
          { id: 'creator', label: 'Developer' },
          { id: 'admin', label: 'Admin' },
        ]}
      />

      {/* Results Header */}
      <div className={commonStyles.resultsMeta}>
        <Filter size={10} />
        <span>
          Showing <strong>{filteredUsers.length}</strong> of {users.length} users
        </span>
      </div>

      {/* Data Table */}
      <div className={commonStyles.tableContainer}>
        <div
          className={commonStyles.tableHeader}
          style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr auto' }}
        >
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Joined</span>
          <span>Last Seen</span>
          <span>Spent</span>
          <span style={{ width: 28 }} />
        </div>

        {filteredUsers.length === 0 ? (
          <div className={commonStyles.emptyState}>
            <UsersIcon size={28} className={commonStyles.emptyIcon} />
            <p className={commonStyles.emptyTitle}>No users match your criteria</p>
            <p className={commonStyles.emptyDesc}>Try adjusting your search terms or filters</p>
          </div>
        ) : (
          filteredUsers.map((user, idx) => {
            const role = user.roles.includes('admin') ? 'admin' : user.roles.includes('creator') ? 'creator' : 'user';
            const displayDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';
            const lastSeen = user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never';

            return (
              <div
                key={user.id}
                className={`${commonStyles.tableRow} ${idx % 2 === 1 ? commonStyles.tableRowAlt : ''} ${openMenu === user.id ? commonStyles.tableRowActive : ''}`}
                style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr auto' }}
              >
                {/* User */}
                <div className={commonStyles.userCell}>
                  <div className={commonStyles.avatarBox}>
                    {user.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p className={commonStyles.cellTitle}>{user.displayName}</p>
                    <div className={commonStyles.cellSubtitle}>
                      <Globe size={8} style={{ flexShrink: 0 }} />
                      <span>Egypt</span>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <span className={commonStyles.monoText} style={{ paddingRight: '1rem' }}>
                  {user.email}
                </span>

                {/* Role */}
                <div>
                  <RoleBadge role={role} />
                </div>

                {/* Status */}
                <div>
                  <UserStatusBadge status={user.status} />
                </div>

                {/* Joined */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={9} style={{ color: '#8c9aaa' }} />
                  <span className={commonStyles.monoText}>{displayDate}</span>
                </div>

                {/* Last Seen */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={9} style={{ color: user.lastLoginAt ? '#4caf80' : '#8c9aaa' }} />
                  <span className={commonStyles.monoText}>{lastSeen}</span>
                </div>

                {/* Spent */}
                <div>
                  <span className={commonStyles.monoText} style={{ color: (userSpentMap.get(user.id) || 0) > 0 ? '#4caf80' : '#eeeeee', fontWeight: 700 }}>
                    EGP {(userSpentMap.get(user.id) || 0).toFixed(2)}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className={commonStyles.actionBtn}
                    onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                  >
                    <MoreVertical size={13} />
                  </button>

                  {openMenu === user.id && (
                    <div className={commonStyles.dropdownMenu}>
                      <button
                        type="button"
                        className={commonStyles.dropdownMenuItem}
                        onClick={() => {
                          setModal({ user, action: 'view' });
                          setOpenMenu(null);
                        }}
                      >
                        <Shield size={12} style={{ color: '#3b9eda' }} /> View Details
                      </button>

                      {/* Role Toggle */}
                      {!user.roles.includes('creator') ? (
                        <button
                          type="button"
                          className={commonStyles.dropdownMenuItem}
                          onClick={() => {
                            handleRoleChange(user.id, 'creator', 'grant');
                            setOpenMenu(null);
                          }}
                        >
                          Make Developer
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`${commonStyles.dropdownMenuItem} ${commonStyles.dropdownMenuItemDanger}`}
                          onClick={() => {
                            handleRoleChange(user.id, 'creator', 'revoke');
                            setOpenMenu(null);
                          }}
                        >
                          Remove Developer
                        </button>
                      )}

                      {!user.roles.includes('admin') ? (
                        <button
                          type="button"
                          className={commonStyles.dropdownMenuItem}
                          onClick={() => {
                            handleRoleChange(user.id, 'admin', 'grant');
                            setOpenMenu(null);
                          }}
                        >
                          Make Admin
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`${commonStyles.dropdownMenuItem} ${commonStyles.dropdownMenuItemDanger}`}
                          onClick={() => {
                            handleRoleChange(user.id, 'admin', 'revoke');
                            setOpenMenu(null);
                          }}
                        >
                          Remove Admin
                        </button>
                      )}

                      {/* Status / Ban actions */}
                      {user.status === 'active' && (
                        <>
                          <button
                            type="button"
                            className={`${commonStyles.dropdownMenuItem} ${commonStyles.dropdownMenuItemWarning}`}
                            onClick={() => {
                              setModal({ user, action: 'temp_ban' });
                              setOpenMenu(null);
                            }}
                          >
                            <Ban size={12} style={{ color: '#f59e0b' }} /> Temp Ban
                          </button>
                          <button
                            type="button"
                            className={`${commonStyles.dropdownMenuItem} ${commonStyles.dropdownMenuItemDanger}`}
                            onClick={() => {
                              setModal({ user, action: 'perma_ban' });
                              setOpenMenu(null);
                            }}
                          >
                            <ShieldOff size={12} style={{ color: '#e74c3c' }} /> Perma Ban
                          </button>
                        </>
                      )}

                      {user.status !== 'active' && (
                        <button
                          type="button"
                          className={`${commonStyles.dropdownMenuItem} ${commonStyles.dropdownMenuItemSuccess}`}
                          onClick={() => {
                            setModal({ user, action: 'activate' });
                            setOpenMenu(null);
                          }}
                        >
                          <ShieldCheck size={12} style={{ color: '#4caf80' }} /> Restore Access
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
