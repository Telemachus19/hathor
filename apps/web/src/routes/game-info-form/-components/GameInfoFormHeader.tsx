import React from 'react';
import { Link } from '@tanstack/react-router';
import { HathorLogo } from '../../../assets';
import styles from '../-styles/GameInfoFormPage.module.css';

export const GameInfoFormHeader: React.FC = () => {
  return (
    <div className={styles.topBar}>
      <Link
        to="/creator/overview"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textDecoration: 'none',
          cursor: 'pointer',
        }}
        title="Return to Creator Dashboard"
      >
        <HathorLogo height={32} width="auto" />
        <div className={styles.topBarDivider} />
        <span className={styles.portalTag}>Developer Portal</span>
      </Link>
      <div style={{ flex: 1 }} />
      <div className={styles.stepNavContainer}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            background: 'rgba(253, 112, 20, 0.14)',
            border: '1px solid #FD7014',
            borderRadius: 3,
          }}
        >
          <div className={styles.stepBadgeActive}>1</div>
          <span className={styles.stepLabelActive}>Step 1: Game Info</span>
        </div>
        <span style={{ color: 'rgba(140, 154, 170, 0.4)' }}>────────</span>
        <div
          style={{
            background: 'transparent',
            border: '1px solid #393E46',
            borderRadius: 3,
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'default',
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: 0.6,
          }}
          title="Complete Step 1 and click Save & Continue to proceed"
        >
          <div className={styles.stepBadgeInactive}>2</div>
          <span className={styles.stepLabelInactive}>Step 2: Store Designer</span>
        </div>
      </div>
    </div>
  );
};
