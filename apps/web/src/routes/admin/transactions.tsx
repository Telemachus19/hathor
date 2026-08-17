import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { MoreVertical, Search, Filter, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Download } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../components/ui/Dropdown';
import { DataTable } from '../../components/ui/DataTable';
import { apiClient } from '../../services/api/index';
import type { Order } from '@hathor/contracts';

export const Route = createFileRoute('/admin/transactions')({
  component: AdminTransactions,
});

function AdminTransactions() {
  const [transactions, setTransactions] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const loadTransactions = async () => {
    try {
      const { data } = await apiClient.GET('/admin/transactions');
      if (data?.items) {
        setTransactions(data.items);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter(t => t.id.toLowerCase().includes(searchQuery.toLowerCase()));
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <Card style={{ borderTop: '3px solid var(--status-success)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Total Revenue (30d)</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px', color: 'var(--status-success)' }}>
                <DollarSign size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-success)' }}>
                ${transactions.reduce((sum, t) => sum + Number(t.totalAmountEgp), 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                <ArrowUpRight size={14} /> Tracking live
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--accent-orange)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Transactions</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '4px', color: 'var(--accent-orange)' }}>
                <CreditCard size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-orange)' }}>
                {transactions.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Total all-time
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-warning)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Pending</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '4px', color: 'var(--status-warning)' }}>
                <DollarSign size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-warning)' }}>
                {transactions.filter(t => t.status === 'payment_pending').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Awaiting settlement
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-danger)' }}>
          <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Failed (30d)</span>
              <div style={{ padding: '0.35rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: 'var(--status-danger)' }}>
                <ArrowDownRight size={16} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--status-danger)' }}>
                {transactions.filter(t => t.status === 'payment_failed').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Requires investigation
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
            placeholder="Search by Transaction ID or User..." 
            className="hathor-input w-full"
            style={{ paddingLeft: '2.5rem', backgroundColor: 'var(--bg-main)' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between" style={{ gap: '2rem' }}>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--accent-orange)', color: 'var(--accent-orange)' }}>ALL</button>
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>SUCCESSFUL</button>
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>PENDING</button>
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>FAILED</button>
              <button className="hathor-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-main)' }}>REFUNDED</button>
            </div>
          </div>
          <button className="hathor-btn flex items-center gap-2" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <Download size={16} /> EXPORT CSV
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Filter size={16} />
        Showing <strong style={{ color: 'var(--text-white)' }}>{filteredTransactions.length}</strong> transactions
      </div>

      {/* Data Table */}
      <DataTable columns={['Transaction ID', 'User', 'Type', 'Amount', 'Date', 'Status', '']}>
        {filteredTransactions.map(trx => (
          <tr key={trx.id}>
            <td>
              <div className="flex items-center gap-4">
                <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-success)' }}>
                  <DollarSign size={16} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-white)' }}>
                  {trx.id.substring(0, 8)}...
                </div>
              </div>
            </td>
            <td style={{ fontWeight: 'bold' }}>-</td>
            <td>
              <Badge variant="success">PURCHASE</Badge>
            </td>
            <td style={{ fontWeight: 'bold', color: 'var(--text-white)' }}>
              {trx.currency} {trx.totalAmountEgp}
            </td>
            <td style={{ color: 'var(--text-light)' }}>
              -
            </td>
            <td>
              <Badge variant={
                trx.status === 'fulfilled' ? 'success' : 
                trx.status === 'payment_pending' ? 'warning' : 'danger'
              }>
                {trx.status.toUpperCase().replace('_', ' ')}
              </Badge>
            </td>
            <td style={{ textAlign: 'right' }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hathor-btn" style={{ padding: '0.25rem 0.5rem' }}>
                    <MoreVertical size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>View Receipt</DropdownMenuItem>
                  <DropdownMenuItem>View User</DropdownMenuItem>
                  {trx.status === 'fulfilled' && <DropdownMenuItem variant="danger">Refund Transaction</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}
        {filteredTransactions.length === 0 && (
          <tr>
            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No transactions found.
            </td>
          </tr>
        )}
      </DataTable>
    </div>
  );
}
