import { useState, useEffect } from 'react';
import { Monitor, Settings } from 'lucide-react';
import { Section, PageSettings, HATHOR_ORANGE, BORDER } from '../../types/designerTypes';
import { BLOCK_META } from '../sidebar/paletteConfig';
import {
  PropSection,
  PropRow,
  ColorField,
  NumField,
  SelField,
  TxtInput,
  AlignmentGridPicker,
} from '../controls';
import { PageBodyInspector } from './sectionInspectors/PageBodyInspector';
import { GridSectionInspector } from './sectionInspectors/GridSectionInspector';
import {
  MediaCarouselInspector,
  GameHeaderInspector,
  AboutGameInspector,
  SystemReqsInspector,
  UserReviewsInspector,
  OwnershipBannerInspector,
} from './sectionInspectors/GameComponentsInspectors';
import {
  SidebarCtaInspector,
  SidebarInfoInspector,
  SidebarRatingsInspector,
  SidebarCommunityInspector,
  RecommendationsInspector,
} from './sectionInspectors/SidebarComponentsInspectors';
import {
  TextBlockInspector,
  HeadingBlockInspector,
  ImageBlockInspector,
  ButtonBlockInspector,
  FeaturesInspector,
  TwoColInspector,
  CtaBlockInspector,
  DividerInspector,
  SpacerInspector,
} from './sectionInspectors/ContentBlocksInspectors';
import styles from '../../DesignerPage.module.css';

export function PropertiesPanel({
  section,
  selectedColIdx,
  selectedElementId: propElementId,
  onChange,
  pageSettings,
  onPageSettingsChange,
  onDeselectAll,
}: {
  section: Section | null;
  selectedColIdx?: number | null;
  selectedElementId?: string | null;
  onChange: (id: string, updates: Partial<Section>, skipHistory?: boolean) => void;
  pageSettings?: PageSettings;
  onPageSettingsChange?: (ps: PageSettings) => void;
  onDeselectAll?: () => void;
}) {
  const [gridColIdx, setGridColIdx] = useState<number>(selectedColIdx ?? 0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(propElementId ?? null);

  useEffect(() => {
    if (selectedColIdx !== undefined && selectedColIdx !== null) {
      setGridColIdx(selectedColIdx);
    }
    if (propElementId !== undefined) {
      setSelectedElementId(propElementId);
    }
  }, [selectedColIdx, propElementId, section?.id]);

  if (!section) {
    return (
      <PageBodyInspector pageSettings={pageSettings} onPageSettingsChange={onPageSettingsChange} />
    );
  }

  const s = section;
  const u = (updates: Partial<Section>, skipHistory?: boolean) =>
    onChange(s.id, updates, skipHistory);
  const Icon = BLOCK_META[s.type]?.Icon || Settings;
  const cols = s.gridCols || [];
  const activeCol = cols[gridColIdx] || cols[0];

  const activeElement =
    s.type === 'grid' && selectedElementId
      ? (activeCol?.elements || []).find((e) => e.id === selectedElementId) || null
      : null;

  const updateGridElement = (elId: string, updates: Partial<any>, skipHistory?: boolean) => {
    if (!activeCol) return;
    const updatedCols = cols.map((c, idx) =>
      idx === gridColIdx
        ? {
            ...c,
            elements: c.elements.map((e) => (e.id === elId ? { ...e, ...updates } : e)),
          }
        : c
    );
    u({ gridCols: updatedCols }, skipHistory);
  };

  const targetObj: any = activeElement || s;
  const isEditingGridElement = !!activeElement;

  const updateTarget = (updates: any, skipHistory?: boolean) => {
    if (isEditingGridElement && activeElement) {
      updateGridElement(activeElement.id, updates, skipHistory);
    } else {
      u(updates, skipHistory);
    }
  };

  return (
    <div className={styles.rightSidebar}>
      <div
        className={styles.propsHeader}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon size={14} style={{ color: HATHOR_ORANGE }} />
          <span>
            {isEditingGridElement ? `Element: ${activeElement?.type}` : BLOCK_META[s.type]?.label}
          </span>
        </div>
        {onDeselectAll && (
          <button
            onClick={onDeselectAll}
            title="Deselect element to edit Page Body"
            style={{
              background: 'rgba(242, 107, 33, 0.15)',
              border: `1px solid ${HATHOR_ORANGE}`,
              color: HATHOR_ORANGE,
              fontSize: 10,
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: 3,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Monitor size={10} />
            Page Settings
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Section Container Styling */}
        {!isEditingGridElement && (
          <PropSection title="Section Container Styling">
            <PropRow label="Background Color / Free Gradient">
              <ColorField
                value={s.bg}
                onChange={(v) => u({ bg: v })}
                placeholder="e.g. transparent, #212631 or linear-gradient(...)"
              />
            </PropRow>
            <PropRow label="Top Accent Line Color">
              <ColorField
                value={s.borderTopColor || ''}
                onChange={(v) => u({ borderTopColor: v })}
                placeholder="#f26b21"
              />
            </PropRow>

            <PropRow label="Background Image URL">
              <TxtInput
                value={s.bgImage || ''}
                onChange={(v) => u({ bgImage: v })}
                placeholder="https://..."
              />
            </PropRow>

            {s.bgImage && (
              <>
                <PropRow label="Background Fit / Scaling">
                  <SelField
                    value={s.bgSize || 'cover'}
                    onChange={(v) => u({ bgSize: v })}
                    options={[
                      { label: 'Cover (Scale to Fill Container)', value: 'cover' },
                      {
                        label: 'Fit Width & Scrollable Tall Artwork (100% auto)',
                        value: '100% auto',
                      },
                      { label: 'Contain (Scale to Fit)', value: 'contain' },
                      { label: 'Stretch (100% 100%)', value: '100% 100%' },
                      { label: 'Auto (Original Size)', value: 'auto' },
                    ]}
                  />
                </PropRow>

                <PropRow label="Background Scroll Behavior">
                  <SelField
                    value={s.bgAttachment || (s.bgSize === '100% auto' ? 'scroll' : 'scroll')}
                    onChange={(v) => u({ bgAttachment: v })}
                    options={[
                      { label: 'Scroll (Document Attached - Scrolls with Page)', value: 'scroll' },
                      { label: 'Fixed (Viewport Anchored - Static Screen)', value: 'fixed' },
                    ]}
                  />
                </PropRow>

                <PropRow label="Background Alignment (3x3 Grid)">
                  <AlignmentGridPicker
                    value={s.bgPosition || 'center center'}
                    onChange={(v) => u({ bgPosition: v })}
                  />
                </PropRow>

                <PropRow label="Repeat Mode">
                  <SelField
                    value={s.bgRepeat || 'no-repeat'}
                    onChange={(v) => u({ bgRepeat: v })}
                    options={[
                      { label: 'No Repeat', value: 'no-repeat' },
                      { label: 'Tile (Repeat X & Y)', value: 'repeat' },
                      { label: 'Repeat Horizontally (X)', value: 'repeat-x' },
                      { label: 'Repeat Vertically (Y)', value: 'repeat-y' },
                    ]}
                  />
                </PropRow>

                <PropRow label="Overlay Tint Color">
                  <ColorField
                    value={s.bgOverlay || 'transparent'}
                    onChange={(v) => u({ bgOverlay: v })}
                    placeholder="e.g. rgba(0,0,0,0.5) or linear-gradient(...)"
                  />
                </PropRow>

                <PropRow label="Overlay Opacity (%)">
                  <NumField
                    value={Math.round((s.bgOverlayOpacity ?? 0.5) * 100)}
                    onChange={(v) => u({ bgOverlayOpacity: v / 100 })}
                    unit="%"
                    min={0}
                    max={100}
                  />
                </PropRow>
              </>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <PropRow label="Pad Top">
                <NumField value={s.pt} onChange={(v) => u({ pt: v })} unit="px" max={400} />
              </PropRow>
              <PropRow label="Pad Bottom">
                <NumField value={s.pb} onChange={(v) => u({ pb: v })} unit="px" max={400} />
              </PropRow>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <PropRow label="Pad Left">
                <NumField
                  value={s.pl ?? s.ph ?? 0}
                  onChange={(v) => u({ pl: v, ph: v })}
                  unit="px"
                  max={400}
                />
              </PropRow>
              <PropRow label="Pad Right">
                <NumField
                  value={s.pr ?? s.ph ?? 0}
                  onChange={(v) => u({ pr: v, ph: v })}
                  unit="px"
                  max={400}
                />
              </PropRow>
            </div>
          </PropSection>
        )}

        {/* Section/Element Specific Inspector Panels */}
        {targetObj.type === 'grid' && (
          <GridSectionInspector
            targetObj={s}
            gridColIdx={gridColIdx}
            setGridColIdx={setGridColIdx}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
            updateTarget={updateTarget}
          />
        )}

        {(targetObj.type === 'carousel' ||
          targetObj.type === 'media-carousel' ||
          targetObj.type === 'game-hero') && (
          <MediaCarouselInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'game-header' && (
          <GameHeaderInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'about-game' && (
          <AboutGameInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'system-reqs' && (
          <SystemReqsInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'user-reviews' && (
          <UserReviewsInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'ownership-banner' && (
          <OwnershipBannerInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}

        {targetObj.type === 'sidebar-cta' && (
          <SidebarCtaInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'sidebar-info' && (
          <SidebarInfoInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'sidebar-ratings' && (
          <SidebarRatingsInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'sidebar-community' && (
          <SidebarCommunityInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'recommendations' && (
          <RecommendationsInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}

        {targetObj.type === 'text' && (
          <TextBlockInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'heading' && (
          <HeadingBlockInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'image' && (
          <ImageBlockInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'button' && (
          <ButtonBlockInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'features' && (
          <FeaturesInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'two-col' && (
          <TwoColInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'cta' && (
          <CtaBlockInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'divider' && (
          <DividerInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}
        {targetObj.type === 'spacer' && (
          <SpacerInspector targetObj={targetObj} updateTarget={updateTarget} />
        )}

        {/* Bottom Deselect Action */}
        {!isEditingGridElement && (
          <div style={{ padding: '16px 14px', borderTop: `1px solid ${BORDER}`, marginTop: 16 }}>
            <button
              onClick={onDeselectAll}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                background: 'rgba(242, 107, 33, 0.12)',
                border: `1px solid ${HATHOR_ORANGE}`,
                color: HATHOR_ORANGE,
                fontSize: 10,
                fontWeight: 800,
                fontFamily: 'monospace',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Monitor size={12} />
              Deselect & Edit Page Body Settings (Esc)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
