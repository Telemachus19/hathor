import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { Gamepad2, Tag as TagIcon, Search, Plus, Trash2, X, Check } from 'lucide-react';
import { apiClient } from '../../services/api/index';
import type { Genre, Tag } from '@hathor/contracts';
import styles from './styles/adminGenres.module.css';
import commonStyles from './styles/adminCommon.module.css';
import modalStyles from './styles/adminModals.module.css';

export const Route = createFileRoute('/admin/genres')({
  component: AdminGenres,
});

function AdminGenres() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [showAddGenre, setShowAddGenre] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');

  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const [genreSearch, setGenreSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadData = async () => {
    try {
      const [genresRes, tagsRes] = await Promise.all([
        apiClient.GET('/admin/genres'),
        apiClient.GET('/admin/tags'),
      ]);
      if (genresRes.data?.items) {
        setGenres(genresRes.data.items);
      } else if (genresRes.error) {
        console.error('Failed to fetch genres:', genresRes.error);
      }
      if (tagsRes.data?.items) {
        setTags(tagsRes.data.items);
      } else if (tagsRes.error) {
        console.error('Failed to fetch tags:', tagsRes.error);
      }
    } catch (e) {
      console.error('Failed to load genres/tags:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;

    const slug = newGenreName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    try {
      await apiClient.POST('/admin/genres', { body: { name: newGenreName.trim(), slug } });
      setNewGenreName('');
      setShowAddGenre(false);
      showToast('Genre created successfully');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to create genre');
    }
  };

  const createTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const slug = newTagName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    try {
      await apiClient.POST('/admin/tags', { body: { name: newTagName.trim(), slug } });
      setNewTagName('');
      setShowAddTag(false);
      showToast('Tag created successfully');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to create tag');
    }
  };

  const deleteGenre = async (id: number) => {
    if (!confirm('Are you sure you want to delete this genre?')) return;
    try {
      await apiClient.DELETE('/admin/genres/{genreId}', { params: { path: { genreId: id } } });
      showToast('Genre deleted');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete genre');
    }
  };

  const deleteTag = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    try {
      await apiClient.DELETE('/admin/tags/{tagId}', { params: { path: { tagId: id } } });
      showToast('Tag deleted');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete tag');
    }
  };

  const filteredGenres = useMemo(
    () => genres.filter((g) => g.name.toLowerCase().includes(genreSearch.toLowerCase())),
    [genres, genreSearch]
  );

  const filteredTags = useMemo(
    () => tags.filter((t) => t.name.toLowerCase().includes(tagSearch.toLowerCase())),
    [tags, tagSearch]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {toast && (
        <div className={commonStyles.toast}>
          <Check size={14} style={{ color: '#4caf80' }} />
          <span>{toast}</span>
        </div>
      )}

      <div className={styles.columnsContainer}>
        {/* Genres Column */}
        <div className={styles.columnCard}>
          <div className={styles.columnTopAccent} style={{ backgroundColor: '#fd7014' }} />
          <div className={styles.columnHeader}>
            <h3 className={styles.columnTitle}>Global Genres</h3>
            <p className={styles.columnSubtitle}>
              Manage top-level store categories and primary taxonomy.
            </p>
          </div>

          <div className={styles.columnBody}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className={commonStyles.searchInputWrapper} style={{ flex: 1 }}>
                <Search size={14} className={commonStyles.searchIcon} />
                <input
                  type="text"
                  className={commonStyles.searchInput}
                  placeholder="Search genres..."
                  value={genreSearch}
                  onChange={(e) => setGenreSearch(e.target.value)}
                />
                {genreSearch && (
                  <button
                    type="button"
                    className={commonStyles.searchClear}
                    onClick={() => setGenreSearch('')}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <button
                type="button"
                className={modalStyles.btnPrimary}
                onClick={() => setShowAddGenre(!showAddGenre)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={13} /> Add Genre
              </button>
            </div>

            {showAddGenre && (
              <form onSubmit={createGenre} className={styles.inlineForm}>
                <div style={{ flex: 1 }}>
                  <label className={modalStyles.fieldLabel}>Genre Name</label>
                  <input
                    className={modalStyles.inputField}
                    placeholder="e.g. Action RPG"
                    value={newGenreName}
                    onChange={(e) => setNewGenreName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className={modalStyles.btnPrimary} style={{ height: 32 }}>
                  Save
                </button>
              </form>
            )}

            <ul className={styles.itemList}>
              {filteredGenres.map((g) => (
                <li key={g.id} className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <div
                      className={styles.itemIconBox}
                      style={{ backgroundColor: 'rgba(253, 112, 20, 0.1)', color: '#fd7014' }}
                    >
                      <Gamepad2 size={18} />
                    </div>
                    <div>
                      <p className={styles.itemName}>{g.name}</p>
                      <p className={styles.itemSlug}>/{g.slug}</p>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      className={`${styles.iconActionBtn} ${styles.iconActionBtnDanger}`}
                      onClick={() => deleteGenre(g.id)}
                      title="Delete Genre"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              ))}
              {filteredGenres.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#8c9aaa',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                  }}
                >
                  No genres found.
                </div>
              )}
            </ul>
          </div>
        </div>

        {/* Tags Column */}
        <div className={styles.columnCard}>
          <div className={styles.columnTopAccent} style={{ backgroundColor: '#3b9eda' }} />
          <div className={styles.columnHeader}>
            <h3 className={styles.columnTitle}>Store Tags</h3>
            <p className={styles.columnSubtitle}>Manage searchable game attributes and keywords.</p>
          </div>

          <div className={styles.columnBody}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className={commonStyles.searchInputWrapper} style={{ flex: 1 }}>
                <Search size={14} className={commonStyles.searchIcon} />
                <input
                  type="text"
                  className={commonStyles.searchInput}
                  placeholder="Search tags..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                />
                {tagSearch && (
                  <button
                    type="button"
                    className={commonStyles.searchClear}
                    onClick={() => setTagSearch('')}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <button
                type="button"
                className={modalStyles.btnPrimary}
                style={{
                  backgroundColor: '#3b9eda',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
                onClick={() => setShowAddTag(!showAddTag)}
              >
                <Plus size={13} /> Add Tag
              </button>
            </div>

            {showAddTag && (
              <form onSubmit={createTag} className={styles.inlineForm}>
                <div style={{ flex: 1 }}>
                  <label className={modalStyles.fieldLabel}>Tag Name</label>
                  <input
                    className={modalStyles.inputField}
                    placeholder="e.g. Open World"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className={modalStyles.btnPrimary}
                  style={{ backgroundColor: '#3b9eda', color: '#ffffff', height: 32 }}
                >
                  Save
                </button>
              </form>
            )}

            <ul className={styles.itemList}>
              {filteredTags.map((t) => (
                <li key={t.id} className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <div
                      className={styles.itemIconBox}
                      style={{ backgroundColor: 'rgba(59, 158, 218, 0.1)', color: '#3b9eda' }}
                    >
                      <TagIcon size={18} />
                    </div>
                    <div>
                      <p className={styles.itemName}>{t.name}</p>
                      <p className={styles.itemSlug}>#{t.slug}</p>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      className={`${styles.iconActionBtn} ${styles.iconActionBtnDanger}`}
                      onClick={() => deleteTag(t.id)}
                      title="Delete Tag"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              ))}
              {filteredTags.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#8c9aaa',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                  }}
                >
                  No tags found.
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
