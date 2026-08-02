import { Layers } from 'lucide-react';
import { Section, Device, PageSettings, BG } from '../../types/designerTypes';
import { SectionWrapper } from './SectionWrapper';
import styles from '../../DesignerPage.module.css';

export function DesignerCanvas({
  sections,
  pageSettings,
  device,
  selectedId,
  selectedColIdx,
  selectedElementId,
  onDeselectAll,
  onSelectSection,
  onSelectChild,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onOpenTemplateModal,
}: {
  sections: Section[];
  pageSettings: PageSettings;
  device: Device;
  selectedId: string | null;
  selectedColIdx: number | null;
  selectedElementId: string | null;
  onDeselectAll: () => void;
  onSelectSection: (id: string) => void;
  onSelectChild: (sectionId: string, colIdx: number, elementId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onOpenTemplateModal: () => void;
}) {
  const deviceMax = device === 'mobile' ? 375 : device === 'tablet' ? 768 : undefined;

  return (
    <div
      className={styles.canvasArea}
      style={{
        backgroundColor:
          pageSettings.bg && pageSettings.bg !== 'transparent' ? pageSettings.bg : BG,
        backgroundImage: pageSettings.bgImage ? `url("${pageSettings.bgImage}")` : undefined,
        backgroundSize: pageSettings.bgSize || 'cover',
        backgroundPosition: pageSettings.bgPosition || 'center center',
        backgroundRepeat: pageSettings.bgRepeat || 'no-repeat',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
      onClick={onDeselectAll}
    >
      {/* Outer Canvas Background Overlay Tint */}
      {pageSettings.bgImage &&
        (pageSettings.bgOverlay || pageSettings.bgOverlayOpacity !== undefined) && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: pageSettings.bgOverlay || 'rgba(0,0,0,0.5)',
              opacity: pageSettings.bgOverlayOpacity ?? 0,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

      {/* Page frame */}
      <div
        className={styles.canvasWrapper}
        style={{
          maxWidth: deviceMax,
          width: '100%',
          boxSizing: 'border-box',
          backgroundColor: 'transparent',
          paddingTop: pageSettings.padTop ?? 0,
          paddingBottom: pageSettings.padBottom ?? 40,
          paddingLeft: pageSettings.padLeft ?? 0,
          paddingRight: pageSettings.padRight ?? 0,
          position: 'relative',
          zIndex: 1,
          transition: 'all 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {sections.length === 0 ? (
          <div className={styles.emptyCanvas}>
            <Layers size={40} style={{ opacity: 0.15 }} />
            <p style={{ fontWeight: 700 }}>Your page is empty</p>
            <p style={{ fontSize: 10, opacity: 0.5 }}>
              Click a block in the left panel or click Templates to load a pre-built layout
            </p>
            <button
              onClick={onOpenTemplateModal}
              className={styles.modalBtnPrimary}
              style={{ width: 'auto', padding: '8px 16px', marginTop: 8 }}
            >
              Choose Template
            </button>
          </div>
        ) : (
          sections.map((s, i) => (
            <SectionWrapper
              key={s.id}
              section={s}
              device={device}
              pageSettings={pageSettings}
              selected={s.id === selectedId}
              selectedColIdx={s.id === selectedId ? selectedColIdx : null}
              selectedElementId={s.id === selectedId ? selectedElementId : null}
              isFirst={i === 0}
              isLast={i === sections.length - 1}
              onSelect={() => onSelectSection(s.id)}
              onSelectChild={(colIdx, elementId) => onSelectChild(s.id, colIdx, elementId)}
              onMoveUp={() => onMoveUp(i)}
              onMoveDown={() => onMoveDown(i)}
              onDuplicate={() => onDuplicate(i)}
              onDelete={() => onDelete(i)}
            />
          ))
        )}
      </div>
    </div>
  );
}
