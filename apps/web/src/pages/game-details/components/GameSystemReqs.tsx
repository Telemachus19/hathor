import React, { useState } from 'react';
import styles from '../styles/GameSystemReqs.module.css';
import {
  MonitorIcon,
  CpuIcon,
  RamIcon,
  GpuIcon,
  HardDriveIcon,
} from '../../landing-page/assets';

export interface SystemSpec {
  os: string;
  cpu: string;
  ram: string;
  gpu: string;
  storage: string;
}

export interface GameSystemReqsProps {
  minimum: SystemSpec;
  recommended: SystemSpec;
}

/**
 * Segmented System Requirements component with hardware SVG icons and merged control tabs.
 */
export const GameSystemReqs: React.FC<GameSystemReqsProps> = ({
  minimum,
  recommended,
}) => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'minimum'>('recommended');

  const currentSpec = activeTab === 'recommended' ? recommended : minimum;

  return (
    <div className={styles.reqsWrap}>
      <div className={styles.headerRow}>
        <h3 className={styles.sectionHeader}>SYSTEM REQUIREMENTS</h3>
        <div className={styles.headerLine} />
      </div>

      <div className={styles.segmentControl}>
        <button
          className={`${styles.segmentBtn} ${activeTab === 'recommended' ? styles.segmentActive : ''}`}
          onClick={() => setActiveTab('recommended')}
        >
          RECOMMENDED
        </button>
        <button
          className={`${styles.segmentBtn} ${activeTab === 'minimum' ? styles.segmentActive : ''}`}
          onClick={() => setActiveTab('minimum')}
        >
          MINIMUM
        </button>
      </div>

      <div className={styles.specGrid}>
        <div className={styles.specCard}>
          <div className={styles.iconWrap}>
            <MonitorIcon width={18} height={18} />
          </div>
          <div className={styles.specTextStack}>
            <span className={styles.specLabel}>OS</span>
            <span className={styles.specValue}>{currentSpec.os}</span>
          </div>
        </div>

        <div className={styles.specCard}>
          <div className={styles.iconWrap}>
            <CpuIcon width={18} height={18} />
          </div>
          <div className={styles.specTextStack}>
            <span className={styles.specLabel}>CPU</span>
            <span className={styles.specValue}>{currentSpec.cpu}</span>
          </div>
        </div>

        <div className={styles.specCard}>
          <div className={styles.iconWrap}>
            <RamIcon width={18} height={18} />
          </div>
          <div className={styles.specTextStack}>
            <span className={styles.specLabel}>RAM</span>
            <span className={styles.specValue}>{currentSpec.ram}</span>
          </div>
        </div>

        <div className={styles.specCard}>
          <div className={styles.iconWrap}>
            <GpuIcon width={18} height={18} />
          </div>
          <div className={styles.specTextStack}>
            <span className={styles.specLabel}>GPU</span>
            <span className={styles.specValue}>{currentSpec.gpu}</span>
          </div>
        </div>

        <div className={styles.specCard}>
          <div className={styles.iconWrap}>
            <HardDriveIcon width={18} height={18} />
          </div>
          <div className={styles.specTextStack}>
            <span className={styles.specLabel}>STORAGE</span>
            <span className={styles.specValue}>{currentSpec.storage}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
