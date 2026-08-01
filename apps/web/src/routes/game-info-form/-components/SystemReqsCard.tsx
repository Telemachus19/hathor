import React, { useState } from 'react';
import { Globe, Cpu, Tv2, MemoryStick, HardDrive } from 'lucide-react';
import { SystemReqSpec } from '../gameInfoCache';
import styles from '../-styles/GameInfoFormPage.module.css';

export interface SystemReqsCardProps {
  minReq: SystemReqSpec;
  recReq: SystemReqSpec;
  onChangeTier: (tier: 'minReq' | 'recReq', key: keyof SystemReqSpec, val: any) => void;
}

const OS_OPTIONS = ["Windows 10", "Windows 11", "macOS 12", "macOS 13", "macOS 14", "Ubuntu 20.04", "Ubuntu 22.04", "Steam OS"];

export const SystemReqsCard: React.FC<SystemReqsCardProps> = ({
  minReq,
  recReq,
  onChangeTier,
}) => {
  const [sysTab, setSysTab] = useState<'min' | 'rec'>('min');

  const tierKey = sysTab === 'min' ? 'minReq' : 'recReq';
  const tierData = sysTab === 'min' ? minReq : recReq;

  function toggleOs(os: string) {
    const currentOs = tierData.os || [];
    const updated = currentOs.includes(os) ? currentOs.filter(s => s !== os) : [...currentOs, os];
    onChangeTier(tierKey, 'os', updated);
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.accentBar} />
        <h2 className={styles.cardTitle}>System Requirements</h2>
      </div>

      {/* Tabs */}
      <div className={styles.tabsRow}>
        <button
          type="button"
          onClick={() => setSysTab('min')}
          className={sysTab === 'min' ? styles.tabBtnActive : styles.tabBtn}
        >
          Minimum
        </button>
        <button
          type="button"
          onClick={() => setSysTab('rec')}
          className={sysTab === 'rec' ? styles.tabBtnActive : styles.tabBtn}
        >
          Recommended
        </button>
      </div>

      <div className={styles.cardBody}>
        {/* OS */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabelSub}>
            <Globe size={11} /> Supported Operating Systems
          </label>
          <div className={styles.pillsContainer}>
            {OS_OPTIONS.map(os => {
              const active = (tierData.os || []).includes(os);
              return (
                <button
                  key={os}
                  type="button"
                  onClick={() => toggleOs(os)}
                  className={active ? styles.osBtnActive : styles.osBtn}
                >
                  {os}
                </button>
              );
            })}
          </div>
        </div>

        {/* CPU */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabelSub}>
            <Cpu size={11} /> Processor (CPU)
          </label>
          <input
            type="text"
            value={tierData.cpu}
            onChange={e => onChangeTier(tierKey, 'cpu', e.target.value)}
            placeholder="e.g. Intel Core i5-8400 / AMD Ryzen 5 2600"
            className={styles.inputField}
          />
        </div>

        {/* GPU */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabelSub}>
            <Tv2 size={11} /> Graphics Card (GPU)
          </label>
          <input
            type="text"
            value={tierData.gpu}
            onChange={e => onChangeTier(tierKey, 'gpu', e.target.value)}
            placeholder="e.g. NVIDIA GTX 1070 (8GB)"
            className={styles.inputField}
          />
        </div>

        {/* RAM & Storage */}
        <div className={styles.twoColInputs}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabelSub}>
              <MemoryStick size={11} /> RAM (GB)
            </label>
            <input
              type="text"
              value={tierData.ram}
              onChange={e => onChangeTier(tierKey, 'ram', e.target.value)}
              placeholder="12"
              className={styles.inputField}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabelSub}>
              <HardDrive size={11} /> Storage Space
            </label>
            <input
              type="text"
              value={tierData.storageNum}
              onChange={e => onChangeTier(tierKey, 'storageNum', e.target.value)}
              placeholder="85"
              className={styles.inputField}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
