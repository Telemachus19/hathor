import React from 'react';
import { Filter, Search, ArrowUpDown, ChevronDown, Library, Clock } from 'lucide-react';
import { SortOption, ViewMode } from '../types';
import styles from '../styles/LibraryPage.module.css';

interface LibraryToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  ownedCount: number;
  pendingCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  showSortMenu: boolean;
  onToggleSortMenu: () => void;
  onToggleMobileFilter: () => void;
  sortOptions: SortOption[];
}

export const LibraryToolbar: React.FC<LibraryToolbarProps> = ({
  viewMode,
  onViewModeChange,
  ownedCount,
  pendingCount,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  showSortMenu,
  onToggleSortMenu,
  onToggleMobileFilter,
  sortOptions,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
      {/* View Mode Tab Selector: OWNED vs PENDING */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #2e3544', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => onViewModeChange('owned')}
          style={{
            background: viewMode === 'owned' ? 'rgba(242, 107, 33, 0.15)' : 'transparent',
            border: viewMode === 'owned' ? '1px solid var(--primary-color, #f26b21)' : '1px solid #2e3544',
            color: viewMode === 'owned' ? '#ffffff' : '#94a3b8',
            padding: '0.5rem 1rem',
            borderRadius: '3px',
            fontFamily: "'Cinzel', serif",
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: '0.15em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s ease',
          }}
        >
          <Library size={14} /> OWNED GAMES ({ownedCount})
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('pending')}
          style={{
            background: viewMode === 'pending' ? 'rgba(242, 107, 33, 0.15)' : 'transparent',
            border: viewMode === 'pending' ? '1px solid var(--primary-color, #f26b21)' : '1px solid #2e3544',
            color: viewMode === 'pending' ? '#ffffff' : '#94a3b8',
            padding: '0.5rem 1rem',
            borderRadius: '3px',
            fontFamily: "'Cinzel', serif",
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: '0.15em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s ease',
          }}
        >
          <Clock size={14} /> PENDING ORDERS ({pendingCount})
        </button>
      </div>

      <div className={styles.toolbar}>
        {/* Mobile filter toggle button */}
        <button className={styles.mobileFilterBtn} onClick={onToggleMobileFilter}>
          <Filter size={10} />
          Filter
        </button>

        {/* Vault Search input */}
        <div className={styles.searchWrap}>
          <Search size={11} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search your vault…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Sort Dropdown */}
        <div className={styles.sortDropdownWrap}>
          <button onClick={onToggleSortMenu} className={styles.sortBtn}>
            <ArrowUpDown size={10} />
            <span>{sortBy}</span>
            <ChevronDown
              size={9}
              style={{
                transform: showSortMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease',
              }}
            />
          </button>

          {showSortMenu && (
            <div className={styles.sortMenu}>
              {sortOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onSortChange(option);
                    onToggleSortMenu();
                  }}
                  className={`${styles.sortOption} ${sortBy === option ? styles.sortOptionActive : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryToolbar;
