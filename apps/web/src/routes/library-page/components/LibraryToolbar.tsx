import React from 'react';
import { Filter, Search, ArrowUpDown, ChevronDown } from 'lucide-react';
import { SortOption } from '../types';
import styles from '../styles/LibraryPage.module.css';

interface LibraryToolbarProps {
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
  );
};

export default LibraryToolbar;
