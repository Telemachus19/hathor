import React from 'react';
import styles from '../-styles/GameInfoFormPage.module.css';

export interface MediaAssetsCardProps {
  bannerUrl: string;
  trailerUrl: string;
  onChangeBannerUrl: (v: string) => void;
  onChangeTrailerUrl: (v: string) => void;
}

export const MediaAssetsCard: React.FC<MediaAssetsCardProps> = ({
  bannerUrl,
  trailerUrl,
  onChangeBannerUrl,
  onChangeTrailerUrl,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.accentBar} />
        <h2 className={styles.cardTitle}>Media & Showcase Assets</h2>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Banner / Cover Image URL</label>
          <input
            type="text"
            value={bannerUrl}
            onChange={(e) => onChangeBannerUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className={styles.inputField}
          />
          {bannerUrl && (
            <div className={styles.imagePreview}>
              <img
                src={bannerUrl}
                alt="Banner preview"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Trailer Video URL</label>
          <input
            type="text"
            value={trailerUrl}
            onChange={(e) => onChangeTrailerUrl(e.target.value)}
            placeholder="https://youtube.com/..."
            className={styles.inputField}
          />
        </div>
      </div>
    </div>
  );
};
