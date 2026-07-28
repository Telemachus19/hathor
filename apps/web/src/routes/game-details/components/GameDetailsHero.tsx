import React, { useState, useEffect, useCallback } from 'react';
import styles from '../styles/GameDetailsHero.module.css';
import { CloseIcon, ZoomIcon } from '../../landing-page/assets';

export interface GameDetailsHeroProps {
  images: string[];
}

/**
 * Top full-width hero media banner with interactive slider arrows, thumbnail preview strip,
 * and Steam-style full-screen Lightbox popup modal on image click.
 */
export const GameDetailsHero: React.FC<GameDetailsHeroProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    },
    [images.length]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    },
    [images.length]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    },
    [isLightboxOpen, handlePrev, handleNext]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!images || images.length === 0) return null;

  return (
    <div className={styles.heroWrap}>
      {/* Main Banner (Click opens Lightbox Modal) */}
      <div
        className={styles.mainBanner}
        onClick={() => setIsLightboxOpen(true)}
        title="View full screen"
      >
        <img
          src={images[activeIndex]}
          alt={`Showcase screenshot ${activeIndex + 1}`}
          className={styles.bannerImg}
        />
        <div className={styles.bannerOverlay} />
        
        <div className={styles.zoomIconBtn}>
          <ZoomIcon width={16} height={16} />
        </div>

        <button
          className={`${styles.navArrow} ${styles.prevArrow}`}
          onClick={handlePrev}
          aria-label="Previous image"
        >
          &lt;
        </button>
        <button
          className={`${styles.navArrow} ${styles.nextArrow}`}
          onClick={handleNext}
          aria-label="Next image"
        >
          &gt;
        </button>
      </div>

      {/* Thumbnails Preview Strip */}
      <div className={styles.thumbnailsBar}>
        <div className={styles.thumbList}>
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              className={`${styles.thumbItem} ${activeIndex === idx ? styles.thumbActive : ''}`}
              onClick={() => setActiveIndex(idx)}
            >
              <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className={styles.thumbImg} />
            </button>
          ))}
        </div>
      </div>

      {/* Steam-Style Full Screen Lightbox Modal Popup */}
      {isLightboxOpen && (
        <div
          className={styles.lightboxModal}
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className={styles.lightboxTopBar}>
            <span className={styles.lightboxCounter}>
              SCREENSHOT {activeIndex + 1} OF {images.length}
            </span>
            <button
              className={styles.closeBtn}
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close full screen view"
            >
              <CloseIcon width={16} height={16} />
            </button>
          </div>

          <button
            className={`${styles.modalNavArrow} ${styles.modalPrevArrow}`}
            onClick={handlePrev}
            aria-label="Previous screenshot"
          >
            &lt;
          </button>

          <div
            className={styles.lightboxImgWrap}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[activeIndex]}
              alt={`Full size screenshot ${activeIndex + 1}`}
              className={styles.lightboxImg}
            />
          </div>

          <button
            className={`${styles.modalNavArrow} ${styles.modalNextArrow}`}
            onClick={handleNext}
            aria-label="Next screenshot"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};
