import { X } from 'lucide-react';
import {
  Section,
  HATHOR_ORANGE,
  GREEN_ACCENT,
  BORDER,
  TEXT_PRIMARY,
  TEXT_MUTED,
  SURFACE,
  FONTS,
  WEIGHTS,
} from '../../../types/designerTypes';
import {
  PropSection,
  PropRow,
  ColorField,
  NumField,
  SelField,
  TxtInput,
  TxtArea,
  AlignField,
} from '../../controls';
import styles from '../../../DesignerPage.module.css';

export function TextBlockInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Text Properties">
      <PropRow label="Content">
        <TxtArea
          value={targetObj.textContent || ''}
          onChange={(v) => updateTarget({ textContent: v })}
          rows={5}
        />
      </PropRow>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Typography & Fonts
      </p>
      <PropRow label="Font Family">
        <SelField
          value={targetObj.textFont || targetObj.font || "'Raleway', sans-serif"}
          onChange={(v) => updateTarget({ textFont: v, font: v })}
          options={FONTS}
        />
      </PropRow>
      <PropRow label="Font Size">
        <NumField
          value={targetObj.textSize || targetObj.size || 14}
          onChange={(v) => updateTarget({ textSize: v, size: v })}
          unit="px"
          min={10}
          max={72}
        />
      </PropRow>
      <PropRow label="Font Weight">
        <SelField
          value={targetObj.textWeight || targetObj.weight || '400'}
          onChange={(v) => updateTarget({ textWeight: v, weight: v })}
          options={WEIGHTS}
        />
      </PropRow>
      <PropRow label="Text Alignment">
        <AlignField
          value={targetObj.textAlign || targetObj.align || 'left'}
          onChange={(v) => updateTarget({ textAlign: v as any, align: v as any })}
        />
      </PropRow>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Color Palette & Accents
      </p>
      <PropRow label="Text Color">
        <ColorField
          value={targetObj.textColor || targetObj.color || TEXT_MUTED}
          onChange={(v) => updateTarget({ textColor: v, color: v })}
        />
      </PropRow>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Spacing & Layout
      </p>
      <PropRow label="Line Height">
        <NumField
          value={targetObj.textLineHeight || 1.65}
          onChange={(v) => updateTarget({ textLineHeight: v })}
          step={0.05}
          max={3}
        />
      </PropRow>
      <PropRow label="Max Width">
        <NumField
          value={targetObj.textMaxWidth || 700}
          onChange={(v) => updateTarget({ textMaxWidth: v })}
          unit="px"
          max={1400}
          step={20}
        />
      </PropRow>
    </PropSection>
  );
}

export function HeadingBlockInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Heading Properties">
      <PropRow label="Content">
        <TxtInput value={targetObj.text || ''} onChange={(v) => updateTarget({ text: v })} />
      </PropRow>
      <PropRow label="Font Family">
        <SelField
          value={targetObj.font || "'Cinzel', serif"}
          onChange={(v) => updateTarget({ font: v })}
          options={FONTS}
        />
      </PropRow>
      <PropRow label="Font Size">
        <NumField
          value={targetObj.size || 22}
          onChange={(v) => updateTarget({ size: v })}
          unit="px"
          min={12}
          max={72}
        />
      </PropRow>
      <PropRow label="Font Weight">
        <SelField
          value={targetObj.weight || '700'}
          onChange={(v) => updateTarget({ weight: v })}
          options={WEIGHTS}
        />
      </PropRow>
      <PropRow label="Color">
        <ColorField
          value={targetObj.color || '#ffffff'}
          onChange={(v) => updateTarget({ color: v })}
        />
      </PropRow>
      <PropRow label="Alignment">
        <AlignField
          value={targetObj.align || 'left'}
          onChange={(v) => updateTarget({ align: v as any })}
        />
      </PropRow>
    </PropSection>
  );
}

export function ImageBlockInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Image Properties">
      <PropRow label="Image URL">
        <TxtInput
          value={targetObj.imageSrc || ''}
          onChange={(v) => updateTarget({ imageSrc: v })}
          placeholder="https://…"
        />
      </PropRow>
      <PropRow label="Alt Text">
        <TxtInput
          value={targetObj.imageAlt || ''}
          onChange={(v) => updateTarget({ imageAlt: v })}
          placeholder="Description"
        />
      </PropRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <PropRow label="Max Width (%)">
          <NumField
            value={targetObj.imageMaxWidth || 100}
            onChange={(v) => updateTarget({ imageMaxWidth: v })}
            unit="%"
            min={10}
            max={100}
          />
        </PropRow>
        <PropRow label="Radius">
          <NumField
            value={targetObj.imageRadius || 4}
            onChange={(v) => updateTarget({ imageRadius: v })}
            unit="px"
            max={40}
          />
        </PropRow>
      </div>
    </PropSection>
  );
}

export function ButtonBlockInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Button Element Properties">
      <PropRow label="Button Text">
        <TxtInput
          value={targetObj.btnText || 'DOWNLOAD NOW'}
          onChange={(v) => updateTarget({ btnText: v })}
        />
      </PropRow>
      <PropRow label="Button Background / Gradient">
        <ColorField
          value={targetObj.btnGradient || targetObj.btnBg || GREEN_ACCENT}
          onChange={(v) => updateTarget({ btnGradient: v, btnBg: v })}
          placeholder="e.g. #38d39f or linear-gradient(...)"
        />
      </PropRow>
      <PropRow label="Button Text Color">
        <ColorField
          value={targetObj.btnColor || '#0e1116'}
          onChange={(v) => updateTarget({ btnColor: v })}
        />
      </PropRow>
      <PropRow label="Border Color">
        <ColorField
          value={targetObj.btnBorderColor || 'transparent'}
          onChange={(v) => updateTarget({ btnBorderColor: v })}
        />
      </PropRow>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Button Sizing & Radius
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <PropRow label="Pad Top/Bottom">
          <NumField
            value={targetObj.btnPaddingV ?? 12}
            onChange={(v) => updateTarget({ btnPaddingV: v })}
            unit="px"
            max={50}
          />
        </PropRow>
        <PropRow label="Pad Left/Right">
          <NumField
            value={targetObj.btnPaddingH ?? 16}
            onChange={(v) => updateTarget({ btnPaddingH: v })}
            unit="px"
            max={80}
          />
        </PropRow>
      </div>
      <PropRow label="Border Radius">
        <NumField
          value={targetObj.btnRadius ?? 3}
          onChange={(v) => updateTarget({ btnRadius: v })}
          unit="px"
          max={40}
        />
      </PropRow>
    </PropSection>
  );
}

export function FeaturesInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Features Grid Settings">
      <PropRow label="Section Title">
        <TxtInput
          value={targetObj.featuresTitle || 'KEY FEATURES'}
          onChange={(v) => updateTarget({ featuresTitle: v })}
        />
      </PropRow>
      <PropRow label="Title Font">
        <SelField
          value={targetObj.featuresTitleFont || targetObj.titleFont || "'Cinzel', serif"}
          onChange={(v) => updateTarget({ featuresTitleFont: v, titleFont: v })}
          options={FONTS}
        />
      </PropRow>
      <PropRow label="Title Color">
        <ColorField
          value={targetObj.featuresTitleColor || targetObj.titleColor || '#ffffff'}
          onChange={(v) => updateTarget({ featuresTitleColor: v, titleColor: v })}
        />
      </PropRow>
      <PropRow label="Columns">
        <SelField
          value={String(targetObj.featuresCols || 3)}
          onChange={(v) => updateTarget({ featuresCols: Number(v) })}
          options={[
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' },
          ]}
        />
      </PropRow>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Feature Cards Styling & Colors
      </p>
      <PropRow label="Card Background Color">
        <ColorField
          value={targetObj.featuresCardBg || targetObj.cardBg || SURFACE}
          onChange={(v) => updateTarget({ featuresCardBg: v, cardBg: v })}
        />
      </PropRow>
      <PropRow label="Card Border Color">
        <ColorField
          value={targetObj.featuresCardBorder || targetObj.cardBorder || BORDER}
          onChange={(v) => updateTarget({ featuresCardBorder: v, cardBorder: v })}
        />
      </PropRow>
      <PropRow label="Card Title Color">
        <ColorField
          value={targetObj.featureItemTitleColor || targetObj.itemTitleColor || TEXT_PRIMARY}
          onChange={(v) => updateTarget({ featureItemTitleColor: v, itemTitleColor: v })}
        />
      </PropRow>
      <PropRow label="Card Description Text Color">
        <ColorField
          value={targetObj.featureItemDescColor || targetObj.itemDescColor || TEXT_MUTED}
          onChange={(v) => updateTarget({ featureItemDescColor: v, itemDescColor: v })}
        />
      </PropRow>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        <p className={styles.propLabel}>Feature Cards ({(targetObj.featuresItems || []).length})</p>
        {(targetObj.featuresItems || []).map((item: any, i: number) => (
          <div
            key={i}
            style={{
              border: `1px solid ${BORDER}`,
              padding: 8,
              background: 'rgba(20, 24, 32, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: HATHOR_ORANGE }}>
                Card #{i + 1}
              </span>
              <button
                onClick={() =>
                  updateTarget({
                    featuresItems: (targetObj.featuresItems || []).filter(
                      (_: any, j: number) => j !== i
                    ),
                  })
                }
                style={{
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${BORDER}`,
                  background: 'transparent',
                  color: TEXT_MUTED,
                  cursor: 'pointer',
                }}
              >
                <X size={10} />
              </button>
            </div>
            <TxtInput
              value={item.title}
              onChange={(v) => {
                const items = [...(targetObj.featuresItems || [])];
                items[i] = { ...items[i], title: v };
                updateTarget({ featuresItems: items });
              }}
              placeholder="Feature Title"
            />
            <TxtArea
              value={item.desc}
              onChange={(v) => {
                const items = [...(targetObj.featuresItems || [])];
                items[i] = { ...items[i], desc: v };
                updateTarget({ featuresItems: items });
              }}
              rows={2}
              placeholder="Feature Description"
            />
          </div>
        ))}
        <button
          onClick={() =>
            updateTarget({
              featuresItems: [
                ...(targetObj.featuresItems || []),
                {
                  title: 'NEW FEATURE',
                  desc: 'Feature description goes here.',
                  icon: 'zap',
                  color: HATHOR_ORANGE,
                },
              ],
            })
          }
          style={{
            width: '100%',
            padding: 6,
            border: `1px dashed ${BORDER}`,
            background: 'transparent',
            color: TEXT_MUTED,
            fontSize: 10,
            cursor: 'pointer',
          }}
        >
          + Add Feature Card
        </button>
      </div>
    </PropSection>
  );
}

export function TwoColInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Two Columns Settings">
      <PropRow label="Column Width Ratio">
        <SelField
          value={targetObj.twoColRatio || '1:1'}
          onChange={(v) => updateTarget({ twoColRatio: v as any })}
          options={[
            { label: '50% / 50% Equal', value: '1:1' },
            { label: '60% / 40% Left Heavy', value: '3:2' },
            { label: '40% / 60% Right Heavy', value: '2:3' },
          ]}
        />
      </PropRow>
      <PropRow label="Left Side Text">
        <TxtArea
          value={targetObj.twoColLeftText || ''}
          onChange={(v) => updateTarget({ twoColLeftText: v })}
          rows={5}
        />
      </PropRow>
      <PropRow label="Right Side Image URL">
        <TxtInput
          value={targetObj.twoColRightImg || ''}
          onChange={(v) => updateTarget({ twoColRightImg: v })}
          placeholder="https://…"
        />
      </PropRow>
    </PropSection>
  );
}

export function CtaBlockInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Call To Action Settings">
      <PropRow label="CTA Title">
        <TxtInput
          value={targetObj.ctaTitle || 'CALL TO ACTION'}
          onChange={(v) => updateTarget({ ctaTitle: v })}
        />
      </PropRow>
      <PropRow label="CTA Subtitle">
        <TxtInput
          value={targetObj.ctaSubtitle || ''}
          onChange={(v) => updateTarget({ ctaSubtitle: v })}
        />
      </PropRow>
      <PropRow label="Title Color">
        <ColorField
          value={targetObj.ctaTitleColor || '#ffffff'}
          onChange={(v) => updateTarget({ ctaTitleColor: v })}
        />
      </PropRow>
      <PropRow label="Subtitle Text Color">
        <ColorField
          value={targetObj.ctaSubtitleColor || TEXT_MUTED}
          onChange={(v) => updateTarget({ ctaSubtitleColor: v })}
        />
      </PropRow>
      <PropRow label="Button Text">
        <TxtInput
          value={targetObj.ctaBtnText || 'BUY NOW'}
          onChange={(v) => updateTarget({ ctaBtnText: v })}
        />
      </PropRow>
      <PropRow label="Button Background Color">
        <ColorField
          value={targetObj.ctaBtnColor || HATHOR_ORANGE}
          onChange={(v) => updateTarget({ ctaBtnColor: v })}
        />
      </PropRow>
      <PropRow label="Button Text Color">
        <ColorField
          value={targetObj.ctaBtnTextColor || '#ffffff'}
          onChange={(v) => updateTarget({ ctaBtnTextColor: v })}
        />
      </PropRow>
      <PropRow label="Block Background">
        <ColorField
          value={
            targetObj.ctaBg ||
            'linear-gradient(135deg, rgba(40, 24, 20, 0.6) 0%, rgba(18, 22, 30, 0.95) 100%)'
          }
          onChange={(v) => updateTarget({ ctaBg: v })}
        />
      </PropRow>
      <PropRow label="Block Border Color">
        <ColorField
          value={targetObj.ctaBorder || HATHOR_ORANGE}
          onChange={(v) => updateTarget({ ctaBorder: v })}
        />
      </PropRow>
    </PropSection>
  );
}

export function DividerInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Divider Line Settings">
      <PropRow label="Line Color">
        <ColorField
          value={targetObj.dividerColor || BORDER}
          onChange={(v) => updateTarget({ dividerColor: v })}
        />
      </PropRow>
      <PropRow label="Thickness">
        <NumField
          value={targetObj.dividerThickness || 1}
          onChange={(v) => updateTarget({ dividerThickness: v })}
          unit="px"
          max={20}
        />
      </PropRow>
    </PropSection>
  );
}

export function SpacerInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Vertical Spacer Settings">
      <PropRow label="Height">
        <NumField
          value={targetObj.spacerHeight || 30}
          onChange={(v) => updateTarget({ spacerHeight: v })}
          unit="px"
          max={300}
        />
      </PropRow>
    </PropSection>
  );
}
