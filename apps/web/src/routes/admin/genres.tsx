import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Trash2, Search, Plus, Edit2, Gamepad2, Tag as TagIcon } from 'lucide-react';
import { apiClient } from '../../services/api/index';
import type { Genre, Tag } from '@hathor/contracts';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';

export const Route = createFileRoute('/admin/genres')({
  component: AdminGenres,
});

function AdminGenres() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  const [showAddGenre, setShowAddGenre] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreSlug, setNewGenreSlug] = useState('');
  
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagSlug, setNewTagSlug] = useState('');

  const [genreSearch, setGenreSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  const loadData = async () => {
    try {
      const [{ data: genresData }, { data: tagsData }] = await Promise.all([
        apiClient.GET('/admin/genres'),
        apiClient.GET('/admin/tags')
      ]);
      if (genresData?.items) setGenres(genresData.items);
      if (tagsData?.items) setTags(tagsData.items);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiClient.POST('/admin/genres', { body: { name: newGenreName, slug: newGenreSlug } });
    setNewGenreName('');
    setNewGenreSlug('');
    setShowAddGenre(false);
    loadData();
  };

  const createTag = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiClient.POST('/admin/tags', { body: { name: newTagName, slug: newTagSlug } });
    setNewTagName('');
    setNewTagSlug('');
    setShowAddTag(false);
    loadData();
  };

  const deleteGenre = async (id: number) => {
    await apiClient.DELETE('/admin/genres/{genreId}', { params: { path: { genreId: id } } });
    loadData();
  };

  const deleteTag = async (id: number) => {
    await apiClient.DELETE('/admin/tags/{tagId}', { params: { path: { tagId: id } } });
    loadData();
  };

  const filteredGenres = genres.filter(g => g.name.toLowerCase().includes(genreSearch.toLowerCase()));
  const filteredTags = tags.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* Genres Column */}
      <Card style={{ borderTop: '3px solid var(--accent-orange)' }}>
        <CardHeader style={{ paddingBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>Global Genres</h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage top-level store categories.</p>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: 0 }}>
          
          <div className="flex justify-between items-center" style={{ gap: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search genres..." 
                className="hathor-input w-full"
                style={{ paddingLeft: '2.5rem' }}
                value={genreSearch}
                onChange={e => setGenreSearch(e.target.value)}
              />
            </div>
            <button onClick={() => setShowAddGenre(!showAddGenre)} className="hathor-btn hathor-btn-primary flex items-center gap-2" style={{ padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}>
              <Plus size={16} /> ADD GENRE
            </button>
          </div>

          {showAddGenre && (
            <form onSubmit={createGenre} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end', backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '6px', border: '1px dashed var(--accent-orange)' }}>
              <div className="flex-col gap-2">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Name</label>
                <input className="hathor-input" placeholder="e.g. Action" value={newGenreName} onChange={e => setNewGenreName(e.target.value)} required />
              </div>
              <div className="flex-col gap-2">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Slug</label>
                <input className="hathor-input" placeholder="e.g. action" value={newGenreSlug} onChange={e => setNewGenreSlug(e.target.value)} required />
              </div>
              <button type="submit" className="hathor-btn hathor-btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Save</button>
            </form>
          )}

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredGenres.map(g => (
              <li key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-orange)' }}>
                    <Gamepad2 size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{g.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{g.slug}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.25rem 0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--text-white)' }}>0</strong> Games
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="hathor-btn" style={{ padding: '0.5rem', color: 'var(--text-muted)', border: 'none', backgroundColor: 'var(--bg-card)' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteGenre(g.id)} className="hathor-btn" style={{ padding: '0.5rem', color: 'var(--status-danger)', border: 'none', backgroundColor: 'var(--bg-card)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {filteredGenres.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No genres found.</div>}
          </ul>
        </CardContent>
      </Card>

      {/* Tags Column */}
      <Card style={{ borderTop: '3px solid var(--status-info)' }}>
        <CardHeader style={{ paddingBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>Store Tags</h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage searchable game attributes.</p>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: 0 }}>
          
          <div className="flex justify-between items-center" style={{ gap: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search tags..." 
                className="hathor-input w-full"
                style={{ paddingLeft: '2.5rem' }}
                value={tagSearch}
                onChange={e => setTagSearch(e.target.value)}
              />
            </div>
            <button onClick={() => setShowAddTag(!showAddTag)} className="hathor-btn" style={{ padding: '0.6rem 1.2rem', fontSize: '0.875rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--status-info)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Plus size={16} /> ADD TAG
            </button>
          </div>

          {showAddTag && (
            <form onSubmit={createTag} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end', backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '6px', border: '1px dashed var(--status-info)' }}>
              <div className="flex-col gap-2">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Name</label>
                <input className="hathor-input" placeholder="e.g. Multiplayer" value={newTagName} onChange={e => setNewTagName(e.target.value)} required />
              </div>
              <div className="flex-col gap-2">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Slug</label>
                <input className="hathor-input" placeholder="e.g. multiplayer" value={newTagSlug} onChange={e => setNewTagSlug(e.target.value)} required />
              </div>
              <button type="submit" className="hathor-btn" style={{ padding: '0.6rem 1.5rem', backgroundColor: 'var(--status-info)', color: '#fff', border: 'none' }}>Save</button>
            </form>
          )}

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredTags.map(t => (
              <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-info)' }}>
                    <TagIcon size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.slug}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.25rem 0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--text-white)' }}>0</strong> Games
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="hathor-btn" style={{ padding: '0.5rem', color: 'var(--text-muted)', border: 'none', backgroundColor: 'var(--bg-card)' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteTag(t.id)} className="hathor-btn" style={{ padding: '0.5rem', color: 'var(--status-danger)', border: 'none', backgroundColor: 'var(--bg-card)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {filteredTags.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No tags found.</div>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
