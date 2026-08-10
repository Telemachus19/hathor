import React from 'react';
import { Filter } from 'lucide-react';
import styles from '../styles/LibraryPage.module.css';

interface FilterItem {
  label: string;
}

interface SidebarFilterProps {
  filters: FilterItem[];
  activeFilter: string;
  onSelectFilter: (label: string) => void;
  updateCount: number;
}

export const SidebarFilter: React.FC<SidebarFilterProps> = ({
  filters,
  activeFilter,
  onSelectFilter,
  updateCount,
}) => {
  return (
    <aside className={styles.sidebarDesktop}>
      <div className={styles.sidebarInner}>
        <div className={styles.sidebarBorderLine} />
        <div className={styles.sidebarContent}>
          <div className={styles.filterHeader}>
            <Filter size={10} className={styles.badgeIcon} />
            <span className={styles.filterTitle}>Filter</span>
          </div>

          <div className={styles.filterList}>
            {filters.map(({ label }) => {
              const isActive = activeFilter === label;
              return (
                <button
                  key={label}
                  onClick={() => onSelectFilter(label)}
                  className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
                >
                  {label}
                  {label === 'Updates' && updateCount > 0 && (
                    <span className={styles.updateCountBadge}>{updateCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarFilter;
