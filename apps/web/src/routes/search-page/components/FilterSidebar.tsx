import React from 'react';
import type { GenreItem, TagItem } from '../types';
import { FilterGroup } from './FilterGroup';
import styles from '../styles/FilterSidebar.module.css';

interface FilterSidebarProps {
  genres: GenreItem[];
  tags: TagItem[];
  selectedGenres: string[];
  selectedTags: string[];
  onToggleGenre: (slug: string) => void;
  onToggleTag: (slug: string) => void;
  onClearAll: () => void;
  activeCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  genres,
  tags,
  selectedGenres,
  selectedTags,
  onToggleGenre,
  onToggleTag,
  onClearAll,
  activeCount,
}) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>Filters</span>
        {activeCount > 0 && (
          <button type="button" onClick={onClearAll} className={styles.clearAllBtn}>
            Clear all
          </button>
        )}
      </div>

      <FilterGroup
        title="Genre"
        options={genres}
        selectedSlugs={selectedGenres}
        onToggle={onToggleGenre}
      />

      <FilterGroup
        title="Tags"
        options={tags}
        selectedSlugs={selectedTags}
        onToggle={onToggleTag}
      />
    </aside>
  );
};

export default FilterSidebar;
