import React from 'react';
import { Search, X } from 'lucide-react';
import styles from '../../styles/adminCommon.module.css';

export interface SegmentedOption<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

interface AdminFilterBarProps<TStatus extends string = string, TRole extends string = string> {
  search: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  statusFilter?: TStatus;
  onStatusFilterChange?: (status: TStatus) => void;
  statusOptions?: SegmentedOption<TStatus>[];
  secondaryFilter?: TRole;
  onSecondaryFilterChange?: (role: TRole) => void;
  secondaryOptions?: SegmentedOption<TRole>[];
  children?: React.ReactNode;
}

export function AdminFilterBar<TStatus extends string = string, TRole extends string = string>({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  secondaryFilter,
  onSecondaryFilterChange,
  secondaryOptions,
  children,
}: AdminFilterBarProps<TStatus, TRole>) {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.searchRow}>
        <div className={styles.searchInputWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button type="button" className={styles.searchClear} onClick={() => onSearchChange('')}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.controlsRow}>
        {statusOptions && onStatusFilterChange && (
          <div className={styles.segmentedGroup}>
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`${styles.segmentedBtn} ${statusFilter === opt.id ? styles.segmentedBtnActive : ''}`}
                onClick={() => onStatusFilterChange(opt.id)}
              >
                {opt.label} {opt.count !== undefined ? `(${opt.count})` : ''}
              </button>
            ))}
          </div>
        )}

        {secondaryOptions && onSecondaryFilterChange && (
          <div className={styles.segmentedGroup}>
            {secondaryOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`${styles.segmentedBtn} ${secondaryFilter === opt.id ? styles.segmentedBtnActive : ''}`}
                onClick={() => onSecondaryFilterChange(opt.id)}
              >
                {opt.label} {opt.count !== undefined ? `(${opt.count})` : ''}
              </button>
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
