import React, { useState } from 'react';
import styles from '../styles/FeaturedGames.module.css';
import { GameCard } from './GameCard';
import { EyeOfHorusIcon } from '../assets';
import { useCatalogGames } from '../../../services/api/catalog';

/**
 * Featured games carousel section displaying curated storefront catalog items.
 */
export const FeaturedGames: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);

  const { data, isLoading, isError } = useCatalogGames({ page: 1, limit: 6 });

  const fetchedGames = data?.data?.items || [];
  const totalCount = data?.data?.pagination?.totalItems || 0;

  const handlePrev = () => {
    setPageIndex((prev) => (prev > 0 ? prev - 1 : 1));
  };

  const handleNext = () => {
    setPageIndex((prev) => (prev < 1 ? prev + 1 : 0));
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.subtitle}>
          <span className={styles.subtitleLine} />
          EDITOR'S PICKS
          <span className={styles.subtitleLine} />
        </div>
        <h2 className={styles.title}>
          FEATURED
          <br />
          <span className={styles.titleAccent}>GAMES</span>
        </h2>

        <div className={styles.carouselControls}>
          <span className={styles.counter}>— 0{pageIndex + 1}</span>
          <div className={styles.arrows}>
            <button className={styles.arrowBtn} onClick={handlePrev} aria-label="Previous page">
              &lt;
            </button>
            <button className={styles.arrowBtn} onClick={handleNext} aria-label="Next page">
              &gt;
            </button>
          </div>
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
        <div style={{ padding: '2rem', textAlign: 'center', color: '#a4b0be' }}>
          Loading featured games from catalog...
        </div>
      )}

      {isError && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ff4655' }}>
          Unable to connect to Catalog API. Please ensure microservices are running.
        </div>
      )}

      {!isLoading && !isError && (
        <div className={styles.carouselTrackWrapper}>
          <div
            className={styles.carouselTrack}
            style={{
              transform: pageIndex === 0 ? 'translateX(0%)' : 'translateX(calc(-100% - 1.5rem))',
            }}
          >
            {fetchedGames.map((game, index) => (
              <div key={game.slug || index} className={styles.carouselItem}>
                <GameCard
                  slug={game.slug}
                  title={game.title}
                  tags={game.tags}
                  priceEgp={game.priceEgp}
                  discountPercent={game.discountPercent}
                  imageUrl={game.bannerUrl}
                  showAddButton={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.paginationInfo}>
        {fetchedGames.length > 0
          ? `${pageIndex * 3 + 1}-${Math.min((pageIndex + 1) * 3, fetchedGames.length)} of ${totalCount} games`
          : '0 games'}
      </div>
    </section>
  );
};
