import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  CreditCard,
  ArrowDownRight,
  Filter,
  MoreVertical,
  Calendar,
  Check,
  User as UserIcon,
} from 'lucide-react';
import { AdminStatsGrid, AdminStatItem } from './components/common/AdminStatsCard';
import { AdminFilterBar } from './components/common/AdminFilterBar';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { apiClient } from '../../services/api/index';
import type { Order, User } from '@hathor/contracts';
import commonStyles from './styles/adminCommon.module.css';

export const Route = createFileRoute('/admin/transactions')({
  component: AdminTransactions,
});

function AdminTransactions() {
  const [transactions, setTransactions] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'fulfilled' | 'pending' | 'failed'>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Order | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadData = async () => {
    try {
      const [{ data: trxData }, { data: usersData }] = await Promise.all([
        apiClient.GET('/admin/transactions'),
        apiClient.GET('/admin/users'),
      ]);

      if (trxData?.items) {
        setTransactions(trxData.items);
      }
      if (usersData?.items) {
        setUsers(usersData.items);
      }
    } catch (err) {
      console.error('Failed to load transactions/users:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((u) => {
      map.set(u.id, u);
    });
    return map;
  }, [users]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      const q = search.toLowerCase();
      const user = (trx as any).userId ? userMap.get((trx as any).userId) : null;
      const userName = user?.displayName?.toLowerCase() || '';
      const userEmail = user?.email?.toLowerCase() || '';
      const userId = (trx as any).userId?.toLowerCase() || '';

      const matchSearch =
        !search ||
        trx.id.toLowerCase().includes(q) ||
        userId.includes(q) ||
        userName.includes(q) ||
        userEmail.includes(q);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'fulfilled' && trx.status === 'fulfilled') ||
        (statusFilter === 'pending' && trx.status === 'payment_pending') ||
        (statusFilter === 'failed' && trx.status === 'payment_failed');

      return matchSearch && matchStatus;
    });
  }, [transactions, search, statusFilter, userMap]);

  const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.totalAmountEgp || 0), 0);
  const pendingCount = transactions.filter((t) => t.status === 'payment_pending').length;
  const failedCount = transactions.filter((t) => t.status === 'payment_failed').length;

  const stats: AdminStatItem[] = [
    {
      label: 'Gross Volume',
      value: `EGP ${totalRevenue.toFixed(2)}`,
      delta: 'All-time platform checkout volume',
      icon: DollarSign,
      color: '#4caf80',
    },
    {
      label: 'Total Orders',
      value: transactions.length,
      delta: 'Processed transactions',
      icon: CreditCard,
      color: '#fd7014',
    },
    {
      label: 'Pending Settlement',
      value: pendingCount,
      delta: 'Awaiting payment provider confirmation',
      icon: DollarSign,
      color: '#f59e0b',
    },
    {
      label: 'Failed Orders',
      value: failedCount,
      delta: 'Payment or fulfillment errors',
      icon: ArrowDownRight,
      color: '#e74c3c',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {toast && (
        <div className={commonStyles.toast}>
          <Check size={14} style={{ color: '#4caf80' }} />
          <span>{toast}</span>
        </div>
      )}

      {openMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpenMenu(null)} />}

      {/* Top Stats */}
      <AdminStatsGrid stats={stats} />

      {/* Search & Filters */}
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by transaction ID, user name, or email..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={[
          { id: 'all', label: 'All', count: transactions.length },
          { id: 'fulfilled', label: 'Completed', count: transactions.filter((t) => t.status === 'fulfilled').length },
          { id: 'pending', label: 'Pending', count: pendingCount },
          { id: 'failed', label: 'Failed', count: failedCount },
        ]}
      />

      {/* Results Header */}
      <div className={commonStyles.resultsMeta}>
        <Filter size={12} />
        <span>
          Showing <strong>{filteredTransactions.length}</strong> of {transactions.length} transactions
        </span>
      </div>

      {/* Data Table */}
      <div className={commonStyles.tableContainer}>
        <div
          className={commonStyles.tableHeader}
          style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr auto' }}
        >
          <span>Transaction ID</span>
          <span>Customer</span>
          <span>Amount (EGP)</span>
          <span>Date</span>
          <span>Status</span>
          <span style={{ width: 32 }} />
        </div>

        {filteredTransactions.length === 0 ? (
          <div className={commonStyles.emptyState}>
            <CreditCard size={32} className={commonStyles.emptyIcon} />
            <p className={commonStyles.emptyTitle}>No transactions match your criteria</p>
            <p className={commonStyles.emptyDesc}>Try adjusting your search terms or filters</p>
          </div>
        ) : (
          filteredTransactions.map((trx) => {
            const dateStr = (trx as any).createdAt
              ? new Date((trx as any).createdAt).toLocaleDateString()
              : 'Recent';

            const user = (trx as any).userId ? userMap.get((trx as any).userId) : null;

            let statusBadgeClass = commonStyles.badgeSuccess;
            if (trx.status === 'payment_pending') statusBadgeClass = commonStyles.badgeWarning;
            else if (trx.status === 'payment_failed') statusBadgeClass = commonStyles.badgeDanger;

            return (
              <div
                key={trx.id}
                className={`${commonStyles.tableRow} ${openMenu === trx.id ? commonStyles.tableRowActive : ''}`}
                style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr auto' }}
              >
                {/* Transaction ID */}
                <div
                  className={commonStyles.userCell}
                  onClick={() => setSelectedTransaction(trx)}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(76, 175, 128, 0.1)',
                      border: '1px solid rgba(76, 175, 128, 0.25)',
                      color: '#4caf80',
                      flexShrink: 0,
                    }}
                  >
                    <DollarSign size={15} />
                  </div>
                  <div>
                    <p className={commonStyles.monoText} style={{ color: 'var(--text-white)', fontWeight: 700 }}>
                      {trx.id.substring(0, 12)}...
                    </p>
                    <p className={commonStyles.cellSubtitle}>Order Purchase</p>
                  </div>
                </div>

                {/* Customer User Details */}
                <div
                  className={commonStyles.userCell}
                  onClick={() => setSelectedTransaction(trx)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={commonStyles.avatarSmall}>
                    {user ? (user.displayName || user.email || 'U').charAt(0).toUpperCase() : <UserIcon size={12} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p className={commonStyles.cellTitle} style={{ margin: 0, fontSize: '0.78rem' }}>
                      {user ? user.displayName || user.email : (trx as any).userId ? `${(trx as any).userId.substring(0, 8)}...` : 'Unknown'}
                    </p>
                    {user && (
                      <p className={commonStyles.cellSubtitle} style={{ margin: 0, fontSize: '0.68rem', fontFamily: 'monospace' }}>
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <span className={commonStyles.priceText}>{Number(trx.totalAmountEgp || 0).toFixed(2)}</span>

                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                  <span className={commonStyles.monoText}>{dateStr}</span>
                </div>

                {/* Status */}
                <div>
                  <span className={`${commonStyles.badge} ${statusBadgeClass}`}>
                    <span className={commonStyles.badgeDot} />
                    {trx.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Action Menu */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className={commonStyles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === trx.id ? null : trx.id);
                    }}
                  >
                    <MoreVertical size={14} />
                  </button>

                  {openMenu === trx.id && (
                    <div className={commonStyles.dropdownMenu}>
                      <button
                        type="button"
                        className={commonStyles.dropdownMenuItem}
                        onClick={() => {
                          setSelectedTransaction(trx);
                          setOpenMenu(null);
                        }}
                      >
                        View Order Details
                      </button>

                      {trx.status === 'fulfilled' && (
                        <button
                          type="button"
                          className={`${commonStyles.dropdownMenuItem} ${commonStyles.dropdownMenuItemDanger}`}
                          onClick={() => {
                            showToast('Refund feature is governed by commerce policy');
                            setOpenMenu(null);
                          }}
                        >
                          Request Refund
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

      {/* Transaction Details Modal Popup */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          user={(selectedTransaction as any).userId ? userMap.get((selectedTransaction as any).userId) : null}
          onClose={() => setSelectedTransaction(null)}
          onShowToast={showToast}
        />
      )}
    </div>
  );
}
