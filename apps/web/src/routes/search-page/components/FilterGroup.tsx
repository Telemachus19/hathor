import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import styles from '../styles/FilterSidebar.module.css';

interface FilterOption {
  name: string;
  slug: string;
}

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
  defaultOpen?: boolean;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  options,
  selectedSlugs,
  onToggle,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.filterGroup}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={styles.groupToggleBtn}>
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp size={14} color="#8c9aaa" />
        ) : (
          <ChevronDown size={14} color="#8c9aaa" />
        )}
      </button>

      {isOpen && (
        <div className={styles.optionsList}>
          {options.map((opt) => {
            const isChecked = selectedSlugs.some(
              (s) => s.trim().toLowerCase() === opt.slug.trim().toLowerCase()
            );
            return (
              <label
                key={opt.slug}
                className={`${styles.optionLabel} ${isChecked ? styles.optionLabelSelected : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onToggle(opt.slug);
                }}
              >
                <div
                  className={`${styles.checkboxBox} ${isChecked ? styles.checkboxBoxChecked : ''}`}
                >
                  {isChecked && <Check size={11} strokeWidth={3} color="#222831" />}
                </div>
                <span className={styles.optionText}>{opt.name}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterGroup;
