import React from 'react';
import { Filter } from 'lucide-react';
import { DynamicFilterItem } from '../types';
import styles from '../styles/LibraryPage.module.css';

interface SidebarFilterProps {
  filters: DynamicFilterItem[];
  activeFilter: string;
  onSelectFilter: (label: string) => void;
}

export const SidebarFilter: React.FC<SidebarFilterProps> = ({
  filters,
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <aside className={styles.sidebarDesktop}>
      <div className={styles.sidebarInner}>
        <div className={styles.sidebarBorderLine} />
        <div className={styles.sidebarContent}>
          <div className={styles.filterHeader}>
            <Filter size={10} className={styles.badgeIcon} />
            <span className={styles.filterTitle}>Genres</span>
          </div>

          <div className={styles.filterList}>
            {filters.map(({ label, count }) => {
              const isActive = activeFilter === label;
              return (
                <button
                  key={label}
                  onClick={() => onSelectFilter(label)}
                  className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
                >
                  <span>{label}</span>
                  <span className={styles.updateCountBadge}>{count}</span>
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
