import React from 'react';
import { RefreshCw, Download, CheckCircle2 } from 'lucide-react';
import { GameStatus } from '../types';
import styles from '../styles/LibraryPage.module.css';

interface StatusPillProps {
  status: GameStatus;
  version?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, version }) => {
  if (status === 'update-available') {
    return (
      <span className={styles.pillUpdate}>
        <RefreshCw size={8} />
        {version ? `v${version}` : 'Update'}
      </span>
    );
  }

  if (status === 'not-installed') {
    return (
      <span className={styles.pillNotInstalled}>
        <Download size={8} />
        Not Installed
      </span>
    );
  }

  return (
    <span className={styles.pillUpToDate}>
      <CheckCircle2 size={8} />
      Up to Date
    </span>
  );
};

export default StatusPill;
