import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/MoreGames.module.css';
import { GameCard } from './GameCard';
import { EyeOfHorusIcon, LogoSolidSmallIcon } from '../assets';
import { useInfiniteCatalogGames } from '../../../api/catalog';

const categories = ['ALL', 'RPG', 'ACTION', 'INDIE', 'STRATEGY', 'CYBERPUNK'];

/**
 * Filterable game catalog grid section with automatic IntersectionObserver infinite scrolling.
 */
export const MoreGames: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCatalogGames({
    tag: activeCategory === 'ALL' ? undefined : activeCategory.toLowerCase(),
    limit: 8,
  });

  const gamesList = data?.pages.flatMap((page) => page.data.items) || [];

  // Automatic infinite scroll trigger via IntersectionObserver
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.subtitle}>
          <span className={styles.subtitleLine} />
          RECOMMENDED FOR YOU
          <span className={styles.subtitleLine} />
        </div>
        <h2 className={styles.title}>
          MORE
          <br />
          <span className={styles.titleAccent}>GAMES</span>
        </h2>

        <div className={styles.categoryFilters}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${activeCategory === cat ? styles.categoryBtnActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.separatorWrap}>
        <div className={styles.separatorLine} />
        <div className={styles.separatorIcon}>
          <EyeOfHorusIcon />
        </div>
        <div className={styles.separatorLine} />
      </div>

      {isLoading && (
        <div className={styles.loadingContainer}>
          <LogoSolidSmallIcon width={64} height={48} className={styles.logoSpinner} />
          <span className={styles.loadingText}>Fetching catalog games...</span>
        </div>
      )}

      {isError && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ff4655' }}>
          Failed to load store catalog.
        </div>
      )}

      {!isLoading && !isError && gamesList.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#a4b0be' }}>
          No published games found for category "{activeCategory}".
        </div>
      )}

      {!isLoading && !isError && gamesList.length > 0 && (
        <div className={styles.grid}>
          {gamesList.map((game, idx) => (
            <GameCard
              key={`${game.slug}-${idx}`}
              title={game.title}
              tags={game.tags}
              priceEgp={game.priceEgp}
              discountPercent={game.discountPercent}
              imageUrl={game.bannerUrl}
              showAddButton={false}
            />
          ))}
        </div>
      )}

      {hasNextPage && <div ref={observerTargetRef} style={{ height: '1px' }} />}

      {isFetchingNextPage && (
        <div className={styles.loadingContainer}>
          <LogoSolidSmallIcon width={64} height={48} className={styles.logoSpinner} />
          <span className={styles.loadingText}>Loading more games...</span>
        </div>
      )}
    </section>
  );
};
