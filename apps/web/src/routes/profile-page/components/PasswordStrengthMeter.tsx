import React from 'react';
import { PasswordStrength } from '../types';
import styles from '../styles/ProfilePage.module.css';

interface PasswordStrengthMeterProps {
  strength: PasswordStrength | null;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ strength }) => {
  if (!strength) return null;

  return (
    <div className={styles.strengthContainer}>
      <div className={styles.strengthTrack}>
        <div
          className={styles.strengthBar}
          style={{
            width: strength.width,
            backgroundColor: strength.color,
          }}
        />
      </div>
      <span className={styles.strengthText} style={{ color: strength.color }}>
        {strength.label}
      </span>
    </div>
  );
};

export default PasswordStrengthMeter;
