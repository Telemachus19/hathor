import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import styles from '../styles/Controls.module.css';

interface SearchHeaderProps {
  initialValue: string;
  onSearch: (value: string) => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({ initialValue, onSearch }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== initialValue) {
        onSearch(value.trim());
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [value, initialValue, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className={styles.searchBarContainer}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <span className={styles.searchIcon}>
          <Search size={18} />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search games by title, genre, or tag..."
          className={styles.searchInput}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearSearchBtn}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </form>
    </div>
  );
};

export default SearchHeader;
