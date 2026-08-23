import { useState } from 'react';
import { X, Plus, Hash } from 'lucide-react';
import styles from '../styles/adminModals.module.css';
import type { Game } from '@hathor/contracts';

const PRESET_TAGS = [
  'Open World',
  'Souls-like',
  'Dark Fantasy',
  'Single Player',
  'RPG',
  'Atmospheric',
  'Roguelike',
  'Pixel Art',
  'Co-op',
  'Action',
  'Strategy',
  'Turn-Based',
  'Political',
  'Story Rich',
  'Survival',
  'Crafting',
  'Multiplayer',
  'Cyberpunk',
  'Neon',
  'Linear',
  'Puzzle',
  'Relaxing',
  'Short',
  'Shooter',
  'Tactical',
  'Competitive',
  'Space',
  'Sci-Fi',
  'Horror',
  'Dark',
  'City Builder',
  'Steampunk',
  'Sandbox',
  'Narrative',
  'Visual Novel',
  'Mystery',
  'Western',
  'Mature',
];

interface TagEditorModalProps {
  game: Game;
  onClose: () => void;
  onSaveTags: (gameId: string, tags: string[]) => void;
}

export function TagEditorModal({ game, onClose, onSaveTags }: TagEditorModalProps) {
  const initialTags = (game as any).tags || [];
  const [selected, setSelected] = useState<string[]>(initialTags);
  const [customInput, setCustomInput] = useState('');

  const toggle = (tag: string) => {
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const addCustom = () => {
    const t = customInput.trim();
    if (t && !selected.includes(t)) {
      setSelected((prev) => [...prev, t]);
    }
    setCustomInput('');
  };

  const handleSave = () => {
    onSaveTags(game.id, selected);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modalContainer} ${styles.modalContainerLg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.topStripe} />
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.modalSubtitle}>Taxonomy &amp; Metadata</p>
            <h3 className={styles.modalTitle}>Edit Tags: {game.title}</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div>
            <p className={styles.fieldLabel}>Selected Tags ({selected.length})</p>
            <div className={styles.tagsContainer} style={{ minHeight: 32 }}>
              {selected.length === 0 && (
                <span
                  style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}
                >
                  No tags selected
                </span>
              )}
              {selected.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(tag)}
                  className={`${styles.tagPill} ${styles.tagPillSelected}`}
                >
                  {tag} <X size={9} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <p className={styles.fieldLabel}>Available Preset Tags</p>
            <div className={styles.tagsContainer}>
              {PRESET_TAGS.map((tag) => {
                const isSelected = selected.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggle(tag)}
                    className={`${styles.tagPill} ${isSelected ? styles.tagPillSelected : ''}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <p className={styles.fieldLabel}>Add Custom Tag</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <Hash
                  size={12}
                  style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  className={styles.inputField}
                  style={{ paddingLeft: '2rem' }}
                  placeholder="Custom tag name..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                />
              </div>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={addCustom}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={13} /> Add
              </button>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.btnPrimary} onClick={handleSave}>
            Save Tags
          </button>
        </div>
      </div>
    </div>
  );
}
