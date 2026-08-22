import React, { ReactNode } from 'react';
import styles from '../styles/ProfilePage.module.css';

interface SectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, icon, children }) => {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>{icon}</span>
        <span className={styles.sectionTitle}>{title}</span>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
};

export default Section;
