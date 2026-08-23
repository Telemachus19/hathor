import React from 'react';
import { Search } from 'lucide-react';
import styles from '../styles/Controls.module.css';

interface EmptyStateProps {
  onClearFilters: () => void;
  hasFilters: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onClearFilters, hasFilters }) => {
  return (
    <div className={styles.emptyState}>
      <Search size={44} className={styles.emptyIcon} />
      <h3 className={styles.emptyTitle}>No Games Found</h3>
      <p className={styles.emptyDescription}>
        We couldn&apos;t find any games matching your current search criteria. Try modifying your
        keywords or clearing active filters.
      </p>
      {hasFilters && (
        <button type="button" onClick={onClearFilters} className={styles.emptyActionBtn}>
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default EmptyState;
