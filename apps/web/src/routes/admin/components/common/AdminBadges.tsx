import styles from '../../styles/adminCommon.module.css';

export function UserStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  let badgeClass = styles.badgeSuccess;
  let label = 'ACTIVE';

  if (normalized === 'temp_banned' || normalized === 'suspended') {
    badgeClass = styles.badgeWarning;
    label = 'TEMP BAN';
  } else if (normalized === 'perma_banned' || normalized === 'banned') {
    badgeClass = styles.badgeDanger;
    label = 'PERMA BAN';
  }

  return (
    <span className={`${styles.badge} ${badgeClass}`}>
      <span className={styles.badgeDot} />
      {label}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const normalized = role.toLowerCase();
  let badgeClass = `${styles.badge} ${styles.badgeUser}`;
  let label = 'USER';

  if (normalized.includes('admin')) {
    badgeClass = `${styles.badge} ${styles.badgeAdmin}`;
    label = 'ADMIN';
  } else if (
    normalized.includes('creator') ||
    normalized.includes('developer') ||
    normalized.includes('dev')
  ) {
    badgeClass = `${styles.badge} ${styles.badgeDev}`;
    label = 'DEV';
  } else if (normalized.includes('mod')) {
    badgeClass = `${styles.badge} ${styles.badgeMod}`;
    label = 'MOD';
  }

  return <span className={badgeClass}>{label}</span>;
}

export function GameStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  let badgeClass = styles.badgeSuccess;
  let label = status.replace('_', ' ').toUpperCase();

  if (normalized === 'pending_review' || normalized === 'draft' || normalized === 'hidden') {
    badgeClass = styles.badgeWarning;
  } else if (normalized === 'suspended' || normalized === 'removed' || normalized === 'rejected') {
    badgeClass = styles.badgeDanger;
  }

  return (
    <span className={`${styles.badge} ${badgeClass}`}>
      <span className={styles.badgeDot} />
      {label}
    </span>
  );
}

export function ContentRatingBadge({ rating }: { rating: string }) {
  const colors: Record<string, string> = {
    E: '#4caf80',
    T: '#3b9eda',
    M: '#f59e0b',
    AO: '#e74c3c',
  };
  const color = colors[rating] || '#8c9aaa';

  return (
    <span
      className={styles.contentRatingBadge}
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}12`,
      }}
    >
      {rating}
    </span>
  );
}
