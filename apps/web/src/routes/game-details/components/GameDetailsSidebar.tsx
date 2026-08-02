import React from 'react';
import { ShoppingCart, Download, Library } from 'lucide-react';

export interface GameDetailsSidebarProps {
  s?: any;
  isAuthenticated?: boolean;
  priceEgp?: string;
  discountPercent?: number;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  genre?: string;
  platforms?: string[];
  ratingsBreakdown?: Array<{ stars: number; percent: number; pct?: number }>;
  communityStats?: { playersCount: string; positiveRatingPct: string };
  device?: 'desktop' | 'tablet' | 'mobile';
  pageSettings?: any;
}

const HATHOR_ORANGE = '#f26b21';
const GREEN_ACCENT = '#38d39f';
const SURFACE = '#181c24';
const BORDER = '#2e3544';
const TEXT_PRIMARY = '#ffffff';
const TEXT_MUTED = '#94a3b8';

export const GameSidebarCta: React.FC<GameDetailsSidebarProps> = (props) => {
  const s = props.s || {};
  const isOwned = s.sidebarOwned ?? props.isAuthenticated ?? true;

  const cardBg = s.sideCardBg || SURFACE;
  const cardBorder = s.sideCardBorder || BORDER;
  const accentColor = s.sideAccentColor || HATHOR_ORANGE;
  const headerFont = s.sideHeaderFont || s.titleFont || props.pageSettings?.titleFont || "'Cinzel', serif";
  const bodyColor = s.sideBodyColor || s.ownedSubtextColor || TEXT_MUTED;
  const isMobile = props.device === 'mobile';

  // Colors for OWNED and BUY modes
  const headerColor = isOwned 
    ? (s.ownedTitleColor || s.ownedHeaderColor || GREEN_ACCENT) 
    : (s.unownedTitleColor || s.unownedHeaderColor || s.sideHeaderColor || HATHOR_ORANGE);

  const priceColor = s.sidePriceColor || s.priceColor || GREEN_ACCENT;
  const originalPriceColor = s.originalPriceColor || TEXT_MUTED;
  const discountBg = s.discountBg || s.recsDiscountBg || HATHOR_ORANGE;
  const discountTextColor = s.discountTextColor || "#ffffff";

  // Price & Discount calculation (Prioritizing DB / previous info screen data props.priceEgp & props.discountPercent)
  const catalogPrice = props.priceEgp;
  const catalogDiscount = props.discountPercent;

  const basePriceStr = (catalogPrice !== undefined && catalogPrice !== null && catalogPrice !== '')
    ? String(catalogPrice)
    : (s.sidebarPrice || s.price || '299.99');

  const discount = (catalogDiscount !== undefined && catalogDiscount !== null)
    ? Number(catalogDiscount)
    : (s.sidebarDiscount ?? s.discount ?? 0);

  const numericBasePrice = parseFloat(String(basePriceStr).replace(/[^0-9.]/g, ''));

  let originalPriceText = '';
  let finalPriceText = '';

  if (!isNaN(numericBasePrice) && numericBasePrice > 0) {
    if (discount > 0) {
      const discountedVal = numericBasePrice * (1 - discount / 100);
      originalPriceText = s.sidebarOriginalPrice || `EGP ${numericBasePrice.toFixed(2)}`;
      finalPriceText = `EGP ${discountedVal.toFixed(2)}`;
    } else {
      finalPriceText = `EGP ${numericBasePrice.toFixed(2)}`;
    }
  } else {
    finalPriceText = String(basePriceStr).startsWith('EGP') ? basePriceStr : `EGP ${basePriceStr}`;
    if (discount > 0 && s.sidebarOriginalPrice) {
      originalPriceText = s.sidebarOriginalPrice;
    }
  }

  // Buttons
  const primaryBtnText = isOwned 
    ? (s.ownedPrimaryBtnText || "DOWNLOAD NOW") 
    : (s.unownedPrimaryBtnText || "ADD TO CART");

  const primaryBtnBg = isOwned 
    ? (s.ownedPrimaryBtnBg || GREEN_ACCENT) 
    : (s.unownedPrimaryBtnBg || s.primaryBtnBg || HATHOR_ORANGE);

  const primaryBtnTextColor = isOwned 
    ? (s.ownedPrimaryBtnTextColor || "#0e1116") 
    : (s.unownedPrimaryBtnTextColor || s.primaryBtnTextColor || "#ffffff");

  const primaryBtnRadius = s.ctaBtnRadius ?? 3;

  const secondaryBtnText = s.ctaSecondaryBtnText || "VIEW IN LIBRARY";
  const secondaryBtnBg = s.ctaSecondaryBtnBg || "transparent";
  const secondaryBtnTextColor = s.ctaSecondaryBtnTextColor || GREEN_ACCENT;
  const secondaryBtnBorder = s.ctaSecondaryBtnBorder || "rgba(56, 211, 159, 0.35)";

  return (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderTop: `3px solid ${accentColor}`, borderRadius: 4, padding: isMobile ? 14 : 20, width: '100%', boxSizing: 'border-box' }}>
      {isOwned ? (
        <>
          <h4 style={{ fontFamily: headerFont, fontSize: isMobile ? 20 : 24, fontWeight: 900, color: headerColor, letterSpacing: '0.06em', margin: '0 0 4px 0' }}>
            {s.ownedTitle || "OWNED"}
          </h4>
          <span style={{ fontSize: 11, color: bodyColor, display: 'block', marginBottom: 16, fontFamily: 'monospace' }}>
            {s.ownedSubtext || "In your library"}
          </span>
          <button style={{ width: '100%', background: primaryBtnBg, border: `1px solid ${primaryBtnBg}`, color: primaryBtnTextColor, padding: '12px 16px', borderRadius: primaryBtnRadius, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10, boxSizing: 'border-box' }}>
            <Download size={14} /> {primaryBtnText}
          </button>
          <button style={{ width: '100%', background: secondaryBtnBg, border: `1px solid ${secondaryBtnBorder}`, color: secondaryBtnTextColor, padding: '12px 16px', borderRadius: primaryBtnRadius, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxSizing: 'border-box' }}>
            <Library size={14} /> {secondaryBtnText}
          </button>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
            {discount > 0 && (
              <span style={{ background: discountBg, color: discountTextColor, fontSize: 12, fontWeight: 900, padding: '4px 8px', borderRadius: 3, fontFamily: 'monospace' }}>
                -{discount}%
              </span>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 'auto' }}>
              {discount > 0 && originalPriceText && (
                <span style={{ fontSize: 11, color: originalPriceColor, textDecoration: 'line-through', fontFamily: 'monospace', opacity: 0.8, marginBottom: 2 }}>
                  {originalPriceText}
                </span>
              )}
              <span style={{ fontSize: 20, fontWeight: 900, color: priceColor, fontFamily: 'monospace' }}>
                {finalPriceText}
              </span>
            </div>
          </div>
          <button style={{ width: '100%', background: primaryBtnBg, border: 'none', color: primaryBtnTextColor, padding: '12px 16px', borderRadius: primaryBtnRadius, fontWeight: 900, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '0.08em' }}>
            <ShoppingCart size={14} /> {primaryBtnText}
          </button>
        </>
      )}
    </div>
  );
};

export const GameSidebarInfo: React.FC<GameDetailsSidebarProps> = (props) => {
  const s = props.s || {};
  const dev = s.sideDev || s.dev || props.developer || 'Developer Name';
  const pub = s.sidePub || s.pub || props.publisher || 'Publisher Name';
  const date = s.sideDate || s.date || props.releaseDate || 'Coming Soon';
  const genre = s.sideGenre || s.genre || props.genre || 'Genre';
  const platforms = s.sidePlatforms || props.platforms || ['Windows'];

  const cardBg = s.infoCardBg || SURFACE;
  const cardBorder = s.infoCardBorder || BORDER;
  const titleFont = s.infoTitleFont || props.pageSettings?.titleFont || "'Cinzel', serif";
  const titleColor = s.infoTitleColor || HATHOR_ORANGE;
  const labelColor = s.infoLabelColor || TEXT_MUTED;
  const valueColor = s.infoValueColor || s.infoTextColor || TEXT_PRIMARY;
  const labelFont = s.infoLabelFont || props.pageSettings?.textFont || "'Raleway', sans-serif";
  const isMobile = props.device === 'mobile';

  return (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 4, padding: isMobile ? 14 : 20, width: '100%', boxSizing: 'border-box' }}>
      <h4 style={{ fontFamily: titleFont, fontSize: 13, fontWeight: 900, color: titleColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, borderBottom: `1px solid ${cardBorder}`, paddingBottom: 8, margin: '0 0 14px 0' }}>
        {s.infoTitle || "GAME DETAILS"}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, fontFamily: labelFont }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: labelColor }}>Developer:</span> <strong style={{ color: valueColor }}>{dev}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: labelColor }}>Publisher:</span> <strong style={{ color: valueColor }}>{pub}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: labelColor }}>Release Date:</span> <strong style={{ color: valueColor }}>{date}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: labelColor }}>Genre:</span> <strong style={{ color: valueColor }}>{genre}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: labelColor }}>Platforms:</span> <strong style={{ color: valueColor }}>{Array.isArray(platforms) ? platforms.join(', ') : String(platforms)}</strong></div>
      </div>
    </div>
  );
};

export const GameSidebarRatings: React.FC<GameDetailsSidebarProps> = (props) => {
  const s = props.s || {};
  const ratings = s.sideRatings || props.ratingsBreakdown || [
    { stars: 5, percent: 82 }, { stars: 4, percent: 12 }, { stars: 3, percent: 4 }, { stars: 2, percent: 1 }, { stars: 1, percent: 1 }
  ];

  const cardBg = s.ratingsCardBg || SURFACE;
  const cardBorder = s.ratingsCardBorder || BORDER;
  const titleFont = s.ratingsTitleFont || props.pageSettings?.titleFont || "'Cinzel', serif";
  const titleColor = s.ratingsTitleColor || HATHOR_ORANGE;
  const fillColor = s.ratingsFillColor || HATHOR_ORANGE;
  const labelColor = s.ratingsLabelColor || TEXT_MUTED;
  const valueColor = s.ratingsValueColor || s.ratingsTextColor || TEXT_MUTED;
  const isMobile = props.device === 'mobile';

  return (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 4, padding: isMobile ? 14 : 20, width: '100%', boxSizing: 'border-box' }}>
      <h4 style={{ fontFamily: titleFont, fontSize: 13, fontWeight: 900, color: titleColor, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px 0', borderBottom: `1px solid ${cardBorder}`, paddingBottom: 8 }}>
        {s.ratingsTitle || "RATING BREAKDOWN"}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ratings.map((r: any, idx: number) => {
          const pct = r.percent ?? r.pct ?? 0;
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11 }}>
              <span style={{ width: 40, fontFamily: 'monospace', color: labelColor }}>{r.stars} Stars</span>
              <div style={{ flex: 1, height: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: fillColor }} />
              </div>
              <span style={{ width: 30, textAlign: 'right', fontFamily: 'monospace', color: valueColor }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const GameSidebarCommunity: React.FC<GameDetailsSidebarProps> = (props) => {
  const s = props.s || {};
  const players = s.sideOwners || props.communityStats?.playersCount || '0';
  const positive = s.sidePositive || props.communityStats?.positiveRatingPct || '0%';
  const avgGameplay = s.sideGameplay || '0 hrs';

  const cardBg = s.communityCardBg || SURFACE;
  const cardBorder = s.communityCardBorder || BORDER;
  const titleFont = s.communityTitleFont || props.pageSettings?.titleFont || "'Cinzel', serif";
  const titleColor = s.communityTitleColor || s.commTitleColor || HATHOR_ORANGE;
  const labelColor = s.communityLabelColor || s.commLabelColor || TEXT_MUTED;
  const valueColor = s.communityValueColor || s.commValueColor || TEXT_PRIMARY;
  const ratingColor = s.communityRatingColor || s.commRatingColor || GREEN_ACCENT;
  const textFont = props.pageSettings?.textFont || "'Raleway', sans-serif";
  const isMobile = props.device === 'mobile';

  return (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 4, padding: isMobile ? 14 : 20, width: '100%', boxSizing: 'border-box' }}>
      <h4 style={{ fontFamily: titleFont, fontSize: 13, fontWeight: 900, color: titleColor, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px 0', borderBottom: `1px solid ${cardBorder}`, paddingBottom: 8 }}>
        {s.communityTitle || "COMMUNITY"}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: labelColor, fontFamily: textFont }}>Players:</span> <strong style={{ color: valueColor, fontFamily: textFont }}>{players}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: labelColor, fontFamily: textFont }}>Avg. Gameplay:</span> <strong style={{ color: valueColor, fontFamily: textFont }}>{avgGameplay}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: labelColor, fontFamily: textFont }}>Positive Rating:</span> <strong style={{ color: ratingColor, fontFamily: textFont }}>{positive}</strong></div>
      </div>
    </div>
  );
};

export const GameDetailsSidebar: React.FC<GameDetailsSidebarProps> = (props) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', boxSizing: 'border-box' }}>
      <GameSidebarCta {...props} />
      <GameSidebarInfo {...props} />
      <GameSidebarRatings {...props} />
      <GameSidebarCommunity {...props} />
    </div>
  );
};

export default GameDetailsSidebar;
