import React from 'react';
import { Hash, Zap } from 'lucide-react';
import { useCatalogGenres, useCatalogTags } from '../../../services/api/catalog';
import styles from '../-styles/GameInfoFormPage.module.css';

const DEFAULT_GENRES = [
  'Action',
  'RPG',
  'Strategy',
  'Adventure',
  'Simulation',
  'Racing',
  'Puzzle',
  'Sports',
  'Horror',
  'City Builder',
];

const DEFAULT_TAGS = [
  'Indie',
  'Cyberpunk',
  'Open World',
  'Singleplayer',
  'Multiplayer',
  'Turn-Based',
  'Dark Fantasy',
  'Sci-Fi',
  'Historical',
  'Pixel Art',
  'Sandbox',
  'Crafting',
  'Roguelike',
  'Stealth',
  'Platformer',
];

export interface ClassificationCardProps {
  genre: string;
  tags: string[];
  onChangeGenre: (genre: string) => void;
  onChangeTags: (tags: string[]) => void;
}

export const ClassificationCard: React.FC<ClassificationCardProps> = ({
  genre,
  tags,
  onChangeGenre,
  onChangeTags,
}) => {
  const { data: serverGenres } = useCatalogGenres();
  const { data: serverTags } = useCatalogTags();

  const genreList =
    serverGenres && serverGenres.length > 0
      ? serverGenres.map((g) => g.name)
      : DEFAULT_GENRES;

  const tagList =
    serverTags && serverTags.length > 0
      ? serverTags.map((t) => t.name)
      : DEFAULT_TAGS;

  function toggleTag(tag: string) {
    if (tags.some((selected) => selected.toLowerCase() === tag.toLowerCase())) {
      onChangeTags(tags.filter((t) => t.toLowerCase() !== tag.toLowerCase()));
    } else {
      onChangeTags([...tags, tag]);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.accentBar} />
        <h2 className={styles.cardTitle}>
          Classification & Tags
          <span className={styles.requiredBadge}>REQUIRED</span>
        </h2>
      </div>
      <div className={styles.cardBody}>
        {/* Genre */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabelSub}>
            <Hash size={11} /> Genre
          </label>
          <div className={styles.pillsContainer}>
            {genreList.map((g) => {
              const active = genre.toLowerCase() === g.toLowerCase();
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => onChangeGenre(active ? '' : g)}
                  className={active ? styles.genreBtnActive : styles.genreBtn}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className={styles.fieldGroup} style={{ marginTop: 8 }}>
          <label className={styles.fieldLabelSub}>
            <Zap size={11} /> Tags
          </label>
          <div className={styles.tagsBox}>
            {tagList.map((t) => {
              const active = tags.some((selected) => selected.toLowerCase() === t.toLowerCase());
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={active ? styles.tagBtnActive : styles.tagBtn}
                >
                  {active && <span style={{ marginRight: 4 }}>✓</span>}
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
