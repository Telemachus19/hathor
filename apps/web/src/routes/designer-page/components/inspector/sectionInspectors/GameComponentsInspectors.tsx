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
} from '../../../types/designerTypes';
import {
  PropSection,
  PropRow,
  ColorField,
  NumField,
  SelField,
  TxtInput,
  TxtArea,
  MediaManagerList,
} from '../../controls';
import styles from '../../../DesignerPage.module.css';

export function MediaCarouselInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Media Carousel Showcase Settings">
      <PropRow label="Slider Height">
        <NumField
          value={targetObj.carouselHeight || targetObj.heroHeight || 420}
          onChange={(v) => updateTarget({ carouselHeight: v, heroHeight: v })}
          unit="px"
          min={200}
          max={900}
          step={20}
        />
      </PropRow>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 0',
        }}
      >
        <span className={styles.propLabel}>Bottom Shadow Overlay</span>
        <button
          onClick={() =>
            updateTarget({ heroShadowEnabled: !(targetObj.heroShadowEnabled ?? true) })
          }
          style={{
            padding: '6px 12px',
            border: `1px solid ${(targetObj.heroShadowEnabled ?? true) ? GREEN_ACCENT : BORDER}`,
            color: (targetObj.heroShadowEnabled ?? true) ? GREEN_ACCENT : TEXT_MUTED,
            background:
              (targetObj.heroShadowEnabled ?? true) ? 'rgba(56, 211, 159, 0.12)' : 'transparent',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: 3,
          }}
        >
          {(targetObj.heroShadowEnabled ?? true) ? 'ENABLED' : 'DISABLED'}
        </button>
      </div>
      {(targetObj.heroShadowEnabled ?? true) && (
        <PropRow label="Shadow Color">
          <ColorField
            value={targetObj.heroShadowColor || '#212631'}
            onChange={(v) => updateTarget({ heroShadowColor: v })}
          />
        </PropRow>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 0',
        }}
      >
        <span className={styles.propLabel}>Thumbnail Navigation Strip</span>
        <button
          onClick={() => updateTarget({ showThumbnails: !(targetObj.showThumbnails ?? true) })}
          style={{
            padding: '6px 12px',
            border: `1px solid ${(targetObj.showThumbnails ?? true) ? GREEN_ACCENT : BORDER}`,
            color: (targetObj.showThumbnails ?? true) ? GREEN_ACCENT : TEXT_MUTED,
            background:
              (targetObj.showThumbnails ?? true) ? 'rgba(56, 211, 159, 0.12)' : 'transparent',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: 3,
          }}
        >
          {(targetObj.showThumbnails ?? true) ? 'VISIBLE' : 'HIDDEN'}
        </button>
      </div>
      <MediaManagerList
        items={targetObj.heroImages || targetObj.carouselImages || targetObj.mediaItems || []}
        onChange={(items) =>
          updateTarget({ heroImages: items, carouselImages: items, mediaItems: items })
        }
        label="Media Showcase Items (Images & Videos)"
      />
    </PropSection>
  );
}

export function GameHeaderInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Game Header Design & Styling">
      <p className={styles.propLabel} style={{ fontWeight: 700, color: HATHOR_ORANGE }}>
        Typography & Fonts
      </p>
      <PropRow label="Title Font">
        <SelField
          value={targetObj.titleFont || targetObj.font || "'Cinzel', serif"}
          onChange={(v) => updateTarget({ titleFont: v, font: v })}
          options={FONTS}
        />
      </PropRow>
      <PropRow label="Subtitle & Badge Font">
        <SelField
          value={targetObj.subtitleFont || "'Cinzel', serif"}
          onChange={(v) => updateTarget({ subtitleFont: v })}
          options={FONTS}
        />
      </PropRow>
      <PropRow label="Body & Text Font">
        <SelField
          value={targetObj.textFont || "'Raleway', sans-serif"}
          onChange={(v) => updateTarget({ textFont: v })}
          options={FONTS}
        />
      </PropRow>
      <PropRow label="Rating Score Font">
        <SelField
          value={targetObj.ratingScoreFont || targetObj.titleFont || "'Cinzel', serif"}
          onChange={(v) => updateTarget({ ratingScoreFont: v })}
          options={FONTS}
        />
      </PropRow>
      <PropRow label="Review Count Font">
        <SelField
          value={targetObj.reviewCountFont || targetObj.textFont || "'Raleway', sans-serif"}
          onChange={(v) => updateTarget({ reviewCountFont: v })}
          options={FONTS}
        />
      </PropRow>
      <PropRow label="Developer & Date Font">
        <SelField
          value={targetObj.devFont || targetObj.textFont || "'Raleway', sans-serif"}
          onChange={(v) => updateTarget({ devFont: v, dateFont: v })}
          options={FONTS}
        />
      </PropRow>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Color Palette & Accents
      </p>
      <PropRow label="Title Color">
        <ColorField
          value={targetObj.titleColor || '#ffffff'}
          onChange={(v) => updateTarget({ titleColor: v })}
        />
      </PropRow>
      <PropRow label="Subtitle & Badge Color">
        <ColorField
          value={targetObj.subtitleColor || targetObj.badgeColor || HATHOR_ORANGE}
          onChange={(v) => updateTarget({ subtitleColor: v, badgeColor: v })}
        />
      </PropRow>
      <PropRow label="Star Rating Color">
        <ColorField
          value={targetObj.starColor || HATHOR_ORANGE}
          onChange={(v) => updateTarget({ starColor: v })}
        />
      </PropRow>
      <PropRow label="Rating Score Text Color">
        <ColorField
          value={targetObj.ratingScoreColor || targetObj.headerRatingColor || '#ffffff'}
          onChange={(v) => updateTarget({ ratingScoreColor: v, headerRatingColor: v })}
        />
      </PropRow>
      <PropRow label="Review Count Text Color">
        <ColorField
          value={targetObj.reviewCountColor || targetObj.headerReviewCountColor || TEXT_MUTED}
          onChange={(v) => updateTarget({ reviewCountColor: v, headerReviewCountColor: v })}
        />
      </PropRow>
      <PropRow label="Developer Name Text Color">
        <ColorField
          value={targetObj.devColor || targetObj.headerDevColor || TEXT_PRIMARY}
          onChange={(v) => updateTarget({ devColor: v, headerDevColor: v })}
        />
      </PropRow>
      <PropRow label="Release Date Text Color">
        <ColorField
          value={targetObj.dateColor || targetObj.headerDateColor || TEXT_PRIMARY}
          onChange={(v) => updateTarget({ dateColor: v, headerDateColor: v })}
        />
      </PropRow>
      <PropRow label="Tag Badges Background">
        <ColorField
          value={targetObj.tagBg || 'rgba(255, 255, 255, 0.05)'}
          onChange={(v) => updateTarget({ tagBg: v })}
        />
      </PropRow>
      <PropRow label="Tag Badges Text Color">
        <ColorField
          value={targetObj.tagColor || TEXT_MUTED}
          onChange={(v) => updateTarget({ tagColor: v })}
        />
      </PropRow>
      <PropRow label="Tag Badges Border Color">
        <ColorField
          value={targetObj.tagBorder || BORDER}
          onChange={(v) => updateTarget({ tagBorder: v })}
        />
      </PropRow>
      <PropRow label="Synopsis Text Color">
        <ColorField
          value={targetObj.descColor || TEXT_MUTED}
          onChange={(v) => updateTarget({ descColor: v })}
        />
      </PropRow>
      <PropRow label="Synopsis Left Accent Line">
        <ColorField
          value={targetObj.descBorderColor || HATHOR_ORANGE}
          onChange={(v) => updateTarget({ descBorderColor: v })}
        />
      </PropRow>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Container Padding & Card Styling
      </p>
      <PropRow label="Card Background Color">
        <ColorField
          value={targetObj.headerBg || 'transparent'}
          onChange={(v) => updateTarget({ headerBg: v })}
          placeholder="e.g. #181c24 or linear-gradient(...)"
        />
      </PropRow>
      <PropRow label="Card Border Color">
        <ColorField
          value={targetObj.headerBorder || 'transparent'}
          onChange={(v) => updateTarget({ headerBorder: v })}
        />
      </PropRow>
      <PropRow label="Card Radius">
        <NumField
          value={targetObj.headerRadius ?? 0}
          onChange={(v) => updateTarget({ headerRadius: v })}
          unit="px"
          max={40}
        />
      </PropRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
        <PropRow label="Pad Top">
          <NumField
            value={targetObj.pt ?? targetObj.headerPadTop ?? 0}
            onChange={(v) => updateTarget({ pt: v, headerPadTop: v })}
            unit="px"
            max={200}
          />
        </PropRow>
        <PropRow label="Pad Bottom">
          <NumField
            value={targetObj.pb ?? targetObj.headerPadBottom ?? 0}
            onChange={(v) => updateTarget({ pb: v, headerPadBottom: v })}
            unit="px"
            max={200}
          />
        </PropRow>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <PropRow label="Pad Left">
          <NumField
            value={targetObj.pl ?? targetObj.ph ?? targetObj.headerPadLeft ?? 0}
            onChange={(v) => updateTarget({ pl: v, ph: v, headerPadLeft: v })}
            unit="px"
            max={200}
          />
        </PropRow>
        <PropRow label="Pad Right">
          <NumField
            value={targetObj.pr ?? targetObj.ph ?? targetObj.headerPadRight ?? 0}
            onChange={(v) => updateTarget({ pr: v, ph: v, headerPadRight: v })}
            unit="px"
            max={200}
          />
        </PropRow>
      </div>
    </PropSection>
  );
}

export function AboutGameInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="About Game Design & Styling">
      <PropRow label="Section Title">
        <TxtInput
          value={targetObj.aboutTitle || ''}
          onChange={(v) => updateTarget({ aboutTitle: v })}
        />
      </PropRow>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Typography & Fonts
      </p>
      <PropRow label="Title Font">
        <SelField
          value={targetObj.titleFont || targetObj.font || "'Cinzel', serif"}
          onChange={(v) => updateTarget({ titleFont: v, font: v })}
          options={FONTS}
        />
      </PropRow>
      <PropRow label="Body Text Font">
        <SelField
          value={targetObj.textFont || "'Raleway', sans-serif"}
          onChange={(v) => updateTarget({ textFont: v })}
          options={FONTS}
        />
      </PropRow>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Color Palette & Accents
      </p>
      <PropRow label="Main Title Color">
        <ColorField
          value={targetObj.titleColor || '#f4b183'}
          onChange={(v) => updateTarget({ titleColor: v })}
        />
      </PropRow>
      <PropRow label="Subheading Color">
        <ColorField
          value={targetObj.subTitleColor || HATHOR_ORANGE}
          onChange={(v) => updateTarget({ subTitleColor: v })}
        />
      </PropRow>
      <PropRow label="Body Text Color">
        <ColorField
          value={targetObj.textColor || TEXT_MUTED}
          onChange={(v) => updateTarget({ textColor: v })}
        />
      </PropRow>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Background & Container Styling
      </p>
      <PropRow label="Container Background">
        <ColorField
          value={targetObj.aboutBg || targetObj.bg || 'transparent'}
          onChange={(v) => updateTarget({ aboutBg: v, bg: v })}
          placeholder="e.g. #181c24 or linear-gradient(...)"
        />
      </PropRow>
      <PropRow label="Container Border Color">
        <ColorField
          value={targetObj.aboutBorder || targetObj.borderColor || 'transparent'}
          onChange={(v) => updateTarget({ aboutBorder: v, borderColor: v })}
        />
      </PropRow>
      <PropRow label="Container Radius">
        <NumField
          value={targetObj.aboutRadius ?? targetObj.radius ?? 0}
          onChange={(v) => updateTarget({ aboutRadius: v, radius: v })}
          unit="px"
          max={40}
        />
      </PropRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
        <PropRow label="Pad Top">
          <NumField
            value={targetObj.pt ?? 16}
            onChange={(v) => updateTarget({ pt: v })}
            unit="px"
            max={200}
          />
        </PropRow>
        <PropRow label="Pad Bottom">
          <NumField
            value={targetObj.pb ?? 16}
            onChange={(v) => updateTarget({ pb: v })}
            unit="px"
            max={200}
          />
        </PropRow>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <PropRow label="Pad Left">
          <NumField
            value={targetObj.pl ?? targetObj.ph ?? 16}
            onChange={(v) => updateTarget({ pl: v, ph: v })}
            unit="px"
            max={200}
          />
        </PropRow>
        <PropRow label="Pad Right">
          <NumField
            value={targetObj.pr ?? targetObj.ph ?? 16}
            onChange={(v) => updateTarget({ pr: v, ph: v })}
            unit="px"
            max={200}
          />
        </PropRow>
      </div>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Content Subsections
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {(targetObj.aboutSections || []).map((sec: any, i: number) => (
          <div
            key={i}
            style={{
              border: `1px solid ${BORDER}`,
              padding: 10,
              background: 'rgba(20, 24, 32, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: HATHOR_ORANGE }}>
                Section #{i + 1}
              </span>
              <button
                onClick={() =>
                  updateTarget({
                    aboutSections: (targetObj.aboutSections || []).filter(
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
              value={sec.title}
              onChange={(v) => {
                const secs = [...(targetObj.aboutSections || [])];
                secs[i] = { ...secs[i], title: v };
                updateTarget({ aboutSections: secs });
              }}
              placeholder="Subheading Title"
            />
            <TxtArea
              value={sec.text}
              onChange={(v) => {
                const secs = [...(targetObj.aboutSections || [])];
                secs[i] = { ...secs[i], text: v };
                updateTarget({ aboutSections: secs });
              }}
              rows={3}
              placeholder="Lore text description..."
            />
            <TxtInput
              value={sec.img || ''}
              onChange={(v) => {
                const secs = [...(targetObj.aboutSections || [])];
                secs[i] = { ...secs[i], img: v };
                updateTarget({ aboutSections: secs });
              }}
              placeholder="Screenshot Image URL (optional)"
            />
          </div>
        ))}
        <button
          onClick={() =>
            updateTarget({
              aboutSections: [
                ...(targetObj.aboutSections || []),
                { title: 'NEW SECTION', text: 'Write section description here...', img: '' },
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
          + Add Game Lore Section
        </button>
      </div>
    </PropSection>
  );
}

export function SystemReqsInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="System Requirements Design & Specs">
      <PropRow label="Section Title">
        <TxtInput
          value={targetObj.reqsTitle || 'SYSTEM REQUIREMENTS'}
          onChange={(v) => updateTarget({ reqsTitle: v })}
        />
      </PropRow>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Typography & Fonts
      </p>
      <PropRow label="Title Font">
        <SelField
          value={targetObj.titleFont || targetObj.font || "'Cinzel', serif"}
          onChange={(v) => updateTarget({ titleFont: v, font: v })}
          options={FONTS}
        />
      </PropRow>
      <PropRow label="Specs Text Font">
        <SelField
          value={targetObj.textFont || "'Raleway', sans-serif"}
          onChange={(v) => updateTarget({ textFont: v })}
          options={FONTS}
        />
      </PropRow>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Color Palette & Accents
      </p>
      <PropRow label="Header Title Color">
        <ColorField
          value={targetObj.titleColor || '#f4b183'}
          onChange={(v) => updateTarget({ titleColor: v })}
        />
      </PropRow>
      <PropRow label="Tab & Icon Accent Color">
        <ColorField
          value={targetObj.accentColor || targetObj.reqsAccentColor || HATHOR_ORANGE}
          onChange={(v) => updateTarget({ accentColor: v, reqsAccentColor: v })}
        />
      </PropRow>
      <PropRow label="Card Background">
        <ColorField
          value={targetObj.reqsCardBg || targetObj.cardBg || SURFACE}
          onChange={(v) => updateTarget({ reqsCardBg: v, cardBg: v })}
          placeholder="e.g. #181c24 or linear-gradient(...)"
        />
      </PropRow>
      <PropRow label="Card Border Color">
        <ColorField
          value={targetObj.reqsCardBorder || targetObj.cardBorder || BORDER}
          onChange={(v) => updateTarget({ reqsCardBorder: v, cardBorder: v })}
        />
      </PropRow>
      <PropRow label="Specs Label Color">
        <ColorField
          value={targetObj.labelColor || TEXT_MUTED}
          onChange={(v) => updateTarget({ labelColor: v })}
        />
      </PropRow>
      <PropRow label="Specs Value Text Color">
        <ColorField
          value={targetObj.valueColor || targetObj.textColor || '#ffffff'}
          onChange={(v) => updateTarget({ valueColor: v, textColor: v })}
        />
      </PropRow>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Padding & Spacing
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <PropRow label="Pad Top">
          <NumField
            value={targetObj.pt ?? 0}
            onChange={(v) => updateTarget({ pt: v })}
            unit="px"
            max={200}
          />
        </PropRow>
        <PropRow label="Pad Bottom">
          <NumField
            value={targetObj.pb ?? 0}
            onChange={(v) => updateTarget({ pb: v })}
            unit="px"
            max={200}
          />
        </PropRow>
      </div>
    </PropSection>
  );
}

export function UserReviewsInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="User Reviews Settings">
      <PropRow label="Section Header Title">
        <TxtInput
          value={targetObj.reviewHeader || ''}
          onChange={(v) => updateTarget({ reviewHeader: v })}
          placeholder="PLAYER REVIEWS"
        />
      </PropRow>
      <PropRow label="Card Background / Free Gradient">
        <ColorField
          value={targetObj.reviewCardBg || SURFACE}
          onChange={(v) => updateTarget({ reviewCardBg: v })}
          placeholder="e.g. #181c24 or linear-gradient(...)"
        />
      </PropRow>
      <PropRow label="Card Border Color">
        <ColorField
          value={targetObj.reviewCardBorder || BORDER}
          onChange={(v) => updateTarget({ reviewCardBorder: v })}
        />
      </PropRow>
      <PropRow label="Card Radius">
        <NumField
          value={targetObj.reviewCardRadius ?? 4}
          onChange={(v) => updateTarget({ reviewCardRadius: v })}
          unit="px"
          max={40}
        />
      </PropRow>

      <p
        className={styles.propLabel}
        style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}
      >
        Typography & Accents
      </p>
      <PropRow label="Reviewer Name Font">
        <SelField
          value={targetObj.reviewNameFont || "'Cinzel', serif"}
          onChange={(v) => updateTarget({ reviewNameFont: v })}
          options={FONTS}
        />
      </PropRow>
      <PropRow label="Reviewer Name Color">
        <ColorField
          value={targetObj.reviewNameColor || TEXT_PRIMARY}
          onChange={(v) => updateTarget({ reviewNameColor: v })}
        />
      </PropRow>
      <PropRow label="Body Text Color">
        <ColorField
          value={targetObj.reviewBodyColor || TEXT_MUTED}
          onChange={(v) => updateTarget({ reviewBodyColor: v })}
        />
      </PropRow>
      <PropRow label="Body Text Font">
        <SelField
          value={targetObj.reviewBodyFont || "'Raleway', sans-serif"}
          onChange={(v) => updateTarget({ reviewBodyFont: v })}
          options={FONTS}
        />
      </PropRow>
      <PropRow label="Star Accent Color">
        <ColorField
          value={targetObj.reviewStarColor || HATHOR_ORANGE}
          onChange={(v) => updateTarget({ reviewStarColor: v })}
        />
      </PropRow>
    </PropSection>
  );
}

export function OwnershipBannerInspector({
  targetObj,
  updateTarget,
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Ownership Banner Settings">
      <PropRow label="Status Title">
        <TxtInput
          value={targetObj.ownershipStatus || 'YOU OWN THIS GAME'}
          onChange={(v) => updateTarget({ ownershipStatus: v })}
        />
      </PropRow>
      <PropRow label="Subtext">
        <TxtInput
          value={targetObj.ownershipSub || 'Purchased Jun 10, 2025 · Available in your library'}
          onChange={(v) => updateTarget({ ownershipSub: v })}
        />
      </PropRow>
      <PropRow label="Primary Button Text">
        <TxtInput
          value={targetObj.ownershipBtn1 || 'DOWNLOAD'}
          onChange={(v) => updateTarget({ ownershipBtn1: v })}
        />
      </PropRow>
      <PropRow label="Primary Button Color">
        <ColorField
          value={targetObj.ownershipBtn1Bg || GREEN_ACCENT}
          onChange={(v) => updateTarget({ ownershipBtn1Bg: v })}
        />
      </PropRow>
      <PropRow label="Secondary Button Text">
        <TxtInput
          value={targetObj.ownershipBtn2 || 'GO TO LIBRARY'}
          onChange={(v) => updateTarget({ ownershipBtn2: v })}
        />
      </PropRow>
      <PropRow label="Banner Background">
        <ColorField
          value={targetObj.ownershipBg || SURFACE}
          onChange={(v) => updateTarget({ ownershipBg: v })}
        />
      </PropRow>
      <PropRow label="Banner Border Color">
        <ColorField
          value={targetObj.ownershipBorder || 'rgba(56, 211, 159, 0.4)'}
          onChange={(v) => updateTarget({ ownershipBorder: v })}
        />
      </PropRow>
    </PropSection>
  );
}
