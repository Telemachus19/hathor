import { useNavigate } from '@tanstack/react-router';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  RotateCw,
  Save,
  Upload,
  LayoutGrid,
  FileUp,
  FileJson,
  Eye,
} from 'lucide-react';
import { Device, HATHOR_ORANGE, GREEN_ACCENT, BORDER, TEXT_MUTED } from '../../types/designerTypes';
import styles from '../../DesignerPage.module.css';

export function DesignerHeader({
  gameTitle,
  setGameTitle,
  device,
  setDevice,
  historyIdx,
  historyLength,
  onUndo,
  onRedo,
  onOpenTemplates,
  onOpenPreview,
  onOpenImport,
  onSaveDraft,
  onOpenPublish,
}: {
  gameTitle: string;
  setGameTitle: (title: string) => void;
  device: Device;
  setDevice: (d: Device) => void;
  historyIdx: number;
  historyLength: number;
  onUndo: () => void;
  onRedo: () => void;
  onOpenTemplates: () => void;
  onOpenPreview: () => void;
  onOpenImport: () => void;
  onSaveDraft: () => void;
  onOpenPublish: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className={styles.topToolbar}>
      <span
        style={{
          color: HATHOR_ORANGE,
          fontWeight: 900,
          fontFamily: 'monospace',
          fontSize: 13,
          letterSpacing: '0.1em',
        }}
      >
        HATHOR
      </span>
      <div className={styles.toolbarDivider} />
      <span className={styles.titleTag}>Developer Portal</span>
      <div className={styles.toolbarDivider} />

      {/* Step Flow Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 10,
          fontFamily: 'monospace',
        }}
      >
        <button
          onClick={() => navigate({ to: '/game-info-form' })}
          style={{
            background: 'transparent',
            border: '1px solid #353c4d',
            borderRadius: 3,
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#8C9AAA',
            cursor: 'pointer',
          }}
          title="Return to Step 1: Game Info"
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: '1px solid #353c4d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 900,
            }}
          >
            1
          </span>
          <span>Step 1: Game Info</span>
        </button>
        <span style={{ color: 'rgba(140, 154, 170, 0.4)' }}>────────</span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            background: 'rgba(242, 107, 33, 0.14)',
            border: `1px solid ${HATHOR_ORANGE}`,
            borderRadius: 3,
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: HATHOR_ORANGE,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 900,
            }}
          >
            2
          </span>
          <span style={{ color: HATHOR_ORANGE, fontWeight: 800 }}>Step 2: Store Designer</span>
        </div>
      </div>

      <div className={styles.toolbarDivider} />
      <input
        value={gameTitle}
        onChange={(e) => setGameTitle(e.target.value)}
        className={styles.gameTitleInput}
      />
      <div className={styles.toolbarSpacer} />

      {/* Template Selector Button */}
      <button
        onClick={onOpenTemplates}
        className={styles.saveDraftBtn}
        style={{ background: 'transparent', border: '1px solid #353c4d', color: TEXT_MUTED }}
      >
        <LayoutGrid size={11} /> Templates
      </button>

      <div className={styles.toolbarDivider} />

      {/* Device preview toggle */}
      <div className={styles.deviceToggleGroup}>
        {(['desktop', 'tablet', 'mobile'] as Device[]).map((d) => {
          const Icon = d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone;
          const isActive = device === d;
          return (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`${styles.deviceBtn} ${isActive ? styles.deviceBtnActive : ''}`}
              title={d.charAt(0).toUpperCase() + d.slice(1)}
            >
              <Icon size={13} />
            </button>
          );
        })}
      </div>

      <div className={styles.toolbarDivider} />

      {/* Undo / Redo */}
      <button
        onClick={onUndo}
        disabled={historyIdx <= 0}
        className={styles.iconActionBtn}
        title="Undo"
      >
        <RotateCcw size={13} />
      </button>
      <button
        onClick={onRedo}
        disabled={historyIdx >= historyLength - 1}
        className={styles.iconActionBtn}
        title="Redo"
      >
        <RotateCw size={13} />
      </button>

      <div className={styles.toolbarDivider} />

      {/* Actions */}
      <button
        onClick={onOpenPreview}
        className={styles.saveDraftBtn}
        style={{
          background: 'rgba(56, 211, 159, 0.14)',
          border: `1px solid ${GREEN_ACCENT}`,
          color: GREEN_ACCENT,
          fontWeight: 800,
        }}
      >
        <Eye size={12} /> Preview Game Page
      </button>
      <button
        onClick={onOpenImport}
        className={styles.saveDraftBtn}
        style={{
          background: 'rgba(242, 107, 33, 0.14)',
          border: `1px solid ${HATHOR_ORANGE}`,
          color: HATHOR_ORANGE,
          fontWeight: 800,
        }}
      >
        <FileUp size={12} /> Import JSON
      </button>
      <button onClick={onSaveDraft} className={styles.saveDraftBtn}>
        <Save size={11} /> Save Draft
      </button>
      <button
        onClick={onOpenPublish}
        className={styles.saveDraftBtn}
        style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: TEXT_MUTED }}
      >
        <FileJson size={11} /> View JSON
      </button>
      <button onClick={onOpenPublish} className={styles.publishBtn}>
        <Upload size={11} /> Publish
      </button>
    </div>
  );
}
