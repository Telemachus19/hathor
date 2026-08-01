import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { HathorLogo } from '../../../assets';
import styles from '../-styles/GameInfoFormPage.module.css';

export const GameInfoFormHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.topBar}>
      <HathorLogo height={20} width="auto" />
      <div className={styles.topBarDivider} />
      <span className={styles.portalTag}>Developer Portal</span>
      <div style={{ flex: 1 }} />
      <div className={styles.stepNavContainer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(253, 112, 20, 0.14)', border: '1px solid #FD7014', borderRadius: 3 }}>
          <div className={styles.stepBadgeActive}>1</div>
          <span className={styles.stepLabelActive}>Step 1: Game Info</span>
        </div>
        <span style={{ color: 'rgba(140, 154, 170, 0.4)' }}>────────</span>
        <button
          onClick={() => navigate({ to: '/designer-page' })}
          style={{ background: 'transparent', border: '1px solid #393E46', borderRadius: 3, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        >
          <div className={styles.stepBadgeInactive}>2</div>
          <span className={styles.stepLabelInactive}>Step 2: Store Designer</span>
        </button>
      </div>
    </div>
  );
};
