import { Section, HATHOR_ORANGE, GREEN_ACCENT, BORDER, TEXT_PRIMARY, TEXT_MUTED, SURFACE, FONTS } from "../../../types/designerTypes";
import { PropSection, PropRow, ColorField, NumField, SelField, TxtInput } from "../../controls";
import styles from "../../../DesignerPage.module.css";

export function SidebarCtaInspector({
  targetObj,
  updateTarget
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Sidebar Action Settings">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", marginBottom: 8 }}>
        <span className={styles.propLabel}>Ownership View Mode</span>
        <button onClick={() => updateTarget({ sidebarOwned: !(targetObj.sidebarOwned ?? true) })}
          style={{ padding: "6px 12px", border: `1px solid ${(targetObj.sidebarOwned ?? true) ? GREEN_ACCENT : HATHOR_ORANGE}`, color: (targetObj.sidebarOwned ?? true) ? GREEN_ACCENT : HATHOR_ORANGE, background: (targetObj.sidebarOwned ?? true) ? "rgba(56, 211, 159, 0.12)" : "rgba(242, 107, 33, 0.12)", fontSize: 10, fontWeight: 800, cursor: "pointer", borderRadius: 3 }}>
          {(targetObj.sidebarOwned ?? true) ? "OWNED MODE" : "STORE / BUY MODE"}
        </button>
      </div>
      {(targetObj.sidebarOwned ?? true) ? (
        <>
          <PropRow label="Header Title"><TxtInput value={targetObj.ownedTitle || "OWNED"} onChange={v => updateTarget({ ownedTitle: v })} /></PropRow>
          <PropRow label="Header Title Color"><ColorField value={targetObj.ownedTitleColor || targetObj.ownedHeaderColor || GREEN_ACCENT} onChange={v => updateTarget({ ownedTitleColor: v, ownedHeaderColor: v })} /></PropRow>
          <PropRow label="Subtext"><TxtInput value={targetObj.ownedSubtext || "In your library"} onChange={v => updateTarget({ ownedSubtext: v })} /></PropRow>
          <PropRow label="Subtext Color"><ColorField value={targetObj.sideBodyColor || targetObj.ownedSubtextColor || TEXT_MUTED} onChange={v => updateTarget({ sideBodyColor: v, ownedSubtextColor: v })} /></PropRow>
          <PropRow label="Primary Button Text"><TxtInput value={targetObj.ownedPrimaryBtnText || "DOWNLOAD NOW"} onChange={v => updateTarget({ ownedPrimaryBtnText: v })} /></PropRow>
          <PropRow label="Primary Button Color"><ColorField value={targetObj.ownedPrimaryBtnBg || GREEN_ACCENT} onChange={v => updateTarget({ ownedPrimaryBtnBg: v })} /></PropRow>
          <PropRow label="Primary Button Text Color"><ColorField value={targetObj.ownedPrimaryBtnTextColor || "#0e1116"} onChange={v => updateTarget({ ownedPrimaryBtnTextColor: v })} /></PropRow>
          <PropRow label="Secondary Button Text"><TxtInput value={targetObj.ctaSecondaryBtnText || "VIEW IN LIBRARY"} onChange={v => updateTarget({ ctaSecondaryBtnText: v })} /></PropRow>
          <PropRow label="Secondary Button Text Color"><ColorField value={targetObj.ctaSecondaryBtnTextColor || GREEN_ACCENT} onChange={v => updateTarget({ ctaSecondaryBtnTextColor: v })} /></PropRow>
          <PropRow label="Secondary Button Border Color"><ColorField value={targetObj.ctaSecondaryBtnBorder || GREEN_ACCENT} onChange={v => updateTarget({ ctaSecondaryBtnBorder: v })} /></PropRow>
        </>
      ) : (
        <>
          <PropRow label="Price Text Color"><ColorField value={targetObj.sidePriceColor || targetObj.priceColor || GREEN_ACCENT} onChange={v => updateTarget({ sidePriceColor: v, priceColor: v })} /></PropRow>
          <PropRow label="Strikethrough Price Color"><ColorField value={targetObj.originalPriceColor || TEXT_MUTED} onChange={v => updateTarget({ originalPriceColor: v })} /></PropRow>
          <PropRow label="Discount Badge Background"><ColorField value={targetObj.discountBg || HATHOR_ORANGE} onChange={v => updateTarget({ discountBg: v })} /></PropRow>
          <PropRow label="Button Text"><TxtInput value={targetObj.unownedPrimaryBtnText || "ADD TO CART"} onChange={v => updateTarget({ unownedPrimaryBtnText: v })} /></PropRow>
          <PropRow label="Button Color"><ColorField value={targetObj.unownedPrimaryBtnBg || HATHOR_ORANGE} onChange={v => updateTarget({ unownedPrimaryBtnBg: v })} /></PropRow>
          <PropRow label="Button Text Color"><ColorField value={targetObj.unownedPrimaryBtnTextColor || "#ffffff"} onChange={v => updateTarget({ unownedPrimaryBtnTextColor: v })} /></PropRow>
        </>
      )}
      <PropRow label="Top Accent Line Color"><ColorField value={targetObj.sideAccentColor || HATHOR_ORANGE} onChange={v => updateTarget({ sideAccentColor: v })} /></PropRow>
      <PropRow label="Card Background"><ColorField value={targetObj.sideCardBg || SURFACE} onChange={v => updateTarget({ sideCardBg: v })} /></PropRow>
      <PropRow label="Card Border Color"><ColorField value={targetObj.sideCardBorder || BORDER} onChange={v => updateTarget({ sideCardBorder: v })} /></PropRow>
    </PropSection>
  );
}

export function SidebarInfoInspector({
  targetObj,
  updateTarget
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Sidebar Game Details Settings">
      <PropRow label="Card Header Title"><TxtInput value={targetObj.infoTitle || "GAME DETAILS"} onChange={v => updateTarget({ infoTitle: v })} /></PropRow>
      <PropRow label="Header Title Color"><ColorField value={targetObj.infoTitleColor || HATHOR_ORANGE} onChange={v => updateTarget({ infoTitleColor: v })} /></PropRow>
      <PropRow label="Field Label Color"><ColorField value={targetObj.infoLabelColor || TEXT_MUTED} onChange={v => updateTarget({ infoLabelColor: v })} /></PropRow>
      <PropRow label="Value Text Color"><ColorField value={targetObj.infoValueColor || targetObj.infoTextColor || TEXT_PRIMARY} onChange={v => updateTarget({ infoValueColor: v, infoTextColor: v })} /></PropRow>
      <PropRow label="Card Background"><ColorField value={targetObj.infoCardBg || SURFACE} onChange={v => updateTarget({ infoCardBg: v })} /></PropRow>
      <PropRow label="Card Border Color"><ColorField value={targetObj.infoCardBorder || BORDER} onChange={v => updateTarget({ infoCardBorder: v })} /></PropRow>
    </PropSection>
  );
}

export function SidebarRatingsInspector({
  targetObj,
  updateTarget
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Sidebar Ratings Breakdown Settings">
      <PropRow label="Card Header Title"><TxtInput value={targetObj.ratingsTitle || "RATING BREAKDOWN"} onChange={v => updateTarget({ ratingsTitle: v })} /></PropRow>
      <PropRow label="Header Title Color"><ColorField value={targetObj.ratingsTitleColor || HATHOR_ORANGE} onChange={v => updateTarget({ ratingsTitleColor: v })} /></PropRow>
      <PropRow label="Stars Label Color"><ColorField value={targetObj.ratingsLabelColor || TEXT_MUTED} onChange={v => updateTarget({ ratingsLabelColor: v })} /></PropRow>
      <PropRow label="Percentage Value Color"><ColorField value={targetObj.ratingsValueColor || targetObj.ratingsTextColor || TEXT_MUTED} onChange={v => updateTarget({ ratingsValueColor: v, ratingsTextColor: v })} /></PropRow>
      <PropRow label="Progress Bar Fill Color"><ColorField value={targetObj.ratingsFillColor || HATHOR_ORANGE} onChange={v => updateTarget({ ratingsFillColor: v })} /></PropRow>
      <PropRow label="Card Background"><ColorField value={targetObj.ratingsCardBg || SURFACE} onChange={v => updateTarget({ ratingsCardBg: v })} /></PropRow>
      <PropRow label="Card Border Color"><ColorField value={targetObj.ratingsCardBorder || BORDER} onChange={v => updateTarget({ ratingsCardBorder: v })} /></PropRow>
    </PropSection>
  );
}

export function SidebarCommunityInspector({
  targetObj,
  updateTarget
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="Sidebar Community Stats Settings">
      <PropRow label="Card Header Title"><TxtInput value={targetObj.communityTitle || "COMMUNITY"} onChange={v => updateTarget({ communityTitle: v })} /></PropRow>
      <PropRow label="Header Title Color"><ColorField value={targetObj.communityTitleColor || targetObj.commTitleColor || HATHOR_ORANGE} onChange={v => updateTarget({ communityTitleColor: v, commTitleColor: v })} /></PropRow>
      <PropRow label="Field Label Color"><ColorField value={targetObj.communityLabelColor || targetObj.commLabelColor || TEXT_MUTED} onChange={v => updateTarget({ communityLabelColor: v, commLabelColor: v })} /></PropRow>
      <PropRow label="Value Text Color"><ColorField value={targetObj.communityValueColor || targetObj.commValueColor || TEXT_PRIMARY} onChange={v => updateTarget({ communityValueColor: v, commValueColor: v })} /></PropRow>
      <PropRow label="Positive Rating % Color"><ColorField value={targetObj.communityRatingColor || targetObj.commRatingColor || GREEN_ACCENT} onChange={v => updateTarget({ communityRatingColor: v, commRatingColor: v })} /></PropRow>
      <PropRow label="Card Background"><ColorField value={targetObj.communityCardBg || SURFACE} onChange={v => updateTarget({ communityCardBg: v })} /></PropRow>
      <PropRow label="Card Border Color"><ColorField value={targetObj.communityCardBorder || BORDER} onChange={v => updateTarget({ communityCardBorder: v })} /></PropRow>
    </PropSection>
  );
}

export function RecommendationsInspector({
  targetObj,
  updateTarget
}: {
  targetObj: Section;
  updateTarget: (updates: Partial<Section>, skipHistory?: boolean) => void;
}) {
  return (
    <PropSection title="More Like This Settings">
      <PropRow label="Section Title"><TxtInput value={targetObj.recsTitle || "MORE LIKE THIS"} onChange={v => updateTarget({ recsTitle: v })} /></PropRow>

      <p className={styles.propLabel} style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}>Typography & Fonts</p>
      <PropRow label="Header Title Font"><SelField value={targetObj.recsTitleFont || targetObj.titleFont || "'Cinzel', serif"} onChange={v => updateTarget({ recsTitleFont: v, titleFont: v })} options={FONTS} /></PropRow>
      <PropRow label="Card Title Font"><SelField value={targetObj.recsCardTitleFont || targetObj.itemTitleFont || "'Cinzel', serif"} onChange={v => updateTarget({ recsCardTitleFont: v, itemTitleFont: v })} options={FONTS} /></PropRow>
      <PropRow label="Price Text Font"><SelField value={targetObj.recsPriceFont || "monospace"} onChange={v => updateTarget({ recsPriceFont: v })} options={FONTS} /></PropRow>

      <p className={styles.propLabel} style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}>Color Palette & Accents</p>
      <PropRow label="Header Title Color"><ColorField value={targetObj.recsTitleColor || targetObj.titleColor || HATHOR_ORANGE} onChange={v => updateTarget({ recsTitleColor: v, titleColor: v })} /></PropRow>
      <PropRow label="Card Title Color"><ColorField value={targetObj.recsCardTitleColor || targetObj.itemTitleColor || TEXT_PRIMARY} onChange={v => updateTarget({ recsCardTitleColor: v, itemTitleColor: v })} /></PropRow>
      <PropRow label="Price Text Color"><ColorField value={targetObj.recsPriceColor || targetObj.priceColor || GREEN_ACCENT} onChange={v => updateTarget({ recsPriceColor: v, priceColor: v })} /></PropRow>
      <PropRow label="Card Background / Free Gradient"><ColorField value={targetObj.recsCardBg || targetObj.cardBg || SURFACE} onChange={v => updateTarget({ recsCardBg: v, cardBg: v })} placeholder="e.g. #181c24 or linear-gradient(...)" /></PropRow>
      <PropRow label="Card Border Color"><ColorField value={targetObj.recsCardBorder || targetObj.cardBorder || BORDER} onChange={v => updateTarget({ recsCardBorder: v, cardBorder: v })} /></PropRow>
      <PropRow label="Card Radius"><NumField value={targetObj.recsCardRadius ?? targetObj.cardRadius ?? 4} onChange={v => updateTarget({ recsCardRadius: v, cardRadius: v })} unit="px" max={40} /></PropRow>
      <PropRow label="Discount Badge Background"><ColorField value={targetObj.recsDiscountBg || targetObj.discountBg || HATHOR_ORANGE} onChange={v => updateTarget({ recsDiscountBg: v, discountBg: v })} /></PropRow>

      <p className={styles.propLabel} style={{ fontWeight: 700, color: HATHOR_ORANGE, marginTop: 12 }}>Section Spacing & Padding</p>
      <PropRow label="Section Background"><ColorField value={targetObj.recsBg || targetObj.bg || "transparent"} onChange={v => updateTarget({ recsBg: v, bg: v })} placeholder="e.g. transparent or #181c24" /></PropRow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
        <PropRow label="Pad Top"><NumField value={targetObj.pt ?? 0} onChange={v => updateTarget({ pt: v })} unit="px" max={200} /></PropRow>
        <PropRow label="Pad Bottom"><NumField value={targetObj.pb ?? 0} onChange={v => updateTarget({ pb: v })} unit="px" max={200} /></PropRow>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <PropRow label="Pad Left"><NumField value={targetObj.pl ?? targetObj.ph ?? 0} onChange={v => updateTarget({ pl: v, ph: v })} unit="px" max={200} /></PropRow>
        <PropRow label="Pad Right"><NumField value={targetObj.pr ?? targetObj.ph ?? 0} onChange={v => updateTarget({ pr: v, ph: v })} unit="px" max={200} /></PropRow>
      </div>
    </PropSection>
  );
}
