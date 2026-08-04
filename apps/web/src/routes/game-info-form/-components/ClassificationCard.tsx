import React from 'react';
import { Hash, Zap } from 'lucide-react';
import styles from '../-styles/GameInfoFormPage.module.css';

const GENRES = [
  'Action',
  'Adventure',
  'RPG',
  'Strategy',
  'Simulation',
  'Sports',
  'Racing',
  'Fighting',
  'Puzzle',
  'Horror',
  'Platformer',
  'Shooter',
  'Stealth',
  'Survival',
  'Visual Novel',
];

const TAGS_BY_GENRE: Record<string, string[]> = {
  Action: [
    'Hack & Slash',
    "Beat 'em Up",
    'Brawler',
    'Run & Gun',
    'Bullet Hell',
    'Side-Scrolling',
    '3D Action',
    'Co-op',
  ],
  Adventure: [
    'Open World',
    'Exploration',
    'Narrative',
    'Point & Click',
    'Walking Simulator',
    'Metroidvania',
    'Puzzle-Adventure',
  ],
  RPG: [
    'Open World',
    'Turn-Based',
    'Action RPG',
    'JRPG',
    'Dark Fantasy',
    'Pixel Art',
    'Party-Based',
    'Roguelite',
    'Souls-like',
  ],
  Strategy: [
    'Real-Time',
    'Turn-Based',
    'Tower Defense',
    '4X',
    'Grand Strategy',
    'City Builder',
    'Auto-Chess',
    'Base Building',
  ],
  Simulation: [
    'Life Sim',
    'City Building',
    'Farming',
    'Space',
    'Management',
    'Vehicle',
    'Physics',
    'Sandbox',
  ],
  Sports: [
    'Football',
    'Basketball',
    'Baseball',
    'Tennis',
    'Golf',
    'Extreme Sports',
    'Esports',
    'Multiplayer',
  ],
  Racing: [
    'Arcade',
    'Simulation',
    'Kart',
    'Off-Road',
    'Futuristic',
    'Street Racing',
    'Split-Screen',
  ],
  Fighting: ['2D Fighter', '3D Fighter', 'Platform Fighter', 'Party Fighter', 'Versus', 'Tag-Team'],
  Puzzle: ['Logic', 'Physics', 'Match-3', 'Escape Room', 'Sokoban', 'Word', 'Narrative Puzzle'],
  Horror: [
    'Survival Horror',
    'Psychological',
    'Jump Scare',
    'Atmospheric',
    'Co-op Horror',
    'First-Person',
  ],
  Platformer: ['2D', '3D', 'Precision', 'Metroidvania', 'Pixel Art', 'Run & Gun', 'Parkour'],
  Shooter: [
    'First-Person',
    'Third-Person',
    'Top-Down',
    'Battle Royale',
    'Hero Shooter',
    'Tactical',
    'Cover-Based',
  ],
  Stealth: ['Tactical', 'Espionage', 'Narrative', 'Open World', 'First-Person'],
  Survival: [
    'Crafting',
    'Open World',
    'Post-Apocalyptic',
    'Co-op',
    'Battle Royale',
    'Base Building',
    'Roguelike',
  ],
  'Visual Novel': [
    'Romance',
    'Mystery',
    'Sci-Fi',
    'Horror',
    'Slice of Life',
    'Otome',
    'Branching Narrative',
  ],
  '': [],
};

const ALL_TAGS = [...new Set(Object.values(TAGS_BY_GENRE).flat())].sort();

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
  function toggleTag(tag: string) {
    if (tags.includes(tag)) {
      onChangeTags(tags.filter((t) => t !== tag));
    } else {
      onChangeTags([...tags, tag]);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.accentBar} />
        <h2 className={styles.cardTitle}>Classification & Tags</h2>
      </div>
      <div className={styles.cardBody}>
        {/* Genre */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabelSub}>
            <Hash size={11} /> Primary Genre <span style={{ color: '#FD7014' }}>*</span>
          </label>
          <div className={styles.pillsContainer}>
            {GENRES.map((g) => {
              const active = genre === g;
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
            <Zap size={11} /> Feature & Style Tags
          </label>
          <div className={styles.tagsBox}>
            {ALL_TAGS.map((t) => {
              const active = tags.includes(t);
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
