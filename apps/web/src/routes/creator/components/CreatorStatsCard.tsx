import React from 'react';
import styles from '../styles/creatorCommon.module.css';

export interface CreatorStatItem {
  label: string;
  value: string | number;
  delta?: string;
  icon: React.ElementType;
  color?: string;
}

export function CreatorStatsCard({
  label,
  value,
  delta,
  icon: Icon,
  color = '#fd7014',
}: CreatorStatItem) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statTopStripe} style={{ backgroundColor: color }} />
      <div className={styles.statHeader}>
        <p className={styles.statLabel}>{label}</p>
        <div
          className={styles.statIconBox}
          style={{
            backgroundColor: `${color}15`,
            border: `1px solid ${color}30`,
          }}
        >
          <Icon size={13} style={{ color }} />
        </div>
      </div>
      <p className={styles.statValue} style={{ color }}>
        {value}
      </p>
      {delta && <p className={styles.statDelta}>{delta}</p>}
    </div>
  );
}

export function CreatorStatsGrid({ stats }: { stats: CreatorStatItem[] }) {
  return (
    <div className={styles.statsGrid}>
      {stats.map((stat, i) => (
        <CreatorStatsCard key={i} {...stat} />
      ))}
    </div>
  );
}
