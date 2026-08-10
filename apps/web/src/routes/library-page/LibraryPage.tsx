import React, { useState } from 'react';
import { BookOpen, Filter } from 'lucide-react';
import { libraryGames } from './data/gamesData';
import { SortOption } from './types';
import { HieroDivider } from './components/HieroDivider';
import { GlyphAccent } from './components/GlyphAccent';
import { LibraryHero } from './components/LibraryHero';
import { GridCard } from './components/GridCard';
import { SidebarFilter } from './components/SidebarFilter';
import { LibraryToolbar } from './components/LibraryToolbar';
import styles from './styles/LibraryPage.module.css';

export const LibraryPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('Title');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const sidebarFilters = [
    { label: 'All' },
    { label: 'Installed' },
    { label: 'Not Installed' },
    { label: 'Updates' },
    { label: 'RPG' },
    { label: 'Action' },
    { label: 'Indie' },
    { label: 'Strategy' },
  ];

  const sortOptions: SortOption[] = ['Title', 'Rating', 'Purchase Date'];

  const updateCount = libraryGames.filter((g) => g.status === 'update-available').length;
  const heroGame = libraryGames.find((g) => g.status !== 'not-installed') ?? libraryGames[0];

  const filteredGames = libraryGames.filter((g) => {
    const matchSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.genre.toLowerCase().includes(searchQuery.toLowerCase());

    const matchFilter =
      activeFilter === 'All'
        ? true
        : activeFilter === 'Installed'
          ? g.status !== 'not-installed'
          : activeFilter === 'Not Installed'
            ? g.status === 'not-installed'
            : activeFilter === 'Updates'
              ? g.status === 'update-available'
              : g.genre.toLowerCase().includes(activeFilter.toLowerCase()) ||
                g.tags.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase()));

    return matchSearch && matchFilter;
  });

  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === 'Title') return a.title.localeCompare(b.title);
    if (sortBy === 'Rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className={styles.pageContainer}>
      <div className={styles.mainContent}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div>
            <div className={styles.headerBadge}>
              <BookOpen size={12} className={styles.badgeIcon} />
              <span className={styles.badgeText}>Your Collection</span>
            </div>
            <h1 className={styles.pageTitle}>
              The <span className={styles.titleHighlight}>Vault</span>
            </h1>
            <p className={styles.headerMeta}>
              {libraryGames.length} titles owned ·{' '}
              {libraryGames.filter((g) => g.status !== 'not-installed').length} installed
            </p>
          </div>
        </div>

        <HieroDivider />

        {/* Spotlight Hero Section */}
        <div style={{ marginBottom: '0.5rem' }}>
          <div className={styles.sectionSpotlightHeader}>
            <span className={styles.spotlightLabel}>⸻ Spotlight ⸻</span>
          </div>
          <LibraryHero game={heroGame} />
        </div>

        {/* Body Layout (Sidebar & Main Grid) */}
        <div className={styles.bodyLayout}>
          {/* Desktop Sidebar Filter */}
          <SidebarFilter
            filters={sidebarFilters}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            updateCount={updateCount}
          />

          {/* Main Content Area */}
          <div className={styles.mainGridArea}>
            {/* Toolbar */}
            <LibraryToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              showSortMenu={showSortMenu}
              onToggleSortMenu={() => setShowSortMenu((prev) => !prev)}
              onToggleMobileFilter={() => setMobileFilterOpen((prev) => !prev)}
              sortOptions={sortOptions}
            />

            {/* Mobile Filter Drawer */}
            {mobileFilterOpen && (
              <div className={styles.mobileDrawer}>
                <div className={styles.filterHeader}>
                  <Filter size={10} className={styles.badgeIcon} />
                  <span className={styles.filterTitle}>Filter</span>
                </div>
                <div className={styles.mobileFilterGroup}>
                  {sidebarFilters.map(({ label }) => {
                    const isActive = activeFilter === label;
                    return (
                      <button
                        key={label}
                        onClick={() => {
                          setActiveFilter(label);
                          setMobileFilterOpen(false);
                        }}
                        className={`${styles.mobileFilterPill} ${isActive ? styles.mobileFilterPillActive : ''}`}
                      >
                        {label}
                        {label === 'Updates' && updateCount > 0 && ` (${updateCount})`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results Count Meta */}
            <div className={styles.resultsMeta}>
              {sortedGames.length} {sortedGames.length === 1 ? 'title' : 'titles'} · sorted by{' '}
              {sortBy.toLowerCase()}
            </div>

            {/* Games Grid or Empty State */}
            {sortedGames.length === 0 ? (
              <div className={styles.emptyState}>
                <GlyphAccent char="𓂀" style={{ fontSize: '3.75rem' }} />
                <p className={styles.emptyText}>No scrolls found in the vault</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {sortedGames.map((game) => (
                  <GridCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
