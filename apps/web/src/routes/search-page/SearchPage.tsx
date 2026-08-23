import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useInfiniteCatalogGames, useStoreGenres, useStoreTags } from '../../services/api/catalog';
import type { SortPreset, GenreItem, TagItem } from './types';
import { SearchHeader } from './components/SearchHeader';
import { SortControls } from './components/SortControls';
import { FilterSidebar } from './components/FilterSidebar';
import { FilterChips } from './components/FilterChips';
import { GameCard } from './components/GameCard';
import { EmptyState } from './components/EmptyState';
import styles from './styles/SearchPage.module.css';

interface RouteSearchParams {
  q?: string;
  sort?: string;
  genre?: string | string[];
  tag?: string | string[];
  tags?: string | string[];
}

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();

  // Read initial search params from URL
  let routeSearch: RouteSearchParams = {};
  try {
    routeSearch = useSearch({ strict: false }) as RouteSearchParams;
  } catch {
    routeSearch = {};
  }

  const initialQ = routeSearch.q || '';
  const initialSort = (
    ['trending', 'top_rated', 'new_arrivals'].includes(routeSearch.sort || '')
      ? routeSearch.sort
      : 'trending'
  ) as SortPreset;

  const initialGenres = useMemo(() => {
    const raw = routeSearch.genre;
    if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
    if (typeof raw === 'string' && raw.trim())
      return raw
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    return [];
  }, [routeSearch.genre]);

  const initialTags = useMemo(() => {
    const raw = routeSearch.tags || routeSearch.tag;
    if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
    if (typeof raw === 'string' && raw.trim())
      return raw
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    return [];
  }, [routeSearch.tags, routeSearch.tag]);

  const [q, setQ] = useState(initialQ);
  const [sort, setSort] = useState<SortPreset>(initialSort);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Synchronize state when URL search params change externally
  useEffect(() => {
    setQ(initialQ);
    setSort(initialSort);
    setSelectedGenres(initialGenres);
    setSelectedTags(initialTags);
  }, [initialQ, initialSort, initialGenres, initialTags]);

  // URL Synchronization helper via TanStack Router navigate
  const updateUrlParams = useCallback(
    (newQ: string, newSort: SortPreset, newGenres: string[], newTags: string[]) => {
      const searchObj: Record<string, string | undefined> = {};
      if (newQ.trim()) searchObj.q = newQ.trim();
      if (newSort !== 'trending') searchObj.sort = newSort;
      if (newGenres.length > 0) searchObj.genre = newGenres.join(',');
      if (newTags.length > 0) searchObj.tags = newTags.join(',');

      void navigate({
        to: '/search',
        search: searchObj as any,
        replace: true,
      });
    },
    [navigate]
  );

  // Fetch Genres & Tags directly from Database via API
  const { data: genresData } = useStoreGenres();
  const { data: tagsData } = useStoreTags();

  const availableGenres: GenreItem[] = useMemo(() => {
    return genresData || [];
  }, [genresData]);

  const availableTags: TagItem[] = useMemo(() => {
    return tagsData || [];
  }, [tagsData]);

  // Infinite Games Query with full API-side search, multi-genre, multi-tags, sort, and pagination
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteCatalogGames({
      q: q.trim() || undefined,
      genre: selectedGenres.length > 0 ? selectedGenres.join(',') : undefined,
      tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
      sort,
      limit: 12,
    });

  // Flatten games directly from paginated API response
  const gamesList = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data.items);
  }, [data?.pages]);

  const totalCount = data?.pages[0]?.data.pagination.totalItems ?? gamesList.length;

  // Infinite scroll observer
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handlers
  const handleSearchSubmit = (searchKeyword: string) => {
    setQ(searchKeyword);
    updateUrlParams(searchKeyword, sort, selectedGenres, selectedTags);
  };

  const handleSortChange = (newSort: SortPreset) => {
    setSort(newSort);
    updateUrlParams(q, newSort, selectedGenres, selectedTags);
  };

  const handleToggleGenre = (genreSlug: string) => {
    const updated = selectedGenres.includes(genreSlug)
      ? selectedGenres.filter((s) => s !== genreSlug)
      : [...selectedGenres, genreSlug];
    setSelectedGenres(updated);
    updateUrlParams(q, sort, updated, selectedTags);
  };

  const handleToggleTag = (tagSlug: string) => {
    const updated = selectedTags.includes(tagSlug)
      ? selectedTags.filter((s) => s !== tagSlug)
      : [...selectedTags, tagSlug];
    setSelectedTags(updated);
    updateUrlParams(q, sort, selectedGenres, updated);
  };

  const handleClearAllFilters = () => {
    setSelectedGenres([]);
    setSelectedTags([]);
    updateUrlParams(q, sort, [], []);
  };

  const activeFilterCount = selectedGenres.length + selectedTags.length;

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Search Header Bar */}
        <SearchHeader initialValue={q} onSearch={handleSearchSubmit} />

        {/* Main Content Layout */}
        <div className={styles.mainLayout}>
          {/* Collapsible Sidebar */}
          {sidebarOpen && (
            <FilterSidebar
              genres={availableGenres}
              tags={availableTags}
              selectedGenres={selectedGenres}
              selectedTags={selectedTags}
              onToggleGenre={handleToggleGenre}
              onToggleTag={handleToggleTag}
              onClearAll={handleClearAllFilters}
              activeCount={activeFilterCount}
            />
          )}

          {/* Results Area */}
          <section className={styles.resultsArea}>
            {/* Results Title & Sort Controls */}
            <div className={styles.resultsHeaderRow}>
              <div className={styles.resultsCountBlock}>
                <h1 className={styles.resultsHeading}>
                  {q ? (
                    <>
                      Results for <span className={styles.queryHighlight}>&ldquo;{q}&rdquo;</span>
                    </>
                  ) : (
                    'Store Catalog'
                  )}
                </h1>
                <p className={styles.resultsSubtext}>
                  {isLoading
                    ? 'Loading games catalog...'
                    : `${totalCount} ${totalCount === 1 ? 'game' : 'games'} available`}
                </p>
              </div>

              <SortControls
                currentSort={sort}
                onSortChange={handleSortChange}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
                activeFilterCount={activeFilterCount}
              />
            </div>

            {/* Active Filter Chips */}
            <FilterChips
              selectedGenres={selectedGenres}
              selectedTags={selectedTags}
              genres={availableGenres}
              tags={availableTags}
              onRemoveGenre={handleToggleGenre}
              onRemoveTag={handleToggleTag}
              onClearAll={handleClearAllFilters}
            />

            {/* Games Grid or Loading Skeletons or Empty State */}
            {isLoading ? (
              <div className={styles.loadingSkeletonGrid}>
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className={styles.skeletonCard} />
                ))}
              </div>
            ) : gamesList.length === 0 ? (
              <EmptyState
                onClearFilters={handleClearAllFilters}
                hasFilters={activeFilterCount > 0 || !!q}
              />
            ) : (
              <div className={styles.gamesGrid}>
                {gamesList.map((game) => (
                  <GameCard key={game.id || game.slug} game={game} />
                ))}
              </div>
            )}

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className={styles.sentinel} />

            {/* Loading Indicator */}
            {isFetchingNextPage && (
              <div className={styles.loadingMoreWrapper}>
                <div className={styles.spinner} />
                <span>Loading more games...</span>
              </div>
            )}

            {/* End of results footer */}
            {!hasNextPage && gamesList.length > 0 && !isLoading && (
              <div className={styles.endOfResults}>End of catalog results</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
