import React from 'react';
import styles from '../styles/PromoBanner.module.css';

export const PromoBanner: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.banner}>
        <div className={styles.content}>
          <div className={styles.subtitle}>
            <span className={styles.subtitleLine} />
            LIMITED TIME
            <span className={styles.subtitleLine} />
          </div>
          <h3 className={styles.title}>
            SUMMER SALE — UP TO <span className={styles.titleAccent}>75% OFF</span>
          </h3>
          <p className={styles.subtitle2}>Offer ends July 31st</p>
        </div>
        <button className={styles.browseBtn}>BROWSE ALL DEALS</button>
      </div>
    </section>
  );
};
