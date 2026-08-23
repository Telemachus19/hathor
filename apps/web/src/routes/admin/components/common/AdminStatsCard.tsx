import type { LucideIcon } from 'lucide-react';
import styles from '../../styles/adminCommon.module.css';

export interface AdminStatItem {
  label: string;
  value: string | number;
  delta?: string;
  icon:
    | LucideIcon
    | React.ComponentType<{
        size?: number | string;
        style?: React.CSSProperties;
        className?: string;
      }>;
  color: string;
}

interface AdminStatsGridProps {
  stats: AdminStatItem[];
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  return (
    <div className={styles.statsGrid}>
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div key={idx} className={styles.statCard}>
            <div className={styles.statCardAccent} style={{ backgroundColor: stat.color }} />
            <div className={styles.statHeader}>
              <p className={styles.statLabel}>{stat.label}</p>
              <div
                className={styles.statIconBox}
                style={{
                  backgroundColor: `${stat.color}15`,
                  border: `1px solid ${stat.color}30`,
                  color: stat.color,
                }}
              >
                <IconComponent size={14} style={{ color: stat.color }} />
              </div>
            </div>
            <div className={styles.statValue} style={{ color: stat.color }}>
              {stat.value}
            </div>
            {stat.delta && <p className={styles.statDelta}>{stat.delta}</p>}
          </div>
        );
      })}
    </div>
  );
}
