import React from 'react';
import { X } from 'lucide-react';
import type { GenreItem, TagItem } from '../types';
import styles from '../styles/Controls.module.css';

interface FilterChipsProps {
  selectedGenres: string[];
  selectedTags: string[];
  genres: GenreItem[];
  tags: TagItem[];
  onRemoveGenre: (slug: string) => void;
  onRemoveTag: (slug: string) => void;
  onClearAll: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  selectedGenres,
  selectedTags,
  genres,
  tags,
  onRemoveGenre,
  onRemoveTag,
  onClearAll,
}) => {
  if (selectedGenres.length === 0 && selectedTags.length === 0) {
    return null;
  }

  const getGenreName = (slug: string) =>
    genres.find((g) => g.slug === slug)?.name || slug;

  const getTagName = (slug: string) =>
    tags.find((t) => t.slug === slug)?.name || slug;

  return (
    <div className={styles.chipsContainer}>
      {selectedGenres.map((slug) => (
        <button
          key={`genre-${slug}`}
          type="button"
          onClick={() => onRemoveGenre(slug)}
          className={styles.chip}
          aria-label={`Remove genre ${getGenreName(slug)}`}
        >
          <span>{getGenreName(slug)}</span>
          <X size={12} />
        </button>
      ))}

      {selectedTags.map((slug) => (
        <button
          key={`tag-${slug}`}
          type="button"
          onClick={() => onRemoveTag(slug)}
          className={`${styles.chip} ${styles.tagChipBadge}`}
          aria-label={`Remove tag ${getTagName(slug)}`}
        >
          <span>{getTagName(slug)}</span>
          <X size={12} />
        </button>
      ))}

      <button type="button" onClick={onClearAll} className={styles.chipClearAll}>
        Clear all
      </button>
    </div>
  );
};

export default FilterChips;
