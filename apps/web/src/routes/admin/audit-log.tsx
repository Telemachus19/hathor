import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  ServerCrash,
  Filter,
  ScrollText,
  FileText,
  Check,
} from 'lucide-react';
import { AdminStatsGrid, AdminStatItem } from './components/common/AdminStatsCard';
import { AdminFilterBar } from './components/common/AdminFilterBar';
import { AuditDetailModal } from './components/AuditDetailModal';
import { apiClient } from '../../services/api/index';
import type { CatalogAuditLog, User, Game, Genre, Tag } from '@hathor/contracts';
import styles from './styles/adminAudit.module.css';
import commonStyles from './styles/adminCommon.module.css';

export const Route = createFileRoute('/admin/audit-log')({
  component: AdminAuditLog,
});

const ACTION_COLORS: Record<string, string> = {
  PUBLISH: '#4caf80',
  APPROVE: '#4caf80',
  CREATE: '#3b9eda',
  UPDATE: '#f59e0b',
  CHANGE: '#f59e0b',
  SUSPEND: '#f59e0b',
  BAN: '#e74c3c',
  DELETE: '#e74c3c',
  REJECT: '#e74c3c',
  ERROR: '#e74c3c',
};

function getActionColor(action: string): string {
  const upper = action.toUpperCase();
  for (const [key, color] of Object.entries(ACTION_COLORS)) {
    if (upper.includes(key)) return color;
  }
  return '#fd7014';
}

function formatAuditDetailsSummary(details: any): string {
  if (!details) return '';
  if (typeof details === 'string') return details;

  if (details.change) return String(details.change);
  if (details.name && details.slug) return `Name: "${details.name}" • Slug: /${details.slug}`;
  if (details.name) return `Name: "${details.name}"`;
  if (details.title) return `Title: "${details.title}"`;
  if (details.status) return `Status changed to: ${details.status}`;
  if (details.reason) return `Reason: ${details.reason}`;

  const pairs = Object.entries(details)
    .filter(([_, v]) => v !== undefined && v !== null && typeof v !== 'object')
    .map(([k, v]) => `${k}: ${v}`);

  return pairs.length > 0 ? pairs.join(' • ') : JSON.stringify(details);
}

function AdminAuditLog() {
  const [logs, setLogs] = useState<CatalogAuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [search, setSearch] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<
    'all' | 'game' | 'user' | 'submission' | 'tag' | 'genre'
  >('all');
  const [selectedLog, setSelectedLog] = useState<CatalogAuditLog | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadData = async () => {
    try {
      const [
        // @ts-ignore
        { data: auditData },
        { data: usersData },
        { data: gamesData },
        { data: genresData },
        { data: tagsData },
      ] = await Promise.all([
        apiClient.GET('/admin/audit-logs', { params: { query: { limit: 100 } } }),
        apiClient.GET('/admin/users'),
        apiClient.GET('/admin/games'),
        apiClient.GET('/admin/genres'),
        apiClient.GET('/admin/tags'),
      ]);

      if (auditData?.items) setLogs(auditData.items as CatalogAuditLog[]);
      if (usersData?.items) setUsers(usersData.items);
      if (gamesData?.items) setGames(gamesData.items);
      if (genresData?.items) setGenres(genresData.items);
      if (tagsData?.items) setTags(tagsData.items);
    } catch (err) {
      console.error('Failed to load audit logs or lookup data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const gameMap = useMemo(() => {
    const map = new Map<string, string>();
    games.forEach((g) => map.set(g.id, g.title));
    return map;
  }, [games]);

  const genreMap = useMemo(() => {
    const map = new Map<string, string>();
    genres.forEach((g) => map.set(String(g.id), g.name));
    return map;
  }, [genres]);

  const tagMap = useMemo(() => {
    const map = new Map<string, string>();
    tags.forEach((t) => map.set(String(t.id), t.name));
    return map;
  }, [tags]);

  const resolveTargetName = (log: CatalogAuditLog): string => {
    const targetType = (log.targetType || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const details = log.details as any;

    if (targetType === 'genre' || action.includes('genre')) {
      const name = details?.name || (log.targetId ? genreMap.get(String(log.targetId)) : null);
      return name ? `GENRE: ${name}` : `GENRE: #${log.targetId || 'Unassigned'}`;
    }

    if (targetType === 'tag' || action.includes('tag')) {
      const name = details?.name || (log.targetId ? tagMap.get(String(log.targetId)) : null);
      return name ? `TAG: ${name}` : `TAG: #${log.targetId || 'Unassigned'}`;
    }

    if (targetType === 'user' || action.includes('role') || action.includes('ban')) {
      const user = log.targetId ? userMap.get(log.targetId) : null;
      const userName = user
        ? user.displayName || user.email
        : details?.email || details?.displayName;
      return userName
        ? `USER: ${userName}`
        : `USER: ${log.targetId ? log.targetId.substring(0, 8) + '...' : 'Global'}`;
    }

    if (targetType === 'submission') {
      const title =
        details?.title || details?.gameTitle || (log.targetId ? gameMap.get(log.targetId) : null);
      return title ? `SUBMISSION: ${title}` : `SUBMISSION: #${log.targetId || 'N/A'}`;
    }

    if (targetType === 'game') {
      const title =
        details?.title || details?.gameTitle || (log.targetId ? gameMap.get(log.targetId) : null);
      return title
        ? `GAME: ${title}`
        : `GAME: ${log.targetId ? log.targetId.substring(0, 8) + '...' : 'Global'}`;
    }

    return `${(log.targetType || 'ENTITY').toUpperCase()}: ${log.targetId ? log.targetId.substring(0, 8) + '...' : 'Global'}`;
  };

  const resolveActorName = (log: CatalogAuditLog): string => {
    if (!log.actorId) return 'System Automated';
    const user = userMap.get(log.actorId);
    return user ? `${user.displayName || user.email}` : `Actor ${log.actorId.substring(0, 8)}...`;
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = search.toLowerCase();
      const targetName = resolveTargetName(log).toLowerCase();
      const actorName = resolveActorName(log).toLowerCase();
      const action = log.action.toLowerCase();
      const detailsStr = formatAuditDetailsSummary(log.details).toLowerCase();

      const matchSearch =
        !search ||
        action.includes(q) ||
        targetName.includes(q) ||
        actorName.includes(q) ||
        detailsStr.includes(q) ||
        (log.targetId && log.targetId.toLowerCase().includes(q)) ||
        (log.actorId && log.actorId.toLowerCase().includes(q));

      const matchTargetType =
        targetTypeFilter === 'all' ||
        (log.targetType && log.targetType.toLowerCase() === targetTypeFilter);

      return matchSearch && matchTargetType;
    });
  }, [logs, search, targetTypeFilter, userMap, gameMap, genreMap, tagMap]);

  const securityAlertsCount = logs.filter(
    (l) => l.action.includes('BAN') || l.action.includes('DELETE') || l.action.includes('REJECT')
  ).length;
  const adminActionsCount = logs.filter((l) => Boolean(l.actorId)).length;
  const systemErrorsCount = logs.filter((l) => l.action.includes('ERROR')).length;

  const stats: AdminStatItem[] = [
    {
      label: 'Total Audit Events',
      value: logs.length,
      delta: 'Recorded system events',
      icon: ShieldAlert,
      color: '#fd7014',
    },
    {
      label: 'Security Actions',
      value: securityAlertsCount,
      delta: 'Bans, rejections & deletions',
      icon: AlertTriangle,
      color: '#e74c3c',
    },
    {
      label: 'Admin Operations',
      value: adminActionsCount,
      delta: 'Staff & creator modifications',
      icon: Users,
      color: '#3b9eda',
    },
    {
      label: 'System Exceptions',
      value: systemErrorsCount,
      delta: 'Automatic error captures',
      icon: ServerCrash,
      color: '#f59e0b',
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

      {/* Top Stats */}
      <AdminStatsGrid stats={stats} />

      {/* Search & Filters */}
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search logs by action, actor name, or target name..."
        statusFilter={targetTypeFilter}
        onStatusFilterChange={setTargetTypeFilter}
        statusOptions={[
          { id: 'all', label: 'All', count: logs.length },
          { id: 'game', label: 'Game' },
          { id: 'user', label: 'User' },
          { id: 'submission', label: 'Submission' },
          { id: 'tag', label: 'Tag' },
          { id: 'genre', label: 'Genre' },
        ]}
      />

      {/* Results Header */}
      <div className={commonStyles.resultsMeta}>
        <Filter size={12} />
        <span>
          Showing <strong>{filteredLogs.length}</strong> of {logs.length} events
        </span>
      </div>

      {/* Audit Log Feed */}
      <div className={styles.auditFeed}>
        {filteredLogs.length === 0 ? (
          <div className={commonStyles.emptyState}>
            <ScrollText size={32} className={commonStyles.emptyIcon} />
            <p className={commonStyles.emptyTitle}>No audit events recorded</p>
            <p className={commonStyles.emptyDesc}>
              Audit logs will populate as platform actions occur
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const color = getActionColor(log.action);
            const tsStr = log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown';
            const targetTitle = resolveTargetName(log);
            const actorTitle = resolveActorName(log);
            const detailsSummary = formatAuditDetailsSummary(log.details);

            return (
              <div
                key={log.id}
                className={styles.auditItem}
                onClick={() => setSelectedLog(log)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.leftAccentStrip} style={{ backgroundColor: `${color}80` }} />

                <div className={styles.auditContent}>
                  {/* Action Badge */}
                  <div className={styles.actionBadgeCol}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.6rem',
                        fontFamily: 'monospace',
                        fontWeight: 900,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color,
                        backgroundColor: `${color}15`,
                        border: `1px solid ${color}35`,
                      }}
                    >
                      {log.action}
                    </span>
                  </div>

                  {/* Main Content */}
                  <div className={styles.mainCol}>
                    <div className={styles.targetRow}>
                      <span className={styles.targetTitle}>{targetTitle}</span>
                      <span style={{ fontSize: '0.65rem', color: '#8c9aaa' }}>•</span>
                      <span className={styles.actionLabel}>{log.action}</span>
                    </div>

                    {detailsSummary && <p className={styles.auditNote}>{detailsSummary}</p>}
                  </div>

                  {/* Right Meta */}
                  <div className={styles.rightMetaCol} onClick={(e) => e.stopPropagation()}>
                    <p className={styles.adminActor}>{actorTitle}</p>
                    <p className={styles.timestampText}>{tsStr}</p>
                    <button
                      type="button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        backgroundColor: 'rgba(253, 112, 20, 0.1)',
                        border: '1px solid rgba(253, 112, 20, 0.3)',
                        color: '#fd7014',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.65rem',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: 4,
                      }}
                      onClick={() => setSelectedLog(log)}
                    >
                      <FileText size={11} /> Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <AuditDetailModal
          log={selectedLog}
          actorName={resolveActorName(selectedLog)}
          targetName={resolveTargetName(selectedLog)}
          actionColor={getActionColor(selectedLog.action)}
          onClose={() => setSelectedLog(null)}
          onShowToast={showToast}
        />
      )}
    </div>
  );
}
