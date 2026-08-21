import { useState, useEffect } from 'react';
import { X, Plus, Hash, Loader2, Tag as TagIcon, Check } from 'lucide-react';
import styles from '../styles/adminModals.module.css';
import { apiClient } from '../../../services/api/index';
import type { Game } from '@hathor/contracts';

interface TagEditorModalProps {
  game: Game;
  onClose: () => void;
  onSaveTags: (gameId: string, tags: string[]) => void;
}

interface TagItem {
  id: number;
  name: string;
  slug: string;
}

export function TagEditorModal({ game, onClose, onSaveTags }: TagEditorModalProps) {
  const [catalogTags, setCatalogTags] = useState<TagItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch available tags from catalog database
        const { data: tagsData } = await (apiClient as any).GET('/admin/tags', {});
        if (tagsData?.items) {
          setCatalogTags(tagsData.items);
        }

        // 2. Fetch current game tags from backend
        const { data: gameData } = await (apiClient as any).GET('/admin/games/{gameId}', {
          params: { path: { gameId: game.id } },
        });

        if (gameData?.tags && Array.isArray(gameData.tags)) {
          const currentTagNames = gameData.tags.map((t: any) =>
            typeof t === 'string' ? t : t?.name || t?.slug || ''
          ).filter(Boolean);
          setSelected(currentTagNames);
        } else if ((game as any).tags && Array.isArray((game as any).tags)) {
          const currentTagNames = (game as any).tags.map((t: any) =>
            typeof t === 'string' ? t : t?.name || t?.slug || ''
          ).filter(Boolean);
          setSelected(currentTagNames);
        }
      } catch (err) {
        console.error('Failed to load catalog tags:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [game.id]);

  const toggle = (tagName: string) => {
    setSelected((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const addCustom = () => {
    const t = customInput.trim();
    if (t && !selected.includes(t)) {
      setSelected((prev) => [...prev, t]);
      // If it doesn't exist in catalogTags, add to local display
      if (!catalogTags.some((ct) => ct.name.toLowerCase() === t.toLowerCase())) {
        setCatalogTags((prev) => [
          ...prev,
          { id: Date.now(), name: t, slug: t.toLowerCase().replace(/\s+/g, '-') },
        ]);
      }
    }
    setCustomInput('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSaveTags(game.id, selected);
      onClose();
    } catch (err) {
      console.error('Error saving tags:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredCatalogTags = catalogTags.filter((t) =>
    !filterSearch || t.name.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modalContainer} ${styles.modalContainerLg}`}
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.topStripe} />
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                backgroundColor: 'rgba(167, 139, 250, 0.15)',
                border: '1px solid rgba(167, 139, 250, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a78bfa',
              }}
            >
              <TagIcon size={16} />
            </div>
            <div>
              <p className={styles.modalSubtitle}>Taxonomy &amp; Metadata</p>
              <h3 className={styles.modalTitle}>Edit Tags: {game.title}</h3>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Selected Tags Display */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <p className={styles.fieldLabel} style={{ margin: 0 }}>
                Selected Tags ({selected.length})
              </p>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
            <div className={styles.tagsContainer} style={{ minHeight: 38, padding: '0.5rem', backgroundColor: '#0c0e14', border: '1px solid #1e2330' }}>
              {selected.length === 0 ? (
                <span style={{ fontSize: '0.7rem', color: '#8c9aaa', fontStyle: 'italic' }}>
                  No tags selected yet. Pick from the catalog tags below or add a custom tag.
                </span>
              ) : (
                selected.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggle(tag)}
                    className={`${styles.tagPill} ${styles.tagPillSelected}`}
                  >
                    {tag} <X size={9} style={{ marginLeft: 2 }} />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Available Catalog Database Tags */}
          <div style={{ borderTop: '1px solid #1e2330', paddingTop: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <p className={styles.fieldLabel} style={{ margin: 0 }}>
                Catalog Database Tags ({catalogTags.length})
              </p>
              <input
                type="text"
                placeholder="Filter tags..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  backgroundColor: '#0c0e14',
                  border: '1px solid #282d3b',
                  color: '#eeeeee',
                  borderRadius: 2,
                  outline: 'none',
                }}
              />
            </div>

            {loading ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#8c9aaa', fontSize: '0.75rem' }}>
                <Loader2 size={16} className="animate-spin" style={{ margin: '0 auto 0.4rem', color: '#a78bfa' }} />
                Loading catalog tags from database...
              </div>
            ) : filteredCatalogTags.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#8c9aaa', fontSize: '0.75rem', fontStyle: 'italic' }}>
                {filterSearch ? `No catalog tags matching "${filterSearch}"` : 'No tags found in catalog.'}
              </div>
            ) : (
              <div className={styles.tagsContainer} style={{ maxHeight: '140px', overflowY: 'auto', padding: '0.5rem', backgroundColor: '#0c0e14', border: '1px solid #1e2330' }}>
                {filteredCatalogTags.map((tag) => {
                  const isSelected = selected.includes(tag.name);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggle(tag.name)}
                      className={`${styles.tagPill} ${isSelected ? styles.tagPillSelected : ''}`}
                    >
                      {tag.name}
                      {isSelected && <Check size={9} style={{ marginLeft: 2 }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Custom Tag */}
          <div style={{ borderTop: '1px solid #1e2330', paddingTop: '0.85rem' }}>
            <p className={styles.fieldLabel}>Add New Tag to Catalog</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <Hash size={12} style={{ position: 'absolute', left: '0.75rem', color: '#8c9aaa' }} />
                <input
                  type="text"
                  className={styles.inputField}
                  style={{ paddingLeft: '2rem' }}
                  placeholder="Type a new tag name..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                />
              </div>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={addCustom}
                disabled={!customInput.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={13} /> Add Tag
              </button>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save Tags'}
          </button>
        </div>
      </div>
    </div>
  );
}
