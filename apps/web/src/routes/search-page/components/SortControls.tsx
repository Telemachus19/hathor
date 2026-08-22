import React from 'react';
import { Award, Clock, TrendingUp, SlidersHorizontal } from 'lucide-react';
import type { SortPreset } from '../types';
import styles from '../styles/Controls.module.css';

interface SortControlsProps {
  currentSort: SortPreset;
  onSortChange: (sort: SortPreset) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeFilterCount: number;
}

export const SortControls: React.FC<SortControlsProps> = ({
  currentSort,
  onSortChange,
  sidebarOpen,
  onToggleSidebar,
  activeFilterCount,
}) => {
  return (
    <div className={styles.sortButtonGroup}>
      <button
        type="button"
        onClick={() => onSortChange('trending')}
        className={`${styles.sortButton} ${currentSort === 'trending' ? styles.sortButtonActive : ''}`}
      >
        <TrendingUp size={14} />
        Trending
      </button>

      <button
        type="button"
        onClick={() => onSortChange('top_rated')}
        className={`${styles.sortButton} ${currentSort === 'top_rated' ? styles.sortButtonActive : ''}`}
      >
        <Award size={14} />
        Top Rated
      </button>

      <button
        type="button"
        onClick={() => onSortChange('new_arrivals')}
        className={`${styles.sortButton} ${currentSort === 'new_arrivals' ? styles.sortButtonActive : ''}`}
      >
        <Clock size={14} />
        New Arrivals
      </button>

      <button
        type="button"
        onClick={onToggleSidebar}
        className={`${styles.filterToggleBtn} ${activeFilterCount > 0 ? styles.filterToggleBtnActive : ''}`}
        aria-label="Toggle filter sidebar"
        aria-expanded={sidebarOpen}
      >
        <SlidersHorizontal size={14} />
        {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
      </button>
    </div>
  );
};

export default SortControls;
