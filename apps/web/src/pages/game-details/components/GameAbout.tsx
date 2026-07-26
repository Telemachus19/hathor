import React, { useState } from 'react';
import styles from '../styles/GameAbout.module.css';

export interface AboutSectionItem {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface GameAboutProps {
  sections: AboutSectionItem[];
}

/**
 * Collapsible "ABOUT THIS GAME" section featuring "READ MORE" expand functionality.
 */
export const GameAbout: React.FC<GameAboutProps> = ({ sections }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.aboutWrap}>
      <h3 className={styles.sectionHeader}>ABOUT THIS GAME</h3>

      <div
        className={`${styles.contentContainer} ${!isExpanded ? styles.contentCollapsed : ''}`}
      >
        {sections.map((item, idx) => (
          <div key={idx} className={styles.subSection}>
            <h4 className={styles.subHeading}>{item.title}</h4>
            <p className={styles.paragraph}>{item.description}</p>
            {item.imageUrl && (
              <div className={styles.showcaseImgWrap}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className={styles.showcaseImg}
                />
              </div>
            )}
          </div>
        ))}

        {!isExpanded && <div className={styles.fadeOverlay} />}
      </div>

      <div className={styles.readMoreWrap}>
        <button
          className={styles.readMoreBtn}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? 'SHOW LESS ▲' : 'READ MORE ▼'}
        </button>
      </div>
    </div>
  );
};
