import React, { useState } from 'react';
import { BookOpen, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUserLibrary } from '../../services/api/library';
import { useUserOrders } from '../../services/api/commerce';
import { useCatalogGames } from '../../services/api/catalog';
import { SortOption, ViewMode, DisplayGame, DynamicFilterItem } from './types';
import { HieroDivider } from './components/HieroDivider';
import { GlyphAccent } from './components/GlyphAccent';
import { LibraryHero } from './components/LibraryHero';
import { GridCard } from './components/GridCard';
import { SidebarFilter } from './components/SidebarFilter';
import { LibraryToolbar } from './components/LibraryToolbar';
import styles from './styles/LibraryPage.module.css';

export const LibraryPage: React.FC = () => {
  const { status: authStatus } = useAuth();

  const [viewMode, setViewMode] = useState<ViewMode>('owned');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('Title');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Live queries
  const { data: libraryLicenses, isLoading: isLibraryLoading } = useUserLibrary();
  const { data: pendingOrders, isLoading: isOrdersLoading } = useUserOrders('payment_pending');
  const { data: catalogData, isLoading: isCatalogLoading } = useCatalogGames({ limit: 100 });

  const catalogGames = catalogData?.data?.items || [];
  const licenses = libraryLicenses || [];
  const pendingList = pendingOrders || [];

  // Filter out expired orders from pending list
  const activePendingList = pendingList.filter((order) => {
    if (order.status === 'expired') return false;
    if (order.expiresAt) {
      const expiryTime = new Date(order.expiresAt).getTime();
      if (!isNaN(expiryTime) && expiryTime <= Date.now()) return false;
    }
    return true;
  });

  // Map owned licenses to DisplayGame items
  const ownedGames: DisplayGame[] = licenses.map((lic) => {
    const catalogGame = catalogGames.find(
      (g) => (g as any).id === lic.gameId || g.slug === lic.gameId
    );
    const rawTags = (catalogGame as any)?.tags || [];
    const tagsList = Array.isArray(rawTags)
      ? rawTags.map((t: any) => (typeof t === 'string' ? t : t?.name || 'Tag'))
      : ['Action'];

    return {
      id: lic.gameId,
      slug: catalogGame?.slug || lic.gameId,
      title: catalogGame?.title || `Game ${lic.gameId.slice(0, 8)}`,
      genre: (catalogGame as any)?.genre || tagsList[0] || 'Action / Strategy',
      developer: (catalogGame as any)?.developer || 'Hathor Studios',
      rating: (catalogGame as any)?.ratingScore || 4.8,
      coverImage:
        (catalogGame as any)?.coverUrl ||
        (catalogGame as any)?.thumbnailUrl ||
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      heroImage:
        (catalogGame as any)?.coverUrl ||
        (catalogGame as any)?.thumbnailUrl ||
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
      tags: tagsList,
      purchaseDate: lic.acquiredAt ? new Date(lic.acquiredAt).toLocaleDateString() : 'Recent',
      priceEgp: lic.pricePaidEgp || '299.99',
      sourceOrderId: lic.sourceOrderId,
      isPending: false,
    };
  });

  // Map pending orders to DisplayGame items
  const pendingGames: DisplayGame[] = activePendingList.flatMap((order) =>
    (order.items || []).map((item) => {
      const catalogGame = catalogGames.find(
        (g) => (g as any).id === item.gameId || g.slug === item.gameId
      );
      const rawTags = (catalogGame as any)?.tags || [];
      const tagsList = Array.isArray(rawTags)
        ? rawTags.map((t: any) => (typeof t === 'string' ? t : t?.name || 'Tag'))
        : ['Pending'];

      return {
        id: item.gameId,
        slug: catalogGame?.slug || item.gameId,
        title: item.titleSnapshot || catalogGame?.title || `Order ${order.id.slice(0, 8)}`,
        genre: (catalogGame as any)?.genre || tagsList[0] || 'Action / Strategy',
        developer: (catalogGame as any)?.developer || 'Hathor Studios',
        rating: (catalogGame as any)?.ratingScore || 4.8,
        coverImage:
          (catalogGame as any)?.coverUrl ||
          (catalogGame as any)?.thumbnailUrl ||
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
        heroImage:
          (catalogGame as any)?.coverUrl ||
          (catalogGame as any)?.thumbnailUrl ||
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        tags: tagsList,
        purchaseDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Pending',
        priceEgp: item.pricePaidEgp || order.totalAmountEgp,
        sourceOrderId: order.id,
        isPending: true,
        paymentReference: order.paymentReference,
        paymentMethod: order.paymentMethod,
      };
    })
  );

  // Extract unique genres dynamically from owned games
  const uniqueGenresSet = new Set<string>();
  ownedGames.forEach((g) => {
    if (g.genre) uniqueGenresSet.add(g.genre);
    g.tags.forEach((t) => uniqueGenresSet.add(t));
  });

  const uniqueGenresList = Array.from(uniqueGenresSet).sort();

  const sidebarFilters: DynamicFilterItem[] = [
    { label: 'All', count: ownedGames.length },
    ...uniqueGenresList.map((genre) => ({
      label: genre,
      count: ownedGames.filter(
        (g) =>
          g.genre.toLowerCase() === genre.toLowerCase() ||
          g.tags.some((t) => t.toLowerCase() === genre.toLowerCase())
      ).length,
    })),
  ];

  const currentList = viewMode === 'owned' ? ownedGames : pendingGames;
  const sortOptions: SortOption[] = ['Title', 'Rating', 'Purchase Date'];
  const heroGame = ownedGames[0];

  // Filtering current list by search and genre sidebar
  const filteredGames = currentList.filter((g) => {
    const matchSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.genre.toLowerCase().includes(searchQuery.toLowerCase());

    const matchFilter =
      activeFilter === 'All'
        ? true
        : g.genre.toLowerCase().includes(activeFilter.toLowerCase()) ||
          g.tags.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase()));

    return matchSearch && matchFilter;
  });

  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === 'Title') return a.title.localeCompare(b.title);
    if (sortBy === 'Rating') return b.rating - a.rating;
    return 0;
  });

  const isLoading = isLibraryLoading || isOrdersLoading || isCatalogLoading;

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.mainContent} style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p style={{ color: '#94a3b8', fontFamily: 'monospace' }}>Loading library vault...</p>
        </div>
      </div>
    );
  }

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
              {ownedGames.length} {ownedGames.length === 1 ? 'title' : 'titles'} owned ·{' '}
              {pendingGames.length} pending orders
            </p>
          </div>
        </div>

        <HieroDivider />

        {/* Spotlight Hero Section (shown if user owns games) */}
        {heroGame && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div className={styles.sectionSpotlightHeader}>
              <span className={styles.spotlightLabel}>⸻ Spotlight ⸻</span>
            </div>
            <LibraryHero game={heroGame} />
          </div>
        )}

        {/* Body Layout (Sidebar & Main Grid) */}
        <div className={styles.bodyLayout}>
          {/* Desktop Sidebar Filter (Shown in Owned mode) */}
          {viewMode === 'owned' && (
            <SidebarFilter
              filters={sidebarFilters}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
            />
          )}

          {/* Main Content Area */}
          <div
            className={styles.mainGridArea}
            style={viewMode === 'pending' ? { gridColumn: '1 / -1' } : {}}
          >
            {/* Toolbar with Owned vs Pending selector */}
            <LibraryToolbar
              viewMode={viewMode}
              onViewModeChange={(mode) => {
                setViewMode(mode);
                setActiveFilter('All');
              }}
              ownedCount={ownedGames.length}
              pendingCount={pendingGames.length}
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
            {mobileFilterOpen && viewMode === 'owned' && (
              <div className={styles.mobileDrawer}>
                <div className={styles.filterHeader}>
                  <Filter size={10} className={styles.badgeIcon} />
                  <span className={styles.filterTitle}>Genres</span>
                </div>
                <div className={styles.mobileFilterGroup}>
                  {sidebarFilters.map(({ label, count }) => {
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
                        {label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results Count Meta */}
            <div className={styles.resultsMeta}>
              {sortedGames.length} {sortedGames.length === 1 ? 'title' : 'titles'} ·{' '}
              {viewMode === 'owned' ? 'owned collection' : 'pending payment orders'}
            </div>

            {/* Games Grid or Empty State */}
            {sortedGames.length === 0 ? (
              <div className={styles.emptyState}>
                <GlyphAccent char="𓂀" style={{ fontSize: '3.75rem' }} />
                <p className={styles.emptyText}>
                  {viewMode === 'owned'
                    ? 'No owned titles found in your vault'
                    : 'No pending payment orders found'}
                </p>
              </div>
            ) : (
              <div className={styles.grid}>
                {sortedGames.map((game) => (
                  <GridCard key={`${game.id}-${game.sourceOrderId || ''}`} game={game} />
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
