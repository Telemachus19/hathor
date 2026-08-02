import React from 'react';
import styles from '../-styles/GameInfoFormPage.module.css';

export interface BasicDetailsCardProps {
  title: string;
  shortDesc: string;
  priceEgp: string;
  onChangeTitle: (v: string) => void;
  onChangeShortDesc: (v: string) => void;
  onChangePriceEgp: (v: string) => void;
}

export const BasicDetailsCard: React.FC<BasicDetailsCardProps> = ({
  title,
  shortDesc,
  priceEgp,
  onChangeTitle,
  onChangeShortDesc,
  onChangePriceEgp,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.accentBar} />
        <h2 className={styles.cardTitle}>Basic Details</h2>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Game Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="Enter your game title (e.g. ELDEN THRONE)..."
            className={styles.inputField}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Short Description</label>
          <textarea
            value={shortDesc}
            onChange={(e) => onChangeShortDesc(e.target.value)}
            placeholder="A compelling one-to-two sentence summary of your game. What makes it unique?"
            rows={3}
            className={styles.textareaField}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Price (EGP)</label>
          <div className={styles.priceWrapper}>
            <span className={styles.pricePrefix}>EGP</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={priceEgp}
              onChange={(e) => onChangePriceEgp(e.target.value)}
              placeholder="299.99"
              className={styles.priceInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
