import { Monitor } from 'lucide-react';
import {
  PageSettings,
  DEFAULT_PAGE_SETTINGS,
  HATHOR_ORANGE,
  FONTS,
} from '../../../types/designerTypes';
import {
  PropSection,
  PropRow,
  ColorField,
  NumField,
  SelField,
  TxtInput,
  AlignmentGridPicker,
} from '../../controls';
import styles from '../../../DesignerPage.module.css';

export function PageBodyInspector({
  pageSettings,
  onPageSettingsChange,
}: {
  pageSettings?: PageSettings;
  onPageSettingsChange?: (ps: PageSettings) => void;
}) {
  const ps = pageSettings || DEFAULT_PAGE_SETTINGS;
  const uPage = (updates: Partial<PageSettings>) => {
    if (onPageSettingsChange) {
      onPageSettingsChange({ ...ps, ...updates });
    }
  };

  return (
    <div className={styles.rightSidebar}>
      <div
        className={styles.propsHeader}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Monitor size={14} style={{ color: HATHOR_ORANGE }} />
          <span>Page Body & Global Canvas</span>
        </div>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            opacity: 0.6,
            background: 'rgba(255,255,255,0.06)',
            padding: '2px 6px',
            borderRadius: 3,
          }}
        >
          Active
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Page Body Background */}
        <PropSection title="Page Body Background">
          <PropRow label="Background Color / Free Gradient">
            <ColorField
              value={ps.bg}
              onChange={(v) => uPage({ bg: v })}
              placeholder="e.g. #0e1116 or linear-gradient(...)"
            />
          </PropRow>

          <PropRow label="Background Image URL">
            <TxtInput
              value={ps.bgImage || ''}
              onChange={(v) => uPage({ bgImage: v })}
              placeholder="https://images.unsplash.com/..."
            />
          </PropRow>

          {ps.bgImage && (
            <>
              <PropRow label="Image Sizing">
                <SelField
                  value={ps.bgSize || 'cover'}
                  onChange={(v) => uPage({ bgSize: v })}
                  options={[
                    { label: 'Cover (Fill entire page)', value: 'cover' },
                    { label: 'Contain (Fit inside)', value: 'contain' },
                    { label: 'Full Width Stretch (100% auto)', value: '100% auto' },
                    { label: 'Original Size (Auto)', value: 'auto' },
                  ]}
                />
              </PropRow>

              <PropRow label="Background Position">
                <AlignmentGridPicker
                  value={ps.bgPosition || 'center center'}
                  onChange={(v) => uPage({ bgPosition: v })}
                />
              </PropRow>

              <PropRow label="Image Tiling (Repeat)">
                <SelField
                  value={ps.bgRepeat || 'no-repeat'}
                  onChange={(v) => uPage({ bgRepeat: v })}
                  options={[
                    { label: 'No Repeat', value: 'no-repeat' },
                    { label: 'Repeat X & Y (Tile)', value: 'repeat' },
                    { label: 'Repeat Horizontal (X)', value: 'repeat-x' },
                    { label: 'Repeat Vertical (Y)', value: 'repeat-y' },
                  ]}
                />
              </PropRow>

              <PropRow label="Scroll Behavior">
                <SelField
                  value={ps.bgAttachment || 'scroll'}
                  onChange={(v) => uPage({ bgAttachment: v })}
                  options={[
                    { label: 'Scroll with Page', value: 'scroll' },
                    { label: 'Fixed Parallax Background', value: 'fixed' },
                  ]}
                />
              </PropRow>

              <PropRow label="Background Overlay Tint">
                <ColorField
                  value={ps.bgOverlay || 'rgba(0,0,0,0.5)'}
                  onChange={(v) => uPage({ bgOverlay: v })}
                  placeholder="rgba(0,0,0,0.5)"
                />
              </PropRow>

              <PropRow label="Overlay Opacity (%)">
                <NumField
                  value={Math.round((ps.bgOverlayOpacity ?? 0) * 100)}
                  onChange={(v) => uPage({ bgOverlayOpacity: v / 100 })}
                  min={0}
                  max={100}
                  unit="%"
                />
              </PropRow>
            </>
          )}
        </PropSection>

        {/* Global Page Typography & Styling */}
        <PropSection title="Global Typography & Theme Accents">
          <PropRow label="Header Title Font Family">
            <SelField
              value={ps.titleFont || "'Cinzel', serif"}
              onChange={(v) => uPage({ titleFont: v })}
              options={FONTS}
            />
          </PropRow>
          <PropRow label="Body Text Font Family">
            <SelField
              value={ps.textFont || "'Raleway', sans-serif"}
              onChange={(v) => uPage({ textFont: v })}
              options={FONTS}
            />
          </PropRow>
          <PropRow label="Primary Accent Color">
            <ColorField
              value={ps.accentColor || HATHOR_ORANGE}
              onChange={(v) => uPage({ accentColor: v })}
            />
          </PropRow>
        </PropSection>

        {/* Outer Page Padding & Spacing */}
        <PropSection title="Outer Viewport Padding">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <PropRow label="Pad Top">
              <NumField
                value={ps.padTop ?? 0}
                onChange={(v) => uPage({ padTop: v })}
                unit="px"
                max={200}
              />
            </PropRow>
            <PropRow label="Pad Bottom">
              <NumField
                value={ps.padBottom ?? 40}
                onChange={(v) => uPage({ padBottom: v })}
                unit="px"
                max={200}
              />
            </PropRow>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <PropRow label="Pad Left">
              <NumField
                value={ps.padLeft ?? 0}
                onChange={(v) => uPage({ padLeft: v })}
                unit="px"
                max={200}
              />
            </PropRow>
            <PropRow label="Pad Right">
              <NumField
                value={ps.padRight ?? 0}
                onChange={(v) => uPage({ padRight: v })}
                unit="px"
                max={200}
              />
            </PropRow>
          </div>
        </PropSection>
      </div>
    </div>
  );
}
